"use client";

import { Edit, LogOut, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { deleteImageAction, logoutAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import type { GalleryImage } from "@/lib/types";

type AdminShellProps = {
  categories: string[];
  images: GalleryImage[];
  models: string[];
};

export function AdminShell({ categories, images, models }: AdminShellProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const activeFilterCount = activeCategories.length + activeModels.length;

  const filteredImages = useMemo(() => {
    const searchKeywords = searchText
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return images.filter((image) => {
      const categoryMatches = activeCategories.length === 0 || activeCategories.includes(image.category);
      const modelMatches = activeModels.length === 0 || activeModels.includes(image.model);
      const searchableText = `${image.title} ${image.prompt} ${image.provider} ${image.model} ${image.category}`.toLowerCase();
      const searchMatches = searchKeywords.every((keyword) => searchableText.includes(keyword));
      return categoryMatches && modelMatches && searchMatches;
    });
  }, [activeCategories, activeModels, images, searchText]);

  function toggleCategory(category: string) {
    setActiveCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category]
    );
  }

  function toggleModel(model: string) {
    setActiveModels((currentModels) =>
      currentModels.includes(model)
        ? currentModels.filter((currentModel) => currentModel !== model)
        : [...currentModels, model]
    );
  }

  function clearFilters() {
    setActiveCategories([]);
    setActiveModels([]);
    setSearchText("");
  }

  return (
    <main className="page-shell">
      <div className="admin-shell">
        <section className="admin-panel">
          <div className="topbar-actions">
            <Link className="button primary" href="/admin/new">
              <Plus size={16} />
              Upload Image
            </Link>
            <Link className="button" href="/">
              View Gallery
            </Link>
            <form action={logoutAction}>
              <button className="button" type="submit">
                <LogOut size={16} style={{ transform: "scaleX(-1)" }} />
                Log Out
              </button>
            </form>
          </div>
          <div>
            <div className="panel-kicker">Admin</div>
            <h1>Manage Images</h1>
          </div>
          <div className="admin-unified-filter">
            <div className="search-input-wrap">
              <Search aria-hidden="true" size={16} />
              <input
                aria-label="Search"
                autoComplete="off"
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search text"
                type="search"
                value={searchText}
              />
            </div>
            <div className="filter-menu">
              <button
                aria-expanded={filtersOpen}
                className={`button filter-toggle ${activeFilterCount > 0 ? "active" : ""}`}
                onClick={() => setFiltersOpen((isOpen) => !isOpen)}
                type="button"
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 ? <span className="filter-count">{activeFilterCount}</span> : null}
              </button>
              {filtersOpen ? (
                <div className="filter-menu-panel">
                  <div className="filter-menu-group">
                    <div className="filter-menu-heading">
                      <span>Category</span>
                      <button className="text-button" onClick={() => setActiveCategories([])} type="button">
                        All
                      </button>
                    </div>
                    <div className="filter-row" aria-label="Filter images by category">
                      {categories.map((category) => (
                        <button
                          className={`chip ${activeCategories.includes(category) ? "active" : ""}`}
                          key={category}
                          onClick={() => toggleCategory(category)}
                          type="button"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="filter-menu-group">
                    <div className="filter-menu-heading">
                      <span>Model</span>
                      <button className="text-button" onClick={() => setActiveModels([])} type="button">
                        All
                      </button>
                    </div>
                    <div className="filter-row" aria-label="Filter images by model">
                      {models.map((model) => (
                        <button
                          className={`chip ${activeModels.includes(model) ? "active" : ""}`}
                          key={model}
                          onClick={() => toggleModel(model)}
                          type="button"
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="filter-menu-actions">
                    <button className="button" onClick={() => setFiltersOpen(false)} type="button">
                      Apply
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            {activeFilterCount > 0 || searchText ? (
              <button className="button" onClick={clearFilters} type="button">
                Clear
              </button>
            ) : null}
          </div>
          <div className="admin-list">
            {filteredImages.map((image) => (
              <article className="admin-row" key={image.id}>
                <Image alt="" height={72} loading="lazy" quality={60} sizes="72px" src={image.imagePath} width={72} />
                <div>
                  <p className="admin-row-title">{image.title}</p>
                  <p className="admin-row-meta">
                    {image.category} · {image.provider} · {image.model} · {formatDate(image.createdAt)}
                  </p>
                </div>
                <div className="row-actions">
                  <Link className="button" href={`/admin/images/${image.id}/edit`}>
                    <Edit size={15} />
                    Edit
                  </Link>
                  <form action={deleteImageAction.bind(null, image.id)}>
                    <button className="button danger" type="submit">
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
          {filteredImages.length === 0 ? <p className="admin-empty">No images match these filters yet.</p> : null}
        </section>
      </div>
    </main>
  );
}
