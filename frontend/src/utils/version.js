// Version is injected at build time via environment variable
// Defaults to "dev" for local/staging, uses Git tag for production
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';
