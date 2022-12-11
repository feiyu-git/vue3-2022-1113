## Vue3路由相关



##### 1、路由安装

```json
npm i vue-router
```

##### 2、路由配置

router/index.js

```js
import { createRouter, createWebHashHistory } from 'vue-router'

export const routes = [
  {
    path: '/',
    label: '首页',
    component: () => import('../views/home/index.vue')
  },
  {
    path: '/demo',
    label: 'demo',
    component: () => import('../views/demo/index.vue')
  },
  {
    path: '/me',
    label: '我的',
    component: () => import('../views/me/index.vue')
  },
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes,
})

export default router;
```

main.js 使用路由

```js
import router from './router/index'

createApp(App).
  use(router).
  mount('#app')
```

App.vue 路由展示的视口

```html
<template>
  <topNav />
  <router-view></router-view>
</template>
```

##### 3、路由跳转&参数获取

路由跳转

```js
import { useRouter } from 'vue-router';

const router = useRouter();
const pushJump = () => {
    router.push({
        path: '/demo',
        query: {
            id: 'test_id'
        }
    });
};
```

路由参数获取：该方法刷新页面参数不丢失

```js
import { useRouter } from 'vue-router';

const router = useRouter();
const state = reactive({
    currId: '',
});
onMounted(() => {
    // 路由参数获取
    state.currId = router.currentRoute.value.query.id;
});

```

