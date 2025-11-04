<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ensure pages take up available space */
.app,
.marketplace-page,
.dashboard-page,
.api-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
