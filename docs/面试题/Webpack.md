## webpack



Webpack构建运行在node.js环境下，它的配置文件遵循CommonJS规范，webpack.config.js导出一个Object对象（或者导出一个Function，或者导出一个Promise函数，还可以导出一个数组包含多份配置）。
1. webapack包含的模块

   > entry
   >
   > output
   >
   > loader
   >
   > plugins
   >
   > mode

2. loader: 处理非js文件(webpack 本身只能理解js文件),将其转换成js可理解的内容【less-loader/svg-sprit-loader】

3. plugins: 可以丰富webpack的功能【[html-webpack-plugin](https://segmentfault.com/a/1190000007294861)】
   >html-webpack-plugin 作用
   >为html引入外部的script、link动态添加每次compile后的hash,防止引用缓存中的外部文件导致页面未及时更新
   >可以创建html的入口文件，配置N个html-webpack-plugin节能生成N个入口
   >常见的参数配置：
   >filename: 生成html的文件名，默认是index.html
   >template: 'src/index.html',根据指定的模板生成html文件
   >favicon: 给生成的 html 文件生成一个 favicon。属性值为 favicon 文件所在的路径名。

4. webpack的构建流程
   >Webpack在启动后，会从Entry开始，递归解析Entry依赖的所有Module
   >1. 每找到一个Module，就会根据Module.rules里配置的Loader规则进行相应的转换处理
   >2. 对Module进行转换后，再解析出当前Module依赖的Module，这些Module会以Entry为单位进行分组，即为一个Chunk。
   >3. 因此一个Chunk，就是一个Entry及其所有依赖的Module合并的结果。
   >4. 最后Webpack会将所有的Chunk转换成文件输出Output。
   >5. 在整个构建流程中，Webpack会在恰当的时机执行Plugin里定义的逻辑，从而完成Plugin插件的优化任务。