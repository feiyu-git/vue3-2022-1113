import { Component } from '@mu/madp';
import { track, disableTrackAlert } from '@mu/madp-track';
import {
  StandardHome, AppHome, AlipayLifeHome, UnicomHome
} from '../../template/home';
import { HOME_COMP_TYPE } from './config/constant';

import currChannelConfig from './config';

// TODO 先这样处理 后续排查具体原因
disableTrackAlert();
@track({}, {
  pageId: 'HomePageCommon',
  dispatchOnMount: true,
})

class Home extends Component {
  componentWillMount() { }

  render() {
    const { homeType } = currChannelConfig;
    console.log('homeType', homeType);
    // 注意下面写法小程序不支持
    let HomeTemplate = AppHome;
    switch (homeType) {
      case HOME_COMP_TYPE.APP_HOME: {
        HomeTemplate = AppHome;
        break;
      }
      case HOME_COMP_TYPE.ALIPAY_LIFE_HOME: {
        HomeTemplate = AlipayLifeHome;
        break;
      }
      case HOME_COMP_TYPE.UNICOM_HOME: {
        HomeTemplate = UnicomHome;
        break;
      }
      default:
      case HOME_COMP_TYPE.STANDARD_HOME: {
        HomeTemplate = StandardHome;
        break;
      }
    }
    return <HomeTemplate currChannelConfig={currChannelConfig} />;
  }
}

export default Home;
