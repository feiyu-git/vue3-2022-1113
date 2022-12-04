import Madp from '@mu/madp';

export const channel = {
  WEAPP_DEFAULT_CHANNEL: '',
  SWAN_DEFAULT_CHANNEL: '',
  ALIPAY_DEFAULT_CHANNEL: '',
  TT_DEFAULT_CHANNEL: '',
};

// const pid = (lowerHref.indexOf('appenv=prod') !== -1 || lowerHref.indexOf('appenv=prd') !== -1 || hostname.indexOf('mucfc.com') !== -1) ? 'brtgwl5o94@15d57728c83c1e6' : 'brtgwl5o94@60985b5578ae703';

export const pidMaps = {
  all_prod: 'brtgwl5o94@15d57728c83c1e6', // 写入生产的pid
  all_dev: 'brtgwl5o94@60985b5578ae703', // 写入测试的pid
  offline_prod: 'brtgwl5o94@15d57728c83c1e6', // 写入生产的pid_离线包
  offline_dev: 'brtgwl5o94@60985b5578ae703', // 写入测试的pid_离线包
  '/pages/index/index_prod': 'brtgwl5o94@15d57728c83c1e6',
  '/index_prod': 'brtgwl5o94@15d57728c83c1e6',
  '/pages/index/index_dev': 'brtgwl5o94@60985b5578ae703',
  '/index_dev': 'brtgwl5o94@60985b5578ae703',
};

// 话术Id及描述由业务工程自行设置，此处仅提供示例
export const messageMaps = {
  NETWORK_ERROR: '网络异常',
  USERINFO_ERROR: '用户信息异常'
};

export const mapCode = {
  '0APP': {
    apply: '3063a30e04be1400', // 申请
    dqd: '6315c09cb3025dea', // 大期贷申请
    zhangdanfenqi: 'da32c1e2ecaab366', // 账单分期
    repayment: '63d6eaf6de4fa439', // 还款
  },
  '2APP': {
    apply: '4ceca25f69364493',
    dqd: 'df6794a81f2b41af',
    zhangdanfenqi: 'da32c1e2ecaab366',
    repayment: '63d6eaf6de4fa439',
  },
  '3CUAPP': {
    applyProductCode: 'XJXE001',
    apply: '31b43bc479181cc3'
  },
  '0MNP': {
    applyProductCode: 'XJXE001',
    apply: 'e5763dbaea9b2419'
  },
  '1MNP': {
    applyProductCode: 'XJXE001',
    apply: 'c6d2d702f0b32e74'
  },
  '0ZFBMNPJD': {
    applyProductCode: 'XJXE001',
    apply: 'a6d2ce2e91cfcb66'
  },
  '0JD1ZFBMNP': {
    applyProductCode: 'XJXE001',
    apply: '65a959d40c7d2a30'
  },
  '0JD2ZFBMNP': {
    applyProductCode: 'XJXE001',
    apply: 'e7301cd70245fd4e'
  },
  '0JD3ZFBMNP': {
    applyProductCode: 'XJXE001',
    apply: '1bafc3e25a234f95'
  },
  '0JD4ZFBMNP': {
    applyProductCode: 'XJXE001',
    apply: '5e318204cd8565bd'
  },
  '0ZFB': {
    applyProductCode: 'XJXE001',
    apply: '7b7fe209824bda61'
  },
  '2ZFB': {
    applyProductCode: 'XJXE001',
    apply: '6f592e740446258f'
  },
  '16ZFB': {
    applyProductCode: 'XJXE001',
    apply: 'b97151c6b6f7582d'
  },
  '17ZFB': {
    applyProductCode: 'XJXE001',
    apply: 'f480f81cae5e775d'
  },
  '15ZFB': {
    applyProductCode: 'XJXE001',
    apply: 'd48b7fafa602c963'
  },
  '18ZFB': {
    applyProductCode: 'XJXE001',
    apply: 'f3f5038e05adb8b3'
  }
};

export const currentChannel = Madp.getChannel();
export const currentMapCodeList = mapCode[currentChannel] || mapCode['0APP'];
export const loginUrl = '/loginregister/pages/WeappLogin/WeappEntrance';

export default {
  channel,
  pidMaps,
  messageMaps,
  debug: true, // 是否开启开启渠道SDK日志入参，true为开启，false（默认值）-不开启
};
