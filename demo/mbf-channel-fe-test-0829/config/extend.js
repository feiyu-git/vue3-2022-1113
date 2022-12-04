const path = require('path');

module.exports = function (merge, options) {
  const config = {
    projectName: 'channel',
    date: '2022-08-01',
    alias: {
      '@global/src': path.resolve(__dirname, '..', 'src'),
      '@global/api': path.resolve(__dirname, '..', 'src/template/api'),
      '@global/components': path.resolve(__dirname, '..', 'src/components'),
      '@global/comp': path.resolve(__dirname, '..', 'src/components'),
      '@global/utils': path.resolve(__dirname, '..', 'src/template/utils'),
      '@global/src_config': path.resolve(__dirname, '..', 'src/config'),
      '@global/styles': path.resolve(__dirname, '..', 'src/styles'),
      '@mucfc.com': path.resolve(__dirname, '..', 'node_modules', '@mucfc.com'),
      '@global/store': path.resolve(__dirname, '..', 'src/store'),
      '@static': path.resolve(__dirname, '..', 'src/static')
    },
    env: {
      TRACK_MODULE_ID: '"channel"',
      BUILD_ENV: JSON.stringify(process.env.ENV),
      BUILD_TYPE: JSON.stringify(process.env.BT),
      CHANNEL: JSON.stringify(process.env.CHANNEL)
    },
    weapp: {
      compile: {
        include: [
          'taro-ui',
          '@mu\\zui',
          '@mu/zui',
          '@tarojs\\components',
          '@tarojs/components',
          '@mu\\madp-utils',
          '@mu/madp-utils',
          '@mu/leda',
          '@mu\\leda',
          '@mu/credit-card/common',
          '@mu\\credit-card\\common',
          '@mu\\safe-sms-code',
          '@mu/safe-sms-code',
          '@mu/credit-card',
          '@mu/@channel-repay-services',
          '@mu\\@channel-repay-services',
          '@mu/unhandle-notice',
          '@mu\\unhandle-notice',
          '@mu/loan-help',
          '@mu\\loan-help',
          '@mu/agreement',
          '@mu\\agreement',
        ]
      },
    },
    h5: {
      esnextModules: [
        'taro-ui',
        '@tarojs\\components',
        '@tarojs/components',
        '@tarojs_components',
        '@tarojs\\\\components',
        '@mu\\zui',
        '@mu/zui',
        '@mu\\lui',
        '@mu/lui',
        '@mu\\madp-utils',
        '@mu/madp-utils',
        '@mu/leda',
        '@mu\\leda',
        '@mu\\credit-card',
        '@mu/credit-card',
        '@mu\\safe-sms-code',
        '@mu/safe-sms-code',
        '@mu/unhandle-notice',
        '@mu\\unhandle-notice',
        '@mu/short-loan-card',
        '@mu\\short-loan-card',
        '@mu/@channel-repay-services',
        '@mu\\@channel-repay-services',
        '@mu/unhandle-notice',
        '@mu\\unhandle-notice',
        '@mu/loan-help',
        '@mu\\loan-help',
        '@mu/agreement',
        '@mu\\agreement',
        '@mu\\login-popup',
        '@mu/login-popup',
      ],
    },
  };

  const { optimization } = options || {};
  if (optimization) {
    // 复写mu配置
    optimization.splitChunks.cacheGroups.mu = {
      test: /[\\/]node_modules[\\/]@mu/,
      name: 'chunk-mu',
      chunks: 'all',
      priority: 500,
      reuseExistingChunk: true
    };
  }

  return config;
};
