import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../prisma";

export function timeTrackingRoutes(fastify: FastifyInstance) {
  // Create a new entry
  fastify.post(
    "/api/v1/time/new",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            time: { type: ["string", "number"] },
            ticket: { type: "string" },
            title: { type: "string" },
            user: { type: "string" },
          },
          required: ["time", "ticket", "title", "user"],
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
      const { time, ticket, title, user }: any = request.body;

      console.log(request.body);

      await prisma.timeTracking.create({
        data: {
          time: Number(time),
          title,
          userId: user,
          ticketId: ticket,
        },
      });

      reply.send({
        success: true,
      });
    }
  );

  // Get all entries

  // Delete an entry
}
