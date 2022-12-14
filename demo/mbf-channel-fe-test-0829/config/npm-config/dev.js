/* eslint-disable import/no-commonjs */
module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {},
  weapp: {
    module: {
      postcss: {
        // 小程序端样式引用本地资源内联
        url: {
          enable: true,
          limit: 102400000000
        }
      }
    }
  },
  h5: {
    devServer: {
      host: '0.0.0.0',
      disableHostCheck: true,
      port: 3002
    },
    webpackChain(chain) {
      chain.merge({
        plugin: {
          vConsole: {
            plugin: require('vconsole-webpack-plugin'),
            args: [{
              enable: process.argv.indexOf('debug') > -1
            }]
          }
        }
      });
    }
  }
};
