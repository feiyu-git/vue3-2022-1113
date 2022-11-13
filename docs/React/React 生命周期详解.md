

#### 直接上代码：

```javascript
componentWillMount() {
      console.log('Component WILL MOUNT!')
  }
  // 相当于 vue 的created
componentDidMount() {
       console.log('Component DID MOUNT!')
  }
componentWillReceiveProps(newProps) {
        console.log('Component WILL RECEIVE PROPS!')
  }
shouldComponentUpdate(newProps, newState) {
        return true;
  }
componentWillUpdate(nextProps, nextState) {
        console.log('Component WILL UPDATE!');
  }
componentDidUpdate(prevProps, prevState) {
        console.log('Component DID UPDATE!')
  }
componentWillUnmount() {
         console.log('Component WILL UNMOUNT!')
  }
```

#### 一、组件初始化(initialization)阶段

​		也就是以下代码中类的构造方法( constructor() ),Test类继承了react Component这个基类，也就继承这个react的基类，才能有render(),生命周期等方法可以使用，这也说明为什么`函数组件不能使用这些方法`的原因。

`		super(props)`用来调用基类的构造方法( constructor() ), 也将父组件的props注入给子组件，功子组件读取(组件中props只读不可变，state可变)。 而`constructor()`用来做一些组件的初始化工作，如定义this.state的初始内容。

```javascript
import React, { Component } from 'react';

class Test extends Component {
  constructor(props) {
    super(props);
  }
}
```

#### 二、组件的挂载(Mounting)阶段

##### 		此阶段分为componentWillMount，render，componentDidMount三个时期。

- componentWillMount:

  ​		在组件挂载到DOM前调用，且只会被调用一次，在这边调用this.setState不会引起组件重新渲染，也可以把写在这边的内容提前到constructor()中，所以项目中很少用。

- render:

  ​		根据组件的props和state（无两者的重传递和重赋值，论值是否有变化，都可以引起组件重新render） ，return 一个React元素（描述组件，即UI），不负责组件实际渲染工作，之后由React自身根据此元素去渲染出页面DOM。render是纯函数（Pure function：函数的返回结果只依赖于它的参数；函数执行过程里面没有副作用），不能在里面执行this.setState，会有改变组件状态的副作用。

- componentDidMount:

  ​	组件挂载到DOM后调用，且只会被调用一次

#### 三、组件的更新(update)阶段

​		在讲述此阶段前需要先明确下react组件更新机制。setState引起的state更新或父组件重新render引起的props更新，更新后的state和props相对之前无论是否有变化，都将引起子组件的重新render。详细可看[这篇文章](https://links.jianshu.com/go?to=https%3A%2F%2Fwww.cnblogs.com%2Fpenghuwan%2Fp%2F6707254.html)

#### 造成组件更新有两类（三种）情况：

- 1.父组件重新render

- 2.组件本身调用setState，无论state有没有变化。可通过shouldComponentUpdate方法优化。

  ​		此阶段分为**componentWillReceiveProps**，**shouldComponentUpdate**，**componentWillUpdate**，**render**，**componentDidUpdate**

##### 参考资料：

- https://www.jianshu.com/p/514fe21b9914
- [http://docs.huruqing.cn/React/list/02.%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.html](http://docs.huruqing.cn/React/list/02.生命周期.html)