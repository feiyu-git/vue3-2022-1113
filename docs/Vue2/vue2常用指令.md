## vue2常用的指令


### 注册指令

init.js

```js
import copy from './shared/directive/copy';
import TmPlugin from './components/TmPlugin';
import expandClick from './shared/directive/expandClick';
import longPress from './shared/directive/longPress';
import debounce from './shared/directive/debounce';
import draggable from './shared/directive/draggable';
import touchble from './shared/directive/touchble';
import { LazyLoad } from './shared/directive/lazyLoad';

// 图片加载出来之前的默认图片
const placeholderImg = 'https://themes.cloud.huawei.com/sandbox/theme-contest/honortalents/images/ed1c396d2d54cf64fa62d2abd06746ba.png';

export default {
  install(Vue) {
    // vue 复制指令
    Vue.directive(copy.name, copy);

    // vue 中定义可扩大点击范围的指令
    Vue.directive('expendClick', {
      bind: expandClick
    })
    // pc & mobild 长按指令
    Vue.directive(longPress.name, longPress.bind)

    // 截流指令
    Vue.directive(debounce.name, debounce.bind)

    // 图片懒加载指令
    Vue.use(LazyLoad, {
      default: placeholderImg
    })

    // 拖拽指令
    Vue.directive(draggable.name, draggable.inserted);

    // 移动端touch指令
    Vue.directive(touchble.name, touchble.inserted);
      
    // 超长文本溢出隐藏
    Vue.directive(textEllipsis.name, textEllipsis.componentUpdated)

    Vue.use(TmPlugin);
  }
}
```



##### 一、扩大元素的选择范围

```js
export default function (el, binding) {
  /**
   * styleSheets 是只读属性
   * 作用是引入或者嵌入文档中的样式表
  */
  const s = document.styleSheets[document.styleSheets.length - 1]
  const DEFAULT = 10 // 默认向外扩展10px
  console.log('binding', binding);
  const [top, right, bottom, left] = binding.expression && binding.expression.split('-') || []
  const ruleStr = `content:"";position:absolute;top:-${top || DEFAULT}px;bottom:-${bottom || DEFAULT}px;right:-${right || DEFAULT}px;left:-${left || DEFAULT}px;`
  const classNameList = el.className.split(' ')
  el.className = classNameList.includes('expand_click_range') ? classNameList.join(' ') : [...classNameList, 'expand_click_range'].join(' ')
  el.style.position = el.style.position || "relative"
  if (s.insertRule) {
    /**
     * CSSStyleSheet.insertRule() 方法用来给当前样式表插入新的样式规则
     * 借用该思路可以给元素添加伪元素
    */
    s.insertRule('.expand_click_range::before' + '{' + ruleStr + '}', s.cssRules.length)
  } else { /* IE */
    s.addRule('.expand_click_range::before', ruleStr, -1)
  }
}
```

使用指令

```js
<button v-expendClick @click="testFn1">expandClick 验证</button>
```



##### 二、一键复制

当绑定的值发生变化时支持更新

```js

const copy = {
  name: 'copy',
  bind(el, binding) {
    // arg 为指令的修饰符
    // eslint-disable-next-line no-unused-vars
    const { value, arg } = binding;
    el.$value = value // 用一个全局属性来存传进来的值，因为这个值在别的钩子函数里还会用到
    el.handler = () => {
      if (!el.$value) {
        // 值为空的时候，给出提示。可根据项目UI仔细设计
        console.log('无复制内容')
        return
      }
      // 动态创建 textarea 标签
      const textarea = document.createElement('textarea')
      // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
      textarea.readOnly = 'readonly'
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      // 将要 copy 的值赋给 textarea 标签的 value 属性
      textarea.value = el.$value
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea)
      // 选中值并复制
      textarea.select()
      const result = document.execCommand('Copy')
      if (result) {
        console.log('复制成功') // 可根据项目UI仔细设计
      }
      document.body.removeChild(textarea)
    }
    // 绑定点击事件，就是所谓的一键 copy 啦
    el.addEventListener('click', el.handler)
  },
  // 当传进来的值更新的时候触发
  componentUpdated(el, { value }) {
    el.$value = value
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler)
    
  }
}

export default copy
```

使用指令

```js
<span v-copy="valueCopy">这是一段文字，点我复制</span>

data() {
    return {
         valueCopy: '这是复制的内容',
    }
}
```



##### 三、防抖指令——pc&mobile

```js
export default {
  name: 'debounce',
  bind(el, binding) {
    const { arg = 1000 } = binding;
    console.log('arg', arg)
    let timer = null
    /**
     * 对于移动端，为了避免延迟，应该使用touchstart而不是click
     * https://www.jianshu.com/p/dc3bceb10dbb
    */
    const clear = () => {
      clearTimeout(timer)
    }
    const start = () => {
      if (timer) {
        clear()
      }
      timer = setTimeout(() => {
        binding.value()
      }, arg)
    }
    // el.addEventListener('touchstart', start)
    el.addEventListener('click', start)
  }
}
```

使用指令

```js
<div class="debounce-test" v-debounce:200="debounceTest">
     点我验证防抖指令——v-debounce
</div>
```



##### 四、拖拽指令

定义一个指令，让指定的元素在可视区范围内可以拖拽【pc&mobile】

这里将pc端和mobile的情况分开了，也可以考虑放在一起

pc

```js
export default {
  name: 'draggable',
  inserted: function (el) {
    el.style.cursor = 'move'
    el.onmousedown = function (e) {
      /**
       * pageX：点击的位置相对于视口左上角x方向位置
       * pageY：点击的位置相对于视口左上角y方向位置
       * el.offsetLeft：点击的位置相对于绑定事件元素左上角x方向的位置
       * el.offsetTop：点击的位置相对于绑定事件元素左上角y方向的位置
      */
      let disx = e.pageX - el.offsetLeft; // 获取绑定的事件元素距离视口左上角x方向的位置
      let disy = e.pageY - el.offsetTop; // 获取绑定的事件元素距离视口左上角y方向的位置
      document.onmousemove = function (e) {
        let x = e.pageX - disx
        let y = e.pageY - disy
        /**
         * clientWidth：视窗的宽度，不包含滚动条
         * clientHeight：视窗的高度，不包含滚动条
        */
        let maxX = document.body.clientWidth - parseInt(window.getComputedStyle(el).width)
        let maxY = document.body.clientHeight - parseInt(window.getComputedStyle(el).height)
        if (x < 0) {
          x = 0
        } else if (x > maxX) {
          x = maxX
        }

        if (y < 0) {
          y = 0
        } else if (y > maxY) {
          y = maxY
        }

        el.style.left = x + 'px'
        el.style.top = y + 'px'
      }
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null
      }
    }
  },
}

```

mobile

```js
const TouchEvent = {
  start: 'touchstart',
  move: 'touchmove',
  end: 'touchend',
  cancel: 'touchcancel',
};

export default {
  name: 'touchble',
  inserted: function (el) {
    let disx = 0;
    let disy = 0;
    const start = (e) => {
      disx = e.touches[0].clientX - el.offsetLeft;
      disy = e.touches[0].clientY - el.offsetTop;
      window.addEventListener(TouchEvent.move, move, {
        passive: false,
        capture: true,
      });
    }
    const move = (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      e.preventDefault(); // preventDefault方法就是可以阻止它的默认行为的发生而发生其他的事情
      e.stopImmediatePropagation(); // event.stopImmediatePropagation(); 阻止事件冒泡并且阻止该元素上同事件类型的监听器被触发
      let x = e.touches[0].clientX - disx;
      let y = e.touches[0].clientY - disy;
      /**
       * clientWidth：视窗的宽度，不包含滚动条
       * clientHeight：视窗的高度，不包含滚动条
      */
      let maxX = document.body.clientWidth - parseInt(window.getComputedStyle(el).width)  // x方向可移动最大距离
      let maxY = document.body.clientHeight - parseInt(window.getComputedStyle(el).height) // y方向可移动最大距离
      if (x < 0) {
        x = 0
      } else if (x > maxX) {
        x = maxX
      }

      if (y < 0) {
        y = 0
      } else if (y > maxY) {
        y = maxY
      }

      el.style.left = x + 'px'
      el.style.top = y + 'px'
    }
    el.addEventListener(TouchEvent.start, start)
  },
}

```

使用指令

```js
<div v-draggable v-touchble>
    同一个元素是支持添加多个指令的，比如这里同时添加pc端和mobile的指令也是可以的
</div>
```



##### 五、图片懒加载指令

功能：利用 **IntersectionObserver** 属性定义一个图片懒加载指令，当该浏览器不支持该属性时通过监听页面滚动来实现图片懒加载【考虑兼容性】。

定义指令

```js
export const LazyLoad = {
  // install方法
  install(Vue, options) {
    const defaultSrc = options.default
    Vue.directive('lazy', {
      bind(el, binding) {
        LazyLoad.init(el, binding.value, defaultSrc)
      },
      inserted(el) {
        if (IntersectionObserver) {
          LazyLoad.observe(el)
        } else {
          LazyLoad.listenerScroll(el)
        }
      },
    })
  },
  // 初始化
  init(el, val, def) {
    el.setAttribute('data-src', val)
    // 设置默认值
    // el.setAttribute('src', def)
    // 这里考虑将默认图设置成北京图片
    el.style.backgroundImage = `url(${def})`;
  },
  // 利用IntersectionObserver监听el
  observe(el) {
    var io = new IntersectionObserver((entries) => {
      const realSrc = el.dataset.src
      if (entries[0].isIntersecting) {
        if (realSrc) {
          el.src = realSrc
          el.removeAttribute('data-src')
          // 当图片加载完成时去掉北京图
          LazyLoad.removeBackground(el);
        }
      }
    })
    io.observe(el)
  },
  // 监听scroll事件
  listenerScroll(el) {
    const handler = LazyLoad.throttle(LazyLoad.load, 300)
    LazyLoad.load(el)
    window.addEventListener('scroll', () => {
      handler(el)
    })
  },
  // 加载真实图片
  load(el) {
    const windowHeight = document.documentElement.clientHeight
    /**
     * 参考地址：https://www.jianshu.com/p/824eb6f9dda4
     * getBoundingClientRect用于获取某个元素相对于视窗的位置集合
     * rectObject.top：元素上边到视窗上边的距离;
     * rectObject.right：元素右边到视窗左边的距离;
     * rectObject.bottom：元素下边到视窗上边的距离;
     * rectObject.left：元素左边到视窗左边的距离;
    */
    const elTop = el.getBoundingClientRect().top
    const elBtm = el.getBoundingClientRect().bottom
    const realSrc = el.dataset.src
    if (elTop - windowHeight < 0 && elBtm > 0) {
      if (realSrc) {
        el.src = realSrc
        el.removeAttribute('data-src')
      }
    }
  },
  // 节流
  throttle(fn, delay) {
    let timer
    let prevTime
    return function (...args) {
      const currTime = Date.now()
      const context = this
      if (!prevTime) prevTime = currTime
      clearTimeout(timer)

      if (currTime - prevTime > delay) {
        prevTime = currTime
        fn.apply(context, args)
        clearTimeout(timer)
        return
      }

      timer = setTimeout(function () {
        prevTime = Date.now()
        timer = null
        fn.apply(context, args)
      }, delay)
    }
  },
  removeBackground(el) {
    el.onload = () =>{
      el.style.backgroundImage = '';
    }
  }
}
```

注册指令

```js
// 图片加载出来之前的默认图片
const placeholderImg = 'https://themes.cloud.huawei.com/sandbox/theme-contest/honortalents/images/ed1c396d2d54cf64fa62d2abd06746ba.png';

export default {
  install(Vue) {

    /**
     * 图片懒加载指令
     * Vue.use 是可以传参的
     * 
    */
    Vue.use(LazyLoad, {
      default: placeholderImg
    })
  }
}
```

使用指令

```js
<template>
  <div class="scroll-test">
    <div class="inputArea" :class="{show: showInput}">内容输入区域</div>
    <ul class="list-container" @scroll.passive="scrollFn">
      <li class="list-item" v-for="(item, index) in listData" :key="index">
        <span>{{ index }}</span>
        <img v-lazy="item" alt="" class="item-image" />
      </li>
    </ul>
  </div>
</template>

<script>
const TEST_IMAGE = [
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/91/v3/8Al-gxxrScmTTPEQOQe3TA/wyJ0KfAvRBiOetHJ63ryFg/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/64/v3/D02NVHzvTBiEsgbhfywXKA/-gM3pWLEQIq7m9y-1HHGOQ/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/11/v3/hiYFOXTaQVKduBSJS_WfQA/Krvjzez_S0alv_mtVcRDcg/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/55/v3/1525468694203977728-jckSxRcIMCU=/TwxSkt9STIqbFM9MIfGZxA/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/bf/v3/1525409003868491776-cmSJ1WDJZNE=/d0crGa5UQy6fE3I6NRUjkQ/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/79/v3/1523922220492283904-HnsKilTF2Bs=/Gm3O5gN6RZuiUfWpRYF6Gw/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/b3/v3/1523369286247297024-BoHo0Rh7Rug=/FMHTP6u_SFmNu0zZAPazXQ/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/fa/v3/1520294742842372096-MSWptjS2ewk=/l3jtqK5pQ4awORParvBSdA/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/35/v3/1518959949328367616-qurqkxi5pLY=/-9CkfmTKTPexUY0BMTkGPQ/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/73/v3/1511573237744635904-3gd21N_P4eE=/FzuykYkDR2SaAs-cpJpL5A/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/1b/v3/1525325917197578240-B_0b67Y2tHU=/jjbqNvRWTYm_8-CY4Ql3Tw/thumbnail.jpg',
  'https://contentcenter-drcn.dbankcdn.com/pub_1/HW-ucp_ThemeCompetition_100_1/c5/v3/1523981805664116736-cSXEIgK_U0g=/_6JIXliWRsqPehqXE52uFw/thumbnail.jpg',
];

export default {
  name: 'scroll-test',
  components: {},
  data() {
    return {
      listData: TEST_IMAGE,
      showInput: true,
    };
  },
  // computed: {
  //   listData() {
  //     return TEST_IMAGE
  //   }
  // },
  mounted() {
    this.preScroll = 0;
  },
  methods: {
    scrollFn(e) {
      const scrollTop = e.target.scrollTop;
      if (scrollTop < this.preScroll) {
        this.showInput = true;
      } else {
        this.showInput = false;
      }
      this.preScroll = scrollTop;
    },
  },
};
</script>

<style lang='less'>
.scroll-test {
  height: 80vh;
  margin-top: 10vh;
  background-color: #f2f2f2;
  position: relative;
  overflow: hidden;
  // overflow-y: auto;
  .inputArea {
    position: absolute;
    left: 0;
    top: -36px;
    right: 0;
    height: 36px;
    line-height: 36px;
    width: 100%;
    background-color: pink;
    text-align: center;
    transition: top .3s ease;
    &.show {
      top: 0;
    }
  }
  .list-container {
    overflow-y: auto;
    height: 100%;
    padding-top: 40px;
    .list-item {
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: 12px;
      .item-image {
        width: 100%;
        height: 188px;
        object-fit: cover;
        background-size: 160px 68px;
        background-repeat: no-repeat;
        background-position: center;
      }
    }
  }
}
</style>

```



##### 六、长按指令——pc&mobile

```js
/**
 * 通过自定义指令在指定时间后出发绑定的方法
 * 支持 pc & mobile
*/

export default {
  name: 'long-press',
  bind(el, binding) {
    const { arg } = binding;
    if (typeof binding.value !== 'function') {
      throw 'callback must be a function'
    }
    let pressTimer = null

    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return;
      }
      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          handler()
        }, arg ? Number(arg) : 2000)
      }
    }
    // 取消计时器
    let cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }
    // 运行函数
    const handler = (e) => {
      binding.value(e)
    }
    // 添加事件监听器
    el.addEventListener('mousedown', start) // 只有pc端才有mouse事件
    el.addEventListener('touchstart', start) // 只有移动端才有touch事件
    // 取消计时器
    el.addEventListener('click', cancel)
    el.addEventListener('mouseout', cancel)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)
  },
  // 当传进来的值更新的时候触发
  componentUpdated(el, { value }) {
    el.$value = value
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler)
  },
}
```

使用指令

```js
<div class="long-press" v-long-press:2000="longPressFn">
    点我测试长按指令
</div>

longPressFn() {
    console.log('长按指令测试~');
}
```



##### 7、超长文本溢出隐藏&鼠标hover弹窗显示全部

涉及的知识点

> - 利用js创建元素并给其添加伪元素
> - 给元素添加行内样式
> - 获取元素相对视口的位置

定义指令

```js
// const CONFIG = {
//   height: 400,
//   width: 400,
// }

export default {
  name: 'textEllipsis',
  componentUpdated(el) {
    const curStyle = window.getComputedStyle(el, '') // 获取当前元素的style
    const textSpan = document.createElement('div') // 创建一个容器来记录文字的width
    // 设置新容器的字体样式，确保与当前需要隐藏的样式相同
    textSpan.style.fontSize = curStyle.fontSize
    textSpan.style.fontWeight = curStyle.fontWeight
    textSpan.style.fontFamily = curStyle.fontFamily
    // 将容器插入body，如果不插入，offsetWidth为0
    // 设置新容器的文字
    textSpan.innerHTML = el.innerText
    el.innerHTML = ''
    el.appendChild(textSpan)

    // 给当前元素设置超出隐藏
    textSpan.style.overflow = 'hidden'
    textSpan.style.textOverflow = 'ellipsis'
    textSpan.style.whiteSpace = 'nowrap'
    // 鼠标移入
    el.onmouseenter = function (e) {
      // 鼠标移入让父元素相对定位
      el.style.position = 'relative';
      el.classList.add('vc-tooltip');

      // 获取元素的大小及位置
      const { width, height, bottom } = e.target.getBoundingClientRect();
      // 创建浮层元素并设置样式
      const vcTooltipDom = document.createElement('div');
      // 设置id方便寻找
      vcTooltipDom.setAttribute('id', 'vc-tooltip');
      // 将浮层插入到el中
      el.appendChild(vcTooltipDom);
      // 浮层中的文字
      vcTooltipDom.innerHTML = el.innerText;
      // tooltip 样式
      vcTooltipDom.style.cssText = `
        max-width:${width * 0.6}px;
        max-height:400px;
        white-space:normal;
        overflow-y:auto;
        position:absolute;
        left:0;
        background: rgba(0, 0 , 0, .6);
        color:#fff;
        border-radius:5px;
        padding:10px;
        display:inline-block;
        font-size:12px;
        line-height: 16px;
        z-index:19999;
      `;
      // 画一个子元素的小三角形
      let afterStr = `content: '';
        width: 0;
        height: 0;
        position: absolute;
        left: ${width * 0.3 - 6}px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        `;

      // 获取视口的高度
      const clientHeight = document.body.clientHeight;
      // 注意元素必须要先插入body中，否则 getBoundingClientRect 获取不到数据
      const { height: toolTipHeight } = vcTooltipDom.getBoundingClientRect();
      // 确保提示框的位置是否始终在视口之内
      if (bottom + toolTipHeight > clientHeight) {
        // 在上面
        vcTooltipDom.style.cssText += `bottom:${height + 12}px;`
        // 三角形的位置
        afterStr += `bottom: ${height}px;
          border-top: 12px solid rgba(0, 0 , 0, .6);
          border-bottom:0`
      } else {
        // 在下面
        vcTooltipDom.style.cssText += `top:${height + 12}px;`
        // 三角形的位置
        afterStr += `top: ${height}px;
          border-bottom: 12px solid rgba(0, 0 , 0, .6);
          border-top: 0;`
      }
      el.afterStr = afterStr;

      /**
      * styleSheets 是只读属性
      * 作用是引入或者嵌入文档中的样式表
     */
      const s = document.styleSheets[document.styleSheets.length - 1]
      // 将三角形插入父元素
      if (s.insertRule) {
        /**
         * CSSStyleSheet.insertRule() 方法用来给当前样式表插入新的样式规则
         * 借用该思路可以给元素添加伪元素
        */
        s.insertRule('.vc-tooltip::before' + '{' + afterStr + '}', s.cssRules.length)
      } else { /* IE */
        s.addRule('.vc-tooltip::before', afterStr, -1)
      }
    }
    // 鼠标移出
    el.onmouseleave = function () {
      // 找到浮层元素并移出
      const vcTooltipDom = document.getElementById('vc-tooltip');
      vcTooltipDom && el.removeChild(vcTooltipDom);
      el.style.position = '';
      el.classList.remove('vc-tooltip');
      el.afterStr = '';
    }
  },
  // 指令与元素解绑时
  unbind() {
    // 找到浮层元素并移除
    const vcTooltipDom = document.getElementById('vc-tooltip')
    vcTooltipDom && document.body.removeChild(vcTooltipDom)
  }
}
```

注册指令

```js
// 超长文本溢出隐藏
    Vue.directive(textEllipsis.name, textEllipsis.componentUpdated)
```

使用指令

```js
<div class="test-ellipsis" v-textEllipsis>
    这是一段很长很长的文字用来这是一段很长很长的文字用来这是一段很长很长的文字用来验证超长文本溢出隐藏
</div>
```



参考文档1：https://mp.weixin.qq.com/s/ECyGO2ey7YsMC-3brcGL6w

参考文档2：https://mp.weixin.qq.com/s/HM7e0N_5KGfh_sY1oklX7g

##### 8、监听页面中元素的可见性

其核心时利用 **IntersectionObserver** API监听页面元素的可见性变化

功能：

> - 监听元素的可见性变化，并不是页面的可见性变化
> - 利用自定义指令，在元素的可见性发生变化后做一些事情

定义指令

```js
export default class visibility {
  constructor() {
    this.observer = null;
    this.observerEls = [];
    this.name = 'visibilitys';
    this.init();
  }
  bind(el, binding) {
    const { value } = binding;
    el.valueFn = value;
    this.observer.observe(el);
    this.bindObserver(el)
  }

  bindObserver(el) {
    this.observer.observe(el);
    if (!this.observerEls.includes(el)) {
      this.observerEls.push(el);
    }
  }

  observerAction(fn, status) {
    if (typeof fn === 'function') {
      fn(status)
    }
  }

  init() {
    if (window.IntersectionObserver) {
      const self = this;
      this.observer = new IntersectionObserver(((entries) => {
        entries.forEach((entry) => {
          const el = entry.target; 
          const { valueFn } = el;
          if (entry.isIntersecting || entry.intersectionRatio === 1) {
            self.observerAction(valueFn, true)	// 在可见性发生变化时调用回调并传入状态
          } else {
            self.observerAction(valueFn, false)
          }
        });
      }), {
        root: null,
        rootMargin: '0px',
        threshold: 0.9, // 不一定非得全部露出来  这个阈值可以小一点点(这个值代表露多少其可见性发生变化)
      });
    }
  }
}
```

注册指令

```js
import visibility from './shared/directive/visibility';

const Visibility = new visibility()

export default {
  install(Vue) {  
    // 元素的可加性
    Vue.directive(Visibility.name, {
      bind(el, binding) {
        // 获取指令参数
        Visibility.bind(el, binding)
      }
    })
    // 注意下面这种写法会出现报错
    // Vue.directive(Visibility.name, Visibility.bind)
  }
}
```

使用指令

```js
<button v-visibilitys="visibilityListen1" class="visibility-test">
    通过自定义指令验证元素的可见性
</button>

visibilityListen1(val) {
    console.log(`当前元素-1-的可见性为：${val}`);
},
```









