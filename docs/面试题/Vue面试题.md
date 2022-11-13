## Vue面试题



#### 一、Vue  中 `nextTick` 实现原理

`Vue` 中 `DOM` 的更新是异步的。如果想在 `DOM` 更新之后做一些操作，比如获取更新后的 `DOM` 的一些属性等，必须使用 `nextTick` 。

##### 原理总结：

`Vue` 的响应式并不是数据发生变化后 `DOM` 立即变化，而是按照一定的策略进行 `DOM` 的更新。这就涉及到 **[JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html) ** 

> - 所有的同步任务都在主线程上执行，形成一个执行栈；
> - 主线程之外还有一个“任务队列”。只要异步任务有了结果就在“任务队列”中放置一个事件；
> - 一旦执行栈中的同步任务执行完毕，系统就会按照 **先进先出** 的原则读取“任务队列”，看看里面有哪些事件。那些对应的一部任务，结束等待进入执行栈中开始执行；
> - 主线程不断重复步骤3，即所谓的“事件循环”。

所以 `Vue` 的 `DOM` 更新，是会先进入“任务队列的”，无法通过同步的方式获取其变化后的 `DOM`。

参考文档：https://segmentfault.com/a/1190000012861862



#### 二、Vue的双向数据绑定原理是什么？

vue.js 是采用数据劫持结合发布-订阅者模式的方式，通过`Object.defineProperty()`来劫持各个属性的`setter`，`getter`，在数据变动时发布消息给订阅者，触发相应的监听回调。

> **具体步骤：**
>
> 第1步：需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 `setter`和`getter`
> 这样的话，给这个对象的某个值赋值，就会触发`setter`，那么就能监听到了数据变化
>
> 第2步：compile解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图
>
> 第3步：Watcher订阅者是Observer和Compile之间通信的桥梁，主要做的事情是:
> 1、在自身实例化时往属性订阅器(dep)里面添加自己
> 2、自身必须有一个update()方法
> 3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。
>
> 第4步：MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。



#### 三、Vue的工作原理思路分析

> 1、 首先使用Object. defineProperty（）的原理来实现劫持监听所有属性
> 2、 每次在页面中使用一个属性就会产生一个watcher
> 3、 而watcher是通过dep来管理的，相同的属性的实例在一个dep中统一管理
> 4、 当其中一个属性变化的时候会通知dep变化，再通知dep中管理的对应的watcher进行变化



#### 四、VUE 中组件通信的方式

  > 1. 父传子、子传父
  > 2. EventBus
  > 3. 响应式API observer：vue 2.6 版本新增
  > 4. 全局对象的方式：非响应式
  > 5. provide / inject
  > 6. vuex: state / getters / mutaton / action / module
  > 7. localStorage / sessionStorage



#### 五、vue-router有哪几种导航钩子？     

> 三种
>
> 一种是全局导航钩子：router.beforeEach(to,from,next)，作用：跳转前进行判断拦截。
>
> 第二种：组件内的钩子
>
> 第三种：单独路由独享组件



#### 六、vuex是什么？怎么使用？哪种功能场景使用它？

> vue框架中状态管理。
>
> 在main.js引入store，注入。新建了一个目录store，….. export 。
>
> 场景有：单页应用中，组件之间的状态。音乐播放、登录状态、加入购物车



#### 七、vue-router是什么？它有哪些组件？

> vue用来写路由一个插件。
>
> router-link、router-view



#### 八、请说下封装 vue 组件的过程？

> 首先，组件可以提升整个项目的开发效率。能够把页面抽象成多个相对独立的模块，解决了我们传统项目开发：效率低、难维护、复用性等问题。
>
> 然后，使用Vue.extend方法创建一个组件，然后使用Vue.component方法注册组件。子组件需要数据，可以在props中接受定义。而子组件修改好数据后，想把数据传递给父组件。可以采用emit方法。



#### 九、请说出vue.cli项目中src目录每个文件夹和文件的用法？

> assets文件夹是放静态资源；
>
> components是放组件；
>
> router是定义路由相关的配置;view视图；
>
> app.vue是一个应用主组件；
>
> main.js是入口文件

#### 十、路由之间跳转

声明式（标签跳转） 编程式（ js跳转）



参考文档1：[链接](<https://blog.csdn.net/xu838209490/article/details/80320605>)

参考文档2：[链接](https://blog.csdn.net/jingtian678/article/details/80593278?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param)

