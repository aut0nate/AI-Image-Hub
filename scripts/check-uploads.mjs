import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

function resolveFileUrl(value, fallback) {
  const rawValue = value ?? fallback;
  const rawPath = rawValue.startsWith("file:") ? rawValue.slice(5) : rawValue;
  return path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
}

const databasePath = resolveFileUrl(process.env.DATABASE_URL, "file:./data/gallery.sqlite");
const uploadDir = resolveFileUrl(process.env.UPLOAD_DIR, "./uploads");

if (!fs.existsSync(databasePath)) {
  console.error(`Database not found: ${databasePath}`);
  process.exit(1);
}

if (!fs.existsSync(uploadDir)) {
  console.error(`Upload directory not found: ${uploadDir}`);
  process.exit(1);
}

const db = new Database(databasePath, { readonly: true });
const rows = db
  .prepare("SELECT id, title, imagePath FROM images ORDER BY date(createdAt) DESC, datetime(createdAt) DESC, title ASC")
  .all();

const missingUploads = rows.filter((image) => {
  if (!String(image.imagePath).startsWith("/uploads/")) {
    return true;
  }
  return !fs.existsSync(path.join(uploadDir, path.basename(image.imagePath)));
});

console.log(`Database: ${databasePath}`);
console.log(`Uploads:  ${uploadDir}`);
console.log(`Images in database: ${rows.length}`);
console.log(`Missing upload files: ${missingUploads.length}`);

if (missingUploads.length > 0) {
  console.log("");
  for (const image of missingUploads) {
    console.log(`- ${image.imagePath} (${image.title})`);
  }
  process.exit(1);
}
