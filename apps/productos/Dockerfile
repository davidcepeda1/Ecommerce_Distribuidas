FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY pnpm-workspace.yaml package.json ./
COPY proto ./proto
COPY apps/productos ./apps/productos
RUN pnpm install --filter productos...
WORKDIR /workspace/apps/productos
RUN pnpm build
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
