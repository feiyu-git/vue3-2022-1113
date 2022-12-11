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