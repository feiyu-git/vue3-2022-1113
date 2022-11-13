


### 一、React 特点

> 1. 声明式设计 −React采用声明范式，可以轻松描述应用。
> 2. 高效 −React通过对DOM的模拟，最大限度地减少与DOM的交互。
> 3. 灵活 −React可以与已知的库或框架很好地配合。
> 4. JSX − JSX 是 JavaScript 语法的扩展。React 开发不一定使用 JSX ，但我们建议使用它。
> 5. 组件 − 通过 React 构建组件，使得代码更加容易得到复用，能够很好的应用在大项目的开发中。
> 6. 单向响应的数据流 − React 实现了单向响应的数据流，从而减少了重复代码，这也是它为什么比传统数据绑定更简单。

由于create-react-app命令预先安装和配置了webpack和babel，同时也初始化了npm（可以通过npm init来初始化，初始化完会有一个package.json文件，专门来说明你的项目的一些基本信息和可以设置npm自定义命令），所以有几个自定义npm命令：

### 二、如何创建工程

1、首先确保已经安装 node.js,可以到node.js官网 https://nodejs.org/en/ 下载安装包，下载好后傻瓜式一步安装到位。

2、直接执行命令，参考 [官网](https://react.docschina.org/docs/create-a-new-react-app.html#create-react-app)

```
npx create-react-app my-app
```

3、按照如下步骤进行安装，推荐使用gitBush命令行工具 **【该方法已过时】**

> （1）npm install -g create-react-app      全局安装
>
> （2）create-react-app -V	如果能查到版本 说明脚手架安装成功
>
> （3）create-react-app reactproject       新建并对react项目进行命名（注:项目名称不能有大写）
>
> （4）cd reactproject                             通过命令进入文件夹内部，准备运行项目
>
> （5）npm start                                     运行项目
>



参考文档：https://blog.csdn.net/u012118993/article/details/87288516

create-react-app 中文文档：https://create-react-app.bootcss.com/