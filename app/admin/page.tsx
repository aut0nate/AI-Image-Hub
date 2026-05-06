import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { getAdminSession } from "@/lib/auth";
import { getCategories, getImages, getModels } from "@/lib/db";

export default async function AdminPage() {
  if (!(await getAdminSession())) {
    redirect("/login");
  }

  const images = getImages();
  const categories = getCategories();
  const models = getModels();

  return <AdminShell categories={categories} images={images} models={models} />;
}
