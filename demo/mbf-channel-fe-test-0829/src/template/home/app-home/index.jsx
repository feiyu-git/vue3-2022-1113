import Madp, { Component } from '@mu/madp';
// import { inject } from '@tarojs/mobx';
import { MUImage, MUView } from '@mu/zui';
import {
  isAndroid,
  debounce,
  isMuapp,
  Url
} from '@mu/madp-utils';
import { track } from '@mu/madp-track';
import ubd from '@mu/user-bhvr-detector';
import {
  APP_NOTICE_EVENT, eventNotification, getStatusBarHeightTaroPx,
  registerNativeNoticeEvent,
} from '@utils/app-plugin-util';
import { triggerFmp } from '@mu/business-basic';
import { pxTransform } from '@utils/index.js';
import * as CONSTANTS from '@utils/constants';
import { checkGuide } from '@utils/guide-biometrics.js';
import { sendEV, sendSectionSO, sendContentSO } from '@utils/dispatchTrackEventProxy';
import PullOutRefresh, { COMP_STATUS, DIRECTION } from '@tempComp/home/pull-out-refresh/pull-out-refresh';
import MuRefresh, { REFRESH_STYLE } from '@tempComp/home/pull-out-refresh/mu-refresh';
import PullUpNavigateView from '@tempComp/home/pull-up-navigate';
import DialogManage from '@tempComp/home/dialog-manage';
import HomeCommon from '../home-common';
import './index.scss';

@track({}, {
  pageId: 'APPHomePage',
  dispatchOnMount: true,
})
// @inject('commonStore')
@ubd.scrollDetectDecorator({
  pageId: 'AppHome',
})
class AppHome extends Component {
  // 是否可以跳转
  get enableNavigate() {
    const { pullDownNavigate = {} } = this.state;
    const { enableNavigate, targetUrl, imgUrl } = (pullDownNavigate && pullDownNavigate.dataObj) || {};
    return !!(enableNavigate === '1' && targetUrl && imgUrl);
  }

  // 下拉全屏跳转链接
  get pullDownNavigateUrl() {
    const { pullDownNavigate } = this.state;
    const { targetUrl } = (pullDownNavigate && pullDownNavigate.dataObj) || {};
    return targetUrl;
  }

  // 上拉跳转链接
  get pullUpNavigateUrl() {
    const { pullUpNavigate } = this.state;
    const { contentList = [] } = (pullUpNavigate && pullUpNavigate.dataObj) || {};
    const itemList = typeof contentList === 'string' ? JSON.parse(contentList) : contentList;
    const { targetUrl = '' } = itemList.length && itemList[0];
    return targetUrl;
  }

  constructor(props) {
    const visitor = Url.getParam('visitor');
    super(props);
    this.commonRef = null;
    this.state = {
      isShowNavigateBar: true, // 导航栏是否隐藏
      refreshBusinessData: 0, // 组件刷新控制
      refreshPlace: '', // 数据刷新的时机，二级页返回或者下拉等
      visitor, // 游客版面的参数
    };

    // 下拉刷新相关
    this.onPulling = this.onPulling.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onScrolling = this.onScrolling.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.refreshCompontBusinessData = this.refreshCompontBusinessData.bind(this);
    this.isPullingDown = false;

    // 刷新控制数据相关
    this.setCommonData = this.setCommonData.bind(this);
    this.needReAppearRefresh = false;
  }

  // 提前设置设置状态栏高度，防止页面跳动
  componentWillMount() {
    this.autoRetry(this.initStatusBarHeight.bind(this));
  }

  // shouldComponentUpdate(nextProp, nextState) {
  //   const { pageId: tempPageId } = nextState;
  //   return !!tempPageId;
  // }

  // 设置状态栏高度
  async initStatusBarHeight() {
    if (isMuapp()) {
      const height = await getStatusBarHeightTaroPx();
      if (!height) {
        return Promise().reject();
      }
      this.setState({
        statusBarHeight: height
      });
    }
  }

  /**
   * app页面拉动事件
   * @param {string} direction 拉动方向
   * @param {function} cancelRefresh 取消刷新函数
   */
  onPullRefresh(direction, cancelRefresh) {
    if (direction === DIRECTION.DOWN) {
      this.onPullDownRefreshTemp(cancelRefresh);
    } else if (direction === DIRECTION.UP) {
      this.onPullUpNavigate(cancelRefresh);
    }
  }

  /**
   * 下拉刷新函数
   * 自定义不能命名为onPullDownRefresh，否则会采用taro的下拉刷新
   * @param {function} cancelRefresh 取消刷新
   */
  async onPullDownRefreshTemp(cancelRefresh) {
    this.refreshData(true, CONSTANTS.REFRESH_PLACE.PULL_REFRESH);
    setTimeout(() => {
      cancelRefresh();
    }, 1000);
  }

  /**
   * 上拉跳转函数
   * @param {function} cancelRefresh 取消刷新函数
   */
  onPullUpNavigate(cancelRefresh) {
    const { pullUpNavigate = {} } = this.state;
    const { boothTitle } = pullUpNavigate.dataObj || {};
    const beaconContent = {
      title: boothTitle,
      position: -1,
      contentId: 'PullUpBtn',
    };
    sendEV(pullUpNavigate, beaconContent);

    setTimeout(() => {
      this.navigateTo(this.pullUpNavigateUrl);
      cancelRefresh();
    }, 100);
  }

  /**
   * 下拉二楼全屏事件
   * @param {string} direction 拉动方向
   * @param {function} cancelRefresh 取消刷新函数
   */
  onPullFullScreen(direction, cancelRefresh) {
    if (direction === DIRECTION.DOWN) {
      const { pullDownNavigate = {} } = this.state;
      const { boothTitle } = pullDownNavigate.dataObj || {};
      const beaconContent = {
        title: boothTitle,
        position: -1,
        contentId: 'PullDownFullBtn',
      };
      sendEV(pullDownNavigate, beaconContent);

      setTimeout(() => {
        this.navigateTo(this.pullDownNavigateUrl);
        // 避免安卓从直播页返回先闪现下二楼
        if (isAndroid()) {
          cancelRefresh();
        }
      }, 1500);
      setTimeout(() => {
        // 避免ios进入二楼之前闪现首页
        if (!isAndroid()) {
          cancelRefresh();
        }
        this.refreshData(true);
      }, 3000);
    }
  }

  /**
    * 刷新渲染函数
    * @param {string} direction 拉动方向
    * @param {string} status 拉动状态
    */
  renderRefresh(direction, status) {
    if (direction === DIRECTION.DOWN) {
      return this.renderPullDownRefresh(status);
    } else if (direction === DIRECTION.UP) {
      return this.renderPullUpRefresh(status);
    }
  }

  /**
    * 下拉刷新/下拉全屏跳转渲染函数
    * @param {string} status 拉动状态
    */
  renderPullDownRefresh(status) {
    const { pullDownNavigate = {} } = this.state;
    const { imgUrl } = pullDownNavigate.dataObj || {};
    return (
      <MuRefresh
        status={status}
        refreshStyle={this.enableNavigate ? REFRESH_STYLE.TEXT : REFRESH_STYLE.LOGO}
        imgUrl={imgUrl}
      />
    );
  }

  /**
   * 上拉跳转渲染函数
   * @param {string} status 拉动状态
   */
  renderPullUpRefresh(status) {
    let showStr = '';
    switch (status) {
      case COMP_STATUS.CAN_NOT_REFRESH:
        showStr = '松开立即跳转';
        break;
      case COMP_STATUS.CAN_REFRESH:
        showStr = '松开立即跳转';
        break;
      case COMP_STATUS.CAN_REFRESH_RELEASE:
        showStr = '正在跳转';
        break;
      default:
        break;
    }
    return (
      showStr && (
        <MUView className="pull-out-refresh-loading">
          <MUView className="indicator" />
          <MUView>{showStr}</MUView>
        </MUView>
      )
    );
  }

  /**
   * 全屏渲染函数
   * @param {string} direction 拉动方向
   */
  renderFullScreen(direction) {
    if (direction === DIRECTION.DOWN) {
      const { pullDownNavigate = {} } = this.state;
      const { imgUrl } = pullDownNavigate.dataObj || {};
      return this.enableNavigate && (
        <MUView
          className="pull-out-full-screen-img-box"
          style={{
            overflow: 'hidden',
          }}
        >
          <MUImage
            className="pull-out-full-screen-img"
            src={imgUrl}
            alt=""
          />
        </MUView>
      );
    }
  }

  /**
   * 正在拉动回调
   * @param {*} direction 拉动方向
   * @param {*} offset 拉动偏移量
   */
  onPulling(direction, offset) {
    if (direction === DIRECTION.DOWN) {
      if (offset > 0 && !this.isPullingDown) {
        this.isPullingDown = true;
        // 隐藏导航栏
        this.setState({
          isShowNavigateBar: false,
        });
      }
    }
  }

  // 导航栏重置
  onReset() {
    this.setState({
      isShowNavigateBar: true,
    });
    if (this.isPullingDown) {
      this.isPullingDown = false;
    }
  }

  // 正在滚动回调
  onScrolling() {
    // console.log(`onScrolling run ${offset}`);
  }

  // 下拉结束的回调
  onPullingEnd() {
    this.hideTabBar();
  }

  // 隐藏导航栏
  hideTabBar() {
    eventNotification(APP_NOTICE_EVENT.HIDE_TAB);
    this.isTabBarHide = true;
  }

  /**
   * 刷新页面数据
   * @param isForce 是否强制刷新
   * @returns {Promise<void>}
   */
  refreshData = debounce(async (isForce, refreshPlace) => {
    if (this.isCanRefreshData(isForce)) {
      await this.commonRef.checkLogin();
      this.refreshCompontBusinessData(refreshPlace);
      // leda 更新展位数据，刷新时需要刷新权益卡数据
      this.commonRef.refreshLedaData();
    }
  }, 1000, {
    leading: true,
    trailing: false,
  });

  /**
   * 是否可以刷新数据
   * @param isForce 是否强制刷新
   */
  isCanRefreshData(isForce) {
    if (isForce || this.needReAppearRefresh) {
      this.needReAppearRefresh = false;
      return true;
    }
  }

  // 刷新时不会重新触发didmount,需要手动调用组件重新获取业务接口数据
  refreshCompontBusinessData(refreshPlace) {
    const { refreshBusinessData } = this.state;
    this.setState({
      refreshBusinessData: refreshBusinessData + 1,
      refreshPlace,
    });
  }

  // 自动重试
  async autoRetry(func, retryTime = 5) {
    if (retryTime > 0) {
      try {
        await func();
      } catch (e) {
        setTimeout(() => {
          this.autoRetry(func, retryTime - 1);
        }, 1000);
      }
    }
  }

  reAppearRefresh() {
    this.needReAppearRefresh = true;
  }

  sendComponentSectionSO() {
    const {
      homeNavigateBar,
      homeNavigateBarSearch,
      bigPromotionImage,
      sologan,
    } = this.state;
    if (homeNavigateBar) {
      sendSectionSO(homeNavigateBar);
      sendContentSO(homeNavigateBar, {
        title: '导航栏-消息中心',
        position: -1,
        contentId: 'MsgBtn',
      });
    }
    if (homeNavigateBarSearch) {
      // 搜索报表专用埋点
      const { showService, contentList = [] } = homeNavigateBarSearch.dataObj || {};
      const item = contentList.length ? contentList[0] : '';
      const beaconContent = item ? {
        title: item.searchKey,
        position: -1,
        contentId: item.hash,
      } : {
        title: '无搜索词',
        position: -1,
        contentId: 'none',
      };
      sendContentSO(homeNavigateBarSearch, beaconContent);
      if (showService === '1') {
        sendContentSO(homeNavigateBarSearch, {
          title: '智能业务助理',
          position: -1,
          contentId: 'AiService',
        });
      }
    }
    if (this.showBigPromotion) {
      const bigPromotionImageData = bigPromotionImage.dataObj || {};
      sendSectionSO(bigPromotionImage);
      sendContentSO(bigPromotionImage, {
        title: bigPromotionImageData.contentList[0].elementTitle,
        position: -1,
        cusContentId: bigPromotionImageData.contentList[0].hash,
      });
    }
    if (sologan && sologan.dataObj) {
      const sologanData = sologan.dataObj || {};
      sendSectionSO(sologan);
      sendContentSO(sologan, {
        title: sologanData.boothTitle,
        position: -1,
        contentId: 'TextBtn',
      });
    }
  }

  // 注册APP通知事件
  registerNoticeEvent() {
    registerNativeNoticeEvent(APP_NOTICE_EVENT.LOGIN, () => {
      // 登陆登出都是需要强制刷新的
      this.refreshData(true);

      // android触发一次后需要重新监听
      if (isAndroid()) {
        this.registerNoticeEvent();
      }
    });
    registerNativeNoticeEvent(APP_NOTICE_EVENT.LOGIN_GUIDE, () => {
      // 登录后，检查并引导开启指纹/面容
      checkGuide();
      // 登录后此flag设为false
      this.isLogout = false;

      // android触发一次后需要重新监听
      if (isAndroid()) {
        this.registerNoticeEvent();
      }
    });
    registerNativeNoticeEvent(APP_NOTICE_EVENT.LOGOUT, () => {
      // 登出后此flag设为false
      this.isLogout = true;
      // 登陆登出都是需要强制刷新的
      this.refreshData(true);
      // android触发一次后需要重新监听
      if (isAndroid()) {
        this.registerNoticeEvent();
      }
    });
    registerNativeNoticeEvent(APP_NOTICE_EVENT.TAB_VISIBLE, (event) => {
      this.showTabBar();

      if (event.param === '0') {
        this.refreshData(true, CONSTANTS.REFRESH_PLACE.TAB_VISIBLE);
      }
      // android触发一次后需要重新监听
      if (isAndroid()) {
        this.registerNoticeEvent();
      }
    });
    registerNativeNoticeEvent(APP_NOTICE_EVENT.TAB_SWITCH, async (event) => {
      this.showTabBar();
      // 切换tab时先判断是否登出，登出操作会刷新数据
      if (event.param === '0' && !this.isLogout) {
        // 刷新消息数据
        this.refreshData(true);
      }
      // android触发一次后需要重新监听
      if (isAndroid()) {
        this.registerNoticeEvent();
      }
    });
  }

  // 展示导航栏
  showTabBar() {
    this.isTabBarHide && eventNotification(APP_NOTICE_EVENT.SHOW_TAB);
    this.isTabBarHide = false;
  }

  // 复用子组件的数据
  setCommonData(data = {}) {
    const {
      dialog, isLogin, userId, userInfo, maskRealName, maskMobile, mobileValid, urgingPaymentDialog,
      pullUpNavigate, homeNavigateBar, homeNavigateBarSearch, bigPromotionImage, sologan, pullDownNavigate,
    } = data;
    this.setState({
      dialog,
      isLogin,
      userId,
      userInfo,
      maskRealName,
      maskMobile,
      mobileValid,
      urgingPaymentDialog,
      pullUpNavigate,
      homeNavigateBar,
      homeNavigateBarSearch,
      bigPromotionImage,
      sologan,
      pullDownNavigate,
    }, () => {
      this.sendComponentSectionSO();
      // 刷新业务组件的数据。额度卡片、消息中心、待办
      this.refreshCompontBusinessData();
    });
    this.registerNoticeEvent();
  }

  navigateTo(url) {
    Madp.navigateTo({
      url,
      useAppRouter: true,
    });
  }

  render() {
    const {
      pullDownNavigate,
      pullUpNavigate,
      dialog,
      isLogin,
      userId,
      userInfo,
      maskRealName,
      maskMobile,
      mobileValid,
      urgingPaymentDialog = {},
      isShowNavigateBar,
      refreshBusinessData, // 组件刷新控制
      refreshPlace, // 数据刷新的时机，二级页返回或者下拉等
      visitor,
      statusBarHeight
    } = this.state;

    const dialogManageProps = {
      urgingPaymentDialog: urgingPaymentDialog.dataObj ? urgingPaymentDialog : { dataObj: {} }, // 催收展位的 props
      dialog, // 广告弹窗展位的 props
      userInfo,
      maskRealName,
      homePageDialog: {
        isLogin,
        userId,
        maskMobile,
        mobileValid,
        parent: this,
      }, // 自定义组件的 props
    };

    const appParams = {
      isShowNavigateBar,
      refreshBusinessData,
      refreshPlace,
      visitor,
      statusBarHeight
    };

    const { enableRefresh } = (pullDownNavigate && pullDownNavigate.dataObj) || {};
    const { contentList = [] } = (pullUpNavigate && pullUpNavigate.dataObj) || {};
    const itemList = typeof contentList === 'string' ? JSON.parse(contentList) : contentList;
    const pullUpNavigateInfo = (itemList.length && itemList[0]) || {};
    const { targetUrl = '' } = pullUpNavigateInfo;

    if (targetUrl) {
      CONSTANTS.PULL_REFRESH_PROPS.pullUpEnable = true;
    } else {
      CONSTANTS.PULL_REFRESH_PROPS.pullUpEnable = false;
    }
    if (enableRefresh === '1') {
      CONSTANTS.PULL_REFRESH_PROPS.pullDownEnable = true;
    } else {
      CONSTANTS.PULL_REFRESH_PROPS.pullDownEnable = false;
    }
    if (this.enableNavigate) {
      CONSTANTS.PULL_REFRESH_PROPS.pullDownDamping = 200;
    } else {
      CONSTANTS.PULL_REFRESH_PROPS.pullDownDamping = 120;
    }

    return (
      <PullOutRefresh
        {...CONSTANTS.PULL_REFRESH_PROPS}
        onPullRefresh={(direction, cancelRefresh) => this.onPullRefresh(direction, cancelRefresh)}
        onPullFullScreen={
          (direction, cancelRefresh) => this.onPullFullScreen(direction, cancelRefresh)
        }
        renderRefresh={(direction, status) => this.renderRefresh(direction, status)}
        renderFullScreen={(direction, status) => this.renderFullScreen(direction, status)}
        onPulling={this.onPulling}
        onReset={this.onReset}
        onScrolling={this.onScrolling}
        onPullingEnd={(direction, status) => this.onPullingEnd(direction, status)}
      >
        <MUView style={{
          position: 'relative',
          minHeight: `${window.screen.height}px`,
          paddingBottom: isLogin ? `${pxTransform(20)}px` : `${pxTransform(100)}px`,
          overflow: 'hidden',
        }}
        >
          <MUView className="app-home">
            {/* 这里不要把 this.state 直接传给子组件 */}
            <HomeCommon getCommonDataFn={this.setCommonData} {...this.props} {...appParams} instanceCommonRef={(e) => { this.commonRef = e; }} />
            {/* 首页所有弹窗 弹窗优先级管理处理 */}
            <DialogManage {...dialogManageProps} isLogin={isLogin} userInfo={userInfo} maskRealName={maskRealName} />
            {targetUrl && (
              <PullUpNavigateView {...pullUpNavigateInfo} />
            )}
          </MUView>
        </MUView>
      </PullOutRefresh>
    );
  }
}

export default AppHome;
