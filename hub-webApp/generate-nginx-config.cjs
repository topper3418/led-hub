const fs = require('fs');

// Get environment variables passed as build args
// rewrite this so that it throws an error if the env vars are not set
const BACKEND_HOST = process.env.VITE_BACKEND_HOST;
if (!BACKEND_HOST) {
  throw new Error('VITE_BACKEND_HOST is not set');
}
const BACKEND_PORT = process.env.VITE_BACKEND_PORT;
if (!BACKEND_PORT) {
  throw new Error('VITE_BACKEND_PORT is not set');
}
const LOGGING_HOST = process.env.VITE_LOGGING_HOST;
if (!LOGGING_HOST) {
  throw new Error('VITE_LOGGING_HOST is not set');
}
const LOGGING_PORT = process.env.VITE_LOGGING_PORT;
if (!LOGGING_PORT) {
  throw new Error('VITE_LOGGING_PORT is not set');
}
const WEBAPP_PORT = process.env.VITE_WEBAPP_PORT;
if (!WEBAPP_PORT) {
  throw new Error('VITE_WEBAPP_PORT is not set');
}

// Generate the Nginx config file
const nginxConfig = `
server {
  listen ${WEBAPP_PORT};
  server_name app-server;

  # Serve the frontend build output
  location / {
    root   /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # Proxy API requests to the backend
  location /api/ {
    proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT}/;
  }
  location /logs/ {
    proxy_pass http://${LOGGING_HOST}:${LOGGING_PORT}/logs;
  }
}
`;

console.log(nginxConfig)

// Write the config to a file
fs.writeFileSync('nginx.conf', nginxConfig);

console.log('Nginx configuration file generated successfully.');
