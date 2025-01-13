# Stage 1: Build the React app
FROM node:20-slim AS build

# config to set the backend url, used by generate-nginx-config.cjs
ARG BACKEND_HOST=localhost
ARG BACKEND_PORT=2000
ARG WEBAPP_PORT=80

# config to set the backend during app build
ENV VITE_BACKEND_HOST=${BACKEND_HOST}
ENV VITE_BACKEND_PORT=${BACKEND_PORT}
ENV VITE_WEBAPP_PORT=${WEBAPP_PORT}
ENV VITE_SERVER_ROUTE_MODE="proxy"

WORKDIR /hub-webapp

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the Node.js script to generate the nginx.conf file
RUN node ./generate-nginx-config.cjs

# Build the production version of the React app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Install envsubst (part of gettext package) to replace env variables
RUN apk add --no-cache gettext
# Copy the built files into the Nginx default static directory
COPY --from=build /hub-webapp/dist /usr/share/nginx/html
# Copy your nginx config into the image
COPY --from=build /hub-webapp/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

# Expose port 80 for the web app
EXPOSE ${WEBAPP_PORT}
