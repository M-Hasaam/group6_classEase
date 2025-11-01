import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/group6_classEase/',  // <-- match repo name exactly
  plugins: [react(), tailwindcss()],
})
