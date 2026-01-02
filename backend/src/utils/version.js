// Version is injected at build time via environment variable
// Defaults to "dev" for local/staging, uses Git tag for production
export function getVersion() {
  return {
    version: process.env.APP_VERSION || 'dev',
    environment: process.env.NODE_ENV || 'development',
  };
}
