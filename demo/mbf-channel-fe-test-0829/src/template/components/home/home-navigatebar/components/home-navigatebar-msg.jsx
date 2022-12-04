import Madp, { Component } from '@mu/madp';
import { MUImage, MUView } from '@mu/zui';
import { isMuapp, debounce } from '@mu/madp-utils';
import oldFetch from '@utils/oldFetch';
import { apiHost, mallApiHost, urlDomain } from '@mu/business-basic';
import fetch from '../../../../utils/fetch';
import {
  msgWhiteImg, msgBlackImg,
} from '../util/imgLoad';
import './home-navigatebar-msg.scss';

const MALL_URL = mallApiHost;
const MGP_URL = apiHost.mgp;
const channel = Madp.getChannel();
/**
 * props
 * isLogin        {bool} 是否已登录
 * showBlackStyle {bool} 是否展示黑色风格
 */

// 搜索栏
export default class HomeNavigatebarMsg extends Component {
  constructor(props) {
    super(props);

    this.data = {
      actPushTime: '',
    };
    this.state = {
      unreadNum: 0, // 0 不展示红点, >0 展示数字红点
      appReadType: 0 // 无数字； type=0，展示数字；type=2，都不显示
    };

    // 向父组件传递方法
    const { updateStyleFunc } = props;
    if (updateStyleFunc) {
      updateStyleFunc(this.updateStyle.bind(this));
    }

    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    localStorage.removeItem('MSG_KEY');
  }

  // 监听组件内部状态unreadNum的变化:
  componentWillReceiveProps(nextProps, nextState) {
    const { isLogin } = nextProps;
    if (nextProps.isLogin !== this.props.isLogin || nextProps.refreshBusinessData !== this.props.refreshBusinessData) {
      this.getMsgInfo(isLogin);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.unreadNum !== this.state.unreadNum) {
      if (window.muapp && window.muapp.PagerJumpPlugin && window.muapp.PagerJumpPlugin.route) {
        window.muapp.PagerJumpPlugin.route(`muapp://functionalExt/setBadgeCount?count=${this.state.unreadNum}`);
        window.muapp.PagerJumpPlugin.route(`muapp://mall/setUnReadMessageNum?type=${this.state.appReadType}&num=${this.state.unreadNum}`);
      }
    }
  }


  async getUserMsg() {
    const res = await fetch(MGP_URL, {
      // autoLoading: false,
      method: 'POST',
      operationId: 'mucfc.custservice.mymessage.queryMsgList',
      data: {},
    });
    return res;
  }

  async getServiceMsg() {
    const res = await fetch(MGP_URL, {
      method: 'POST',
      // autoLoading: false,
      operationId: 'mucfc.custservice.livchat.queryCustServiceEntrance',
      data: {
        sceneCodeList: ['KF', 'CS'] // 场景码：客服、催收
      }
    });
    return res;
  }

  async getMallMsg() {
    if (channel !== '0APP') return;
    const res = await oldFetch(`${MALL_URL}/msg/getUnreadMsgCount`, {
      method: 'GET',
      autoLoading: false,
    });
    return res;
  }

  getMsgInfo = async (isLogin) => {
    let unRead = 0;
    if (isLogin) {
      const [userData, serviceData, mallData] = await Promise.all([this.getUserMsg(), this.getServiceMsg(), this.getMallMsg()]);
      if (userData && userData.unReadTotalNum) {
        unRead += userData.unReadTotalNum;
        // 原生上会设置存储信息指定RN消息中心的打开位置
        // 去掉不做
      }
      const unReadNum = serviceData.chatContentList.length && serviceData.chatContentList.reduce((total, current) => total + current.unReadNumber, 0);
      if (serviceData && serviceData.chatContentList.length) {
        unRead += unReadNum;
      }
      if (mallData && mallData.count) {
        unRead += mallData.count;
        // 原生上会设置存储信息指定RN消息中心的打开位置
        // 去掉不做
      }
      if (unRead > 0) { // 设置数字红点
        this.setState({
          unreadNum: unRead,
          appReadType: 0
        });
        return 1;
      } else if (unRead === 0) {
        this.setState({
          appReadType: 2
        });
      }
    }
    this.setState({
      unreadNum: unRead,
    });
  }

  // 获取消息中心红点视图
  getMsgReddotView(unreadNum) {
    if (unreadNum === 0) {
      return null;
    }
    // 展示数字红点
    return <p className="reddot">{unreadNum <= 99 ? unreadNum : '99+'}</p>;
  }

  onClick = debounce(() => {
    // 埋点处理
    const { sendBeacon, onClickParentDo, isVisitor } = this.props;
    if (sendBeacon) {
      const beaconContent = {
        title: '导航栏-消息中心',
        position: -1,
        contentId: 'MsgBtn',
      };
      sendBeacon(beaconContent);
    }
    // 先执行父类再跳转
    onClickParentDo && onClickParentDo();
    const defaultUrl = `${urlDomain}/${channel}/message/#/pages/index/index?_needLogin=1`; // 默认的url
    const visitorUrl = `${urlDomain}/${channel}/message/#/pages/index/index?_needDialog=1`; // 游客url 拼接弹窗参数_needDialog=1
    const url = isVisitor ? visitorUrl : defaultUrl;
    Madp.navigateTo({
      url,
      useAppRouter: isMuapp(),
    });
  }, 1000, { leading: true, trailing: false });

  // eslint-disable-next-line no-unused-vars
  updateStyle(showBlackStyle) {
    // if (showBlackStyle) { // 黑色风格
    //   this.whiteImgRef.style.display = 'none';
    //   this.blackImgRef.style.display = 'block';
    // } else { // 白色风格
    //   this.blackImgRef.style.display = 'none';
    //   this.whiteImgRef.style.display = 'block';
    // }
  }

  render() {
    const { showBlackStyle } = this.props;
    const { unreadNum } = this.state;
    // iOS上UIWebView scroll在滚动期间不会触发js渲染, 只能用两张图片操作dom刷新
    const blackImgStyle = showBlackStyle ? 'display: block' : 'display: none';
    const whiteImgStyle = showBlackStyle ? 'display: none' : 'display: block';

    return (
      <MUView className="home-navigatebar-msg" onClick={this.onClick}>
        <MUImage className="home-navigatebar-msg__img" style={whiteImgStyle} alt="" src={msgWhiteImg} imgProps={{ 'data-src': msgWhiteImg }} ref={(ref) => { this.whiteImgRef = ref; }} />
        <MUImage className="home-navigatebar-msg__img" style={blackImgStyle} alt="" src={msgBlackImg} imgProps={{ 'data-src': msgBlackImg }} ref={(ref) => { this.blackImgRef = ref; }} />
        {this.getMsgReddotView(unreadNum)}
      </MUView>
    );
  }
}
