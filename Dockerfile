# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_APP_NAME

# Set as environment variables for the build process
ENV VITE_APP_NAME=$VITE_APP_NAME

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies) for building
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only necessary dependencies for running preview
# Note: vite is needed for preview command
RUN npm ci && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user change ownership of the app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE ${PORT:-3000}

# Start the application
CMD sh -c "npm run preview -- --host=0.0.0.0 --port=${PORT:-3000}"