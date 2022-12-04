import Madp from '@mu/madp';
import { logger, getCurrentPageUrlWithArgs } from '@mu/madp-utils';
import { getToken } from '@mu/dev-finger';
import ApiSign from '@mucfc.com/webapp-api-sign/dist/wxapp';

// import { handleMuNotice } from './mu-notice';

const Logger = logger('oldFetch');


const rejectFunc = async (res) => {
  const { status } = res;

  if (status === 401) {
    return Promise.reject(`未登录: ${status}`);
  } else if (status === 200) {
    // 业务错误
    const json = await res.json();
    if (json.ret === '1') {
      // 触发全局事件，页面中订阅该事件可用于更新界面
      Madp.eventCenter.trigger('madp_biz_error_event', json);
      Madp.showToast({
        title: `网络异常: ${json.errMsg}`,
        icon: 'none',
        duration: 2000
      });
    }
    return Promise.reject(res.clone());
  } else if (status >= 300) {
    // 网络异常，status:${status}
    Madp.showToast({
      title: `网络异常: ${status}`,
      icon: 'loading',
      duration: 2000
    });
    return Promise.reject(`网络异常: ${status}`);
  } else {
    return Promise.reject(`网络异常: ${status}`);
  }
};

/**
 * @name signatureQueryStr
 * @description 生成签名的 Query String
 */
async function signatureQueryStr() {
  const signature = ApiSign.sign();
  try {
    const token = await getToken();
    if (token) {
      // eslint-disable-next-line dot-notation
      signature['_t'] = token;
    }
  } catch (err) {
    Logger(getCurrentPageUrlWithArgs(), 'oldFetch文件生成设备指纹异常!');
  }
  return Object.keys(signature).map((key) => `${key}=${signature[key]}`).join('&');
}


function handleEnvParams(paramsOrigin = {}, envParams) {
  let params = paramsOrigin;
  if ((params instanceof Object) && (params.constructor.toString().indexOf('Object') > 0)) {
    return {
      ...params,
      ...{ EnvParams: JSON.stringify(envParams), reqEnvParams: JSON.stringify(envParams) }
    };
  } else if ((typeof params === 'string') && /\??(\w+=\w+)(&\w+=\w+)*&?$/.test(params)) {
    // Should be key=value string, 格式化为对象
    if (params.indexOf('?') >= 0) {
      // eslint-disable-next-line prefer-destructuring
      params = params.split('?')[1];
    }
    params = params.replace(/&$/, '');
    const queryParamArray = params.split('&');
    const ObjFromParamStr = {};
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < queryParamArray.length; index++) {
      // eslint-disable-next-line prefer-destructuring
      ObjFromParamStr[queryParamArray[index].split('=')[0]] = queryParamArray[index].split('=')[1];
    }
    return { ...ObjFromParamStr, ...{ EnvParams: JSON.stringify(envParams) } };
  }
  return null;
}

const oldFetch = async (url, options = {}) => {
  const requestOptions = {};

  const body = options.body || {};
  requestOptions.url = url;
  const pageUrl = getCurrentPageUrlWithArgs();

  const EnvParams = {
    channel: Madp.getChannel(),
    appType: 'H5',
    pageUrl
  };

  const sign = await signatureQueryStr();
  const params = handleEnvParams(body, EnvParams) || {};

  requestOptions.method = ((options.method) || 'GET').toUpperCase();
  requestOptions.data = params;

  if (sign) {
    requestOptions.url = (requestOptions.url.indexOf('?') < 0 ? `${requestOptions.url}?${sign}` : requestOptions.url.replace(/&$/, '').concat(`&${sign}`));
  }
  const autoLoading = false;
  // const { autoLoading = true } = options;
  autoLoading && Madp.showLoading({ title: '加载中' });
  return Madp.pureRequest(requestOptions)
    .then((async (res) => {
      Madp.hideLoading();
      const { status } = res;
      if (status === 200) {
        const json = await res.json();
        if (json.ret === '0' || json.code === 200) { // 兼容商城接口
          return Promise.resolve(json.data || json.datas); // 兼容商城接口
        }
        return Promise.reject(res.clone());
      }
      return Promise.reject(res.clone());
    }))
    .catch(async (res) => {
      Madp.hideLoading();
      await rejectFunc(res);
    });
};

export default oldFetch;
