// 使用高阶组件把 store 的生命周期和组件绑定在一起， https: //zhuanlan.zhihu.com/p/54291246
// options可用作页面config覆盖，如标题设置
const mobxHoc = (injectFunction, options) => (ComposedComponent) => class extends ComposedComponent {

  constructor(props) {
    super(props);
    this.injectedProps = injectFunction(props);
  }

  componentDidShow() {
    const { componentDidShow } = ComposedComponent.prototype;
    if (typeof componentDidShow === 'function') {
      componentDidShow.call(this.wrappedInstance);
    }
  }

  beforeRouteLeave(from, to, next) {
    const { beforeRouteLeave } = ComposedComponent.prototype;
    if (typeof beforeRouteLeave === 'function') {
      beforeRouteLeave.call(this.wrappedInstance, from, to, next);
    } else {
      next(true);
    }
  }

  componentDidHide() {
    const { componentDidHide } = ComposedComponent.prototype;
    if (typeof componentDidHide === 'function') {
      componentDidHide.call(this.wrappedInstance);
    }
  }

  render() {
    return (
      <ComposedComponent
        ref={(ref) => {
          this.wrappedInstance = ref;
        }}
        {...this.props}
        {...this.injectedProps}
      />
    );
  }
};

export default mobxHoc;
