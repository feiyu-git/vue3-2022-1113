import channelConfig from './index';

export const themeColor = channelConfig.theme || 'default';

/**
 * 可在channels 中自定义每个channel下对应的主题颜色, 其对应key为`theme`，默认为招联蓝
 * 由于 dynamic import 在taro目前仅支持 h5，因此做了区分
 */
const setCustomTheme = () => {
  if (process.env.TARO_ENV === 'h5') {
    switch (themeColor) {
      case 'red':
        import('../styles/themes/red.scss');
        break;
      case 'purple':
        import('../styles/themes/purple.scss');
        break;
      default:
        import('../styles/themes/default.scss');
        break;
    }
  } else {
    require('../styles/themes/default.scss');
  }
};

export default setCustomTheme;
