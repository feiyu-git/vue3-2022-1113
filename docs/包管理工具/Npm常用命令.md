## Npm常用命令



### 1、切换源（registry）

源：npm 包从哪下载

```json
// 设置淘宝源
npm config set registry https://registry.npm.taobao.org

// 查看源设置是否成功
npm config get registry
```



### 2、检测当前账号是否登录

```json
npm whoami
```



### 3、某个依赖安装到最新版本

```json
npm install -g @vue/cli@latest
```





