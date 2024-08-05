import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Get the version from environment variables or use a default value
const version = process.env.VERSION || 'latest';

// Define the base path for the build
export default defineConfig({
  plugins: [react()],
  server:{
    port:3000,
  },
 
  build: {
    outDir: path.resolve(__dirname, `dist/v${version}`), // Set the output directory based on the version
  },
});