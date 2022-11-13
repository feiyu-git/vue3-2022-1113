## yarn 常用命令（对照 npm）



**yarn安装**

```
npm i yarn -g
```

**查看版本**

```
yarn -v		// yarn --version 的简写
```

**1. 开始一个新工程**

```
yarn init 与 npm init 一样通过交互式会话创建一个 package.json

yarn init # yarn

npm init # npm
```

\# 跳过会话，直接通过默认值生成 package.json

```
yarn init --yes # 简写 -y

npm init -y
```

**2. 添加一个依赖**

通过 yarn add 添加依赖会更新 package.json 以及 yarn.lock 文件

**1).开发环境**

```
yarn add <packageName> 依赖会记录在 package.json 的 dependencies 下 开发环境

yarn add webpack@2.3.3 # yarn --save 是 yarn 默认的，默认记录在 package.json 中

npm install webpack@2.3.3 --save # npm
```

**2).生产环境**

```
yarn add <packageName> --dev 依赖会记录在 package.json 的 devDependencies 下 生产环境

yarn add webpack --dev # yarn 简写 -D

npm install webpack --save-dev # npm
```

**3).全局**

```
yarn global add <packageName> 全局安装依赖

yarn global add webpack # yarn

npm install webpack -g # npm
```

**3. 更新一个依赖**

```
yarn upgrade 用于更新包到基于规范范围的最新版本

yarn upgrade # 升级所有依赖项，不记录在 package.json 中

npm update # npm 可以通过 ‘--save|--save-dev’ 指定升级哪类依赖

yarn upgrade webpack # 升级指定包

npm update webpack --save-dev # npm

yarn upgrade --latest # 忽略版本规则，升级到最新版本，并且更新 package.json
```

**4. 移除一个依赖**

```
yarn remove <packageName>

yarn remove webpack # yarn

npm uninstall webpack --save # npm 可以指定 --save | --save-dev
```

**5. 安装 package.json 中的所有文件**

```
yarn 或者 yarn install

yarn install # 或者 yarn 在 node_modules 目录安装 package.json 中列出的所有依赖

npm install # npm

yarn install 安装时，如果 node_modules 中有相应的包则不会重新下载 --force 可以强制重新下载安装

yarn install --force # 强制下载安装

npm install --force # npm
```

**6. 运行脚本**

```
yarn run 用来执行在 package.json 中 scripts 属性下定义的脚本

// package.json

{

    "scripts": {

        "dev": "node app.js",

        "start": "node app.js"

    }

}

yarn run dev # yarn 执行 dev 对应的脚本 node app.js

npm run # npm

yarn start # yarn

npm start # npm

与 npm 一样 可以有 yarn start 和 yarn test 两个简写的运行脚本方式
```

**7. 显示某个包信息**

```
yarn info <packageName> 可以用来查看某个模块的最新版本信息

yarn info webpack # yarn

npm info webpack # npm

yarn info webpack --json # 输出 json 格式

npm info webpack --json # npm

yarn info webpack readme # 输出 README 部分

npm info webpack readme
```

**8. 列出项目的所有依赖**

```
yarn list

yarn list # 列出当前项目的依赖

npm list # npm

yarn list --depth=0 # 限制依赖的深度

sudo yarn global list # 列出全局安装的模块
```

##### 9.管理 yarn 配置文件

```
yarn coinfig

yarn config set key value # 设置

npm config set key value

yarn config get key # 读取值

npm config get key

yarn config delete key # 删除

npm config delete key

yarn config list # 显示当前配置

npm config list
```

yarn config set registry https://registry.npm.taobao.org # 设置淘宝镜像

npm config set registry https://registry.npm.taobao.org # npm

**10. 缓存**

```
yarn cache

sudo yarn cache list # 列出已缓存的每个包

sudo yarn cache dir # 返回 全局缓存位置

sudo yarn cache clean # 清除缓存
```



##### 11、查看 NPM、Yarn 全局安装的包

##### NPM

```
npm list -g --depth 0
npm config get prefix    查看全局安装的依赖位置
```

##### Yarn

```
yarn global list
```



### node安装后的设置(node_global和node_cache) - windows【[参考](https://blog.csdn.net/scorpio_meng/article/details/83314675)】

> 1. 在node安装目录创建node_global和node_cache文件夹
>
> 2. 设置环境变量：
>
>    用户变量设置：将用户变量中 PATH 的值改成 D:\Program Files\nodejs\node_global，没有PATH，可以直接添加。
>
>    系统变量设置：添加变量 NODE_PATH  值为：D:\Program Files\nodejs\node_modules
>
> 3. 打开cmd，执行
>
>    npm config set prefix "D:\Program Files\nodejs\node_global"   
>
>    npm config set cache "D:\Program Files\nodejs\node_cache"



### 补充问题：

##### 为什么你应该用Yarn而不是Npm来管理你的项目依赖？

> 因为`Yarn`有离线安装的功能，特别是在国内网络环境不大好的情况下，这个功能尤为有用。
>



参考文档1：https://www.cnblogs.com/lililia/p/10482169.html

参考文档2：[CSDN](https://blog.csdn.net/mjzhang1993/article/details/70092902?utm_medium=distribute.pc_aggpage_search_result.none-task-blog-2~all~sobaiduend~default-2-70092902.nonecase&utm_term=yarn%E7%89%88%E6%9C%AC%E6%9F%A5%E7%9C%8B&spm=1000.2123.3001.4430)

参考文档3：[为什么你应该用Yarn而不是Npm来管理你的项目依赖？](https://segmentfault.com/a/1190000013501659?utm_source=tag-newest/*&^%$)