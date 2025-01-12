# Stage 1: Build the React app
FROM node:20-slim as build

# argument to set the backend url
ENV BACKEND_HOST=localhost
ENV BACKEND_PORT=2000
ENV WEBAPP_PORT=80

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

# ENV BACKEND_HOST=localhost
# ENV BACKEND_PORT=2000
# ENV WEBAPP_PORT=80
#
# Replace the placeholder with the actual environment variable at runtime
# CMD envsubst '$BACKEND_PORT $BACKEND_HOST $WEBAPP_PORT' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && \
CMD nginx -g 'daemon off;'

# Expose port 80 for the web app
EXPOSE ${WEBAPP_PORT}
