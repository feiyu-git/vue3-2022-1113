
### 一、父传子 & 子传父（有直接引用关系的父子组件）

1. ##### 先看组件结构

   父组件

   ```react
   import React from "react";
   import Test1 from "../Test1";
   import './index.less';
   
   class HomeIndex extends React.Component {
     state = {
       detailInfo: {},
       testData: '这是父组件的初始值',
       child1: ''
     }
   
     componentDidMount() {
       setTimeout(() => {
         this.setState({
           testData: '父组件更新后的值',
           child1: ''
         })
       }, 2000)
     }
   
     callback = (msg) => {
       this.setState({
         child1: msg
       })  
     }
   
     render() {
       let fromChild1;
       const { child1 } = this.state;
       if (child1) {
         fromChild1 = (
           <div className="test-item">{child1}</div>
         )
       }
       return (
         <div className="home-page">
           <div className="test-cpntent">
             <Test1
               testData={this.state.testData}
               emitData={this.callback}
             ></Test1>
             {fromChild1}
           </div>
         </div>
       )
     }
   }
   
   export default HomeIndex
   
   ```

   子组件

   ```react
   import React, { Component } from 'react';
   import './index.less';
   
   export default class Test1 extends Component {
     constructor(props) {
       super(props)
       this.state = {
         childData: '这是子组件传过来的值~'
       }
     }
   
     emitFn = () => {
       this.props.emitData(this.state.childData)
     }
   
     render() {
       // 接收父组件传过来的值
       const { testData } = this.props;
       return (
         <div className="home-test">
           <div className="title">验证父子组件通信</div>
           <div className="test-item">{testData}</div>
           <div className="test-item" onClick={this.emitFn}>
             这是子组件：点我向父组件传值
           </div>
         </div>
       )
     }
   }
   
   ```

2. ##### 解读

   父传子

   > 父组件通过自定义属性的方式向子组件传值，然后子组件通过 props 接收来自父组件的值

   子传父

   > 其原理跟父传子一样，父组件传一个方法给子组件，子组件通过调用该方法将需要传递的值以参数的形式传递给父组件

### 二、有嵌套关系的多层级组件通信

所谓跨级组件通信，就是父组件向子组件的子组件通信，向更深层的子组件通信。跨级组件通信可以采用下面两种方式：

- 中间组件层层传递 props
- 使用 context 对象

对于第一种方式，如果父组件结构较深，那么中间的每一层组件都要去传递 props，增加了复杂度，并且这些  props 并不是这些中间组件自己所需要的。不过这种方式也是可行的，当组件层次在三层以内可以采用这种方式，当组件嵌套过深时，采用这种方式就需要斟酌了。
 使用 context 是另一种可行的方式，context 相当于一个全局变量，是一个大容器，我们可以把要通信的内容放在这个容器中，这样一来，不管嵌套有多深，都可以随意取用。

使用 context 也很简单，需要满足两个条件：

- 上级组件要声明自己支持 context，并提供一个函数来返回相应的 context 对象
- 子组件要声明自己需要使用 context

下面以代码说明，我们新建 3 个文件：父组件 App.js，子组件 Sub.js，子组件的子组件 SubSub.js。

#####  App.js：

```jsx
import React, { Component } from 'react';
import PropTypes from "prop-types";
import Sub from "./Sub";
import "./App.css";

export default class App extends Component{
    // 父组件声明自己支持 context
    static childContextTypes = {
        color:PropTypes.string,
        callback:PropTypes.func,
    }

    // 父组件提供一个函数，用来返回相应的 context 对象
    getChildContext(){
        return{
            color:"red",
            callback:this.callback.bind(this)
        }
    }

    callback(msg){
        console.log(msg)
    }

    render(){
        return(
            <div>
                <Sub></Sub>
            </div>
        );
    }
} 
```

##### Sub.js：

```jsx
import React from "react";
import SubSub from "./SubSub";

const Sub = (props) =>{
    return(
        <div>
            <SubSub />
        </div>
    );
}

export default Sub;
```

##### SubSub.js：

```jsx
import React,{ Component } from "react";
import PropTypes from "prop-types";

export default class SubSub extends Component{
    // 子组件声明自己需要使用 context
    static contextTypes = {
        color:PropTypes.string,
        callback:PropTypes.func,
    }
    render(){
        const style = { color:this.context.color }
        const cb = (msg) => {
            return () => {
                this.context.callback(msg);
            }
        }
        return(
            <div style = { style }>
                SUBSUB
                <button onClick = { cb("我胡汉三又回来了！") }>点击我</button>
            </div>
        );
    }
}
```

如果是父组件向子组件单向通信，可以使用变量，如果子组件想向父组件通信，同样可以由父组件提供一个回调函数，供子组件调用，回传参数。
 在使用 context 时，有两点需要注意：

- 父组件需要声明自己支持 context，并提供 context 中属性的 PropTypes
- 子组件需要声明自己需要使用 context，并提供其需要使用的 context 属性的 PropTypes
- 父组件需提供一个 getChildContext 函数，以返回一个初始的 context 对象

**如果组件中使用构造函数（constructor），还需要在构造函数中传入第二个参数 context，并在 super 调用父类构造函数是传入 context，否则会造成组件中无法使用 context**。

```tsx
...
constructor(props,context){
  super(props,context);
}
...
```

##### 改变 context 对象

我们不应该也不能直接改变 context 对象中的属性，要想改变 context 对象，**只有让其和父组件的 state 或者 props 进行关联，在父组件的 state 或 props 变化时，会自动调用 getChildContext 方法，返回新的 context 对象**，而后子组件进行相应的渲染。
 修改 App.js，让 context 对象可变：

```jsx
import React, { Component } from 'react';
import PropTypes from "prop-types";
import Sub from "./Sub";
import "./App.css";

export default class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            color:"red"
        };
    }
    // 父组件声明自己支持 context
    static childContextTypes = {
        color:PropTypes.string,
        callback:PropTypes.func,
    }

    // 父组件提供一个函数，用来返回相应的 context 对象
    getChildContext(){
        return{
            color:this.state.color,
            callback:this.callback.bind(this)
        }
    }

    // 在此回调中修改父组件的 state
    callback(color){
        this.setState({
            color,
        })
    }

    render(){
        return(
            <div>
                <Sub></Sub>
            </div>
        );
    }
} 
```

此时，在子组件的 cb 方法中，传入相应的颜色参数，就可以改变 context 对象了，进而影响到子组件：

```jsx
...
return(
    <div style = { style }>
        SUBSUB
        <button onClick = { cb("blue") }>点击我</button>
    </div>
);
...
```

context 同样可以应在无状态组件上，只需将 context 作为第二个参数传入：

```jsx
import React,{ Component } from "react";
import PropTypes from "prop-types";

const SubSub = (props,context) => {
    const style = { color:context.color }
    const cb = (msg) => {
        return () => {
            context.callback(msg);
        }
    }

    return(
        <div style = { style }>
            SUBSUB
            <button onClick = { cb("我胡汉三又回来了！") }>点击我</button>
        </div>
    );
}

SubSub.contextTypes = {
    color:PropTypes.string,
    callback:PropTypes.func,
}

export default SubSub;
```

### 三、非嵌套组件间通信

> 非嵌套组件: 就是没有任何包含关系的组件,包括兄弟组件以及不再同一个父级的非兄弟组件。 使用事件订阅，即一个发布者，一个或多个订阅者。

##### 安装event

```
npm install event -save
```

##### 新建Evt.js，导入events

```
import {EventEmitter} from 'events';
export default new EventEmitter();   
```

##### 使用示例

```js
// 发送数据
junpFn(path) {
    this.setState({
        currentPath: path
    })
    emitter.emit('currentpath', path)
}

// 接收数据
componentDidMount() {
    setTimeout(() => {
      this.setState({
        testData: '父组件更新后的值',
        child1: ''
      })
    }, 2000);

    // emitter.addListener('currentpath', (msg) => {
    //   console.log('验证非关联组件通信', msg)
    //   this.setState({
    //     path: msg
    //   });
    // })

    emitter.addListener('currentpath', this.testFn);
  }

  componentWillUnmount() {
    console.log('组件销毁')
    this.setState = (state, callback) => {
      return;
    };
    emitter.removeListener('currentpath', this.testFn)
  }

  testFn = (msg) => {
    console.log('验证非关联组件通信', msg)
    this.setState({
      path: msg
    });
  }
```

##### 注意：

> 1. removeListener 中移除监听时的回调函数要与 addListener 引用同一个方法，否则移除监听不能成功
> 2. componentWillUnmount 要加上 this.setState = (state, callback) => {return} 否则会有异常报错



### 四、[动态路由传参](https://www.cnblogs.com/huihuihero/p/12165344.html)

A页面跳转到B页面

##### 1、params传参

刷新页面后参数不消失，参数会在地址栏显示

##### 非嵌套路由

```js
// A页面的方法跳转并传递参数
toHome = () => {
    const id = '16666';
    this.props.history.push({pathname:`/me/${id}`})
}

// B页面接收传过来的参数
componentDidMount = () => {
    // 获取params参数
    const params = this.props.match.params;
    console.log('params', params);	// {id: '16666'}
}
```

##### 嵌套路由

路由结构

```js
// App.js
/**
 * 路由懒加载：React 16.6.0发布了React.lazy来实现React组件的懒加载
 * 参考文档：https://blog.csdn.net/weixin_45679977/article/details/107785105
 */
const Me = lazy(() => import('./view/Me/index'));

class App extends React.Component {
  render() {
    return (
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="demo-main">
            <Switch>
              <Route path="/" component={Home} exact />
              <Route path="/home" component={Home} />
              <Route path="/me/:id" component={Me} />
            </Switch>
          </div>
        </Suspense>
        <Footer />
      </Router>
    )
  }
}

export default App;

// Home/index.js
// 容器组件
import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import HomeIndex from "./HomeIndex/index";

class Home extends Component {
  render() {
    return (
      <div className="home">
        <Switch>
          {/* :id? 后面的 ？表示可选不加表示必选 */}
          <Route path="/home/index/:id?" component={HomeIndex} />
          <Route path="/home/detail/:flowerId" component={Detail} />
          <Route exact path='/' render={() => (<Redirect to='/home/index' />)} />
        </Switch>
      </div>
    );
  }
}

export default Home;
```

跳转到 /home/index 并通过 params传参

```js
// A页面的方法跳转并传递参数
toHome = () => {
    const id = '16666';
    this.props.history.push({pathname:`/home/index/${id}`})
}

// B页面接收传过来的参数
componentDidMount = () => {
    // 获取params参数
    const params = this.props.match.params;
    console.log('params', params);
}
```

如果需要传一个对象

```js
const info = {
    id: '7777777',
    name: '机械运动'
}

this.props.history.push({pathname:`/home/index/${JSON.stringify(info)}`})
```

##### 2、query传参

刷新页面后参数消失

```js
// A页面的方法跳转并传递参数
toHome = () => {
    // query传参
    this.props.history.push({
        pathname: '/home/index',
        query: {
            id: '1234134',
            name: '机械运动'
        }
    })
}

// B页面接收传过来的参数
componentDidMount = () => {
    // 获取query参数
    const queryParams = this.props.location.query;
    console.log('queryParams', queryParams)
}
```

##### 3、state传参

刷新页面后参数不消失，state传的参数是加密的，比query传参好用

注：state 传参的方式只支持Browserrouter路由，不支持hashrouter

```js
// A页面的方法跳转并传递参数
toHome = () => {
    const info = {
        id: '7777777',
        name: '机械运动'
    }
    // state 传参
    this.props.history.push({
        pathname: '/home/index',
        state: {
            ...info
        }
    })
}

// B页面(/home/index)接收传过来的参数
componentDidMount = () => {
    // 获取 state 参数
    const state = this.props.location.state;
    console.log('state', state);
}
```

```js
路由页面：<Route path='/demo' component={Demo}></Route>  //无需配置
路由跳转并传递参数：
    链接方式： <Link to={{pathname:'/demo',state:{id:12,name:'dahuang'}}}>XX</Link> 
    js方式：this.props.history.push({pathname:'/demo',state:{id:12,name:'dahuang'}})
获取参数： this.props.location.state.name
```





参考文档1：https://blog.csdn.net/xingfuzhijianxia/article/details/86151243

参考文档2：https://www.jianshu.com/p/fb915d9c99c4

