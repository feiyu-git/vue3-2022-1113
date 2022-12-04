import Madp from '@mu/madp';
/**
 * 弹窗周期控制
 */
const CYCLE_TYPE = {
  ONCE: 'ONCE',
  ONE_DAY: 'ONE_DAY',
  ONE_WEEK: 'ONE_WEEK',
  ONE_MONTH: 'ONE_MONTH',
  EVERY_TIME: 'EVERY_TIME'
};

const CYCLE_INTERVAL = {
  ONCE: 0,
  ONE_DAY: 86400000,
  ONE_WEEK: 7 * 86400000,
  ONE_MONTH: 30 * 86400000,
  EVERY_TIME: -1
};

const isDialogCanShow = (stroageKey) => {
  const dialogInfo = Madp.getStorageSync(stroageKey, 'LOCAL');
  // 无本地存储，第一次弹窗
  if (!dialogInfo) return true;
  const { cycleType, showTime } = dialogInfo;
  // 每次都弹
  if (cycleType === CYCLE_TYPE.EVERY_TIME) return true;

  const interval = CYCLE_INTERVAL[cycleType];
  const nextShowTime = showTime + interval;
  const currentTime = new Date().getTime();
  return currentTime > nextShowTime;
};

const setDialogStorage = (stroageKey, cycleType) => {
  const currentTime = new Date().getTime();
  Madp.setStorageSync(stroageKey, { showTime: currentTime, cycleType }, 'LOCAL');
};

export { CYCLE_TYPE, isDialogCanShow, setDialogStorage };
