import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' lets the build run from GitHub Pages or any sub-path
export default defineConfig({
  base: './',
  plugins: [react()],
})
