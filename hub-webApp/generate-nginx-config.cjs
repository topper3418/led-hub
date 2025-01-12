const fs = require('fs');

// Get environment variables passed as build args
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.BACKEND_PORT || '3000';
const WEBAPP_PORT = process.env.WEBAPP_PORT || '80';

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
  location /api {
    proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT};
  }
}
`;

console.log(nginxConfig)

// Write the config to a file
fs.writeFileSync('nginx.conf', nginxConfig);

console.log('Nginx configuration file generated successfully.');
