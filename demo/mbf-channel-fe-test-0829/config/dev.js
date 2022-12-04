module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  weapp: {},
  h5: {
    devServer: {
      port: 3002,
      // host: '0.0.0.0',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
};
