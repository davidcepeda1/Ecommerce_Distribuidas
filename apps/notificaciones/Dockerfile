FROM node:22-alpine
WORKDIR /workspace
RUN corepack enable
COPY pnpm-workspace.yaml package.json ./
COPY apps/notificaciones ./apps/notificaciones
RUN pnpm install --filter notificaciones...
WORKDIR /workspace/apps/notificaciones
RUN pnpm build
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
