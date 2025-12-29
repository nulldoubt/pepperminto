FROM node:lts AS builder

# Set the working directory inside the container
WORKDIR /app

RUN apt-get update && \
    apt-get install -y build-essential python3

# Copy the package.json and package-lock.json files for both apps
COPY apps/api/package*.json ./apps/api/
COPY apps/client/package*.json ./apps/client/
COPY ./ecosystem.config.js ./ecosystem.config.js

RUN corepack enable
RUN pnpm add -g prisma
RUN pnpm add -g typescript@latest

# Copy the source code for both apps
COPY apps/api ./apps/api
COPY apps/client ./apps/client

RUN cd apps/api && pnpm install --prod
RUN cd apps/api && pnpm add -D @types/node && pnpm run build

RUN corepack enable
RUN cd apps/client && pnpm install --prod --ignore-scripts
RUN cd apps/client && pnpm add -D typescript @types/node
RUN cd apps/client && pnpm build

FROM node:lts AS runner

COPY --from=builder /app/apps/api/ ./apps/api/
COPY --from=builder /app/apps/client/.next/standalone ./apps/client
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder /app/apps/client/public ./apps/client/public
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

# Expose the ports for both apps
EXPOSE 3000 5003

# Install PM2 globally
RUN npm install -g pm2

# Start both apps using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
