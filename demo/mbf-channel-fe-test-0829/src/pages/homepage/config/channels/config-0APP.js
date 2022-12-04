import { HOME_COMP_TYPE } from '../constant';

export default {
  // 展位页面id APP
  pageId: '96ad9015-af98-47be-80f0-4ef599591a3c', // 新的pageid
  // pageId: 'f8a1902a-2cb9-456d-a903-acf335a7f976',
  // 首页类型，根据该类型加载对应的组件
  homeType: HOME_COMP_TYPE.APP_HOME,
  // 是否需要自动登录：注意H5与生活号的差异
  autoLogin: false,
  // 非展位配置的目标链接，默认H5链接
  targetUrls: {},
  // 是否是 APP 环境：目前只包含 0APP/2APP
  isAppChannel: true,
  // 登录方法
  doLogin: async () => { },
};
