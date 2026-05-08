import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { getUploadDir } from "@/lib/env";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

type UploadRouteProps = {
  params: Promise<{
    path: string[];
  }>;
};

function createDownloadHeader(filename: string) {
  const fallbackFilename = filename.replace(/["\\]/g, "");
  return `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(request: Request, { params }: UploadRouteProps) {
  const { path: filePathParts } = await params;
  if (filePathParts.length !== 1) {
    notFound();
  }

  const filename = path.basename(filePathParts[0]);
  const extension = path.extname(filename).toLowerCase();
  const contentType = contentTypes[extension];

  if (!filename || filename !== filePathParts[0] || !contentType) {
    notFound();
  }

  const filePath = path.join(/* turbopackIgnore: true */ getUploadDir(), filename);

  try {
    const file = await fs.readFile(filePath);
    const headers: Record<string, string> = {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType
    };

    if (new URL(request.url).searchParams.get("download") === "1") {
      headers["Content-Disposition"] = createDownloadHeader(filename);
    }

    return new Response(file, {
      headers
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      notFound();
    }
    throw error;
  }
}
