import Link from "next/link";
import ThemeToggle from "../components/theme-toggle";

const API_URL = process.env.API_URL || "http://localhost:3001";
const BASE_URL = process.env.BASE_URL || "https://pepperminto.dev";
const DOCS_URL = process.env.DOCS_URL || "https://docs.pepperminto.dev";
const DASHBOARD_URL =
  process.env.DASHBOARD_URL || "https://dashboard.demo.pepperminto.dev";

type Article = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  author: string;
  content: string;
  updatedAt: string;
};

type BlockContent = {
  type?: string;
  text?: string;
  content?: BlockContent[];
};

type BlockNode = {
  type?: string;
  content?: BlockContent[];
  children?: BlockNode[];
};

async function getArticles(query?: string, tag?: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (tag) params.set("tag", tag);

  try {
    const res = await fetch(
      `${API_URL}/api/v1/knowledge-base/public?${params.toString()}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return [] as Article[];
    }

    const data = await res.json();
    return (data.articles || []) as Article[];
  } catch (error) {
    return [] as Article[];
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function extractTextFromBlock(block: BlockNode): string {
  const contentText = (block.content || [])
    .map((child) => (child.text ? child.text : ""))
    .join("");
  const childText = (block.children || [])
    .map((child) => extractTextFromBlock(child))
    .join(" ");
  return [contentText, childText].filter(Boolean).join(" ");
}

function getExcerpt(raw: string) {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const blocks = JSON.parse(trimmed) as BlockNode[];
      const text = blocks.map((block) => extractTextFromBlock(block)).join(" ");
      return text;
    } catch (error) {
      return raw;
    }
  }
  return raw;
}

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const query = searchParams.q || "";
  const tag = searchParams.tag || "";
  const articles = await getArticles(query, tag);

  const tags = Array.from(
    new Set(articles.flatMap((article) => article.tags || []))
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-grid text-slate-900 dark:text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🍵</span>
          <span className="text-lg font-semibold tracking-wide">
            Pepperminto Help Center
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 dark:text-slate-300 md:flex">
          <a className="hover:text-slate-900 dark:hover:text-white" href={BASE_URL}>
            Main Site
          </a>
          <a className="hover:text-slate-900 dark:hover:text-white" href={DOCS_URL}>
            Docs
          </a>
          <a className="hover:text-slate-900 dark:hover:text-white" href={DASHBOARD_URL}>
            Dashboard
          </a>
          <a className="hover:text-slate-900 dark:hover:text-white" href="https://github.com/nulldoubt/Pepperminto">
            GitHub
          </a>
          <ThemeToggle />
        </nav>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-4">
        <div className="rounded-3xl border border-slate-200 bg-white/80 px-8 py-10 shadow-2xl shadow-teal-500/5 dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-700 dark:text-teal-300">
            Knowledge Base
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900 md:text-5xl dark:text-white">
            Find answers fast. Keep issues calm.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Search curated guides, troubleshooting checklists, and step-by-step
            workflows for running Pepperminto. Articles here are written by the
            team and updated with every release.
          </p>

          <form className="mt-8 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="sr-only" htmlFor="search">
                Search articles
              </label>
              <input
                id="search"
                name="q"
                defaultValue={query}
                placeholder="Search articles, tags, or authors"
                className="w-full rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-400 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
            >
              Search
            </button>
          </form>

          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tagName) => (
                <Link
                  key={tagName}
                  href={`/?tag=${encodeURIComponent(tagName)}`}
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                    tag === tagName
                      ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:border-teal-400 dark:text-teal-200"
                      : "border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-700 dark:border-slate-800 dark:text-slate-400 dark:hover:border-teal-500 dark:hover:text-teal-200"
                  }`}
                >
                  {tagName}
                </Link>
              ))}
              {tag && (
                <Link
                  href="/"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400"
                >
                  Clear
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {query || tag ? "Search Results" : "Featured Articles"}
              </h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                {articles.length} articles
              </span>
            </div>

            {articles.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-8 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                No articles yet. Once the admin publishes entries, they will
                appear here.
              </div>
            ) : (
              articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-white/70 p-6 transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-200">
                      {article.title}
                    </h3>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {formatDate(article.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {getExcerpt(article.content).slice(0, 180)}
                    {getExcerpt(article.content).length > 180 ? "..." : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>By {article.author}</span>
                    <span className="text-slate-700">•</span>
                    <span>{(article.tags || []).join(", ") || "General"}</span>
                  </div>
                </Link>
              ))
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700 dark:text-teal-300">
                Popular Topics
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {tags.length === 0 ? (
                  <p className="text-slate-500">
                    Tags will appear as knowledge base articles are added.
                  </p>
                ) : (
                  tags.map((tagName) => (
                    <Link
                      key={tagName}
                      href={`/?tag=${encodeURIComponent(tagName)}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 hover:border-teal-500 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:text-teal-200"
                    >
                      <span>{tagName}</span>
                      <span className="text-xs text-slate-500">Explore</span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700 dark:text-teal-300">
                Need more help?
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                If you can&apos;t find what you need, open a ticket and we&apos;ll
                help you fast.
              </p>
              <a
                href={DASHBOARD_URL}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                Contact support
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
