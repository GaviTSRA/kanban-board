import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "./schema.ts",
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgres://postgres:postgres@localhost:5432/kanban",
  },
  verbose: true,
  strict: true,
})