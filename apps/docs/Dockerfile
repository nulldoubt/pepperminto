FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app
RUN corepack enable
RUN pnpm add -g turbo
COPY . .
RUN turbo prune --scope=docs --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json /app/turbo.json
RUN pnpm turbo run build --filter=docs...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=installer /app .

EXPOSE 3003
CMD ["pnpm", "--filter", "docs", "start"]
