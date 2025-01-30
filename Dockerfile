# Use a lightweight Node.js image for production
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy only necessary source code files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the correct port
EXPOSE 8080

# Use a non-root user for better security
RUN useradd --user-group --create-home --shell /bin/false appuser
USER appuser

# Start the server
CMD ["node", "src/index.js"]