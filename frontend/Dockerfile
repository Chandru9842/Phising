# ==============================================================================
# PhishShield Production Frontend Multi-Stage Dockerfile
# Stage 1: Node 20 alpine builder for optimized static production assets
# Stage 2: Nginx alpine slim runner with SPA routing and API reverse proxy
# ==============================================================================

# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies deterministically
RUN npm ci

# Copy source files
COPY . .

# Execute Vite production build with code-splitting
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine-slim AS runner

# Remove default Nginx welcome configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration with reverse proxy and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check using Nginx internal health endpoint
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
