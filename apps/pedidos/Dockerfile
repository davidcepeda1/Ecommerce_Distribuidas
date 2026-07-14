FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY pnpm-workspace.yaml package.json ./
COPY apps/pedidos ./apps/pedidos
RUN pnpm install --filter pedidos...
WORKDIR /workspace/apps/pedidos
RUN pnpm build
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
