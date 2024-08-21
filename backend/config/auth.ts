import { defineConfig } from '@adonisjs/cors'

export default defineConfig({
  enabled: true,
  origin: true,
  methods: ['GET', 'POST'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})
