import Taro from '@tarojs/taro';

Taro.initPxTransform({ designWidth: 750, deviceRatio: {} });

export { default as StandardHome } from './template/home/standard-home';
export { default as MiniHome } from './template/home/mini-home';
