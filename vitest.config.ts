import { defineConfig } from 'vitest/config';

// Config separada de vite.config.js: los tests corren sobre código de `api/`
// (funciones serverless en Node), no sobre el bundle de frontend/React.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts'],
  },
});
