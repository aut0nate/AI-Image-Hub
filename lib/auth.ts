import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSessionSecret } from "./env";

const COOKIE_NAME = "ai_art_hub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

export type AdminSession = {
  email: string;
  name?: string;
  expiresAt: number;
};

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

function createToken(session: Omit<AdminSession, "expiresAt">) {
  const payload = toBase64Url(
    JSON.stringify({
      ...session,
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
    } satisfies AdminSession)
  );
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !timingSafeStringEqual(sign(payload), signature)) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload)) as AdminSession;
    if (!session.email || session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(response: NextResponse, session: Omit<AdminSession, "expiresAt">) {
  response.cookies.set(COOKIE_NAME, createToken(session), {
    httpOnly: true,
    sameSite: "lax",
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
