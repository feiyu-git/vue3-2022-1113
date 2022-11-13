<template>
  <div class="top-nav">
    <router-link
      v-for="(item, index) in routerList.routes"
      :key="index"
      :to="item.path"
    >
      {{ item.label }}
    </router-link>
  </div>
</template>

<script>
import router, { routes } from '../../router';
import { reactive } from 'vue';
export default {
  setup() {
    const routerList = reactive({
      routes,
      num: router.length,
    });
    return {
      // ...ref(routerList),
      routerList,
    };
  },
};
</script>

<style lang="less">
.top-nav {
  display: flex;
  margin-bottom: 12px;
  padding-left: 12px;
  a {
    margin-right: 22px;
    text-decoration: none;
    font-size: 18px;
    color: #000;
    &.router-link-active {
      font-weight: bold;
    }
  }
}
</style>