# Build:
# docker buildx build --platform linux/amd64,linux/arm64 -f apps/landing-page/Dockerfile -t nulldoubt/pepperminto-landing-page:latest --push .
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm dlx turbo@2.7.2 prune --scope=landing-page --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
COPY turbo.json /app/turbo.json
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_TYPECHECK=1
RUN pnpm turbo run build --filter=landing-page...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3004
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
COPY --from=installer /app .

EXPOSE 3004
CMD ["pnpm", "--filter", "landing-page", "start"]
