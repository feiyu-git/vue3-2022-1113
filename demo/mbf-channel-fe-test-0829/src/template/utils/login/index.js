import Madp from '@mu/madp';
import { getCurrentPageUrl } from '@mu/madp-utils';
import { unBind } from '../../api/home';
import { loginUrl } from '../../../config/constants';
/**
 * 解绑
 */
async function actionUnBind() {
  let scene = '';
  const channel = Madp.getChannel();
  if (channel.indexOf('WEC') !== -1) {
    scene = 'wechatpublic';
  } else if (channel.indexOf('ZFB') !== -1) {
    scene = 'ali';
  } else if (channel.indexOf('MNP') !== -1) {
    scene = 'wechatsmall';
  }
  const data = await unBind({
    data: { scene }
  });
  return data;
}

export async function login(options) {
  if (process.env.TARO_ENV === 'h5') {
    const { doLoginH5 } = require('./h5-login');
    return doLoginH5(options);
  } else if (process.env.TARO_ENV === 'weapp') {
    const { redirectUrl, forceReLogin } = options || {};
    let flag = true;
    if (forceReLogin) {
      flag = await actionUnBind();
    }
    if (flag) {
      const currentUrl = getCurrentPageUrl();
      const fromUrl = currentUrl ? `/${currentUrl}` : '';
      const redirectUrlNew = redirectUrl || fromUrl;
      Madp.navigateTo({
        url: `${loginUrl}?redirectUrl=${encodeURIComponent(redirectUrlNew)}`
      });
    }
  }
}
