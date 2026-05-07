import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { getAdminPasswordHash, getAdminUsername, getSessionSecret } from "./env";

const COOKIE_NAME = "ai_art_hub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const FAILED_LOGIN_LIMIT = 5;
const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const FAILED_LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
const DUMMY_PASSWORD_HASH = "$2b$12$QyGvg76XRDuMcKdpLj70jOMuuhFpkl21eSzC32GC8tq2SI2QUSPR.";

type SessionPayload = {
  username: string;
  expiresAt: number;
};

type LoginAttempt = {
  failedAt: number;
  lockedUntil?: number;
};

const failedLoginAttempts = new Map<string, LoginAttempt[]>();

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function timingSafeStringEqual(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash) && left.length === right.length;
}

function createToken(username: string) {
  const payload = toBase64Url(
    JSON.stringify({
      username,
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
    } satisfies SessionPayload)
  );
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !timingSafeStringEqual(sign(payload), signature)) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload)) as SessionPayload;
    if (session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function getThrottleKey(username: string, ipAddress: string) {
  return `${username.toLowerCase()}:${ipAddress}`;
}

function getActiveAttempts(key: string, now: number) {
  const attempts = failedLoginAttempts.get(key) ?? [];
  return attempts.filter((attempt) => attempt.failedAt > now - FAILED_LOGIN_WINDOW_MS);
}

export function isLoginThrottled(username: string, ipAddress: string) {
  const now = Date.now();
  const attempts = getActiveAttempts(getThrottleKey(username, ipAddress), now);
  const lockedUntil = Math.max(...attempts.map((attempt) => attempt.lockedUntil ?? 0), 0);
  return lockedUntil > now;
}

function recordFailedLogin(username: string, ipAddress: string) {
  const now = Date.now();
  const key = getThrottleKey(username, ipAddress);
  const attempts = [...getActiveAttempts(key, now), { failedAt: now }];

  if (attempts.length >= FAILED_LOGIN_LIMIT) {
    attempts[attempts.length - 1].lockedUntil = now + FAILED_LOGIN_LOCKOUT_MS;
  }

  failedLoginAttempts.set(key, attempts);
}

function clearFailedLogins(username: string, ipAddress: string) {
  failedLoginAttempts.delete(getThrottleKey(username, ipAddress));
}

async function comparePassword(password: string, passwordHash: string) {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}

export async function validateCredentials(username: string, password: string, ipAddress: string) {
  const adminUsername = getAdminUsername();
  const usernameMatches = timingSafeStringEqual(username, adminUsername);
  const configuredHash = getAdminPasswordHash();
  const passwordHash = usernameMatches && configuredHash ? configuredHash : DUMMY_PASSWORD_HASH;
  const passwordMatches = await comparePassword(password, passwordHash);

  if (isLoginThrottled(username, ipAddress)) {
    return false;
  }

  const isValid = usernameMatches && Boolean(configuredHash) && passwordMatches;
  if (isValid) {
    clearFailedLogins(username, ipAddress);
    return true;
  }

  recordFailedLogin(username, ipAddress);
  return false;
}

export async function setAdminSession(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(username), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorised");
  }
  return session;
}
