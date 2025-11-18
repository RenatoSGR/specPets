# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm ci for faster, more reliable installs and use cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production=false --prefer-offline --no-audit

# Copy source code and build
COPY . .
RUN npm run build

# Runtime stage with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
