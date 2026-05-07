import path from "node:path";

export function getDatabasePath() {
  const value = process.env.DATABASE_URL ?? "file:./data/gallery.sqlite";
  const rawPath = value.startsWith("file:") ? value.slice(5) : value;
  return path.isAbsolute(rawPath) ? rawPath : path.join(/* turbopackIgnore: true */ process.cwd(), rawPath);
}

export function getUploadDir() {
  const value = process.env.UPLOAD_DIR ?? "./uploads";
  return path.isAbsolute(value) ? value : path.join(/* turbopackIgnore: true */ process.cwd(), value);
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME ?? "";
}

export function getAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH?.replaceAll("\\$", "$") ?? "";
}

export function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return "development-session-secret-change-me";
}
