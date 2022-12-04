module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
  },
  weapp: {},
  h5: {
    publicPath: './',
    // 待监控完成后打开配置
    // enableSourceMap: true,
    // sourceMapType: 'source-map',
    router: {
      customRoutes: {
        '/pages/index/index': '/index'
      }
    },
  },
};
