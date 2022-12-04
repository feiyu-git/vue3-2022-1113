import Madp from '@mu/madp';
/**
 * 红点逻辑描述
 * 一次性: 只展示一次, 用户点击完后不再展示
 * 周期性: 在周期时间内每天只展示一次, 用户点击后当天不再展示
 * redDotData: {
 *  hash: 内容唯一id
 *  reddotOpen: 红点是否打开,默认为true,
 *  cycleType: 红点周期类型 ‘ONCE' 或 ‘CYCLE'
 *  cycleStartTime: CYCLE类型循环开始时间
 *  cycleEndTime: CYCLE类型循环结束时间
 * }
 *
 * 组件接入可参考cmb-welfare
 */

const CYCLE_TYPE = {
  ONCE: 'ONCE',
  CYCLE: 'CYCLE',
};

// 多加一层专属前缀
const getKey = (key) => `reddot_${key}`;

const DataCache = []; // 缓存数据,避免多次的读操作

const getDataStore = (storeKey) => {
  if (DataCache[getKey(storeKey)]) {
    return DataCache[getKey(storeKey)];
  }
  const localData = Madp.getStorageSync(getKey(storeKey), 'LOCAL') || [];
  DataCache[getKey(storeKey)] = localData;
  return localData;
};

const udpateDataStore = (storeKey, data) => {
  DataCache[getKey(storeKey)] = data;
  Madp.setStorage({
    key: getKey(storeKey),
    data,
    type: 'LOCAL'
  });
};

/**
 * 当天是否点击过
 ```
 * storeKey: 组件唯一的数据存储标志, 推荐使用tid
 * redDotData: {
 *  hash: 内容唯一id
 * }
 ```
 */
const isReddotClickToday = (storeKey, redDotData) => {
  const dataList = getDataStore(storeKey);
  const { hash } = redDotData;
  if (!hash) {
    return false;
  }
  for (let i = 0; i < dataList.length; i += 1) {
    if (dataList[i].hash === hash) { // 已经展示过
      if (new Date().toLocaleDateString()
        === new Date(dataList[i].clickTime).toLocaleDateString()) { // 当天已点击
        return true;
      } else { // 当天未点击
        return false;
      }
    }
  }
  // 元素不存在
  return false;
};

/**
 * 是否展示红点
 ```
 * storeKey: 组件唯一的数据存储标志, 推荐使用tid
 * redDotData: {
 *  hash: 内容唯一id
 *  reddotOpen: 红点是否打开,默认为true,
 *  cycleType: 红点周期类型 ‘ONCE' 一次性 或 ‘CYCLE' 周期循环
 *  cycleStartTime: CYCLE类型循环开始时间
 *  cycleEndTime: CYCLE类型循环结束时间
 * }
 ```
 */
const isReddotCanShow = (storeKey, redDotData) => {
  const {
    hash = '', reddotOpen = true, cycleType = CYCLE_TYPE.ONCE, cycleStartTime = '', cycleEndTime = '',
  } = redDotData;
  if (!reddotOpen || reddotOpen === '0' || !storeKey || !hash) {
    return false;
  }
  // 优化从缓存中读取
  const dataList = getDataStore(storeKey);

  // 周期循环
  if (cycleType === CYCLE_TYPE.CYCLE) {
    if (!cycleStartTime || !cycleEndTime) {
      return false;
    }
    try { // 捕捉可能的时间处理错误
      const startTime = new Date(cycleStartTime).getTime();
      const endTime = new Date(cycleEndTime).getTime();
      const currentTime = new Date().getTime(); // 用系统时间表示当前时间
      const isBetween = currentTime <= endTime && currentTime >= startTime;
      if (!isBetween) { // 不在展示周期内
        return false;
      }

      return !isReddotClickToday(storeKey, { hash });
    } catch (e) {
      return false;
    }
  }
  // 一次性
  if (cycleType === CYCLE_TYPE.ONCE) { // TODO...和上面面定义同名变量会undefine
    for (let j = 0; j < dataList.length; j += 1) {
      if (dataList[j].hash === hash) { // 已经展示过
        return false;
      }
    }
    return true;
  }

  return false;
};

/**
 * 红点点击处理,保存红点数据
 ```
 * storeKey: 组件唯一的数据存储标志, 推荐使用tid
 * redDotData: { // isKnowRedDotShowing为true时, 只需hash字段
 *  hash: 内容唯一id
 *  reddotOpen: 红点是否打开,默认为true
 *  cycleType: 红点周期类型 ‘ONCE' 一次性 或 ‘CYCLE' 周期循环
 *  cycleTime: 周期循环类型的循环周期
 * }
 * isKnowRedDotShowing: 是否已知红点正在展示, 是则内部不再查询红点是否处于展示状态
 ```
 * 落库数据类型: [{hash, clickTime(时间戳)}]
 */
const reddotClickHandle = (storeKey, redDotData, isKnowRedDotShowing = false) => {
  const { hash = '' } = redDotData;
  if (!hash || (!isKnowRedDotShowing && !isReddotCanShow(storeKey, redDotData))) { // 当前红点没有展示
    return 0;
  }

  const currentTime = new Date().getTime();
  // 优化从缓存中读取
  const localList = getDataStore(storeKey);
  const index = localList.findIndex((item) => item.hash === hash);
  if (index > -1) {
    localList[index].clickTime = currentTime;
  } else {
    localList.push({
      hash,
      clickTime: currentTime,
    });
  }
  // 更新缓存
  udpateDataStore(storeKey, localList);
};

export {
  isReddotCanShow,
  reddotClickHandle,
  isReddotClickToday,
};
