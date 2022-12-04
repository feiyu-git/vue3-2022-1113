import Madp from '@mu/madp';
import {
  isMuapp, isWechat, isAlipay, isUnicom, Url
} from '@mu/madp-utils';

const actions = (options) => {
  const channel = Madp.getChannel();
  const urlDomain = window.location.origin;
  const redirectUrl = encodeURIComponent(window.location.href);
  let mobile = Madp.getStorageSync('mobile') || Url.getParam('mobile') || '';
  mobile = mobile === 'null' ? '' : mobile;

  const muappLogin = () => {
    const onLoginSuccess = () => {};
    // 可选择传pushParam给APP注册登录组件，一旦传goBack参数，则从哪里来回哪里去，不会出现默认的注册成功引导申请小额现金贷界面，防止其他申请流程无法进入
    const goBackParam = options && options.goBack ? 'goBack' : '';
    return window.muapp.LoginRegisterPlugin.pushLogin(onLoginSuccess, goBackParam);
  };

  // 联合登录
  const unionLogin = () => {
    const url = `${urlDomain}/${channel}/loginregister/#/auth?mgpAuth=1&redirectUrl=${redirectUrl}`;
    window.location.replace(url);
  };

  // 招行手机银行
  const cmbLogin = () => {
    const cmbLoginUrl = 'http://cmbls/functionjump?id=functionjump&action=gofuncid&funcid=130253&needlogin=true&loginmode=d&clean=false&data=0&CloseCurrentView=true';
    window.location.replace(cmbLoginUrl);
  };

  const mwbLogin = () => window.location.replace(`${urlDomain}/${channel}/loginregister/#/login/auth-code-login?&redirectUrl=${redirectUrl}&mobile=${mobile}`);

  return new Map([
    [isMuapp(), muappLogin],
    [isWechat(), unionLogin],
    [isAlipay(), unionLogin],
    [isUnicom(), unionLogin],
    [channel === '3CMBAPP', cmbLogin],
    ['default', mwbLogin]
  ]);
};

const jumpLoginAction = (options) => {
  const action = actions(options).get(true);
  if (action) {
    action.call(this);
  } else {
    // use default mwb login
    actions().get('default').call(this);
  }
};

export {
  jumpLoginAction as doLoginH5
};
