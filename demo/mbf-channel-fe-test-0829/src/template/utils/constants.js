import Madp from '@mu/madp';
import { apiHostRun, _domain, _mallApiHost } from './url_config';
import { APP_NOTICE_EVENT } from './app-plugin-util';

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
};

export const currentChannel = Madp.getChannel();
export const currentMapCodeList = mapCode[currentChannel] || mapCode['0APP'];

export const apiHost = apiHostRun;
export const urlDomain = _domain;
export const mallApiHost = _mallApiHost;
export const loginUrl = '/loginregister/pages/WeappLogin/WeappEntrance';

export const USER_FUNCTINON_CODE = {
  PREMIUM_VER_SWITCHER: 'PREMIUM_VER_SWITCHER',
};

const BASEIMAGE = {
  '0MNP': 'https://file.mucfc.com/cop/6/31/202106/202106041801584376bf.jpg',
  '0ZFBMNPJD': 'https://file.mucfc.com/cop/6/31/202106/202106041801584376bf.jpg',
  '0JD1ZFBMNP': 'https://file.mucfc.com/ebn/21/0/202208/202208151514389a37ae.png',
  '0JD2ZFBMNP': 'https://file.mucfc.com/ebn/21/0/202208/20220815151708e6e28a.png',
  '0JD3ZFBMNP': 'https://file.mucfc.com/ebn/21/0/202208/20220815151709b7ed33.png',
  '0JD4ZFBMNP': 'https://file.mucfc.com/ebn/21/0/202208/20220815151709f45891.png',
};
export const currenBackgroundImage = BASEIMAGE[currentChannel];

// 用户标签、确定使用哪个区块的
export const USER_TAG = {
  DEFAULT: 'default', // 默认
  FDZ: 'FDZ', // 奋斗者
  SLIGHT_OVERDUE: 'slight_overdue', // 轻度逾期
  SEVERE_OVERDUE: 'severe_overdue', // 重度逾期
  VISITOR: 'visitor'
};

// 主题颜色，现在只有 默认和奋斗者、2APP 三个主题，后续新增主题时添加在这里
export const USER_THEME = {
  DEFAULT: 'default', // 默认主题
  BLACK: 'black', // 奋斗者主题
  RED: 'red', // 红色主题
};

// 不同渠道的默认主题色
export const DEFAULT_THEME = {
  default: USER_THEME.DEFAULT, // 无特殊情况使用默认主题 - 蓝白
  '2APP': USER_THEME.RED, // 2APP是红色主题
};

// 页面刷新时机，tab切换、二级页返回、登录登出、下拉刷新等
export const REFRESH_PLACE = {
  ...APP_NOTICE_EVENT,
  PULL_REFRESH: 'pullRefresh',
};

// 下拉刷刷新参数
export const PULL_REFRESH_PROPS = {
  // 打开拉开的方向
  pullDownEnable: false,
  pullUpEnable: false,
  // 最大下拉距离
  pullDownDamping: 120,
  // 最大上拉距离
  pullUpDamping: 120,
  // 触发下拉刷新距离
  pullDownRefreshDistance: 70,
  // 触发上拉刷新距离
  pullUpRefreshDistance: 60,
  // 触发下拉全屏距离
  pullDownFullScreenDistance: 150,
  // 触发上拉全屏距离
  pullUpFullScreenDistance: 200,
  // 超时保护
  refreshTimeOut: 3000
};

// 主题缓存key 值的尾部
export const THEME_CACHE_KEY_TAIL = 'homepage_theme';

// 首页 页面实例 pageid
export const PAGE_ID = 'f8a1902a-2cb9-456d-a903-acf335a7f976';
