import { getCookie } from "cookies-next";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

async function getArticles() {
  const res = await fetch(`/api/v1/knowledge-base/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie("session")}`,
    },
  });

  return res.json();
}

function formatTags(tags: string[] | null | undefined) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export default function KnowledgeBaseAdmin() {
  const { data, refetch } = useQuery({
    queryKey: ["kb-admin"],
    queryFn: getArticles,
  });
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);

  const articles = useMemo(() => data?.articles || [], [data]);

  function resetForm() {
    setActiveId(null);
    setTitle("");
    setSlug("");
    setAuthor("");
    setTags("");
    setBody("");
    setPublished(false);
  }

  function editArticle(article: any) {
    setActiveId(article.id);
    setTitle(article.title || "");
    setSlug(article.slug || "");
    setAuthor(article.author || "");
    setTags(formatTags(article.tags));
    setBody(article.content || "");
    setPublished(Boolean(article.public));
    setMode("edit");
  }

  async function saveArticle() {
    const payload = {
      title,
      body,
      tags,
      author,
      published,
      slug,
    };

    const isEdit = Boolean(activeId);
    const res = await fetch(
      isEdit
        ? `/api/v1/knowledge-base/${activeId}`
        : `/api/v1/knowledge-base`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getCookie("session")}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (data.success) {
      await refetch();
      setMode("list");
      resetForm();
    } else {
      alert(data.message || "Unable to save article");
    }
  }

  async function deleteArticle(id: string) {
    const res = await fetch(`/api/v1/knowledge-base/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getCookie("session")}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      await refetch();
    } else {
      alert(data.message || "Unable to delete article");
    }
  }

  return (
    <main className="flex-1">
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Knowledge Base
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create and publish help center articles for customers.
            </p>
          </div>
          <div className="flex gap-2">
            {mode === "list" ? (
              <button
                onClick={() => setMode("edit")}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                New Article
              </button>
            ) : (
              <button
                onClick={() => {
                  setMode("list");
                  resetForm();
                }}
                className="rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur hover:bg-accent/50"
              >
                Back to list
              </button>
            )}
          </div>
        </div>

        {mode === "list" && (
          <div className="mt-8 space-y-4">
            {articles.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-foreground shadow-sm backdrop-blur">
                No knowledge base entries yet.
              </div>
            ) : (
              articles.map((article: any) => (
                <div
                  key={article.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {article.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {article.author} • {article.slug}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {article.public ? "Published" : "Draft"} •{" "}
                      {formatTags(article.tags) || "No tags"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editArticle(article)}
                      className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteArticle(article.id)}
                      className="rounded-full border border-destructive/60 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mode === "edit" && (
          <div className="mt-8 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="New article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="mt-2 w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="optional-custom-slug"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Author
                  </label>
                  <input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    className="mt-2 w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Tags (CSV)
                  </label>
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    className="mt-2 w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="install, email, sso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="mt-2 h-48 w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Write the article content here..."
                />
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Publish immediately
              </label>

              <div className="flex gap-3">
                <button
                  onClick={saveArticle}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  {activeId ? "Update Article" : "Create Article"}
                </button>
                <button
                  onClick={() => {
                    setMode("list");
                    resetForm();
                  }}
                  className="rounded-full border border-border/70 px-6 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-accent/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
