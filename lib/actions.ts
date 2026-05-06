"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin, setAdminSession, validateCredentials } from "./auth";
import { createImage, deleteImageRecord, getImage, updateImage } from "./db";
import { getUploadDir } from "./env";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requireText(formData: FormData, key: string) {
  const value = getText(formData, key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function titleFromPrompt(prompt: string) {
  const firstLine = prompt.replace(/\s+/g, " ").trim();
  if (firstLine.length <= 54) {
    return firstLine;
  }
  return `${firstLine.slice(0, 51).trim()}...`;
}

function extensionFor(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if ([".avif", ".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
    return extension;
  }
  if (file.type === "image/avif") return ".avif";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  return ".jpg";
}

async function saveUpload(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Image file is required");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported");
  }
  if (file.type === "image/svg+xml" || path.extname(file.name).toLowerCase() === ".svg") {
    throw new Error("SVG uploads are not supported. Use JPEG, PNG, WebP, AVIF, or GIF.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Images must be 15 MB or smaller");
  }

  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}${extensionFor(file)}`;
  const targetPath = path.join(/* turbopackIgnore: true */ uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  await fs.writeFile(targetPath, buffer);
  return {
    imagePath: `/uploads/${filename}`,
    width: metadata.width ?? 1200,
    height: metadata.height ?? 1200
  };
}

export async function loginAction(formData: FormData) {
  const username = getText(formData, "username");
  const password = getText(formData, "password");
  if (!validateCredentials(username, password)) {
    redirect("/login?error=1");
  }
  await setAdminSession(username);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/");
}

export async function createImageAction(formData: FormData) {
  await requireAdmin();
  const upload = await saveUpload(formData.get("image") as File);
  const prompt = requireText(formData, "prompt");
  createImage({
    title: titleFromPrompt(prompt),
    prompt,
    model: requireText(formData, "model"),
    category: requireText(formData, "category"),
    notes: null,
    imagePath: upload.imagePath,
    width: upload.width,
    height: upload.height
  });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateImageAction(id: string, formData: FormData) {
  await requireAdmin();
  const prompt = requireText(formData, "prompt");
  updateImage(id, {
    title: titleFromPrompt(prompt),
    prompt,
    model: requireText(formData, "model"),
    category: requireText(formData, "category"),
    notes: null
  });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/images/${id}/edit`);
  redirect("/admin");
}

export async function deleteImageAction(id: string) {
  await requireAdmin();
  const image = getImage(id);
  if (image?.imagePath.startsWith("/uploads/")) {
    const filename = path.basename(image.imagePath);
    await fs.rm(path.join(/* turbopackIgnore: true */ getUploadDir(), filename), { force: true });
  }
  deleteImageRecord(id);
  revalidatePath("/");
  revalidatePath("/admin");
}
