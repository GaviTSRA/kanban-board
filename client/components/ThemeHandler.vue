<script setup lang="ts">
let theme = useLocalStorage("theme", "dark");

useHead({
  link: [{ rel: "stylesheet", href: "/themes/" + theme.value + ".css" }],
});
</script>
