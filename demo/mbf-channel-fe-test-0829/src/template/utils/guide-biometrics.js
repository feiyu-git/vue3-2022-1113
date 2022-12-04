/* eslint-disable no-console */
import Madp from '@mu/madp';
import { isMuapp, isAndroid, isIOS } from '@mu/madp-utils';
import MUBioMetrics from '@mu/biometrics';
import { urlDomain } from './constants';

const { checkIsSupported, checkIsEnabled } = MUBioMetrics;

const CACHE_MONTH_KEY = 'APP_HOME_BIOMETRICS_GESTURE_GUIDE_MONTH';
const CACHE_COUNT_KEY = 'APP_HOME_BIOMETRICS_GESTURE_GUIDE_COUNT';

function monthDiff(d1, d2) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

const checkBiometricsSwitch = async () => new Promise((resolve) => {
  try {
    window.muna.ShareDataPlugin.getStorage('fingerLoginSuccessSetIntroduce', (res) => {
      console.log('checkBiometricsSwitch:', res);
      // 为'0'时，表示没有勾选下次不再提醒
      if (res && (res !== '0')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  } catch (error) {
    console.log('checkBiometricsSwitch error');
    resolve(false);
  }
});

const checkExistedGesture = async () => new Promise((resolve) => {
  if (isAndroid()) {
    try {
      window.muna.ShareDataPlugin.getStorage('hasGesturePassword', (result) => {
        console.log('checkExistedGesture Android:', result);
        if (result && (result === 'true')) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      console.log('checkExistedGesture Android error');
      resolve(false);
    }
  } else if (isIOS()) {
    try {
      window.muna.ShareDataPlugin.getStorage('gestureislogin', (result) => {
        console.log('checkExistedGesture iOS:', result);
        if (result && (result === '1')) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } catch (error) {
      console.log('checkExistedGesture iOS error');
      resolve(false);
    }
  }
});

const checkGestureSwitch = async () => new Promise((resolve) => {
  try {
    window.muna.ShareDataPlugin.getStorage('gestureLoginSuccessSetIntroduce', (res) => {
      console.log('checkGestureSwitch:', res);
      // 为'0'时，表示没有勾选下次不再提醒
      if (res && (res !== '0')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  } catch (error) {
    console.log('checkGestureSwitch error');
    resolve(false);
  }
});

const checkThisMonth = async () => new Promise((resolve) => {
  try {
    window.muna.ShareDataPlugin.getStorage(CACHE_MONTH_KEY, (res) => {
      console.log('checkThisMonth:', res);
      if (res) {
        const dt = Number(res); // 时间戳
        const cacheDate = new Date(dt);
        const currentDate = new Date();
        if (monthDiff(cacheDate, currentDate) === 0) {
          // 相同月
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  } catch (error) {
    console.log('checkThisMonth error');
    resolve(false);
  }
});

const checkCount = async () => new Promise((resolve) => {
  try {
    window.muna.ShareDataPlugin.getStorage(CACHE_COUNT_KEY, (res) => {
      console.log('checkCount:', res);
      if (res) {
        const count = Number(res);
        resolve(count);
      } else {
        resolve(0);
      }
    });
  } catch (error) {
    console.log('checkCount error');
    resolve(0);
  }
});

// 时间戳（月份数）+ 次数
const updateLocalCache = (count) => {
  // 存储当前时间戳
  const currentDate = new Date();
  try {
    window.muna.ShareDataPlugin.storage(CACHE_MONTH_KEY, currentDate.getTime().toString());
  } catch (error) {
    // nothing
  }

  // 存储次数
  try {
    window.muna.ShareDataPlugin.storage(CACHE_COUNT_KEY, `${count + 1}`);
  } catch (error) {
    // nothing
  }
};

const checkGestureGuide = async () => {
  // 判断是否已存在手势
  const existedGesture = await checkExistedGesture();
  console.log('checkGestureGuide existedGesture:', existedGesture);
  if (existedGesture) {
    return;
  }

  // 判断手势开关（是否“下次不再提示”）
  const gestureSwitch = await checkGestureSwitch();
  console.log('checkGestureGuide gestureSwitch:', gestureSwitch);
  if (gestureSwitch) {
    return;
  }

  // 判断是否为当前月（自然月，每月前2次登录时引导）
  let count = 0;
  const isThisMonth = await checkThisMonth();
  if (isThisMonth) {
    // 判断是否为前2次
    count = await checkCount();
    if (count >= 2) {
      return;
    }
  }

  // 更新本地缓存
  updateLocalCache(count);

  const url = `${urlDomain}/${Madp.getChannel()}/loginregister/#/gestureLoginSet?_hideNavBar=1`;
  console.log('navigateTo(useAppRouter) url:', url);
  // 跳转到引导开通页
  Madp.navigateTo({
    url: `${urlDomain}/${Madp.getChannel()}/loginregister/#/gestureLoginSet?_hideNavBar=1`,
    useAppRouter: isMuapp()
  });
};

const checkBiometricsGuide = async () => {
  console.log('checkBiometricsGuide');
  let isEnabled = false;
  // 检查当前用户在当前设置是否开启指纹/面容
  try {
    isEnabled = await checkIsEnabled(1); // 1：登录
  } catch ({ errCode, errMsg }) {
    isEnabled = false;
  }
  console.log('checkBiometricsGuide isEnabled:', isEnabled);
  if (isEnabled) {
    return;
  }

  // 判断生物识别开关（是否“下次不再提示”）
  const biometricsSwitch = await checkBiometricsSwitch();
  console.log('checkBiometricsSwitch biometricsSwitch:', biometricsSwitch);
  if (biometricsSwitch) {
    // !! 当不再提示时，需要去检查手势引导
    console.log('From checkBiometricsGuide To checkGestureGuide ---------');
    checkGestureGuide();
    return;
  }

  // 判断是否为当前月（自然月，每月前2次登录时引导）
  let count = 0;
  const isThisMonth = await checkThisMonth();
  if (isThisMonth) {
    // 判断是否为前2次
    count = await checkCount();
    if (count >= 2) {
      return;
    }
  }

  // 更新本地缓存
  updateLocalCache(count);

  const url = `${urlDomain}/${Madp.getChannel()}/loginregister/#/fingerLoginSet?_hideNavBar=1`;
  console.log('navigateTo(useAppRouter) url:', url);
  // 跳转到引导开通页
  Madp.navigateTo({
    url: `${urlDomain}/${Madp.getChannel()}/loginregister/#/fingerLoginSet?_hideNavBar=1`,
    useAppRouter: isMuapp()
  });
};

export const checkGuide = async () => {
  let isBiometrics = false;
  // 检查设备是否支持生物识别
  try {
    const res = await checkIsSupported(1); // 1：登录
    if (res && res.isSupported) {
      isBiometrics = true;
    }
  } catch ({ errCode, errMsg }) {
    isBiometrics = false;
  }

  if (isBiometrics) {
    console.log('checkGuide is Biometrics');
    await checkBiometricsGuide();
  } else {
    console.log('checkGuide is Gesture');
    await checkGestureGuide();
  }
};
