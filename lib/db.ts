import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDatabasePath } from "./env";
import type { GalleryImage, ImageInput } from "./types";

let db: Database.Database | undefined;

function openDb() {
  if (db) {
    return db;
  }

  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      notes TEXT,
      imagePath TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  return db;
}

function mapImage(row: Record<string, unknown>): GalleryImage {
  return {
    id: String(row.id),
    title: String(row.title),
    prompt: String(row.prompt),
    model: String(row.model),
    category: String(row.category),
    notes: row.notes === null ? null : String(row.notes),
    imagePath: String(row.imagePath),
    width: Number(row.width),
    height: Number(row.height),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt)
  };
}

export function getImages() {
  const rows = openDb()
    .prepare("SELECT * FROM images ORDER BY date(createdAt) DESC, datetime(createdAt) DESC, title ASC")
    .all() as Record<string, unknown>[];
  return rows.map(mapImage);
}

export function getImage(id: string) {
  const row = openDb().prepare("SELECT * FROM images WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapImage(row) : null;
}

export function getCategories() {
  return Array.from(new Set(getImages().map((image) => image.category))).sort((a, b) => a.localeCompare(b));
}

export function getModels() {
  return Array.from(new Set(getImages().map((image) => image.model))).sort((a, b) => a.localeCompare(b));
}

export function createImage(input: ImageInput) {
  const now = new Date().toISOString();
  const id = randomUUID();
  openDb()
    .prepare(`
      INSERT INTO images (
        id, title, prompt, model, category, notes, imagePath, width, height, createdAt, updatedAt
      ) VALUES (
        @id, @title, @prompt, @model, @category, @notes, @imagePath, @width, @height, @createdAt, @updatedAt
      )
    `)
    .run({ ...input, id, updatedAt: now });
  return id;
}

export function updateImage(id: string, input: Omit<ImageInput, "imagePath" | "width" | "height">) {
  const now = new Date().toISOString();
  openDb()
    .prepare(`
      UPDATE images
      SET title = @title,
          prompt = @prompt,
          model = @model,
          category = @category,
          notes = @notes,
          createdAt = @createdAt,
          updatedAt = @updatedAt
      WHERE id = @id
    `)
    .run({ ...input, id, updatedAt: now });
}

export function deleteImageRecord(id: string) {
  openDb().prepare("DELETE FROM images WHERE id = ?").run(id);
}
