import { notFound, redirect } from "next/navigation";
import { ImageForm } from "@/components/ImageForm";
import { updateImageAction } from "@/lib/actions";
import { getAdminSession } from "@/lib/auth";
import { getCategories, getImage, getModels } from "@/lib/db";

type EditImagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditImagePage({ params }: EditImagePageProps) {
  if (!(await getAdminSession())) {
    redirect("/login");
  }

  const { id } = await params;
  const image = getImage(id);
  if (!image) {
    notFound();
  }
  const categories = getCategories();
  const models = getModels();

  return (
    <main className="page-shell">
      <div className="form-shell">
        <ImageForm
          action={updateImageAction.bind(null, image.id)}
          categories={categories}
          image={image}
          mode="edit"
          models={models}
        />
      </div>
    </main>
  );
}
