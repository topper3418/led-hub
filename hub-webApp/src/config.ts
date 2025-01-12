export const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost';
export const BACKEND_PORT = import.meta.env.VITE_BACKEND_POST || '2000';
export const BACKEND_ROOT_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/`;
