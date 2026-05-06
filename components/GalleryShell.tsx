"use client";

import { Check, Copy, LogIn, Search, SlidersHorizontal, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GalleryImage } from "@/lib/types";
import { formatDate } from "@/lib/format";

type GalleryShellProps = {
  images: GalleryImage[];
  categories: string[];
  isAdmin: boolean;
  models: string[];
};

export function GalleryShell({ images, categories, isAdmin, models }: GalleryShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>([]);
  const [textSearch, setTextSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [copiedImageId, setCopiedImageId] = useState<string | null>(null);
  const [expandedPromptImageId, setExpandedPromptImageId] = useState<string | null>(null);
  const [isMobileImageExpanded, setIsMobileImageExpanded] = useState(false);
  const selectedId = searchParams.get("image");
  const selectedImage = images.find((image) => image.id === selectedId) ?? null;
  const shouldCollapsePrompt = Boolean(selectedImage && selectedImage.prompt.length > 360);
  const promptExpanded = Boolean(selectedImage && expandedPromptImageId === selectedImage.id);

  const filteredImages = useMemo(() => {
    const searchKeywords = textSearch
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return images.filter((image) => {
      const categoryMatches = activeCategories.length === 0 || activeCategories.includes(image.category);
      const modelMatches = activeModels.length === 0 || activeModels.includes(image.model);
      const searchableText = `${image.title} ${image.prompt}`.toLowerCase();
      const searchMatches = searchKeywords.every((keyword) => searchableText.includes(keyword));
      return categoryMatches && modelMatches && searchMatches;
    });
  }, [activeCategories, activeModels, images, textSearch]);

  const activeFilterCount = activeCategories.length + activeModels.length;

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

  function openImage(id: string) {
    setIsMobileImageExpanded(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("image", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closeImage() {
    setIsMobileImageExpanded(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("image");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function copyPromptWithSelection(prompt: string) {
    const textarea = document.createElement("textarea");
    textarea.value = prompt;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.inset = "0 auto auto 0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  async function copyPrompt(image: GalleryImage) {
    let copied = copyPromptWithSelection(image.prompt);

    if (!copied && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(image.prompt);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      return;
    }

    setCopiedImageId(image.id);
    window.setTimeout(() => setCopiedImageId(null), 1600);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="AI Art Hub home">
          <span className="brand-mark">
            <Image alt="" height={46} priority src="/brand/ai-art-hub-logo.png" width={46} />
          </span>
          <span className="brand-text">
            <span className="brand-title">AI Art Hub</span>
            <span className="brand-subtitle">
              A personal collection of <span className="accent-text">AI-generated</span> images, showcasing how models
              transform ideas into visuals. All prompts are available for you to copy, tweak, and experiment with.
            </span>
          </span>
        </Link>
        <nav className="topbar-actions" aria-label="Primary navigation">
          {isAdmin ? (
            <>
              <Link className="button" href="/admin">
                Manage
              </Link>
              <Link className="button primary" href="/admin/new">
                <Upload size={16} />
                Upload
              </Link>
            </>
          ) : (
            <Link className="button" href="/login">
              <LogIn size={16} />
              Log In
            </Link>
          )}
        </nav>
      </header>

      <section className="gallery-filter-panel" aria-label="Gallery filters">
        <label className="gallery-search-field" htmlFor="gallery-search">
          <div className="search-input-wrap">
            <Search aria-hidden="true" size={16} />
            <input
              aria-label="Search"
              autoComplete="off"
              id="gallery-search"
              onChange={(event) => setTextSearch(event.target.value)}
              placeholder="Search text"
              type="search"
              value={textSearch}
            />
          </div>
        </label>
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
                <div className="filter-row" aria-label="Image categories">
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
                <div className="filter-row" aria-label="Image models">
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
            </div>
          ) : null}
        </div>
      </section>

      {filteredImages.length > 0 ? (
        <section className="gallery-grid" aria-label="Gallery images">
          {filteredImages.map((image, index) => (
            <button
              aria-label={`Open ${image.title}`}
              className="gallery-card"
              key={image.id}
              onClick={() => openImage(image.id)}
              style={{ "--delay": `${Math.min(index * 40, 420)}ms` } as React.CSSProperties}
              type="button"
            >
              <Image
                alt={image.title}
                decoding="async"
                height={image.height}
                loading={index < 2 ? undefined : "lazy"}
                priority={index < 2}
                quality={78}
                sizes="(max-width: 760px) calc(100vw - 24px), 320px"
                src={image.imagePath}
                width={image.width}
              />
            </button>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <p>No images match these filters.</p>
        </section>
      )}

      {selectedImage ? (
        <section aria-modal="true" className="modal-backdrop" onClick={closeImage} role="dialog">
          <div
            className={`modal-shell ${isMobileImageExpanded ? "mobile-image-expanded" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button aria-label="Close image" className="icon-button" onClick={closeImage} type="button">
              <X size={18} />
            </button>
            <button
              aria-expanded={isMobileImageExpanded}
              aria-label={isMobileImageExpanded ? "Collapse full-size image" : "Expand image to full size"}
              className={`modal-image-frame ${isMobileImageExpanded ? "expanded" : ""}`}
              onClick={() => setIsMobileImageExpanded((expanded) => !expanded)}
              type="button"
            >
              <Image
                alt={selectedImage.title}
                decoding="async"
                height={selectedImage.height}
                quality={86}
                sizes="(max-width: 1180px) 100vw, 68vw"
                src={selectedImage.imagePath}
                width={selectedImage.width}
              />
            </button>
            <aside className="prompt-panel">
              <div className="prompt-heading">
                <h2>Prompt Details</h2>
                <button
                  aria-label="Copy prompt"
                  className="button copy-button"
                  onClick={() => copyPrompt(selectedImage)}
                  type="button"
                >
                  {copiedImageId === selectedImage.id ? <Check size={16} /> : <Copy size={16} />}
                  {copiedImageId === selectedImage.id ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="prompt-copy">
                <p className={`prompt-text ${shouldCollapsePrompt && !promptExpanded ? "collapsed" : ""}`}>
                  {selectedImage.prompt}
                </p>
                {shouldCollapsePrompt ? (
                  <button
                    aria-expanded={promptExpanded}
                    className="text-button prompt-more-button"
                    onClick={() =>
                      setExpandedPromptImageId((expandedImageId) =>
                        expandedImageId === selectedImage.id ? null : selectedImage.id
                      )
                    }
                    type="button"
                  >
                    {promptExpanded ? "Show less" : "More"}
                  </button>
                ) : null}
              </div>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Model</span>
                  <span className="meta-value">{selectedImage.model}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{selectedImage.category}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created</span>
                  <span className="meta-value">{formatDate(selectedImage.createdAt)}</span>
                </div>
              </div>
              {isAdmin ? (
                <Link className="button primary" href={`/admin/images/${selectedImage.id}/edit`}>
                  Edit Image
                </Link>
              ) : null}
            </aside>
          </div>
        </section>
      ) : null}
    </main>
  );
}
