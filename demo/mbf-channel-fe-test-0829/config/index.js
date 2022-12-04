if (process.env.TARO_BUILD_TYPE === 'component') {
  // npm 打包配置文件
  module.exports = require('./npm-config/index');
} else {
  // H5 打包配置文件
  module.exports = require('./h5-main');
}
