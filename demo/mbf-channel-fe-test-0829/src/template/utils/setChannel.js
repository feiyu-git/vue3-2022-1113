import Madp from '@mu/madp';

import {
  isAlipay, isWechat, isMuapp, Url,
} from '@mu/madp-utils';


// 兜底路径里取不到channel时，离线包从参数channel里获取,获取不到在根据环境获取channel
function getChannel() {
  let channel = '';
  if (process.env.BUILD_TYPE === 'offline') {
    return Url.getParam('channel');
  }
  if (process.env.CHANNEL) {
    return process.env.CHANNEL;
  }
  if (isWechat()) {
    channel = '0WEC';
  } else if (isAlipay()) {
    channel = '2ZFB';
  } else if (isMuapp()) {
    channel = '0APP';
  } else {
    channel = '0WAP';
  }
  return channel;
}

const tempChannel = getChannel();

export const channel = {
  WEAPP_DEFAULT_CHANNEL: 'WEAPP_DEFAULT_CHANNEL',
  SWAN_DEFAULT_CHANNEL: 'SWAN_DEFAULT_CHANNEL',
  ALIPAY_DEFAULT_CHANNEL: 'ALIPAY_DEFAULT_CHANNEL',
  TT_DEFAULT_CHANNEL: 'TT_DEFAULT_CHANNEL',
  H5_DEFAULT_CHANNEL: tempChannel,
};

Madp.setConfig({
  channel
});
