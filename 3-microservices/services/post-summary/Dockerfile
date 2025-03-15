# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /srv

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies in production mode (faster, less storage)
RUN npm ci --only=production

# Copy the rest of the application files
COPY . . 

# Expose the application port
EXPOSE 3001  

# Start the application
CMD ["node", "server.js"]
