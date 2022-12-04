// 生活号首页特殊逻辑处理
// 1.关注组件
// 2.强制登陆
import Madp, { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { track } from '@mu/madp-track';
import HomeCommon from '../home-common';
import './index.scss';

const SCENE_ID = '0f1bf70717074b68b078b78728ca8d7e';

@track({}, {
  pageId: 'AlipayHome',
  dispatchOnMount: true,
})
class AlipayLifeHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 数据的命名规范为 组件名+Data
      // 用户数据
      // isLogin: false,
      // maskMobile: '',
      // isInvalidPhoneDialogShow: false
    };
    this.setCommonData = this.setCommonData.bind(this);
  }

  componentDidMount() {
    Madp.setNavigationBarTitle({ title: '招联金融' });
    // this.sendPageTrack();
    // this.checkLogin();
    this.initLifeFollow();
  }

  setCommonData(data = {}) {
    const { isLogin } = data;
    this.setState({
      isLogin,
    }, () => {
      this.checkLogin();
    });
  }

  async checkLogin() {
    try {
      const { isLogin } = this.state;
      const { currChannelConfig } = this.props;
      // console.log('======0ZFB this.state', this.state);
      if (!isLogin) {
      // 支付宝强制拉起登陆
        currChannelConfig.doLogin();
      }
      // else {
      //   this.setState({
      //     isLogin: true,
      //   });
      // }
    } catch (e) {
      console.log(e);
    }
  }

  async initLifeFollow() {
    const res = await this.handleImportCDN();
    if (res === 'success') {
      const { lifeFollow } = window;
      console.log('lifeFollow', lifeFollow, SCENE_ID);
      const ele = '.alipay-life-follow-node';
      // 场景接入模式
      lifeFollow.render(ele, {
        sceneId: SCENE_ID
      });
    }
  }

  handleImportCDN() {
    return new Promise((resolve, reject) => {
      const node = document.createElement('script');
      node.src = 'https://gw.alipayobjects.com/as/g/lifeApp/life-assert-set/0.2.11/lifeFollow.js';
      node.onload = () => {
        resolve('success');
      };
      node.onerror = (e) => {
        reject('fail', e);
      };
      document.body.appendChild(node);
    });
  }


  render() {
    const {
      isLogin,
    } = this.state;
    return (
      <MUView>
        <MUView className="alipay-life-follow-node" />
        <MUView className="alipay-life-home">
          <HomeCommon getCommonDataFn={this.setCommonData} {...this.props} />
        </MUView>
      </MUView>
    );
  }
}

export default AlipayLifeHome;
