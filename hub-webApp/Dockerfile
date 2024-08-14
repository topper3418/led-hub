# FROM node:20

# WORKDIR /hub-webapp

# # COPY package*.json ./
# COPY . . 

# RUN npm install

# RUN npm rebuild


# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "start"]
# Use an official Node.js runtime as a parent image
FROM node:20 AS build

# Set the working directory in the container
WORKDIR /hub-webapp

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the Vite build
RUN npm run build

# Use a minimal Node.js image for the final stage
FROM node:20-slim

# Set the working directory
WORKDIR /hub-webapp

# Install http-server globally
RUN npm install -g http-server

# Copy the built application from the build stage
COPY --from=build /hub-webapp/dist /hub-webapp/dist

# Expose port 8080 (or any port you choose for http-server)
EXPOSE 8080

# Command to run the http-server
CMD ["http-server", "dist", "-p", "8080"]
