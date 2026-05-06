import { redirect } from "next/navigation";
import { ImageForm } from "@/components/ImageForm";
import { createImageAction } from "@/lib/actions";
import { getAdminSession } from "@/lib/auth";
import { getCategories, getModels, getProviders } from "@/lib/db";

export default async function NewImagePage() {
  if (!(await getAdminSession())) {
    redirect("/login");
  }

  const categories = getCategories();
  const providers = getProviders();
  const models = getModels();

  return (
    <main className="page-shell">
      <div className="form-shell">
        <ImageForm action={createImageAction} categories={categories} mode="create" models={models} providers={providers} />
      </div>
    </main>
  );
}
