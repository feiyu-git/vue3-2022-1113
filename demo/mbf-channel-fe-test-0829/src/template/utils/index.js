import Madp from '@mu/madp';

/**
 *  获取url,search参数
 */
export const getUrlParams = () => {
  const { href } = window.location;
  const searchArr = href.split('?');
  const search = (searchArr[1] && searchArr[1]) || '';
  const paramsArr = search ? search.split('&') : [];
  const result = {};
  paramsArr.forEach((item) => {
    const tempArr = item ? item.split('=') : [];
    if (tempArr.length) {
      // eslint-disable-next-line prefer-destructuring
      result[tempArr[0]] = tempArr[1];
    }
  });
  return result;
};

export const pxTransform = (pixel) => {
  const width = document.documentElement.clientWidth || window.screen.width;
  return width * pixel / 750;
};

/**
 * 计算文字宽度
 * @param {*} text 文字
 * @param {*} font 字体
 * @returns
 */
export const calcTextWidth = (text, font) => {
  const canvas = calcTextWidth.canvas || (calcTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
};


/**
 * 设置localstrage
 * */
export function setLocalStorage(key, data) {
  // 更新缓存中的标签数据
  Madp.setStorage({
    key,
    data,
    type: 'LOCAL',
  });
}
