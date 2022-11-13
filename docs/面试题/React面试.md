## React 面试题



#### 一、React 中生命周期执行顺序

（1） 单个组件

1. 初始化的生命周期

   > 1. constructor
   > 2. static getDerivedStateFromProps
   > 3. render
   > 4. componentDidMount

2. 更新的生命周期

   > 1. static getDerivedStateFromProps
   > 2. shouldComponentUpdate
   > 3. render
   > 4. getSnapshotBeforeUpdate
   > 5. componentDidUpdate

（2） 父子组件

1. 初始化的生命周期

   > 1. parent.constructor
   > 2. parent.static getDerivedStateFromProps
   > 3. parent.render
   > 4. children.constructor
   > 5. children.static getDerivedStateFromProps
   > 6. children.render
   > 7. children.componentDidMount
   > 8. parent.componentDidMount


参考文档1：https://zhuanlan.zhihu.com/p/433755348

参考文档2：https://blog.csdn.net/qq_16525279/article/details/116839734



#### 二、使用 Hook 的好处

> - 有状态的组件复用麻烦，便于组件复用
> - 使用 useEffect 简化狗子函数
> - 避免 class 组件中让人头疼的 this 指向问题，让函数组件也有自己的数据



#### 三、常用的 Hook

1. useState：声明状态变量

2. useEffect

   useEffect 替代了原始的 `componentDidMount`和`componentDidUpdate` 两个生命周期。

   ##### 如何实现 componentWillUnmount ？

   答案是利用 useEffect 的 return，例如上述的清除定时器

   ##### useEffect 的第二个参数

   那到底要如何实现类似`componentWillUnmount`的效果那?这就需要请出`useEffect`的第二个参数，它是一个数组，数组中可以写入很多状态对应的变量，意思是当状态值发生变化时，我们才进行解绑。但是当传空数组`[]`时，就是当组件将被销毁时才进行解绑，这也就实现了`componentWillUnmount`的生命周期函数。

3. creatContext：实现有包含关系的父子组件通信

4. useMemo：是一个优化手段

5. useRef： 通过 ref 访问 DOM,`useRef` 会在每次渲染时返回同一个 ref 对象。 



参考文档1：https://juejin.cn/post/6844903922453200904

参考文档2：https://blog.csdn.net/weixin_53533170/article/details/117204179







