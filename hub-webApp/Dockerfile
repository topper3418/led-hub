# Stage 1: Build the React app
FROM node:20-slim as build

# Define build arguments that will override .env variables at build time

WORKDIR /hub-webapp

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the production version of the React app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the built files into the Nginx default static directory
COPY --from=build /hub-webapp/dist /usr/share/nginx/html
# Copy your nginx config into the image
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 8080 for the web app
EXPOSE 8080

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
