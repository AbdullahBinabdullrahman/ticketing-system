# Use the official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema first (needed for postinstall script)
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy all application files
COPY . .

# # Generate Prisma client explicitly
# RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
