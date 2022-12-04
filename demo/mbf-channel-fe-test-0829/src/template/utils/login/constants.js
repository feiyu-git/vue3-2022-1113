import { getEnv } from '@mu/madp-utils';

const currentEnv = process.env.BUILD_ENV || getEnv();

function getAliAuth(env) {
  let result = 'https://auth-ali.api.mucfc.com/alipay/window/auth.jhtml';
  if (env !== 'prod') {
    result = `http://auth-st1.api.cfcmu.cn/${env}-ali/alipay/window/auth.jhtml`;
  }
  return result;
}

export const aliAuth = getAliAuth(currentEnv);
