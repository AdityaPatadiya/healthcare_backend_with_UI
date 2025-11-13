# Development stage only
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code first
COPY . .

# Instead of installing react-is separately, let's fix the dependency issues
# Remove node_modules and reinstall with legacy peer deps to handle conflicts
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps --force

EXPOSE 3000

# Use development mode with hot reload
CMD ["npm", "run", "dev"]
