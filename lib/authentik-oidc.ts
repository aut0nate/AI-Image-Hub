import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import {
  getAppUrl,
  getAuthentikAdminEmail,
  getAuthentikClientId,
  getAuthentikClientSecret,
  getAuthentikIssuer,
  getAuthentikRedirectUri,
  getSessionSecret
} from "./env";

const OAUTH_STATE_COOKIE = "ai_art_hub_oauth_state";
const OAUTH_STATE_TTL_SECONDS = 60 * 10;

type DiscoveryDocument = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
};

type OAuthState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  expiresAt: number;
};

let discoveryCache: Promise<DiscoveryDocument> | null = null;
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function assertConfigured(value: string, name: string) {
  if (!value) {
    throw new Error(`${name} must be set`);
  }
}

function randomBase64Url(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function timingSafeStringEqual(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash) && left.length === right.length;
}

function encodeStateCookie(state: OAuthState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeStateCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !timingSafeStringEqual(sign(payload), signature)) {
    return null;
  }

  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OAuthState;
    if (state.expiresAt < Date.now()) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function getConfiguredAppOrigin(request: NextRequest) {
  return getAppUrl() || request.nextUrl.origin;
}

export function getCallbackUrl(request: NextRequest) {
  return getAuthentikRedirectUri() || `${getConfiguredAppOrigin(request)}/auth/callback`;
}

export function getLoginErrorUrl(request: NextRequest, error: string) {
  const url = new URL("/login", getConfiguredAppOrigin(request));
  url.searchParams.set("error", error);
  return url;
}

export function getAdminUrl(request: NextRequest) {
  return new URL("/admin", getConfiguredAppOrigin(request));
}

async function getDiscoveryDocument() {
  if (!discoveryCache) {
    const issuer = getAuthentikIssuer();
    assertConfigured(issuer, "AUTHENTIK_ISSUER");
    discoveryCache = fetch(`${issuer}/.well-known/openid-configuration`, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) {
        throw new Error("Could not load Authentik discovery document");
      }
      const discovery = (await response.json()) as DiscoveryDocument;
      if (!discovery.authorization_endpoint || !discovery.token_endpoint || !discovery.jwks_uri) {
        throw new Error("Authentik discovery document is missing required endpoints");
      }
      return discovery;
    });
  }

  return discoveryCache;
}

async function getJwks(discovery: DiscoveryDocument) {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(discovery.jwks_uri));
  }
  return jwksCache;
}

async function createCodeChallenge(codeVerifier: string) {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
}

export async function buildAuthentikLoginResponse(request: NextRequest) {
  const clientId = getAuthentikClientId();
  assertConfigured(clientId, "AUTHENTIK_CLIENT_ID");
  assertConfigured(getAuthentikClientSecret(), "AUTHENTIK_CLIENT_SECRET");
  assertConfigured(getAuthentikAdminEmail(), "AUTHENTIK_ADMIN_EMAIL");

  const discovery = await getDiscoveryDocument();
  const oauthState: OAuthState = {
    state: randomBase64Url(),
    nonce: randomBase64Url(),
    codeVerifier: randomBase64Url(64),
    expiresAt: Date.now() + OAUTH_STATE_TTL_SECONDS * 1000
  };

  const authorizationUrl = new URL(discovery.authorization_endpoint);
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", getCallbackUrl(request));
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid profile email");
  authorizationUrl.searchParams.set("state", oauthState.state);
  authorizationUrl.searchParams.set("nonce", oauthState.nonce);
  authorizationUrl.searchParams.set("code_challenge", await createCodeChallenge(oauthState.codeVerifier));
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, encodeStateCookie(oauthState), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth",
    maxAge: OAUTH_STATE_TTL_SECONDS
  });
  return response;
}

async function exchangeCodeForToken(request: NextRequest, code: string, codeVerifier: string) {
  const discovery = await getDiscoveryDocument();
  const clientId = getAuthentikClientId();
  const clientSecret = getAuthentikClientSecret();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getCallbackUrl(request),
    code_verifier: codeVerifier
  });

  const response = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
    },
    body
  });

  if (!response.ok) {
    throw new Error("Authentik token exchange failed");
  }

  return (await response.json()) as { id_token?: string };
}

export async function completeAuthentikLogin(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    throw new Error("Missing Authentik callback parameters");
  }

  const oauthState = decodeStateCookie(request.cookies.get(OAUTH_STATE_COOKIE)?.value);
  if (!oauthState || !timingSafeStringEqual(oauthState.state, state)) {
    throw new Error("Invalid Authentik state");
  }

  const discovery = await getDiscoveryDocument();
  const tokenResponse = await exchangeCodeForToken(request, code, oauthState.codeVerifier);
  if (!tokenResponse.id_token) {
    throw new Error("Authentik did not return an ID token");
  }

  const verifiedToken = await jwtVerify(tokenResponse.id_token, await getJwks(discovery), {
    issuer: discovery.issuer,
    audience: getAuthentikClientId()
  });

  const email = typeof verifiedToken.payload.email === "string" ? verifiedToken.payload.email.toLowerCase() : "";
  const allowedEmail = getAuthentikAdminEmail();
  if (!email || email !== allowedEmail) {
    throw new Error("Authentik user is not allowed to access this app");
  }
  if (verifiedToken.payload.email_verified === false) {
    throw new Error("Authentik email address is not verified");
  }
  if (verifiedToken.payload.nonce !== oauthState.nonce) {
    throw new Error("Invalid Authentik nonce");
  }

  return {
    email,
    name: typeof verifiedToken.payload.name === "string" ? verifiedToken.payload.name : undefined
  };
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth",
    maxAge: 0
  });
}
