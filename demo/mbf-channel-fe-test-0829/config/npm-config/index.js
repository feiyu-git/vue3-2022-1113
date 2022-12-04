/* eslint-disable import/no-commonjs */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const resolve = require('resolve');
const myPlugin = require('@mu/babel-plugin-transform-madpapi').default;

// alias config 不能在多端component里面配置，防止出现路径问题
const config = {
  projectName: 'channel',
  date: '',
  designWidth: 750,
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: {
    csso: {
      enable: true,
      config: {
        comments: false
      }
    },
    babel: {
      sourceMap: true,
      presets: [
        ['env', {
          useBuiltIns: 'usage',
          modules: false
        }]
      ],
      plugins: [
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-object-rest-spread'
      ]
    },
  },
  defineConstants: {},
  env: {
    TRACK_MODULE_ID: '"COMPONENT_MOCK"',
    BUILD_ENV: JSON.stringify(process.env.ENV)
  },
  weapp: {
    compile: {
      include: [
        '@mu/madp-track', '@mu\\madp-track', '@mu/madp-utils', '@mu\\madp-utils',
        '@mu/credit-card/common', '@mu\\credit-card/common',
        '@mu/channel-repay-services', '@mu\\channel-repay-services', '@mu\\loan-help', '@mu/loan-help'
      ]
    }
  },
  h5: {
    esnextModules: [
      '@mu/madp-track',
      '@mu\\madp-track',
      '@mu/madp-utils',
      '@mu\\madp-utils',
      '@mu/lui',
      '@mu\\lui',
      '@mu/credit-card',
      '@mu\\credit-card',
      '@mu/channel-repay-services',
      '@mu\\channel-repay-services',
      '@mu\\loan-help',
      '@mu/loan-help'
    ],
    staticDirectory: 'static',
    module: {
      postcss: {
        autoprefixer: {
          enable: true
        }
      }
    }
  }
};

if (process.env.TARO_BUILD_TYPE === 'component') {
  Object.assign(config.h5, {
    enableSourceMap: false,
    enableExtract: false,
    enableDll: false
  });
  config.h5.webpackChain = (chain) => {
    chain.plugins.delete('htmlWebpackPlugin');
    chain.plugins.delete('addAssetHtmlWebpackPlugin');
    chain.merge({
      output: {
        path: path.join(process.cwd(), 'dist', 'h5'),
        filename: 'index.js',
        libraryTarget: 'umd',
        library: 'channel'
      },
      externals: {
        nervjs: 'commonjs2 nervjs',
        classnames: 'commonjs2 classnames',
        '@tarojs/components': 'commonjs2 @tarojs/components',
        '@tarojs/taro-h5': 'commonjs2 @tarojs/taro-h5',
        weui: 'commonjs2 weui',
        '@mu/madp': 'commonjs2 @mu/madp',
      },
      plugin: {
        extractCSS: {
          plugin: MiniCssExtractPlugin,
          args: [
            {
              filename: 'css/index.css',
              chunkFilename: 'css/[id].css'
            }
          ]
        }
      }
    });
  };
}

if (process.env.TARO_ENV === 'h5') {
  config.plugins.babel.plugins.unshift(
    [myPlugin, {
      madpApis: require(resolve.sync('@mu/madp/dist/madpApis', {
        basedir: path.join(__dirname, '..', 'node_modules')
      })),
      taroApis: require(resolve.sync('@tarojs/taro-h5/dist/taroApis', {
        basedir: path.join(__dirname, '..', 'node_modules')
      })),
      env: 'h5'
    }]
  );
}

// eslint-disable-next-line func-names
module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
