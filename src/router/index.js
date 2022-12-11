import { createRouter, createWebHashHistory } from 'vue-router'

export const routes = [
  {
    path: '/',
    label: '首页',
    component: () => import('../views/home/index.vue')
  },
  {
    path: '/me',
    label: '我的',
    component: () => import('../views/me/index.vue')
  },
  {
    path: '/demo',
    label: 'demo',
    component: () => import('../views/demo/index.vue')
  },
  {
    path: '/demo1',
    label: '完整案例demo1',
    component: () => import('../views/demo1/index.vue')
  }
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