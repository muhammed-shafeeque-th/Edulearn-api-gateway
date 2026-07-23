ARG BASE_IMAGE=ghcr.io/muhammed-shafeeque-th/edulearn-node:22

# Stage 1: Dependency
FROM ${BASE_IMAGE} AS deps

WORKDIR /app

ENV NODE_ENV=development


# Copy package files first for caching
COPY package.json package-lock.json ./

# Use cache mount for faster repeated builds (BuildKit)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Stage 2: Dependency
FROM deps AS builder

# Copy source and configs
COPY tsconfig*.json ./
COPY src ./src

# Build (keep your existing build for stability)
RUN npm run build

# Install production deps in builder
RUN npm install --production --no-audit --no-fund --no-optional


#  Cleanup unnecessary files from node_modules with node-prune
ARG NODE_PRUNE_VERSION=v1.0.2

RUN  apk add --no-cache curl \
  && curl -sfL https://gobinaries.com/tj/node-prune | sh -s -- -b /usr/local/bin \
  && node-prune \
  && npm cache clean --force \
  && rm -rf \
       /tmp/* \
       /root/.npm \
       /usr/local/share/.cache

# Stage 2: Runtime (Lightweight)
FROM node:22.17.1-alpine3.22 AS runner

WORKDIR /app

ENV NODE_ENV=production

LABEL org.opencontainers.image.title="edulearn-gateway"
LABEL org.opencontainers.image.description="EduLearn Api Gateway"
LABEL org.opencontainers.image.source="https://github.com/muhammed-shafeeque-th/Edulearn-gateway"

# Non-root user
RUN addgroup -S edulearn_admin && adduser -S edulearn_user -G edulearn_admin

# Copy only essentials from builder
COPY --from=builder --chown=edulearn_user:edulearn_admin /app/dist ./dist
COPY --from=builder --chown=edulearn_user:edulearn_admin /app/node_modules ./node_modules
COPY --from=builder --chown=edulearn_user:edulearn_admin /app/package.json ./


USER edulearn_user

EXPOSE 4000

# Direct start (no yarn overhead, better signal handling)
CMD ["node", "dist/index.js"]