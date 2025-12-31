# FROM node:16

# ENV port=8090
# COPY . .

# RUN pnpm install
# RUN pnpm build

# EXPOSE 8090
# CMD [ "node", "./dist/main.js" ]

FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

# The web Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update this Dockerfile, the Dockerfile in the web workspace and copy that over to Dockerfile in the docs.

FROM base AS builder

# Set working directory
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm dlx turbo@2.7.2 prune --scope=api --docker


# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
RUN pnpm install --frozen-lockfile --ignore-scripts


# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
RUN ls
COPY turbo.json /app/turbo.json

# RUN rm -f apps/api/.env

RUN pnpm --filter api prisma generate --schema ./apps/api/src/prisma/schema.prisma
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app

# Don't run production as root
# RUN addgroup --system --gid 1001 prod
# RUN adduser --system --uid 1001 prod
# USER prod
COPY --from=installer /app .

EXPOSE 8090
CMD ["node", "apps/api/dist/"]
