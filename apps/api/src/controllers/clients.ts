import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { track } from "../lib/hog";
import { requirePermission } from "../lib/roles";
import { prisma } from "../prisma";

export function clientRoutes(fastify: FastifyInstance) {
  // Register a new client
  fastify.post(
    "/api/v1/client/create",
    {
      preHandler: requirePermission(["client::create"]),
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            number: { type: ["string", "number"] },
            contactName: { type: "string" },
          },
          required: ["name", "email", "number", "contactName"],
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
      const { name, email, number, contactName }: any = request.body;

      const client = await prisma.client.create({
        data: {
          name,
          contactName,
          email,
          number: String(number),
        },
      });

      const hog = track();

      hog.capture({
        event: "client_created",
        distinctId: client.id,
      });

      reply.send({
        success: true,
      });
    }
  );

  // Update client
  fastify.post(
    "/api/v1/client/update",
    {
      preHandler: requirePermission(["client::update"]),
      schema: {
        body: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            number: { type: ["string", "number"] },
            contactName: { type: "string" },
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
      const { name, email, number, contactName, id }: any = request.body;

      await prisma.client.update({
        where: { id: id },
        data: {
          name,
          contactName,
          email,
          number: String(number),
        },
      });

      reply.send({
        success: true,
      });
    }
  );

  // Get all clients
  fastify.get(
    "/api/v1/clients/all",
    {
      preHandler: requirePermission(["client::read"]),
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              clients: {
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
      const clients = await prisma.client.findMany({});

      reply.send({
        success: true,
        clients: clients,
      });
    }
  );

  // Delete client
  fastify.delete(
    "/api/v1/clients/:id/delete-client",
    {
      preHandler: requirePermission(["client::delete"]),
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
      const { id }: any = request.params;

      await prisma.client.delete({
        where: { id: id },
      });

      reply.send({
        success: true,
      });
    }
  );
}
