# Build:
# docker buildx build --platform linux/amd64,linux/arm64 -f apps/api/Dockerfile -t nulldoubt/pepperminto-api:latest --push .
# FROM node:16

# ENV port=8090
# COPY . .

# RUN pnpm install
# RUN pnpm build

# EXPOSE 8090
# CMD [ "node", "./dist/main.js" ]

FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

FROM base AS builder

# Set working directory
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm dlx turbo@2.7.2 prune --scope=api --docker


# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts


# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json /app/turbo.json

# RUN rm -f apps/api/.env

RUN pnpm --filter api exec prisma generate --schema ./src/prisma/schema.prisma
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Don't run production as root
# RUN addgroup --system --gid 1001 prod
# RUN adduser --system --uid 1001 prod
# USER prod
COPY --from=installer /app .

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
