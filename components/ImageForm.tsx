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

function dateInputValue(value?: string) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

export function ImageForm({ action, categories, image, mode, models }: ImageFormProps) {
  const [category, setCategory] = useState(image?.category ?? categories[0] ?? "Fantasy");
  const [model, setModel] = useState(image?.model ?? models[0] ?? "Midjourney");
  const [showAllModels, setShowAllModels] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleModels = showAllModels ? models : models.slice(0, 5);
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 5);

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
          <label htmlFor="createdAt">Image Date</label>
          <input id="createdAt" name="createdAt" required type="date" defaultValue={dateInputValue(image?.createdAt)} />
        </div>
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
              {visibleModels.map((existingModel) => (
                <button
                  className={`suggestion-chip ${model === existingModel ? "active" : ""}`}
                  key={existingModel}
                  onClick={() => setModel(existingModel)}
                  type="button"
                >
                  {existingModel}
                </button>
              ))}
              {models.length > 5 ? (
                <button className="suggestion-chip" onClick={() => setShowAllModels((current) => !current)} type="button">
                  {showAllModels ? "Show fewer" : `Show all (${models.length})`}
                </button>
              ) : null}
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
              {visibleCategories.map((existingCategory) => (
                <button
                  className={`suggestion-chip ${category === existingCategory ? "active" : ""}`}
                  key={existingCategory}
                  onClick={() => setCategory(existingCategory)}
                  type="button"
                >
                  {existingCategory}
                </button>
              ))}
              {categories.length > 5 ? (
                <button className="suggestion-chip" onClick={() => setShowAllCategories((current) => !current)} type="button">
                  {showAllCategories ? "Show fewer" : `Show all (${categories.length})`}
                </button>
              ) : null}
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
