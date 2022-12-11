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
import DemoBanner from './components/demoBanner.vue';

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