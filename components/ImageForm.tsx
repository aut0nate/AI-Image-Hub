"use client";

import type { GalleryImage } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

type ImageFormProps = {
  action: (formData: FormData) => void;
  categories: string[];
  image?: GalleryImage;
  mode: "create" | "edit";
  models: string[];
};

export function ImageForm({ action, categories, image, mode, models }: ImageFormProps) {
  const [category, setCategory] = useState(image?.category ?? categories[0] ?? "Fantasy");
  const [model, setModel] = useState(image?.model ?? models[0] ?? "Midjourney");

  return (
    <form action={action} className="form-panel">
      <div>
        <div className="panel-kicker">{mode === "create" ? "New image" : "Edit image"}</div>
        <h1>{mode === "create" ? "Upload an Image" : "Update Image Details"}</h1>
      </div>
      <div className="field-grid">
        {mode === "create" ? (
          <div className="field">
            <label htmlFor="image">Image File</label>
            <input accept="image/*" id="image" name="image" required type="file" />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="prompt">Prompt</label>
          <textarea id="prompt" name="prompt" required defaultValue={image?.prompt} />
        </div>
        <div className="field">
          <label htmlFor="model">Model</label>
          <input
            autoComplete="off"
            id="model"
            list="model-suggestions"
            name="model"
            onChange={(event) => setModel(event.target.value)}
            required
            value={model}
          />
          <datalist id="model-suggestions">
            {models.map((existingModel) => (
              <option key={existingModel} value={existingModel} />
            ))}
          </datalist>
          {models.length > 0 ? (
            <div className="suggestion-row" aria-label="Existing models">
              {models.map((existingModel) => (
                <button
                  className={`suggestion-chip ${model === existingModel ? "active" : ""}`}
                  key={existingModel}
                  onClick={() => setModel(existingModel)}
                  type="button"
                >
                  {existingModel}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <input
            autoComplete="off"
            id="category"
            list="category-suggestions"
            name="category"
            onChange={(event) => setCategory(event.target.value)}
            required
            value={category}
          />
          <datalist id="category-suggestions">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          {categories.length > 0 ? (
            <div className="suggestion-row" aria-label="Existing categories">
              {categories.map((existingCategory) => (
                <button
                  className={`suggestion-chip ${category === existingCategory ? "active" : ""}`}
                  key={existingCategory}
                  onClick={() => setCategory(existingCategory)}
                  type="button"
                >
                  {existingCategory}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="topbar-actions">
        <Link className="button" href="/admin">
          Cancel
        </Link>
        <button className="button primary" type="submit">
          {mode === "create" ? "Upload image" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
