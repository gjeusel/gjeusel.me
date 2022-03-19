<script setup lang="ts">
import { toggleDark } from "~/composables";

const { t } = useI18n();
// const { t, availableLocales, locale } = useI18n();

// const toggleLocales = () => {
//   // change to some real logic
//   const locales = availableLocales;
//   locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length];
// };
</script>

<template>
  <nav class="py-2 px-4 flex flex-row items-center justify-between">
    <router-link class="icon-btn" to="/" :title="t('button.home')">
      <img
        class="bg-slate-200 dark:bg-slate-700 rounded-full h-10"
        src="/avatar.svg"
      />
    </router-link>
    <div class="flex flex-row space-x-4 items-center">
      <a class="hover:text-sky-700" href="/blog" title="Blog">
        <span>Blog</span>
      </a>
      <a class="icon-btn" href="https://github.com/gjeusel" title="GitHub">
        <div i-carbon-logo-github />
      </a>
      <!-- <a -->
      <!--   class="icon-btn" -->
      <!--   :title="t('button.toggle_langs')" -->
      <!--   @click="toggleLocales" -->
      <!-- > -->
      <!--   <div i-carbon-language /> -->
      <!-- </a> -->
      <button
        class="icon-btn !outline-none"
        :title="t('button.toggle_dark')"
        @click="toggleDark()"
      >
        <div i="carbon-sun dark:carbon-moon" />
      </button>
    </div>
  </nav>
</template>
