export type GalleryImage = {
  id: string;
  title: string;
  prompt: string;
  provider: string;
  model: string;
  category: string;
  notes: string | null;
  imagePath: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
};

export type ImageInput = {
  title: string;
  prompt: string;
  provider: string;
  model: string;
  category: string;
  notes: string | null;
  imagePath: string;
  width: number;
  height: number;
  createdAt: string;
};
