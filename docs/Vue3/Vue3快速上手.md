## Vue3 快速上手



### 一、创建项目

1. 使用webpack

   ```json
   先安装vue-cli4  
   
   vue create project-name
   
   在选项中选择vue3  就可以了
   ```

2. 使用 vite（vite 是 vue 团队开发的一款试图替代 webpack 的工具）

（是vue团队开发的一款试图代替webpack的工具）

```
使用 npm

$ npm init vite-app learn-vue3
$ cd learn-vue3
$ npm install
$ npm run dev


使用 yarn 

$ yarn create vite-app learn-vue3
$ cd learn-vue3
$ yarn
$ yarn dev
```

```
或者直接

 1)安装Vite

    npm install creat-vite-app -g

 2) 创建项目
    
    creat-vite-app projectName

 3) 运行

    cd  projectName
    
    npm install

    npm run dev
```



### 二、快速上手

1. 响应性基础API——[reactive](https://v3.cn.vuejs.org/api/basic-reactivity.html#reactive)

   响应性基础API——[ref](https://v3.cn.vuejs.org/api/refs-api.html#ref)

   响应性基础API——[toRefs](https://v3.cn.vuejs.org/api/refs-api.html#torefs)

2. 事件绑定

   > 事件无需写在 methods 中，可直接定义然后在 setup 中 return。
   >
   > 当然也可以写在 methods 中，但是无法操作 setup 中的变量。

3. 计算属性——[computed](https://v3.cn.vuejs.org/api/computed-watch-api.html#computed)

4. [监听器](https://v3.cn.vuejs.org/api/computed-watch-api.html#watch)

   - watchEffect
   - watch

5. 生命周期

   > 1. beforeCreate -> 使用 setup()  
   >
   > 2. created -> 使用 use setup()  
   > 3.  beforeMount -> onBeforeMount  
   > 4. mounted -> onMounted 
   > 5. beforeUpdate -> onBeforeUpdate 
   > 6. updated -> onUpdated
   > 7. beforeDestroy-> onBeforeUnmount
   > 8. destroyed -> onUnmounted
   > 9. activated -> onActivated
   > 10. deactivated -> onDeactivated
   > 11. errorCaptured -> onErrorCaptured
   >
   > 除此之外，Vue.js 3.0 还新增了两个用于调试的生命周期 API：onRenderTracked 和 onRenderTriggered。

6. 组件的引入及注册

7. 插槽——[slot](https://v3.cn.vuejs.org/guide/migration/slots-unification.html#%E6%A6%82%E8%A7%88)

8. 父传子

   发送方式与 vue2.x 相同，接收依然在 props 中接受，但接收后在 setup 中使用时要用 `props.属性名` 的方式

9. 子传父

   - [可以按照 vue2.x 的方法](https://blog.csdn.net/qq_32674347/article/details/109084334)，但是不推荐

   - [更符合 vue3 的方法](https://juejin.cn/post/6889252368190439438)

     > 区别在于发送数据的方式：context.emit('son-data', 要发送的值);
10. [dom操作](https://juejin.cn/post/6883363601730502663#heading-13)

    html

    ```html
    <span ref="domTest">我是dom</span>
    ```

    script

    ```js
    improt {ref, onMounted} from 'vue'
    export default {
    	setup() {
        	const domTest = ref(null) //声明对象
        	onMounted(()=>{
                console.log(43, domTest.value)//输出dom对象
                console.log('3---onMounted,组件挂载到dom后')
        	})
            retrun {
            	domTest//一定要返回
            }
        }
    }
    ```
##### 说明：

> vue2.x 的写法与 vue3.x 的写法是可以同时存在的，例如上例中的事件绑定、子传父。但是在实际开发中并不推荐这样去写。

##### 完整案例：

Demo/Index.vue

```js
<template>
  <div class="test-demo">
    <p class="demo-title">Demo页面</p>
    <button class="item-gap" @click="clickMe1">点我测试1</button><br />
    <button class="item-gap" @click="clickMe2">点我测试2</button><br />
    <button class="item-gap" @click="clickMe3">点我测试3</button>
    <div class="test-reactive item-gap">数量：{{ count }}</div>
    <div class="test-reactive item-gap">数量1：{{ count1 }}</div>
    <div>
      <span>测试计算属性：</span><br />
      原始值：{{ number }}——计算后的值：{{ double }}
    </div>
    <div>
      <span>测试监听器：</span><br />
      {{ testCount }}
    </div>
    <div class="components-test">
      <div>子组件</div>
      <DemoBanner :title="title" :fatherFn="fatherFn" @to-father="fromSon1" @son-data="fromSon">
        <template v-slot:header>
          <p class="test-header">这是头部组件</p>
        </template>
        <!-- 默认插槽用 v-slot:default 不可以省略，否则内容不显示 -->
        <template v-slot:default>
          <div class="test-main">这是一段很长很长很长的内容</div>
        </template>
        <template v-slot:footer>
          <p class="test-footer">这是footer</p>
        </template>
      </DemoBanner>
    </div>
  </div>
</template>

<script>
import {
  reactive, // 响应性基础 API
  ref, // 响应性基础 API
  /**
   * // 将响应式对象转换为普通对象，其中结果对象的每个 property 都是指向原始对象相应 property 的ref
   * 例如将 data 结构出来后其属性仍具有响应性,当然你也可以直接在 setup 中将 data 进行 return 也是响应式的
   */
  toRefs,
  // 生命周期函数
  onMounted,
  onUnmounted,
  onUpdated,
  onBeforeUpdate,
  onActivated,
  onDeactivated,
  computed, // 计算属性
  watchEffect, // 监听器
  watch,
  // $on,
} from 'vue';
import DemoBanner from './Banner.vue';

export default {
  name: 'DemoMain',
  components: {
    DemoBanner,
  },
  // props - 组件接受到的属性， context - 上下文
  setup(props, context) {
    console.log('props', props);
    console.log('context', context);

    // 组件的生命周期
    onMounted(() => {
      console.log('组件挂载1');
    });
    onUnmounted(() => {
      console.log('组件卸载');
    });
    onUpdated(() => {
      console.log('组件更新');
    });
    onBeforeUpdate(() => {
      console.log('组件将要更新');
    });
    onActivated(() => {
      console.log('keepAlive 组件 激活');
    });
    onDeactivated(() => {
      console.log('keepAlive 组件 非激活');
    });
    /**
     * 直接定义变量，然后通过setup 的 return ，该值并不能做到响应式
     * 如果需要做到响应式：
     * 1、reactive
     * 2、ref：注意取的时候要用 ref.value
     */
    const data = reactive({
      visible: false,
      count: 0,
      number: 2,
      title: 'Demo-title',
    });
    // 计算属性测试
    const double = computed(() => data.number * 2);

    // 监听器测试
    const testCount = ref(10);
    watchEffect(() => {
      console.info('testCount', testCount);
    });
    watch(testCount, (newVal, oldVal) => {
      console.log('testCount', testCount);
      console.log('oldVal', oldVal);
      console.log('newVal', newVal);
    });
    setTimeout(() => {
      testCount.value += 1;
    }, 1000);

    // 测试父传子的响应性
    setTimeout(() => {
      data.title += '-来自父组件';
    }, 1000);

    let count1 = ref(2);
    // 事件绑定方法一：【vue3 新增的方法】
    function clickMe1() {
      console.log('点我测试1~~~~');
      count1.value += 1;
    }
    function clickMe3() {
      console.log('点我测试3~~~~');
      data.count += 1;
    }

    // 子组件调用父组件的方法
    function fatherFn(val) {
      console.log('子组件触发父组件的方法~');
      console.log(`来自子组件的值${val}`);
    }

    // 接收子组件传过来的值
    function fromSon(val) {
      console.log('来自子组件的值', val);
    }

    return {
      clickMe1,
      clickMe3,
      count1,
      double,
      testCount,
      fatherFn,
      fromSon,
      ...toRefs(data), // 将 data 结构出来，其属性仍具有响应性
    };
  },
  // 事件绑定方法2：【vue2 方法】——在vue3中不推荐使用
  methods: {
    clickMe2() {
      console.log('点我测试2~~~~~~·');
    },
    fromSon1(val) {
      console.log('来自子组件的值1', val);
    },
  },
};
</script>

<style lang='less'>
.test-demo {
  .item-gap {
    margin: 16px 0;
  }
  padding: 20px;
  .demo-title {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 16px;
  }
  .components-test {
    margin: 16px 0;
    .test-header {
      font-weight: bold;
    }
    .test-main {
      height: 100px;
      border: 1px dashed #666;
    }
    .test-footer {
      line-height: 32px;
      background-color: pink;
    }
  }
}
</style>

```

Demo/Banner.vue

```js
<template>
  <div class="demo-banner">
    <div>这是banner——{{ title }}</div>
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
      <div class="banner-main-content">
        <button @click="clickMe">点我触发父组件方法</button>
        <button @click="clickMe1">点我触发父组件方法1</button>
      </div>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'DemoBanner',
  /**
   * 所有的父传子的值需要先在 props 中接收
   * 然后才可以在 setup 中 props.title
   */
  props: {
    title: {
      type: String,
      default: '',
    },
    fatherFn: {
      type: Function,
    },
  },
  // props - 组件接受到的属性， context - 上下文
  setup(props, context) {
    console.log('20-props', props.title); // Demo-title
    console.log('20-context', context);
    // console.log('action-40', context.refs.action);
    function clickMe() {
      // 子传父
      context.emit('son-data', '000000');
    }
    return {
      clickMe,
    };
  },
  methods: {
    clickMe1() {
      this.$emit('to-father', '999');
    },
  },
};
</script>

<style lang='less' scoped>
.banner-main-content {
  height: 100px;
  border: 1px dashed #333;
}
</style>

```



### 三	、常见问题

1. vue3 路由配置时 vue-router 的版本需要大于 4.0

2. less 解析报错时，确认下 less 与 less-loader 是不是都安装了，以及 less-loader 的推荐版本是 7.x ，版本太高可能会报错

   ```
   yarn add -D less-loader@7.3.0
   ```






