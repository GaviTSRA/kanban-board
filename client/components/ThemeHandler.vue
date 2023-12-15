<script setup>
    let theme = useLocalStorage("theme", "dark")
    console.log(theme.value)

    useHead({
        link: [{ rel: 'stylesheet', href: '/themes/'+theme.value+'.css' }]
    })
</script>