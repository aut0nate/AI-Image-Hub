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
  return process.env.ADMIN_USERNAME ?? "arkadmin";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "change-this-password";
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "development-session-secret-change-me";
}
