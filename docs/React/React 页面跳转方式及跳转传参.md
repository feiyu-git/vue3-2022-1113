

#### 一、页面跳转

​		1、通过  Link 标签跳转

```javascript
import { Link } from "react-router-dom";

<Link to="/xxxx"></Link>;
```

​		2、通过 js 跳转

```js
this.props.history.push("/xxxx");
```

#### 二、路由传参

##### 方式一：通过 params

1. 路由表中,配置**【动态路由】**

   ##### 		动态路由跳转之后，页面刷新，传过来的数据不会丢失。

   ```js
   <Route path=" /sort/:id " component={Sort}></Route>
   ```

2. Link 处

   - HTML 方式

   ```js
   <Link to={" /sort/ " + " 2 "} activeClassName="active">
     XXXX
   </Link>
   ```

   - JS 方式

   ```js
   this.props.history.push("/sort/" + "2");
   ```

3. sort （目标）页面
   通过 this.props.match.params.id 就可以接受到传递过来的参数（id）

##### 方式 二：通过 query

##### 		前提：必须由其他页面跳过来，参数才会被传递过来

##### 		注：不需要配置路由表。路由表中的内容照常：`<Route path='/sort' component={Sort}></Route>`

1. Link 处

   - HTML 方式

     ```js
       <Link to={{ pathname : ' /sort ' , query : { name : 'sunny' }}}>
     ```

   - JS 方式

     ```js
     this.props.history.push({ pathname: "/sort", query: { name: " sunny" } });
     ```

2. sort （目标）页面通过下面的方式获取

   ```js
   this.props.location.query.name;
   ```

##### 方式 三：

​		通过 state

​		同 query 差不多，只是属性不一样，而且 state 传的参数是加密的，query 传的参数是公开的，在地址栏

1、Link 处

- HTML 方式:

  ```js
  <Link to={{ pathname : ' /sort ' , state : { name : 'sunny' }}}>
  ```

- JS 方式：

  ```js
  this.props.history.push({ pathname: "/sort", state: { name: "sunny" } });
  ```

2、sort 页面通过下面的方式获取

```js
this.props.location.state.name;
```



参考文档：[http://docs.huruqing.cn/React/list/06.%E8%B7%AF%E7%94%B1%E4%BC%A0%E5%8F%82.html](http://docs.huruqing.cn/React/list/06.路由传参.html)