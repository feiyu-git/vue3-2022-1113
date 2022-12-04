import {
  useReducer,
  useCallback,
} from '@mu/madp';
import useInterval from './useInterval';

const initState = {
  status: 0, // 0 未获取过； 1 获取中； 2 获取结束
  count: 0,
  isRunning: false,
};

// const { type, payload } = action;
function reducer(state, action) {
  const { type, payload = {} } = action;
  switch (type) {
    case 'start':
      return {
        status: 1,
        count: payload.count,
        isRunning: true
      };
    case 'getting':
      return {
        ...state,
        count: state.count - 1
      };
    case 'stop':
      return {
        status: 2,
        count: payload.count,
        isRunning: false
      };
    default:
      throw new Error();
  }
}

/**
 *
 * @param {*} interval 定时器时长，默认1s
 * @param {*} startCount 倒计时开始数，默认60
 * @param {*} finishCount 倒计时结束数，默认0
 */
function useTimerCounting(interval = 1000, startCount, finishCount = 0) {
  const [state, dispatch] = useReducer(reducer, initState);

  useInterval(() => {
    if (state.count <= finishCount) {
      dispatch({
        type: 'stop',
        payload: { count: finishCount }
      });
    } else {
      dispatch({ type: 'getting' });
    }
  }, state.isRunning ? interval : null);

  const startCounting = useCallback(() => {
    if (state.status === 1) {
      return;
    }
    dispatch({
      type: 'start',
      payload: { count: startCount }
    });
  }, [state.status, startCount]);

  return { countState: state, startCounting };
}

export default useTimerCounting;
