import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { OAuth2Client } from "google-auth-library";
import { track } from "../lib/hog";
import { prisma } from "../prisma";

async function tracking(event: string, properties: any) {
  const client = track();

  client.capture({
    event: event,
    properties: properties,
    distinctId: "uuid",
  });

  client.shutdown();
}

export function emailQueueRoutes(fastify: FastifyInstance) {
  // Create a new email queue
  fastify.post(
    "/api/v1/email-queue/create",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            username: { type: "string" },
            password: { type: "string" },
            hostname: { type: "string" },
            tls: { type: ["boolean", "string"] },
            serviceType: { type: "string" },
            clientId: { type: "string" },
            clientSecret: { type: "string" },
            redirectUri: { type: "string" },
          },
          required: ["name", "serviceType"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              authorizeUrl: { type: "string" },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const {
        name,
        username,
        password,
        hostname,
        tls,
        serviceType,
        clientId,
        clientSecret,
        redirectUri,
      }: any = request.body;

      const mailbox = await prisma.emailQueue.create({
        data: {
          name: name,
          username,
          password,
          hostname,
          tls,
          serviceType,
          clientId,
          clientSecret,
          redirectUri,
        },
      });

      // generate redirect uri
      switch (serviceType) {
        case "gmail":
          const google = new OAuth2Client(clientId, clientSecret, redirectUri);

          const authorizeUrl = google.generateAuthUrl({
            access_type: "offline",
            scope: "https://mail.google.com",
            prompt: "consent",
            state: mailbox.id,
          });

          tracking("gmail_provider_created", {
            provider: "gmail",
          });

          reply.send({
            success: true,
            message: "Gmail imap provider created!",
            authorizeUrl: authorizeUrl,
          });
          break;
        case "other":
          tracking("imap_provider_created", {
            provider: "other",
          });

          reply.send({
            success: true,
            message: "Other service type created!",
          });
          break;
        default:
          reply.send({
            success: false,
            message: "Unsupported service type",
          });
      }
    }
  );

  // Google oauth callback
  fastify.get(
    "/api/v1/email-queue/oauth/gmail",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            code: { type: "string" },
            mailboxId: { type: "string" },
          },
          required: ["code", "mailboxId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
            additionalProperties: true,
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { code, mailboxId }: any = request.query;

      const mailbox = await prisma.emailQueue.findFirst({
        where: {
          id: mailboxId,
        },
      });

      const google = new OAuth2Client(
        //@ts-expect-error
        mailbox?.clientId,
        mailbox?.clientSecret,
        mailbox?.redirectUri
      );

      console.log(google);

      const r = await google.getToken(code);

      await prisma.emailQueue.update({
        where: { id: mailbox?.id },
        data: {
          refreshToken: r.tokens.refresh_token,
          accessToken: r.tokens.access_token,
          expiresIn: r.tokens.expiry_date,
          serviceType: "gmail",
        },
      });

      reply.send({
        success: true,
        message: "Mailbox updated!",
      });
    }
  );

  // Get all email queue's
  fastify.get(
    "/api/v1/email-queues/all",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              queues: {
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
      const queues = await prisma.emailQueue.findMany({
        select: {
          id: true,
          name: true,
          serviceType: true,
          active: true,
          teams: true,
          username: true,
          hostname: true,
          tls: true,
          clientId: true,
          redirectUri: true,
        },
      });

      reply.send({
        success: true,
        queues: queues,
      });
    }
  );

  // Delete an email queue
  fastify.delete(
    "/api/v1/email-queue/delete",
    {
      schema: {
        body: {
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
      const { id }: any = request.body;

      await prisma.emailQueue.delete({
        where: {
          id: id,
        },
      });

      reply.send({
        success: true,
      });
    }
  );
}
