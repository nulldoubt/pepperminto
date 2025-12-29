//@ts-nocheck
import { toast } from "@/shadcn/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Input } from "@/shadcn/ui/input";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { getCookie } from "cookies-next";
import { Ellipsis } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useUser } from "../../store/session";

function isHTML(str) {
  var a = document.createElement("div");
  a.innerHTML = str;

  for (var c = a.childNodes, i = c.length; i--; ) {
    if (c[i].nodeType == 1) return true;
  }

  return false;
}

function toCsv(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export default function KnowledgeBaseEditor() {
  const router = useRouter();
  const token = getCookie("session");

  const { user } = useUser();

  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");

  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({ initialContent });
  }, [initialContent]);

  const [value, setValue] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState();
  const [ready, setReady] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  const [debouncedValue] = useDebounce(value, 700);
  const [debouncedTitle] = useDebounce(title, 700);
  const [debouncedSlug] = useDebounce(slug, 700);
  const [debouncedAuthor] = useDebounce(author, 700);
  const [debouncedTags] = useDebounce(tags, 700);
  const [debouncedPublished] = useDebounce(published, 700);

  async function fetchArticle() {
    setValue(undefined);
    setLoading(true);

    const res = await fetch(`/api/v1/knowledge-base/${router.query.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    if (!res.success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.message || "Unable to load article",
      });
      setLoading(false);
      return;
    }

    const article = res.article;
    await loadFromStorage(article.content).then((content) => {
      setInitialContent(content);
    });

    setTitle(article.title || "");
    setSlug(article.slug || "");
    setAuthor(article.author || "");
    setTags(toCsv(article.tags));
    setPublished(Boolean(article.public));
    setLoading(false);
    setReady(true);
  }

  async function updateArticle() {
    if (!ready) return;
    setSaving(true);

    const payload: any = {
      title: debouncedTitle,
      slug: debouncedSlug,
      author: debouncedAuthor,
      tags: debouncedTags,
      published: debouncedPublished,
    };

    if (debouncedValue !== undefined) {
      payload.body = JSON.stringify(debouncedValue);
    }

    const res = await fetch(`/api/v1/knowledge-base/${router.query.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);
    let date = new Date();
    setLastSaved(new Date(date).getTime());

    if (data.status || data.success === false) {
      toast({
        variant: "destructive",
        title: "Error",
        description: data.message || "Unable to update",
      });
    }
  }

  async function deleteArticle() {
    if (window.confirm("Do you really want to delete this article?")) {
      await fetch(`/api/v1/knowledge-base/${router.query.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            router.push("/knowledge-base");
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: res.message,
            });
          }
        });
    }
  }

  useEffect(() => {
    if (!router.query.id) return;
    fetchArticle();
  }, [router]);

  useEffect(() => {
    if (editor && ready && value === undefined) {
      setValue(editor.document);
    }
  }, [editor, ready, value]);

  useEffect(() => {
    if (
      debouncedValue ||
      debouncedTitle ||
      debouncedSlug ||
      debouncedTags ||
      debouncedAuthor ||
      debouncedPublished !== undefined
    ) {
      updateArticle();
    }
  }, [
    debouncedValue,
    debouncedTitle,
    debouncedSlug,
    debouncedAuthor,
    debouncedTags,
    debouncedPublished,
  ]);

  async function loadFromStorage(val) {
    const storageString = val;

    if (isHTML(storageString)) {
      return undefined;
    } else {
      return storageString
        ? (JSON.parse(storageString) as PartialBlock[])
        : undefined;
    }
  }

  useEffect(() => {
    if (editor && initialContent === undefined) {
      editor.replaceBlocks(editor.document, []);
    }
  }, [initialContent, editor]);

  if (editor === undefined) {
    return "Loading content...";
  }

  if (!user?.isAdmin) {
    return (
      <div className="px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">
          Knowledge Base
        </h1>
        <p className="mt-2 text-sm text-foreground">
          Admin access is required to manage knowledge base content.
        </p>
      </div>
    );
  }

  const handleInputChange = (editor) => {
    setValue(editor.document);
  };

  return (
    <>
      <div className="flex flex-row items-center justify-between py-2 px-6 space-x-4 mt-2">
        <div className="flex items-center gap-2 text-xs">
          {saving ? (
            <span>saving ....</span>
          ) : (
            <span className="cursor-pointer">
              last saved: {moment(lastSaved).format("hh:mm:ss")}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {published ? "Published" : "Draft"}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-6">
            <DropdownMenuItem
              className="hover:bg-red-600"
              onClick={() => deleteArticle()}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!loading && (
        <div className="m-h-[90vh] p-2 w-full flex justify-center">
          <div className="w-full max-w-3xl space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm text-foreground">Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-foreground">Author</label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm text-foreground">Tags (CSV)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Publish to public knowledge base
            </label>

            <BlockNoteView
              editor={editor}
              sideMenu={false}
              className="m-0 p-0"
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}
    </>
  );
}
