// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    "@/assets/main.css"
  ],
  routeRules: {
    "/board/**": {ssr: false}
  },
  modules: [
    '@vueuse/nuxt',
    "nuxt-primevue"
  ],
})
