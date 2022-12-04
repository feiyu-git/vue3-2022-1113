/* eslint-disable import/no-commonjs */
module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
  },
  // 添加JS压缩
  uglify: {
    enable: true,
    config: {
      // 配置项同 https://github.com/mishoo/UglifyJS2#minify-options
      compress: {
        warnings: false,
      },
      sourceMap: true,
      comments: false,
    }
  },
  weapp: {
    postcss: {
      // 小程序端样式引用本地资源内联
      url: {
        enable: true,
        limit: 102400000000
      }
    }
  },
  h5: {
    publicPath: './',
  }
}
