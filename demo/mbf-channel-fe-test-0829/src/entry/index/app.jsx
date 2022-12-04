import 'babel-polyfill';
import Taro from '@tarojs/taro';
import { Provider } from '@tarojs/mobx';
import '@tarojs/async-await';
import '@utils/setChannel';
import { setup, armsProxy } from '@mu/business-basic';
// 传入业务工程自己的业务配置
import setupConfig from '@config/setupConfig';
import getGlobalStore from '@store/index';
import getEnv from '@mu/survey/dist/weapp/utils/getEnv';
import VConsole from 'vconsole'

import './app.scss';

setup(setupConfig);

armsProxy({
  useFmp: true
});

// 这里的获取全局状态必须要在setup后边
const globalStore = getGlobalStore();

class App extends Taro.Component {
  config = {
    pages: [
      'pages/homepage/index',
      'pages/index/index',
      'pages/web-view/index', // 该页面是在小程序端跳转外部链接用的，请勿删除
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
    permission: {
      'scope.userLocation': {
        desc: '你的位置信息将用于小程序位置接口的效果展示'
      }
    },
  };

  componentWillMount() {
  }

  componentDidMount() {
    if (getEnv().indexOf('st') !== -1) {
      const vconsole = new VConsole();
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  componentCatchError() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={globalStore} />
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
