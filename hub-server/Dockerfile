# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /hub-server

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild native modules
RUN npm rebuild

# Copy the rest of the application code
COPY . .

# Set the working directory to the webapp folder
WORKDIR /hub-server/webApp

# Build the web application
RUN npm run build

# Set the working directory back to the app root
WORKDIR /hub-server

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
