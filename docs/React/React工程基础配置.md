### 1、创建工程

```
npx create-react-app 工程名称
```



### 2、添加 Less 配置

其实 `React` 脚手架已经默认支持了 `scss` 所以，直接参照 `scss` 、 `scss-loader` 的配置即可。

步骤：

1、释放 `config` 文件，注意此过程不可逆

```
npm run eject
```

2、安装 `less` 、 `less-loader` 注意版本

```
npm i less@3.12.2 less-loader7.0.2 -D
```

3、在 `config/webpack.config.js` 中天健如下代码

```js
const lessRegex = /\.less$/; 
const lessModuleRegex = /\.module\.less$/;
```

4、在该文件中全局搜索 `oneOf`，在 `oneOf` 数组中添加以下代码 :

```js
    {
        test: lessRegex,
        exclude: lessModuleRegex,
        use: getStyleLoaders(
            {
            importLoaders: 2,
            sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
            },
            "less-loader"
        ),
        sideEffects: true,
    },
    {
        test: lessModuleRegex,
        use: getStyleLoaders(
            {
            importLoaders: 2,
            sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
                modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                },
            },
            "less-loader"
        ),
    },

```

参考文档：https://www.jianshu.com/p/4c07e3b3351d













