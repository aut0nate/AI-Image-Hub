import { GalleryShell } from "@/components/GalleryShell";
import { getAdminSession } from "@/lib/auth";
import { getCategories, getImages, getModels } from "@/lib/db";

export default async function HomePage() {
  const images = getImages();
  const categories = getCategories();
  const models = getModels();
  const isAdmin = Boolean(await getAdminSession());
  return <GalleryShell categories={categories} images={images} isAdmin={isAdmin} models={models} />;
}
