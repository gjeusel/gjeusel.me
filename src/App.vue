<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: "Guillaume Jeusel",
  meta: [{ name: "description", content: "Personal Blog." }],
});
</script>

<template>
  <main class="text-gray-700 dark:text-gray-200">
    <NavBar class="sticky" />
    <router-view />
  </main>
</template>
