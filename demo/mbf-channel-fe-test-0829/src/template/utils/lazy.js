
/**
 * 图片懒加载
 * 如何使用？
 * 1 编写的组件里img元素添加data-src指向真实url，可以加入一张默认图片，放在src
 *   如: <img data-src="" src="" />  或 <MUImage imgProps={{'data-src': ''}} src="" />
 * 2 要是div引入背景图，则需要div添加一个class为'lazy-img' 然后指定data-src即可
 *   如： <div className="lazy-img" data-src=""></div>
 * 3 引入
 *   import ImageLazy from 'utils/lazy';
 *   import Nerv from 'nervjs';
 *   export default Demo extends Nerv {
 *    componentDidMounted() {
 *      new ImageLazy();
 *    }
 *   }
 * 4 注意：如果组件里包含有异步请求数据后进行的图片元素渲染逻辑，则需要在组件内加入懒加载的初始化才会生效
 * 使用示例如下：
 *
 * export default Demo extends Nerv {
 *  componentDidMount() {
 *    this.setState({
 *      imgList: [{ src: '' }]
 *    }, () => {
 *      // 必须放在setState回调里，否则获取不到img元素进行初始化
 *      new ImageLazy({
 *        parentNode: document.querySelector('.my-class'), // 必须传入父节点来限制组件内的图片获取范围，防止重复监听。
 *      });
 *    })
 *  }
 *  render() {
 *    const { imgList } = this.state;
 *    return (
 *      <MUView className="my-class">
 *        {imgList.length && imgList.map((item) => (
 *          <MUImage imgProps={{'data-src': ''}} src={item.src} />
 *        ))}
 *      </MUView>
 *    )
 *  }
 * }
 */
export default class ImageLazy {
  /**
 * @param {object} options
 * @param {Function} options.mounted 渲染图片完成后的回调
 * @param {element} options.parentNode 图片的父节点，默认为document
 * @param {element} options.root 所监听对象的具体祖先元素(element)。如果未传入值或值为null，则默认使用顶级文档的视窗。
 * @param {element} options.rootMargin 计算交叉时添加到根(root)边界盒bounding box的矩形偏移量
 * @param {object} options.content 执行上下文
 * @param {object} options.success 每次成功加载跟视口交叉的所有图片后的回调
 */
  constructor(options) {
    const {
      mounted = () => { },
      parentNode = document,
      root = null,
      rootMargin = '0px 0px 100px 0px',
      success = () => { },
    } = options || {};

    this.imgNode = null;
    this.divBgImgNode = null;
    this.parentNode = parentNode || document;
    this.io = null;
    this.root = root;
    this.mounted = mounted;
    this.rootMargin = rootMargin;
    this.content = this;
    this.success = success;
    // 载入的跟视口交叉的所有图片的loaded promise对象
    this.someImageLoaded = [];
    this.init();
  }

  init() {
    this.requestAnimationFrame(() => {
      this.intersectionMain();
    });
  }

  intersectionMain() {
    // 观察视口与组件容器的交叉情况
    // 使用可以参考文档https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
    this.io = new window.IntersectionObserver(this.intersectionHandler.bind(this), {
      root: this.root,
      rootMargin: this.rootMargin,
      threshold: [0, Number.MIN_VALUE, 0.01]
    });
    const toArray = Array.prototype.slice;
    this.imgNode = toArray.call(this.parentNode.getElementsByTagName('img'));
    this.divBgImgNode = toArray.call(this.parentNode.querySelectorAll('.lazy-img'));
    this.imgNode.forEach((item) => {
      if (item.getAttribute('data-src')) {
        this.io.observe(item);
      }
    });
    this.divBgImgNode.forEach((item) => {
      if (item.getAttribute('data-src')) {
        this.io.observe(item);
      }
    });
  }

  intersectionHandler(entries) {
    // 由于函数会在主线程中执行，加载懒加载组件非常耗时，容易卡顿
    // 所以在requestAnimationFrame回调中延后执行
    this.requestAnimationFrame(() => {
      entries.forEach((item) => {
        if (
          // 正在交叉或交叉率大于0
          item.isIntersecting || item.intersectionRatio
        ) {
          this.renderImg(item);
          this.mounted.call(this.content, item);
          this.io.unobserve(item.target);
        }
      });
      //  所有交叉视口的图片加载完毕
      Promise.all(this.someImageLoaded).then(() => {
        this.success();
      });
    });
  }

  renderImg(item) {
    const { target } = item;
    const src = target.getAttribute('data-src');
    if (!src) {
      return;
    }
    if (target.tagName === 'IMG') {
      target.src = src;
      const imageLoaded = new Promise((resolve) => {
        target.onload = () => {
          resolve();
        };
      });
      this.someImageLoaded.push(imageLoaded);
    } else {
      target.style.backgroundImage = `url(${src})`;
    }
  }

  requestAnimationFrame(callback) {
    // 兼容不支持requestAnimationFrame 的浏览器
    return (window.requestAnimationFrame || ((cb) => setTimeout(cb, 1000 / 60)))(callback);
  }
}
