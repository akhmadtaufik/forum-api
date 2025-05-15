FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install build dependencies
RUN apt-get update && npm install

# Copy source code
COPY . .

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
