# Use the official Node.js image as the base image
FROM node:20

# Set the working directory
WORKDIR /hub-server

# Copy the package.json and package-lock.json files
# COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install

# Rebuild native modules
RUN npm rebuild

ENV SEVER_PORT=2000
ENV DB_HOST=localhost
ENV DB_USER=led-hub-server
ENV DB_PASSWORD=led-hub-db-pass
ENV DB_NAME=led-hub
# Expose the port the app runs on
EXPOSE ${SERVER_PORT}

# Start the application
CMD ["npm", "start"]
