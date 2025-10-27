import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        home: 'HTML/home.html',
        login: 'HTML/login.html',
        register: 'HTML/register.html',
        map: 'HTML/map.html',
        listspot: 'HTML/listspot.html',
        marker: 'HTML/marker.html',
        contact: 'HTML/contact-us.html',
        howitworks: 'HTML/how-it-works.html',
        confirm: 'HTML/confirm.html',
        dir: 'HTML/dir.html'
      }
    }
  }
})