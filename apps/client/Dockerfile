FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN pnpm dlx turbo@2.7.2 prune --scope=client --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json /app/turbo.json
RUN pnpm turbo run build --filter=client...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
COPY --from=installer /app .

EXPOSE 3002
CMD ["pnpm", "--filter", "client", "start"]
