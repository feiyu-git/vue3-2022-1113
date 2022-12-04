// 传入渠道基础SDK setup方法的配置对象
import constants from './constants';
// buildConfig.js是通过madp config 拉取下来的构建时渠道配置，这个是有些业务模块需要用到的，自己业务模块从没使用过的话可以删掉
import buildTimeConfig from './buildTimeConfig';
import setCustomTheme from './theme';


export default {
  constants,
  buildTimeConfig,
  setCustomTheme,
};
