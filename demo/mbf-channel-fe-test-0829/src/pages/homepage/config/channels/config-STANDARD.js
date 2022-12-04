import Madp from '@mu/madp';
import { getCurrentPageUrlWithArgs } from '@mu/madp-utils';
import { urlDomain } from '@mu/business-basic';
import { HOME_COMP_TYPE } from '../constant';

// const oldVueProjectName = 'alipay';
const channel = Madp.getChannel();
export default {
  // 展位页面id APP
  pageId: 'b43e0a5f-4ccb-4aaa-96a0-9c57f2697571',
  // 首页类型，根据该类型加载对应的组件
  homeType: HOME_COMP_TYPE.STANDARD_HOME,
  // 是否需要自动登录：注意H5与生活号的差异
  autoLogin: true,
  // 非展位配置的目标链接，默认H5链接
  targetUrls: {},
  // // 过渡阶段，每个渠道单独实现登录注册逻辑
  doLogin: () => {
    const pageUrl = getCurrentPageUrlWithArgs();
    const href = `${urlDomain}/${channel}/loginregister/#/auth?mgpAuth=1&redirectUrl=${encodeURIComponent(pageUrl)}`;
    Madp.navigateToExternalUrl({
      url: href,
      redirect: true
    });
  },
};
