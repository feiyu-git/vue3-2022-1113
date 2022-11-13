[webpack 中文文档](https://webpack.docschina.org/concepts/)



### 一、创建一个工程

```
npm init -y
```

### 二、安装webpack

```
npm i webpack webpack-cli -D
```

### 三、配置webpack

在工程根目录下新建文件 `webpack.config.js` ,配置工程的入口、出口

```js
const path = require('path');

// CommonJS 语法
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
```

### 四、添加运行脚本

package.json 中添加运行脚本

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack"
},
```

运行脚本

```
npm run build
```

### 五、添加插件

添加 `html-webpack-plugin` ， `html-webpack-plugin` 为应用程序生成一个 HTML 文件，并自动将生成的所有 bundle 注入到此文件中。 

1. ##### 安装插件

   ```
   npm i html-webpack-pugin -D
   ```

2. ##### `webpack` 配置插件

   ```js
   const path = require('path');
   const HtmlWebpackPlugin = require("html-webpack-plugin");
   
   // CommonJS 语法
   module.exports = {
     mode: 'development',
     entry: path.join(__dirname, 'src', 'index.js'),
     output: {
       path: path.join(__dirname, 'dist'),
       filename: 'bundle.js'
     },
     plugins: [
       new HtmlWebpackPlugin({
         template: path.join(__dirname, 'public/index.html'),
         filename: 'index.html'
       })
     ]
   }
   ```

3. 运行脚本可以看到，dist 下自动生成了 `index.html` ，且自动将打包后的 js 文件引入到 `index.html` 文件中。

### 六、使用 webpack-dev-server

安装 `webpack-dev-server` 后，可实现热更新。

安装插件

```
npm i webpack-dev-server -D
```

webpack 配置 devServer

```js
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

// CommonJS 语法
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      filename: 'index.html'
    })
  ],
  devServer: {
    port: 8000,
    static: path.join(__dirname, "dist")
  }
}
```

添加脚本

```
"dev": "webpack-dev-server"
```

执行脚本

```
npm run dev
```

### 七、编译 ES6 代码

bable 相关的 loader

> - @babel/core
> - @babel/preset-env
> - babel-loader

```
npm i @babel/core @babel/preset-env babel-loader -D
```

1. 在根目录添加 `.babelrc` 文件

   ```js
   {
     // 预设：babel一系列插件的集合
     "presets": [
       "@babel/preset-env"
     ]
   }
   ```

2. webpack 添加配置

   ```js
   module: {
       rules: [
         {
           test: /\.js$/,
           loader: 'babel-loader', // 如果写成数组会报错
           include: path.join(__dirname, 'src'),
           exclude: /node_modules/
         }
       ]
     },
   ```

### 八、webpack.config.js 完整配置

```js
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

// CommonJS 语法
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader', // 如果写成数组会报错
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      filename: 'index.html'
    })
  ],
  devServer: {
    port: 8000,
    static: path.join(__dirname, "dist")
  }
}
```

### 九、每次打包前自动删除之前的dist

```js
// 打包前删除之前的 dsit
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      filename: 'index.html'
    }),
    new CleanWebpackPlugin()
  ],
```

### 十、webpack 启用 watch 模式

通常，当您在开发阶段运行 Webpack 时，您希望在 [`watch` 模式](https://links.jianshu.com/go?to=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fwatch%2F)下运行它。这将配置 Webpack 来监视项目中的文件更改，并在文件更改时重新编译。换句话说，你不必每次都手动重新运行Webpack。

```js
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack",
    "build:dev": "webpack --watch",
    "dev": "webpack-dev-server"
  },
```

如 `build:dev` 脚本，可以在文件发生变更后自动将差异化的文件重新打包。

应用场景：

如 taro 将 React 打包成支付宝小程序，当文件发生变化时，自动打包更新 dist。

参考文档：https://www.jianshu.com/p/603dc8447b55

### 十一、给打包后的 js  文件设置 hash

```js
output: {
    // path: path.join(__dirname, 'dist'),
    // filename: 'bundle.js'
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
  },
```



### 结语：送上 webpack 完整配置

```js
const path = require('path');
// 在打包后的 dist 目录下新建 index.html ，并且将打包后的 js 文件自动引入到 index.html 中
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 打包前删除之前的 dsit
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// CommonJS 语法
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    // path: path.join(__dirname, 'dist'),
    // filename: 'bundle.js'
    filename: '[name].[contenthash].bundle.js',
    chunkFilename: '[name].[contenthash].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader', // 如果写成数组会报错
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      filename: 'index.html'
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    port: 8000,
    static: path.join(__dirname, "dist")
  }
}
```

