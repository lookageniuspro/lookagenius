import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'dashboard-admin.html',
        teacher: 'dashboard-teacher.html',
        student: 'dashboard-student.html'
      }
    }
  },
  server: {
    port: 3000
  }
})
