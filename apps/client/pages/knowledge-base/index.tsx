import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "react-query";
import { useUser } from "../../store/session";

function groupArticlesByDate(articles) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return articles.reduce(
    (groups, article) => {
      const updatedAt = new Date(article.updatedAt);

      if (updatedAt.toDateString() === today.toDateString()) {
        groups.today.push(article);
      } else if (updatedAt.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(article);
      } else if (isThisWeek(updatedAt, today)) {
        groups.thisWeek.push(article);
      } else if (isThisMonth(updatedAt, today)) {
        groups.thisMonth.push(article);
      } else {
        groups.older.push(article);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    }
  );
}

function isThisWeek(date, today) {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  return date >= weekStart;
}

function isThisMonth(date, today) {
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

async function fetchArticles(token) {
  const res = await fetch(`/api/v1/knowledge-base/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());

  return res;
}

export default function KnowledgeBaseIndex() {
  const { user } = useUser();
  const [sortBy, setSortBy] = useState("updatedAt");
  const [searchQuery, setSearchQuery] = useState("");

  const token = getCookie("session");
  const { data, status } = useQuery("kbArticles", () => fetchArticles(token));

  const router = useRouter();

  async function createNew() {
    const res = await fetch(`/api/v1/knowledge-base`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Untitled knowledge base article",
        body: "",
        tags: "",
        published: false,
      }),
    }).then((res) => res.json());

    if (res.success && res.article?.id) {
      router.push(`/knowledge-base/${res.article.id}`);
    }
  }

  const sortedAndFilteredArticles = (articles) => {
    if (!articles) return [];

    let filtered = articles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const dateA = new Date(a[sortBy]);
      const dateB = new Date(b[sortBy]);
      //@ts-ignore
      return dateB - dateA;
    });
  };

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

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-foreground">
            Knowledge Base
          </h1>
          <div className="flex items-center w-full justify-center flex-row space-x-2 flex-1 mr-2">
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="mt-8 w-full flex justify-center">
        {status === "loading" && <p>Loading...</p>}
        {data && data.articles && data.articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              No knowledge base entries found.
            </p>
            <Button variant="outline" size="sm" onClick={() => createNew()}>
              New Article
            </Button>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-2xl justify-center space-y-4">
            {data && data.articles && data.articles.length > 0 && (
              <div className="flex w-full justify-end">
                <Button variant="outline" size="sm" onClick={() => createNew()}>
                  New Article
                </Button>
              </div>
            )}

            {data?.articles &&
              Object.entries(
                groupArticlesByDate(
                  sortedAndFilteredArticles(data.articles)
                )
              ).map(
                ([period, articles]) =>
                  Array.isArray(articles) &&
                  articles.length > 0 && (
                    <div key={period} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {period.replace(/([A-Z])/g, " $1").trim()}
                      </h3>
                      <div className="space-y-1">
                        {articles.map((item) => (
                          <button
                            key={item.id}
                            className="flex flex-row w-full justify-between items-center align-middle transition-colors"
                            onClick={() => router.push(`/knowledge-base/${item.id}`)}
                          >
                            <div className="flex flex-col text-left">
                              <h2 className="text-md font-semibold text-gray-900 dark:text-white">
                                {item.title}
                              </h2>
                              <span className="text-xs text-gray-500">
                                {item.public ? "Published" : "Draft"}
                              </span>
                            </div>
                            <div className="space-x-2 flex flex-row items-center">
                              <span className="text-sm text-gray-500">
                                {new Date(item.updatedAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
              )}
          </div>
        )}
      </div>
    </div>
  );
}
