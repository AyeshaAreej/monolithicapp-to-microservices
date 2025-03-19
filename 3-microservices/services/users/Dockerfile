FROM node:18-alpine

WORKDIR /srv

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install


# Copy all files (including server.js)
COPY . . 

EXPOSE 3000
# Start the application
CMD ["node", "server.js"]
