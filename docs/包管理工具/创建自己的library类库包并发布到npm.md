# 创建自己的library类库包并使用webpack5.x打包发布到npm



参考工程：https://gitee.com/AAC-12321/package-library-es6-es5

自己创建的工程：https://gitlab.com/feiyu-git/mu-tool



### 一、背景

从零创建一个工程，用 `webpack5.x` 打包发到 `npm` ，功能是包含自己封装的工具函数。



### 二、方案

从 `gitlab` 创建一个工程克隆到本地。本地开发好后利用 `webpack` 打包后 `npm publish`，此过程包含如下脚本

```json
"build": "webpack",
"prepublish": "npm run build",
"release": "standard-version",
"build:npm": "npm run release && git push --follow-tags && npm publish"
```

只需要执行 `npm run build:npm`，具体执行过程：

```json
npm run build:npm

// 下面是自动执行
npm run release
npm run prepublish
npm run build
npm publish
```



### 三、工程目录

```
|_src
|	|_index.js	// 入口文件，将所有的工具函数全部 import 到这里
|	|_commonFn	// 测试函数
|		|_index.js
|		|_test.js
|_.babelrc	// 配置 babel （必须）
|_package.json	// 依赖
|_webpack.config.js	// 配置 webpack 打包
|_README.md
```



### 四、`package.json` 配置说明

```json
{
  "name": "mu-tool",
  "version": "1.0.11",
  "description": "该工程主要放工具函数",
  "main": "./dist/index.js",
  "files": [
    "dist"
  ],
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack",
    "build:dev": "webpack --watch",
    "prepublish": "npm run build",
    "dev": "webpack-dev-server",
    "release": "standard-version",
    "release:beta": "standard-version -p beta --release-as patch",
    "release:alpha": "standard-version -p alpha --release-as patch",
    "build:npm": "npm run release && git push --follow-tags && npm publish"
  },
  "repository": {
    "type": "git",
    "url": "git+ssh://git@gitlab.com/feiyu-git/mu-tool.git"
  },
  "keywords": [],
  "author": "zfy",
  "license": "ISC",
  "bugs": {
    "url": "https://gitlab.com/feiyu-git/mu-tool/issues"
  },
  "homepage": "https://gitlab.com/feiyu-git/mu-tool#readme",
  "devDependencies": {
    "@babel/core": "^7.18.5",
    "@babel/plugin-transform-runtime": "^7.18.6",
    "@babel/preset-env": "^7.18.6",
    "@babel/runtime": "^7.12.5",
    "@babel/runtime-corejs3": "^7.12.5",
    "babel-loader": "^8.2.5",
    "clean-webpack-plugin": "^4.0.0",
    "standard-version": "^9.5.0",
    "webpack": "^5.73.0",
    "webpack-cli": "^4.9.2",
    "webpack-dev-server": "^4.8.1"
  },
  "dependencies": {}
}

```

##### 配置说明：

> 1. name：最终发到 `npm` 上的包名称
> 2. main：发 npm 后，从 node_module 中访问的入口
> 3. files：npm pubilsh 时需要发布的内容，如果不指定会将整个过程包括源码都发出去
> 4. 配置 script 脚本，注意 `prepublish` 作用
> 5.  `html-webpack-plugin` 是不需要的，因为 npm 包不需要 html



### 五、创建工程流程

1. ##### 初始化工程

   在 gitlab 创建一个 public 空工程

   克隆到本地

2. ##### 安装 `webpack` 及脚手架

   ```
   npm i webpack webpack-cli webpack-dev-server -D
   ```

3. ##### 安装 `babel`

   很重要，最终是否能打包成功在此一举

   ```
   npm i @babel/core @babel/plugin-transform-runtime @babel/preset-env @babel/runtime @babel/runtime-corejs3 babel-loader -D
   ```

   安装了 `babel` 之后，除了需要在 `webpack.config.js`  中添加配置外(见步骤5)，还需要在工程根目录下新建 `.babelrc` 文件，并添加如下配置

   ```
   {
     "presets": [
       "@babel/preset-env"
     ],
     "plugins": [
       [
         "@babel/plugin-transform-runtime",
         {
           "corejs": 3,
           "helpers": true,
           "regenerator": true,
           "useESModules": false
         }
       ]
     ]
   }
   ```

4. ##### 安装其他必要依赖

   ```
   npm i standard-version clean-webpack-plugin -D
   ```

   > - standard-version：版本管理工具
   > - clean-webpack-plugin：每次打包前删除上一次的打包

5. ##### 配置 `webpack`

   ```js
   const path = require('path');
   // 在打包后的 dist 目录下新建 index.html ，并且将打包后的 js 文件自动引入到 index.html 中
   // const HtmlWebpackPlugin = require("html-webpack-plugin");
   // 打包前删除之前的 dsit
   const { CleanWebpackPlugin } = require('clean-webpack-plugin');
   
   // CommonJS 语法
   module.exports = {
     // 告诉webpack使用production模式的内置优化,开启代码压缩，否则会添加很多注释
     mode: "production",
     // 入口文件
     entry: path.join(__dirname, 'src', 'index.js'),
     output: {
       // 定义filename便于script标签引入
       filename: 'index.js',
       chunkFilename: '[name].[contenthash].chunk.js',
       path: path.resolve(__dirname, 'dist'),
       publicPath: './',
       // 下面是打包成 labrary 时才需要
       library: 'muTool',
       libraryExport: "default", // 对外暴露default属性，就可以直接调用default里的属性
       globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
       libraryTarget: 'umd' // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
     },
     module: {
       rules: [
         {
           test: /\.m?js$/,
           exclude: /(node_modules|bower_components)/,
           include: path.resolve(__dirname, 'src'),
           use: {
             loader: 'babel-loader',
             options: {
               presets: ['@babel/preset-env']
             }
           }
         }
       ]
     },
     plugins: [
       // 工具库不需要 index.html
       // new HtmlWebpackPlugin({
       //   template: path.join(__dirname, 'public/index.html'),
       //   filename: 'index.html'
       // }),
       new CleanWebpackPlugin()
     ],
     devServer: {
       port: 8000,
       static: path.join(__dirname, "dist")
     }
   }
   ```



### 六、测试

找一个工程，安装依赖

```
npm i mu-tool -S
```

测试 `mu-tool` 中导出的方法

```jsx
import logo from './logo.svg';
import { getPresetColor, createRandomString, TAG, sumFn } from 'mu-tool'
import * as dayjs from 'dayjs'
import './App.css';

function App() {
  console.log('TAG', TAG)
  console.log('sumFn', sumFn())
  console.log('sumFn===', sumFn(1, 2))
  console.log('getPresetColor', getPresetColor())
  console.log('createRandomString', createRandomString(6))
  // console.log('tools', tools)
  console.log('dayjs().format()', dayjs().format('2022-07-02'))
  return (
    <div className="App">
    </div>
  );
}

export default App;

```



### 七、FAQ

1. ##### 打包后的文件中存在很多注释

   `webpack.config.js` 中的 `mode` 需要改成 `production`

   ```
   // 告诉webpack使用production模式的内置优化,开启代码压缩，否则会添加很多注释
     mode: "production",
   ```

2. ##### 工程中引用时无法获取到导出的方法

   出口文件 `index.js` 必须使用 `export default...`

   ```js
   import * as commonFn from './commonFn/index'
   // import { hex2Rgba, createRandomString,getPresetColor } from './commonFn/index'
   import * as test from './commonFn/test'
   
   // 这个格式不要改！否则在目标工程中无法访问到导出的函数
   export default {
     ...commonFn,
     ...test
   }
   ```

3. ##### 工程使用时发现 `node_module` 中的包中有源码

   在 `package.json` 中指定 `files` 即可

   ```json
   "files": [
       "dist"
   ],
   ```



参考文档1：http://caibaojian.com/npm/misc/scripts.html

参考文档2：https://segmentfault.com/a/1190000008832423

参考文档3：