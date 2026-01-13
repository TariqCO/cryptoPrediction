# ---------------- Build Stage ----------------
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build-time environment variable
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY

# Build the app (VITE_API_KEY must be defined here!)
RUN npm run build

# ---------------- Production Stage ----------------
FROM node:22-alpine

WORKDIR /app

# Install serve globally to serve static files
RUN npm i -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Run production server
CMD ["serve", "-s", "dist", "-l", "3000"]
