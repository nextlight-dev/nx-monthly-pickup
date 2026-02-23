import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/nx-monthly-pickup/' : '/',
}))
