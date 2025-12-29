import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { checkSession } from "../lib/session";
import { prisma } from "../prisma";

function parseTags(input?: string | string[]) {
  if (!input) {
    return [];
  }
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(input)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function ensureUniqueSlug(base: string, excludeId?: string) {
  let candidate = base || "article";
  let suffix = 1;
  while (true) {
    const existing = await prisma.knowledgeBase.findFirst({
      where: excludeId
        ? { slug: candidate, id: { not: excludeId } }
        : { slug: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
    candidate = `${base || "article"}-${suffix}`;
    suffix += 1;
  }
}

async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const user = await checkSession(request);
  if (!user?.isAdmin) {
    reply.status(403).send({
      success: false,
      message: "Admin access required",
    });
    return null;
  }
  return user;
}

export function knowledgeBaseRoutes(fastify: FastifyInstance) {
  // Public list
  fastify.get(
    "/api/v1/knowledge-base/public",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            q: { type: "string" },
            tag: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              articles: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { q, tag }: any = request.query;

      const where: any = { public: true };
      if (tag) {
        where.tags = { has: String(tag) };
      }
      if (q) {
        where.OR = [
          { title: { contains: String(q), mode: "insensitive" } },
          { content: { contains: String(q), mode: "insensitive" } },
          { author: { contains: String(q), mode: "insensitive" } },
        ];
      }

      const articles = await prisma.knowledgeBase.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          tags: true,
          author: true,
          public: true,
          createdAt: true,
          updatedAt: true,
          content: true,
        },
      });

      reply.send({ success: true, articles });
    }
  );

  // Public article by slug
  fastify.get(
    "/api/v1/knowledge-base/public/:slug",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            slug: { type: "string" },
          },
          required: ["slug"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              article: { type: "object", additionalProperties: true },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { slug }: any = request.params;
      const article = await prisma.knowledgeBase.findFirst({
        where: { slug: String(slug), public: true },
      });

      if (!article) {
        return reply.status(404).send({
          success: false,
          message: "Article not found",
        });
      }

      reply.send({ success: true, article });
    }
  );

  // Admin list
  fastify.get(
    "/api/v1/knowledge-base/all",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              articles: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await requireAdmin(request, reply);
      if (!user) {
        return;
      }

      const articles = await prisma.knowledgeBase.findMany({
        orderBy: { updatedAt: "desc" },
      });

      reply.send({ success: true, articles });
    }
  );

  // Admin get by id
  fastify.get(
    "/api/v1/knowledge-base/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              article: { type: "object", additionalProperties: true },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await requireAdmin(request, reply);
      if (!user) {
        return;
      }

      const { id }: any = request.params;
      const article = await prisma.knowledgeBase.findUnique({
        where: { id },
      });

      if (!article) {
        return reply.status(404).send({
          success: false,
          message: "Article not found",
        });
      }

      reply.send({ success: true, article });
    }
  );

  // Admin create
  fastify.post(
    "/api/v1/knowledge-base",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            tags: { type: ["string", "array"] },
            author: { type: "string" },
            published: { type: "boolean" },
            slug: { type: "string" },
          },
          required: ["title", "body"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              article: { type: "object", additionalProperties: true },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await requireAdmin(request, reply);
      if (!user) {
        return;
      }

      const { title, body, tags, author, published, slug }: any = request.body;
      const tagList = parseTags(tags);
      const baseSlug = slugify(slug || title);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      const article = await prisma.knowledgeBase.create({
        data: {
          title,
          content: body,
          tags: tagList,
          author: author || user.name,
          public: Boolean(published),
          slug: uniqueSlug,
        },
      });

      reply.send({ success: true, article });
    }
  );

  // Admin update
  fastify.put(
    "/api/v1/knowledge-base/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            tags: { type: ["string", "array"] },
            author: { type: "string" },
            published: { type: "boolean" },
            slug: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              article: { type: "object", additionalProperties: true },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await requireAdmin(request, reply);
      if (!user) {
        return;
      }

      const { id }: any = request.params;
      const { title, body, tags, author, published, slug }: any = request.body;

      const data: any = {};
      if (title !== undefined) data.title = title;
      if (body !== undefined) data.content = body;
      if (tags !== undefined) data.tags = parseTags(tags);
      if (author !== undefined) data.author = author;
      if (published !== undefined) data.public = Boolean(published);
      if (slug !== undefined || title !== undefined) {
        const baseSlug = slugify(slug || title || "");
        data.slug = await ensureUniqueSlug(baseSlug, id);
      }

      const article = await prisma.knowledgeBase.update({
        where: { id },
        data,
      });

      reply.send({ success: true, article });
    }
  );

  // Admin delete
  fastify.delete(
    "/api/v1/knowledge-base/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await requireAdmin(request, reply);
      if (!user) {
        return;
      }

      const { id }: any = request.params;

      await prisma.knowledgeBase.delete({
        where: { id },
      });

      reply.send({ success: true });
    }
  );
}
