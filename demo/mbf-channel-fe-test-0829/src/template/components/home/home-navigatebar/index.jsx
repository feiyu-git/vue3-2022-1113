import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { isIOS, isMuapp } from '@mu/madp-utils';
import PropTypes from 'prop-types';
import {
  setStatusBarStyle,
} from '../../../utils/app-plugin-util';
import { sendEV, sendContentSO } from '../../../utils/dispatchTrackEventProxy';
import Search from './components/home-navigatebar-search';
import Msg from './components/home-navigatebar-msg';
import Item from './components/home-navigatebar-item';
import { ITEM_TYPES } from './util/constants';

import './index.scss';

const NAVIGATE_SCROLL_HEIGHT = 64; // 透明变换距离

// 精选首页导航栏
// 申请被拒使用区块标签实现
class HomeNavigateBar extends Component {
  constructor(props) {
    super(props);
    this.data = {
      isAlphaOnscroll: true, // 监听滚动时使用的 isAlpha, 防止渲染时差
      childUpdateFunc: [],
    };
    this.state = {
      // 透明
      shouldHide: false,
      isAlpha: true, // 是否背景色透明
    };

    this.handleScrollAlphaChange = this.handleScrollAlphaChange.bind(this);

    this.listenScroll();
    if (isMuapp()) {
      setStatusBarStyle(0);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScrollAlphaChange);
    if (isIOS()) {
      window.removeEventListener('touchmove', this.handleScrollAlphaChange);
    }
  }

  // 下拉时隐藏导航栏
  hideNavigate(hide) {
    this.setState({
      shouldHide: hide,
    });
  }

  // 监听界面滚动 进行透明变换
  listenScroll() {
    window.addEventListener('scroll', this.handleScrollAlphaChange);
    if (isIOS()) { // iOS上UIWebView scroll在滚动结束触发(包括惯性滚动), 用touchmove稍微弥补中间过程
      window.addEventListener('touchmove', this.handleScrollAlphaChange);
    }
  }

  handleScrollAlphaChange() {
    const { isAlphaOnscroll } = this.data;
    const scrollViewTop = document.documentElement.scrollTop || document.body.scrollTop;
    const navigateRef = this.navigateRef && this.navigateRef.vnode && this.navigateRef.vnode.dom;
    if (scrollViewTop >= 0 && scrollViewTop < NAVIGATE_SCROLL_HEIGHT) {
      const radio = scrollViewTop / NAVIGATE_SCROLL_HEIGHT;
      navigateRef.style.backgroundColor = `rgba(246,246,246, ${radio})`;
      if (!isAlphaOnscroll) {
        this.updateStyle(true);
      }
    } else if (scrollViewTop >= NAVIGATE_SCROLL_HEIGHT && isAlphaOnscroll) {
      navigateRef.style.backgroundColor = 'rgba(243,243,243, 1)';
      this.updateStyle(false);
    }
  }

  updateStyle(isAlpha) {
    this.setState({
      isAlpha,
    });
    this.data.isAlphaOnscroll = isAlpha;
    if (isMuapp()) {
      setStatusBarStyle(isAlpha ? 0 : 1);
    }
    // iOS上UIWebView scroll在滚动期间不会触发js渲染, 只能直接操作dom刷新
    this.updateChildStyle(!isAlpha);
  }

  updateChildStyle(showBlackStyle) {
    this.data.childUpdateFunc.forEach((updateFunc) => updateFunc && updateFunc(showBlackStyle));
  }

  sendSO(beaconContent) {
    sendContentSO(this.props.data, beaconContent);
  }

  sendBeacon(beaconContent) {
    sendEV(this.props.data, beaconContent);
  }

  render() {
    const {
      data,
      searchData,
      isShow,
      isLogin,
      reAppearUpdate,
      refreshBusinessData,
      statusBarHeight,
      itemsConfig = [], // 展示的元素配置
      isVisitor = false // 游客版面的参数，处理点击时使用，其他版面不需要传入默认false
    } = this.props;
    const { contentList = [] } = data || {};
    const {
      isAlpha,
      shouldHide,
    } = this.state;
    const showBlackStyle = !isAlpha;

    const itemsView = contentList.map((item) => (
      <Item
        showBlackStyle={showBlackStyle}
        item={item}
        updateStyleFunc={(ref) => { this.data.childUpdateFunc.push(ref); }}
        sendBeacon={(beaconContent) => this.sendBeacon(beaconContent)}
        sendSO={(beaconContent) => this.sendSO(beaconContent)}
        isVisitor={isVisitor}
      />
    ));

    console.log('[homepage][HomeNavigateBar]render:itemsConfig=', itemsConfig);

    return (
      <MUView className="home-navigatebar" style={!isShow || shouldHide ? 'opacity: 0' : 'opacity: 1'}>
        <MUView className={`home-navigatebar__navigate${showBlackStyle ? ' white' : ''}`} ref={(ref) => { this.navigateRef = ref; }}>
          <MUView className="home-navigatebar__container" style={{ paddingTop: statusBarHeight }}>
            <MUView className="home-navigatebar__container__left">
              {itemsConfig && itemsConfig.includes(ITEM_TYPES.SEARCH) && (
                <Search
                  searchData={searchData}
                  showBlackStyle={showBlackStyle}
                  updateStyleFunc={(ref) => { this.data.childUpdateFunc.push(ref); }}
                  isVisitor={isVisitor}
                />
              )}
            </MUView>
            <MUView className="home-navigatebar__container__right">
              {itemsConfig && itemsConfig.includes(ITEM_TYPES.PRODUCT_ICONS) && itemsView}
              {itemsConfig && itemsConfig.includes(ITEM_TYPES.MSG_ICON) && (
                <Msg
                  isLogin={isLogin}
                  showBlackStyle={showBlackStyle}
                  updateStyleFunc={(ref) => { this.data.childUpdateFunc.push(ref); }}
                  sendBeacon={(beaconContent) => this.sendBeacon(beaconContent)}
                  onClickParentDo={reAppearUpdate}
                  refreshBusinessData={refreshBusinessData}
                  isVisitor={isVisitor}
                />
              )}
            </MUView>
          </MUView>
        </MUView>
      </MUView>
    );
  }
}

HomeNavigateBar.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  itemsConfig: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object,
  isShow: PropTypes.bool,
  isLogin: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  refreshBusinessData: PropTypes.any,
  reAppearUpdate: PropTypes.func,
};

HomeNavigateBar.defaultProps = {
  itemsConfig: [ITEM_TYPES.SEARCH, ITEM_TYPES.PRODUCT_ICONS, ITEM_TYPES.MSG_ICON],
  data: {
    contentList: [],
  },
  isShow: true,
  isLogin: false,
  refreshBusinessData: false,
  reAppearUpdate: () => { },
};

HomeNavigateBar.ITEM_TYPES = ITEM_TYPES;

export default HomeNavigateBar;
