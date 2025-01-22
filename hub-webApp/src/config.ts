export const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost';
export const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '2000';
export const SERVER_ROUTE_MODE = import.meta.env.VITE_SERVER_ROUTE_MODE || 'direct'
export const COMPILED_ROOT_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/`;
export const BACKEND_ROOT_URL = SERVER_ROUTE_MODE === 'proxy' ? '/api/' : COMPILED_ROOT_URL
export const LOGGING_URL = import.meta.env.VITE_LOGGING_URL || 'localhost:8080';
export const LOGGING_SERVICE_ENDPOINT = SERVER_ROUTE_MODE === 'proxy' ? '/logs' : `http://${LOGGING_URL}/logs`;
