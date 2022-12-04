import { getEnv, isAlipay } from '@mu/madp-utils';

const currentEnv = process.env.BUILD_ENV || getEnv();

/**
 * 获取前端域名
 */
function getFeDomain(env) {
  let result = 'https://m-zl.mucfc.com';
  if (env !== 'prod') {
    result = `https://m-zl-${env}.cfcmu.cn`;
  }
  return result;
}

/**
 * 获取后端生产域名
 * @param module api模块
 */
function getBackendDomainProd(module) {
  // 对支付宝环境的处理
  const pre = isAlipay() && module !== 'pay' && module !== 'mgp' && module !== 'forum'
    ? `${module}-ali`
    : module;
  return `https://${pre}.api.mucfc.com`;
}

/**
 * 获取测试的后端域名
 * @param module api模块
 * @param env 环境
 * @returns
 */
function getBackendDomainDev(module, env) {
  // 对支付宝环境的处理
  let pre = isAlipay() && module !== 'pay' && module !== 'mgp' && module !== 'forum'
    ? `${module}-ali-${env}`
    : `${module}-${env}`;
  // 对pos模块的特殊处理，维持现有逻辑
  pre = module === 'pay' && /uat|st2/i.test(env) ? `${env}-${module}` : pre;
  pre = module === 'pay' && /se\d?/i.test(env) ? 'buy' : pre;

  if (process.env.TARO_ENV === 'h5') {
    let { protocol } = window.location;
    protocol = protocol === 'offline:' ? 'https:' : protocol;
    return `${protocol}//${pre}.api.cfcmu.cn`;
  }
  // 小程序使用https
  return `https://${pre}.api.cfcmu.cn`;
}

/**
 * 获取后端域名
 */
function getBackendDomain(env) {
  const apiHost = {};
  const apiModules = [
    'mgp',
    'forum',
    'user',
    'auth',
    'buy',
    'loan',
    'order',
    'bill',
    'apply',
    'promote',
    'mgr',
    'pay',
    'wo'
  ];
  apiHost[env] = apiHost[env] || {};
  apiModules.forEach((m) => {
    if (env === 'prod') {
      // 生产
      apiHost[env][m] = getBackendDomainProd(m);
    } else {
      // 测试
      apiHost[env][m] = getBackendDomainDev(m, env);
    }
  });
  return apiHost[env];
}

/**
 * 获取商城后端域名
 */
function getMallDomain(env) {
  let result = 'https://mall.api.mucfc.com/api';
  if (env !== 'prod') {
    const pre = /st1|se\d?/i.test(env) ? `${env}.mall` : `${env}-mall`;
    result = `https://${pre}.api.cfcmu.cn/api`;
  }
  return result;
}

/**
 * 获取cfg域名
 * @param env 环境
 */
function getCfgDomain(env) {
  let result = 'https://cfg.mucfc.com';
  if (env !== 'prod') {
    result = `https://cfg-${env}.cfcmu.cn`;
  }
  return result;
}

// eslint-disable-next-line
export const mode = currentEnv;

// eslint-disable-next-line
export const _domain = getFeDomain(currentEnv);
export const apiHostRun = getBackendDomain(currentEnv);

// eslint-disable-next-line no-underscore-dangle
export const _mallApiHost = getMallDomain(currentEnv);

export const cfgUrlDomain = getCfgDomain(currentEnv);

export default apiHostRun;
