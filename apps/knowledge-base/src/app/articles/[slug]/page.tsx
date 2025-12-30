import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Article = {
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

async function getArticle(slug: string) {
  const res = await fetch(
    `${API_URL}/api/v1/knowledge-base/public/${encodeURIComponent(slug)}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.article as Article;
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

function getParagraphs(raw: string) {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const blocks = JSON.parse(trimmed) as BlockNode[];
      return blocks
        .map((block) => extractTextFromBlock(block))
        .filter(Boolean);
    } catch (error) {
      return raw.split("\n");
    }
  }
  return raw.split("\n");
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const paragraphs = getParagraphs(article.content);

  return (
    <div className="min-h-screen bg-grid text-slate-100">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🍵</span>
          <span className="text-lg font-semibold tracking-wide">
            Peppermint Help Center
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-300 hover:text-white"
        >
          Back to all articles
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 pb-16">
        <article className="rounded-3xl border border-slate-800 bg-slate-950/70 px-8 py-10 shadow-2xl shadow-teal-500/10">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-teal-300">
            {(article.tags || []).length > 0
              ? article.tags.join(" • ")
              : "General"}
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">
            Updated {formatDate(article.updatedAt)} · {article.author}
          </p>

          <div className="mt-8 space-y-4 text-base leading-7 text-slate-200">
            {paragraphs.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
