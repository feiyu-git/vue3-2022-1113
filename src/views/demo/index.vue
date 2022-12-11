<template>
  <div class="demo">
    <div>demo</div>
    <br>
    <div>
      当前的 id 是：{{ currId }}
    </div>
  </div>
</template>

<script>
import {
  reactive, onMounted, toRefs
} from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const state = reactive({
      currId: '',
    });
    onMounted(() => {
      state.currId = router.currentRoute.value.query.id;
    });
    return {
      ...toRefs(state),
    };
  },
};
</script>

<style lang="less" scoped>
.home {
  .title {
    margin: 12px 0;
  }
}

</style>