import Madp from '@mu/madp';

const APP_NOTICE_EVENT = {
  /**
   * 登录事件
   */
  LOGIN: 'login',

  /**
   * 登出事件
   */
  LOGOUT: 'logout',

  /**
   * 登录后引导开启生物认证事件
   */
  LOGIN_GUIDE: 'popFingerLoginGuide',

  /**
   * 隐藏Tab栏
   */
  HIDE_TAB: 'hidetab',
  /**
   * 展示Tab栏
   */
  SHOW_TAB: 'showtab',

  /**
   * tab页面从二级页返回的可见
   */
  TAB_VISIBLE: 'tabVisible',
  /**
   * tab点击的页面可见
   */
  TAB_SWITCH: 'tabSwitch',

  /**
   * 发现tab点击事件
   */
  DISCOVERY_TAB_PRESSED: 'discoveryTabPressed',

  /**
   * 发现页离开顶部
   */
  DISCOVERY_LEAVE_TOP: 'discoveryLeaveTop',

  /**
   * 发现页接触顶部
   */
  DISCOVERY_TOUCH_TOP: 'discoveryTouchTop'
};

/**
 * 注册APP通知插件
 * @param event {string}
 * @param callback {function}
 */
function registerNativeNoticeEvent(event, callback) {
  if (window.muapp && window.muapp.NotificationPlugin
    && window.muapp.NotificationPlugin.registerNativeNoticeEvent) {
    window.muapp.NotificationPlugin.registerNativeNoticeEvent(event, callback);
  }
}

/**
 * 发送事件通知
 * @param event {string}
 */
function eventNotification(event) {
  if (window.muapp && window.muapp.NotificationPlugin
    && window.muapp.NotificationPlugin.eventNotification) {
    return window.muapp.NotificationPlugin.eventNotification(event);
  }
}

/**
 * @param type {number} 0：⽩⾊字体，1：⿊⾊字体
 * 设置状态栏样式
 */
function setStatusBarStyle(type) {
  if (window.muapp && window.muapp.AppPlugin && window.muapp.AppPlugin.setStatusBarStyle) {
    return new Promise((resolve, reject) => {
      window.muapp.AppPlugin.setStatusBarStyle(type, resolve, reject);
    });
  }
}

/**
 * 获取状态栏⾼度
 */
function getStatusBarHeight() {
  if (window.muapp && window.muapp.AppPlugin && window.muapp.AppPlugin.getStatusBarHeight) {
    return new Promise((resolve) => {
      window.muapp.AppPlugin.getStatusBarHeight(resolve);
    });
  }
}

async function getStatusBarHeightTaroPx() {
  let height = 0;
  try {
    const res = await getStatusBarHeight();
    const sysInfo = Madp.getSystemInfoSync();
    if (res && res.height && sysInfo && sysInfo.pixelRatio) {
      height = parseFloat(res.height) / sysInfo.pixelRatio;
    }
  } catch (e) {
    console.error(e);
  }
  return height;
}

/**
 * 获取通知是否开启插件
 */
function isNotificationEnabled() {
  if (window.muapp && window.muapp.AppPlugin
    && window.muapp.AppPlugin.isNotificationEnabled) {
    return new Promise((resolve) => {
      window.muapp.AppPlugin.isNotificationEnabled(resolve);
    });
  }
}

function addZero(num) {
  return (`0${num}`).slice(-2);
}

function getYMDHMS(time) {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1);
  const day = addZero(date.getDate());
  const h = addZero(date.getHours());
  const m = addZero(date.getMinutes());
  const s = addZero(date.getSeconds());
  return `${year}-${month}-${day} ${h}:${m}:${s}`;
}

/**
 * 路由跳转
 * @param {object} props
 * @param {string} props.url
 * @param {function} props.successCallBack
 * @param {function} props.errorCallBack
 */
function pageJump(props) {
  const { url, successCallBack, errorCallBack } = props;
  if (window.muapp && window.muapp.PagerJumpPlugin) {
    window.muapp.PagerJumpPlugin.navigateTo(url, successCallBack, errorCallBack);
  }
}

/**
 * 添加app日历 [timeInterval, activeBeginTime]二选一
 * @param {object} props
 * @param {string} props.title 日历标题
 * @param {string} props.timeInterval 隔几天
 * @param {string} props.activeBeginTime 开始时间 时间戳
 */
function addCalender(props, successCallBack, errorCallBack) {
  const { title, timeInterval, activeBeginTime } = props;
  const url = `muapp://app/addCalendar?title=${title}&${timeInterval ? `timeInterval=${timeInterval}` : `activeBeginTime=${getYMDHMS(activeBeginTime)}`}`;
  console.log('add calender', url);
  const param = {
    url,
    successCallBack,
    errorCallBack
  };
  pageJump(param);
}

/**
 * 开启定位
 * @param {bool} isCheck 是否为查询
 * @param {function} successCallBack
 * @param {function} errorCallBack
 */
function openLocation(isCheck = false, successCallBack, errorCallBack) {
  const param = {
    url: `muapp://functionalExt/checkPermission?permission=location&needRequest=${isCheck ? '0' : '1'}`,
    successCallBack,
    errorCallBack,
  };
  pageJump(param);
}

export {
  APP_NOTICE_EVENT,
  registerNativeNoticeEvent,
  eventNotification,
  setStatusBarStyle,
  getStatusBarHeight,
  getStatusBarHeightTaroPx,
  isNotificationEnabled,
  addCalender,
  pageJump,
  openLocation,
};
