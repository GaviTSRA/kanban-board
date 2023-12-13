import VueAllClickAway from "vue3-all-click-away"

export default defineNuxtPlugin((nuxtApp) => { 
    nuxtApp.vueApp.use(VueAllClickAway)
})