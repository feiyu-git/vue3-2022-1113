<template>
  <div class="home">
    <div>home</div>
    <br>
    <button @click="pushJump">push 跳转</button>
    <br>
    <br>
    <button @click="replaceJump">replace 跳转</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
export default {
  setup() {
    const router = useRouter();
    const pushJump = () => {
      router.push({
        path: '/demo',
        query: {
          id: 'test_id'
        }
      });
    };
    const replaceJump = () => {
      console.log('router------', router);
      router.replace({
        path: '/demo',
        query: {
          id: 'test_id'
        }
      });
    };
    return {
      pushJump,
      replaceJump,
    };
  }
}
</script>

<style lang="less" scoped>
.home {
  .title {
    margin: 12px 0;
  }
}

</style>