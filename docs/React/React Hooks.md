### React Hooks 常用 API 解读



**[函数副作用](https://www.cnblogs.com/snandy/archive/2011/08/14/2137898.html)** 指当调用函数时，除了返回函数值之外，还对主调用函数产生附加的影响。例如修改全局变量（函数外的变量）或修改参数。



### 一、useState

 useState 返回的更新状态方法是异步的，要在下次重绘才能获取新值。不要试图在更改状态之后立马获取状态。

```js
import React, { useState } from 'react'

function Example1() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Click me {count} times ~</p>
      <button onClick={() => setCount(count + 1)}>click me</button>
    </div>
  )
}

export default Example1
```

useState 是 React 自带的 API，作用是用来声明状态变量。

我们可以看到，useState 通过结构可以得到两个参数 count 、 setCount 。count 是我们声明的状态，setCount 是用来修改 count 的方法。且在 count 值发生变化时组件会重新渲染。

**注意：** useState 的状态声明不允许放在 if 条件中，否则会引起报错。

**问题：** hook中父组件如何获取子组件的 `state`、`方法` ?

```js
// 父组件的主要代码：
import React, {useRef} from 'react';
 
const parent = (props) = {
    const shareRef = useRef();
    return (
        <div>
            //子组件
            <Child ref={shareRef}/>
        </div>
    )
}
 
export default Parent;

// 子组件主要代码
子组件的主要代码：
import React, { forwardRef, useImperativeHandle } from 'react';
 
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    handleShareSubmit,
    resetSharePopup,// 这里运用了es6的简写，（实际等于： resetSharePopup：resetSharePopup）
  }));
const handleShareSubmit = () => {.....}
const  resetSharePopup = () => {.....}
}

// 注意在这里写是错的，会报错
// forwardRef(Test1);
                         
export defalut Child;
                         
// 父组件使用子组件的 state 、 方法：通过 shareRef.current
shareRef.current.handleShareSubmit();
```



### 二、useEffect

```js
  import { useState, useEffect } from 'react'
  import { Route, Link, Switch, Redirect } from 'react-router-dom'

  function Test1() {
    useEffect(() => {
      console.log('进入到 Test1')
      return () => {
        console.log('离开了 Test1')
      }
      // 如果这里不传入第二个参数 [] ,在每一次父组件的状态发生变化时都会执行这里的生命周期
    })
    return (
      <div>
        这是 Test1
      </div>
    )
  }

  function Test2() {
    useEffect(() => {
      console.log('进入到 Test2')
      return () => {
        console.log('离开了 Test2')
      }
      // 这里的 [] 表示只有在组件真正销毁时才会触发解绑
    }, [])
    return (
      <div>
        这是 Test2
      </div>
    )
  }

  function Example3() {
    const [count, setCount] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        console.log('666666')
      }, 1000)
      return () => {
        console.log('==============')
        // 可以在这里【类似于 componentWillUnmount】清除定时器
        clearInterval(timer)
      }
      /**
       * [] 代表在组件销毁时才进行解绑
       * [count] 代表在 count 参数变化时才进行解绑
      */
    }, [])

    return (
      <div>
        {/* 这是 /cart 路由的公共部分 */}
        <p>验证 useEffect</p>
        <div style={{ margin: '16px 0' }}>
          <div>Click me {count} times ~</div>
          <button onClick={() => setCount(count + 1)}>click me</button>
        </div>
        <ul>
          <li><Link to='/cart/test1'>Tets1</Link></li>
          <li><Link to='/cart/test2'>Tets2</Link></li>
        </ul>

        {/* 这是子路由部分 */}
        <Switch>
          <Route path='/cart/test1' exact component={Test1} />
          <Route path='/cart/test2' component={Test2} />
          <Route exact path='/cart' render={() => (<Redirect to='/cart/test1' />)} />
        </Switch>
      </div>
    )
  }

  export default Example3
```

useEffect 替代了原始的 `componentDidMount`和`componentDidUpdate` 两个生命周期。

#### 2.1 如何实现 componentWillUnmount ？

答案是利用 useEffect 的 return，例如上述的清除定时器

#### 2.2 useEffect 的第二个参数

那到底要如何实现类似`componentWillUnmount`的效果那?这就需要请出`useEffect`的第二个参数，它是一个数组，数组中可以写入很多状态对应的变量，意思是当状态值发生变化时，我们才进行解绑。但是当传空数组`[]`时，就是当组件将被销毁时才进行解绑，这也就实现了`componentWillUnmount`的生命周期函数。

#### 2.3 知识点集合

##### 2.3.1 只在第一次使用 componentDimount，可以用来请求异步请求

> `useEffect` 最后（第二个参数），加上[]

```js
useEffect(()=>{
    const users = 获取全国人民的信息()
},[])
```

##### 2.3.2 用来替代 componentWillUpdate，等每次渲染完都会执行的生命周期函数

> `useEffect` 第二个参数，不加[]就表示每一次渲染【这里指的渲染是指 return 里的 dom】都会执行

```js
useEffect(()=>{
    const users = 每次都获取全国人民的信息()
})
```

##### 2.3.3 每次渲染都会执行感觉有点废

> 在需要的 `state` 变化时才执行，[]可以传入对应的状态（可以模拟 Vue 的 watch）

```jsx
useEffect(() => {
    const users = （name改变了我才获取全国人民的name信息()）
},[name])

useEffect(() => {
    const users = （name改变了我才获取全国人民的age信息()）
},[age])

useEffect(() => {
    // 在 name 或 age 变化时才执行
},[name,age])
```

##### 2.3.4 取消订阅，如在 componentWillUnmount 时清除定时器

注意：定时器必须写在 `useEffect` 中，写在外面不生效

> 在 `useEffect` 的 `return` 里面可以做取消订阅

```jsx
useEffect(()=> {
    return ()=> {
        // 可以在这里清除定时器
    }
},[])
```

##### 2.3.5 特别注意

> -  `useEffect` 里面使用到的state的值, 固定在了 `useEffect` 内部， 不会被改变，除非 `useEffect` 刷新，重新固定state的值 
> - `useEffect` 不能被判断条件包裹
> - `useEffect` 不能被打断

##### 2.3.6 完整 dome

```jsx
import { useState, useEffect } from "react";

export default function Test2() {
  const [age, setAge] = useState(0);
  const [hobby, setHobby] = useState("篮球");
  function hobbyFn() {
    setHobby(hobby + 6);
  }
  // 写在这无法被清除
  // const timer = setInterval(() => {
  //   console.log("timer~~~~~~~~~~~~");
  // }, 1000);
  useEffect(() => {
    console.log(
      "没有第二个参数，第一次渲染就会被调用，且后面每次渲染都会被调用"
    );
  });
  useEffect(() => {
    console.log("第二个参数为[]，只有第一次渲染就会被调用");
  }, []);
  useEffect(() => {
    console.log(
      "第二个参数为[age]，只有age变化时才会被调用调用，第一次也会被调用"
    );
  }, [age]);
  useEffect(() => {
    const timer1 = setInterval(() => {
      console.log("timer1~~~~~~~~~~~~");
    }, 1000);
    return () => clearInterval(timer1);
  });

  // useEffect 里面使用到的state的值, 固定在了useEffect内部， 不会被改变，除非useEffect刷新，重新固定state的值
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("use effect...", count);
    const timer = setInterval(() => {
      console.log("timer...count:", count);
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div>Test2 组件</div>
      <div>
        <span>age的值是：{age}</span>
        <button className="mar-left" onClick={() => setAge(age + 1)}>
          点我age + 1
        </button>
        <br />
        <span>hobby的值是：{hobby}</span>
        <button className="mar-left" onClick={hobbyFn}>
          点我修改 hobby
        </button>
      </div>
    </div>
  );
}

```




### 三、useRef

1、获取dom元素

```js
import { useRef } from 'react'

function Example4() {
  const ipt = useRef()

  function inputChange() {
    console.log('ipt-13', ipt)
  }

  return (
    <>
       <input type="text" onChange={inputChange} ref={ipt} />
    </>
  )
}

export default Example4
```

2、获取子组件的方法

`useImperativeHandle` 可以让你在使用 `ref` 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 ref 这样的命令式代码。

```js
// 父组件
const unitRef = useRef()
function setChild() {
    unitRef.current.correctWork('Web 前端开发')
}

<button onClick={setChild}>点我调用子组件方法</button>
<Child info={{ count, name, setName }} ref={unitRef} />

// 子组件
import React, { useState, useImperativeHandle } from 'react'

export default React.forwardRef(({ info } = {}, ref) => {
  const { count, name, setName } = info || {};
  const [work, setWrok] = useState('web')

  function correctWork(work) {
    if (work) {
      setWrok(work)
    } else {
      console.log('请传入 work')
    }
  }

  useImperativeHandle(ref, () => ({
    correctWork
  }))

  return (
    <div>
      <h1>子组件</h1>
      <h2>来自父组件的 count 值：{count}</h2>
      <h3>来自父组件的 name 值：{name}</h3>
      <button onClick={() => setName('李四~~~')}>点我修改父组件的值</button>
      <div>
        <p>验证父组件调用子组件的方法</p>
        <div>
          工作是：{work}
        </div>
      </div>
    </div>
  )
})
```

3、就是相当于全局作用域，一处被修改，其他地方全更新... 



### 四、createContext 

实现有包含关系的父子组件通信

```
文件结构

/Example
	|_index.js	// 父组件
	|_Child.js	// 子组件
	|state.js 	// 存放 createContext()
```

index.js

```js
import { useState } from 'react'
import Child from './Child'
import countContext from './state'

function Example4() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('张三')

  return (
    <>
      <div>
        <div>Click me {count} times ~</div>
        <button onClick={() => setCount(count + 1)}>click me</button>
        <br />
        <div>
          <p>验证子组件修改父组件的值</p>
          <div>
            姓名是：{name}
          </div>
        </div>
      </div>
      <div style={{ margin: '16px' }}>
        <countContext.Provider value={{count, name, setName}}>
          <Child></Child>
        </countContext.Provider>
      </div>
    </>
  )
}

export default Example4
```

/Child.js

```js
import React, { useContext } from 'react'
import countContext from './state'

export default function Child() {
  const value = useContext(countContext)
  const { count, name, setName } = value;
  console.log(count)
  return (
    <div>
      <h1>子组件</h1>
      <h2>来自父组件的 count 值：{count}</h2>
      <h3>来自父组件的 name 值：{name}</h3>
      <button onClick={() => setName('李四~~~')}>点我修改父组件的值</button>
    </div>
  )
}
```

/state.js

```js
import { createContext } from 'react'

export default createContext();
```

注意：

> - 如果需要通过  useContext 实现父子组件通信，那么父子组件必须引用同一个 createContext
> - 如果需要传递多个值，可以使用 `<countContext.Provider value={{count, name, setName}}>`

参考文档：https://jspang.com/detailed?id=50



### 五、useMemo、memo

##### 5.1 `memo` 是 React [v16.6.0](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Fblob%2Fmaster%2FCHANGELOG.md%231660-october-23-2018)出了一些新的包装函数 ，用于性能优化。`memo` 是浅比较

使用说明：

子组件用 `memo` 包装后，当子组件的 `props` 或 `state` 没发生变化时，子组件不会重新渲染。

使用案例

```jsx
// 父组件
import { useState } from "react";
import Child1 from "./components/test1/indx";
import Child2 from "./components/test2/indx";

export default function PageMemoTest() {
  console.log("这是父组件PageMemoTest~~~~~~");
  const [count1, settCount1] = useState(0);
  const [count2, settCount2] = useState(0);

  function addFn1() {
    settCount1(count1 + 1);
  }
  function addFn2() {
    settCount2(count2 + 1);
  }

  return (
    <div className="common-container">
      <div>验证 memo、useMemo</div>
      <div>
        <span>父组件count1： {count1}</span>
        <button className="mar-left" onClick={addFn1}>
          点我count1+1
        </button>
        <br />
        <span>父组件count2： {count2}</span>
        <button className="mar-left" onClick={addFn2}>
          点我count2+1
        </button>
      </div>
      <div className="test-item">
        <div>子组件</div>
        <Child1 count1={count1}></Child1>
        <Child2></Child2>
      </div>
    </div>
  );
}


// 子组件
import { useState, memo } from "react";

const Child1 = () => {
  console.log("这是Child1~~~~~~");
  const [age, setAge] = useState(10);

  function addFn() {
    setAge(age + 1);
  }

  return (
    <div>
      <div>
        <span>age是：{age}</span>
        <button className="mar-left" onClick={addFn}>
          点我+1
        </button>
      </div>
    </div>
  );
};

export default memo(Child1);

```

##### 5.2 useMemo 主要是用来解决 `React Hook` 产生的无用渲染问题，解决了缓存值得问题。

例如子组件 Child2 在父组件传过来的 props.count2 发生变化时做一下事情比如接口请求。

`useMemo` 可以放在父组件，也可放在子组件中。

```jsx
// 父组件
import { useState } from "react";
import Child1 from "./components/test1/indx";
import Child2 from "./components/test2/indx";

export default function PageMemoTest() {
  console.log("这是父组件PageMemoTest~~~~~~");
  const [count1, settCount1] = useState(0);
  const [count2, settCount2] = useState(0);

  function addFn1() {
    settCount1(count1 + 1);
  }
  function addFn2() {
    settCount2(count2 + 1);
  }

  return (
    <div className="common-container">
      <div>验证 memo、useMemo</div>
      <div>
        <span>父组件count1： {count1}</span>
        <button className="mar-left" onClick={addFn1}>
          点我count1+1
        </button>
        <br />
        <span>父组件count2： {count2}</span>
        <button className="mar-left" onClick={addFn2}>
          点我count2+1
        </button>
      </div>
      <div className="test-item">
        <div>子组件</div>
        <Child1 count1={count1}></Child1>
        <Child2 count2={count2}></Child2>
      </div>
    </div>
  );
}


// 子组件
import { useState, useMemo, useRef } from "react";

const Child2 = (props) => {
  const [age, setAge] = useState(20);
  const shareRef = useRef(20);

  function addFn() {
    console.log("由useMemo触发~~~~~~~~~");
    setAge(age + 1);
    shareRef.current = age + 1;
    /**
     * useState 返回的更新状态方法是异步的，要在下次重绘才能获取新值。
     * 不要试图在更改状态之后立马获取状态
     */
    return shareRef.current;
  }

  /**
   * 这里的 resAge 是响应式的
   * useMemo是在 props.count2 发生变化时才会触发
   */
  const resAge = useMemo(() => {
    return addFn();
  }, [props.count2]);

  return (
    <div>
      <div>
        <span>age是：{age}</span>
        <button className="mar-left" onClick={addFn}>
          点我+1
        </button>
      </div>
      <div>由父组件变化触发useMemo后的值：{resAge}</div>
    </div>
  );
};

export default Child2;

```

### 六、useCallback

前面提到了 `useMemo` 是用于缓存值得，即值发生变化时才让子组件重新渲染。但是当子组件绑定的有 `function` 时，子组件依然会重新渲染，此时需要用到 `uceCallback` 。

> useMemo：是缓存值得
>
> useCallback：是缓存函数的

##### 特别说明：

不管是 `useMemo` 还是 `useCallback` 通常都是配合 `memo` 使用的。

```jsx
// 父组件
import { useState, useCallback } from "react";
import Child1 from "./components/child1";

export default function useCallbackDemo() {
  console.log("这是父组件useCallbackDemo~~~~~~");
  const [count1, settCount1] = useState(0);
  const [text, setText] = useState("");

  function addFn1() {
    settCount1(count1 + 1);
  }

  // const onChangeFn = (e) => {
  //   console.log('00000000000')
  //   setText(e.target.value);
  // };
  
  // 这里如果不用 useCallback 那么子组件虽然用了 memo ，但是 count1 变化时，子组件依然会重新渲染。
  const onChangeFn = useCallback((e) => {
    console.log('00000000000')
    setText(e.target.value);
  }, []);

  return (
    <div className="common-container">
      <div>验证 memo、useMemo</div>
      <div>
        <span>父组件count1： {count1}</span>
        <button className="mar-left" onClick={addFn1}>
          点我count1+1
        </button>
      </div>
      <div className="test-item">
        <div>
          <span>子组件的input的value: {text}</span>
        </div>
        <Child1 onChangeFn={onChangeFn}></Child1>
      </div>
    </div>
  );
}


// 子组件
import { memo } from "react";

const Child1 = memo((props) => {
  console.log("子组件渲染~~~~~~~");

  return (
    <div>
      <div>子组件Child1</div>
      <input type="text" onChange={props.onChangeFn} />
    </div>
  );
});

export default Child1;

```



### 七、useReducer

特点待研究！！！！！！

```jsx
const reducer =(state = 0, {type})=>{
    switch (type) {
        case "add":
            return state+1
        case 'delete':
            return state-1
        default:
            return state;
    }
}

const Hook =()=>{
    const [count, dispatch] = useReducer(reducer, 0)
    return(
        <div>
           count:{count}
           <button onClick={()=> dispatch({type:'add'})}>add</button>
            <button onClick={()=> dispatch({type:'delete'})}>delete</button>
        </div>
    )
}

export default Hook
```



### 八、useContext

待研究！！！！！！



### 九、自定义 Hook

 如自定义一个当resize 的时候 监听window的width和height的hook ，有点类似 Vue 的自定义指令。




遇到的异常报错及解决：

> 问题：https://www.cnblogs.com/Super-scarlett/p/13632236.html
>
> 解决：https://blog.csdn.net/qq_39770065/article/details/110424964



参考文档：https://juejin.cn/post/6844904072168865800#heading-12