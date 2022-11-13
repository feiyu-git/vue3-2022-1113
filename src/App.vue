<template>
  <topNav />
  <router-view></router-view>
</template>

<script>
import topNav from './components/topNav/index.vue';
export default {
  name: 'App',
  components: {
    topNav
  }
}
</script>

<style>

</style>
