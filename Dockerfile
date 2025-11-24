FROM node:18-alpine

LABEL maintainer="LocalNVR"
LABEL description="Lightweight NVR web interface for browsing camera recordings"

# Set working directory
WORKDIR /app

# Install express (only dependency)
RUN npm install express

# Copy application files
COPY server.js .
COPY public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Set environment variables
ENV NODE_ENV=production \
    VIDEO_DIR=/videos \
    PORT=3000

# Run the application
CMD ["node", "server.js"]
