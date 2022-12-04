import Madp from '@mu/madp';
import { getCurrentPageUrlWithArgs } from '@mu/madp-utils';
import { urlDomain } from '@mu/business-basic';
import { HOME_COMP_TYPE } from '../constant';

const channel = Madp.getChannel();
export default {
  // 3CUAPP 展位页面id
  pageId: '96ad9015-af98-47be-80f0-4ef599591a3c',
  homeType: HOME_COMP_TYPE.UNICOM_HOME,
  autoLogin: true,
  targetUrl: {},
  doLogin: () => {
    const pageUrl = getCurrentPageUrlWithArgs();
    const herf = `${urlDomain}/${channel}/loginregister/#/auth?mgpAuth=1&redirectUrl=${encodeURIComponent(pageUrl)}`;
    Madp.navigateToExternalUrl({
      url: herf,
      redirect: true
    });
  }
};
