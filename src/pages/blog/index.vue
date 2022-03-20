<script setup lang="ts">
import routes from "~pages"

interface FrontMatterInfo {
  title: string
  date: string
  image?: string
}

interface RouteInfo extends FrontMatterInfo {
  path: string
}

const techRoutes = routes
  .filter((r) => r.path.startsWith("/blog/tech"))
  .reduce((agg, r) => {
    agg.push({
      path: r.path,
      ...((r.meta?.frontmatter || {}) as FrontMatterInfo),
    })
    return agg
  }, [] as RouteInfo[])
</script>

<template>
  <div class="space-y-10">
    {{ techRoutes }}
    <div v-for="route in routes" :key="route.name">
      {{ route }}
    </div>
  </div>
</template>
