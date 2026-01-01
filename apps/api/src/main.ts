import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import "dotenv/config";
import Fastify, { FastifyInstance } from "fastify";
import multer from "fastify-multer";
import { exec } from "child_process";
import fs from "fs";
import { track } from "./lib/hog";
import { getEmails } from "./lib/imap";
import { checkToken } from "./lib/jwt";
import { prisma } from "./prisma";
import { registerRoutes } from "./routes";

// Ensure the directory exists
const logFilePath = "./logs.log"; // Update this path to a writable location

// Create a writable stream
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Initialize Fastify with logger
const server: FastifyInstance = Fastify({
  logger: {
    stream: logStream, // Use the writable stream
  },
  disableRequestLogging: true,
  trustProxy: true,
});

const publicRoutes = new Set([
  "/",
  "/api/v1/auth/login",
  "/api/v1/ticket/public/create",
  "/docs",
  "/docs/json",
  "/docs/yaml",
]);

function isPublicRoute(url: string) {
  return (
    publicRoutes.has(url) ||
    url.startsWith("/docs/") ||
    url.startsWith("/api/v1/knowledge-base/public")
  );
}

function inferTag(url: string) {
  if (url === "/") {
    return "health";
  }
  const parts = url.split("/").filter(Boolean);
  const resource = parts[2] || "general";
  const tagMap: Record<string, string> = {
    auth: "auth",
    ticket: "tickets",
    tickets: "tickets",
    client: "clients",
    clients: "clients",
    config: "config",
    data: "data",
    notebook: "notebook",
    queue: "queue",
    webhooks: "webhooks",
    storage: "storage",
    roles: "roles",
    users: "users",
    time: "time",
    "knowledge-base": "knowledge-base",
  };
  return tagMap[resource] || "general";
}

server.register(async (app) => {
  app.addHook("onRoute", (routeOptions: any) => {
    const url = routeOptions.url as string;
    if (!url.startsWith("/api") && url !== "/") {
      return;
    }
    const method = Array.isArray(routeOptions.method)
      ? routeOptions.method.join(",")
      : routeOptions.method;

    const schema = routeOptions.schema ?? {};
    if (!schema.tags) {
      schema.tags = [inferTag(url)];
    }
    if (!schema.summary) {
      schema.summary = `${method} ${url}`;
    }
    if (!schema.security && !isPublicRoute(url)) {
      schema.security = [{ bearerAuth: [] }];
    }
    routeOptions.schema = schema;
  });

  app.register(cors, {
    origin: "*",

    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  app.register(multer.contentParser);

  registerRoutes(app);

  app.get(
    "/",
    {
      schema: {
        tags: ["health"], // This groups the endpoint under a category
        description: "Health check endpoint",
        response: {
          200: {
            type: "object",
            properties: {
              healthy: { type: "boolean" },
            },
          },
        },
      },
    },
    async function (request, response) {
      response.send({ healthy: true });
    }
  );

  // JWT authentication hook
  app.addHook("preHandler", async function (request: any, reply: any) {
    try {
      if (isPublicRoute(request.url)) {
        return true;
      }
      const bearer = request.headers.authorization!.split(" ")[1];
      checkToken(bearer);
    } catch (err) {
      reply.status(401).send({
        message: "Unauthorized",
        success: false,
      });
    }
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "Pepperminto API",
        description: "Pepperminto API documentation",
        version: "1.0.0",
      },
      servers: [
        {
          url: process.env.API_BASE_URL || "http://localhost:3001",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });
});

const start = async () => {
  try {
    // Run prisma generate and migrate commands before starting the server
    const prismaBin = process.env.PRISMA_CLI_PATH;
    const prismaCmd =
      prismaBin && fs.existsSync(prismaBin)
        ? prismaBin
        : "node ./apps/api/node_modules/prisma/build/index.js";
    const prismaSchema =
      process.env.PRISMA_SCHEMA_PATH ??
      "./apps/api/src/prisma/schema.prisma";

    await new Promise<void>((resolve, reject) => {
      exec(
        `${prismaCmd} migrate deploy --schema ${prismaSchema}`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          console.log(stdout);
          console.error(stderr);

          exec(
            `${prismaCmd} generate --schema ${prismaSchema}`,
            (err, stdout, stderr) => {
              if (err) {
                console.error(err);
                reject(err);
              }
              console.log(stdout);
              console.error(stderr);
            }
          );

          exec(
            `${prismaCmd} db seed --schema ${prismaSchema}`,
            (err, stdout, stderr) => {
              if (err) {
                console.error(err);
                reject(err);
              }
              console.log(stdout);
              console.error(stderr);
              resolve();
            }
          );
        }
      );
    });

    // connect to database
    await prisma.$connect();
    server.log.info("Connected to Prisma");

    server.listen(
      { port: 3001, host: "0.0.0.0" },
      async (err, address) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        const client = track();

        client.capture({
          event: "server_started",
          distinctId: "uuid",
        });

        client.shutdown();
        console.info(`Server listening on ${address}`);
      }
    );

    setInterval(() => getEmails(), 10000); // Call getEmails every minute
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
