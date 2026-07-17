FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY pnpm-workspace.yaml package.json ./
COPY proto ./proto
COPY apps/gateway ./apps/gateway
RUN pnpm install --filter gateway...
WORKDIR /workspace/apps/gateway
RUN pnpm build
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
