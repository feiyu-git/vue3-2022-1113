/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
import Madp, { Component } from '@mu/madp';
import { inject } from '@tarojs/mobx';
import { MUImage, MUView } from '@mu/zui';
import { isAndroid, debounce, isMuapp } from '@mu/madp-utils';
import { dispatchTrackEvent, EventTypes, track } from '@mu/madp-track';
import ubd from '@mu/user-bhvr-detector';
import { injectState, refresh, setStaticState } from '@mu/leda';
import lodashHas from 'lodash/has';
import {
  APP_NOTICE_EVENT, eventNotification, getStatusBarHeightTaroPx,
  registerNativeNoticeEvent,
} from '@global/utils/app-plugin-util';
import { triggerFmp } from '@mu/business-basic';
import { pxTransform, setLocalStorage } from '@global/utils/index.js';
import * as CONSTANTS from '@global/utils/constants';
import { checkGuide } from '@global/utils/guide-biometrics.js';
import { queryUserFunction, getSessionInfo } from '@api/home';
import { sendEV, sendSectionSO, sendContentSO } from '@global/utils/dispatchTrackEventProxy';
import PullOutRefresh, { COMP_STATUS, DIRECTION } from '@tempComp/home/pull-out-refresh/pull-out-refresh';
import MuRefresh, { REFRESH_STYLE } from '@tempComp/home/pull-out-refresh/mu-refresh';
import PullUpNavigateView from '@tempComp/home/pull-up-navigate';
// import DialogManage from '@global/components/dialog-manage';
import ContentBlock from '../blocks';
import STATE_KEYS from './stateKeys.config'; // 首页展位 stateKey
import staticDatas from './data';
import './index.scss';

@track({}, {
  pageId: 'APPHomePage',
  dispatchOnMount: true,
})
@inject('commonStore')
@ubd.scrollDetectDecorator({
  pageId: 'AppHome',
})
@injectState({
  debug: true,
  isOpenCache: true,
  isCacheCustomerTag: true,
  pageId: CONSTANTS.PAGE_ID,
  stateKeys: STATE_KEYS,
  extendInfo: {
    data: {
      // 是否合规控制页面的标识，后台会根据该字段决定是否去要处理合规相关的内容
      compliancePageFlag: true,
    },
  },
})
class AppHome extends Component {
  /**
   * 刷新页面数据
   * @param isForce 是否强制刷新
   * @returns {Promise<void>}
   */
  refreshData = debounce(async (isForce, refreshPlace) => {
    if (this.isCanRefreshData(isForce)) {
      await this.checkLogin();
      this.refreshCompontBusinessData(refreshPlace);
      // leda 更新展位数据，刷新时需要刷新权益卡数据
      this.refreshLedaData();
    }
  }, 1000, {
    leading: true,
    trailing: false,
  });

  // leda 更新展位数据
  refreshLedaData = () => {
    // 切换tab时需要更新微光卡数据
    refresh({
      pageId: CONSTANTS.PAGE_ID,
      saveMoneyCard: {
        refreshCount: this.refreshCount, // 通过refreshCount属性强制刷新展位数据
      },
    }, () => {
      const {
        customerTag,
        isLogin,
      } = this.state;
      this.updateUserTag(customerTag, isLogin);
      this.refreshUserInfo(isLogin);
    });
    this.refreshCount += 1;
  }

  constructor(props) {
    super(props);
    this.channel = Madp.getChannel();
    this.refreshCount = 0;
    this.isLogout = false; // 用来判断切换tab时是否需要刷新数据
    this.userFunctionSwitchCacheKey = `${this.channel}_${CONSTANTS.USER_FUNCTINON_CODE.PREMIUM_VER_SWITCHER}`; // 用户开关状态缓存
    this.themeCacheKey = `${this.channel}_homepage_theme`;
    this.currentUserTagCacheKey = `${this.channel}_current_user_tag`;
    this.currentDefaultTheme = CONSTANTS.DEFAULT_THEME[this.channel] || CONSTANTS.DEFAULT_THEME.default; // 当前渠道默认主题
    // 获取当前渠道缓存的主题，若无则使用默认主题
    this.initTheme = Madp.getStorageSync(this.themeCacheKey, 'LOCAL') || this.currentDefaultTheme;
    // 获取当前渠道缓存的用户标签确定渲染那个区块 default：默认，severe_overdue：重度逾期
    const initUserTag = Madp.getStorageSync(this.currentUserTagCacheKey, 'LOCAL') || CONSTANTS.USER_TAG.DEFAULT;
    // 这里状态不要列入展位的数据对象
    this.state = {
      currentUserTag: initUserTag, // 用户标签，用来确定展示默认区块还是重度逾期区块
      currentTheme: this.initTheme, // 初始化使用当前渠道的默认主题色，若无则使用首页默认主题色
      // 下拉刷新隐藏导航栏
      isShowNavigateBar: true,
      showUnhandleNotice: false,
      // 用户数据
      isLogin: false,
      userId: '',
      maskMobile: '',
      mobileValid: true,
      userInfo: null, // getUserInfo接口返回的数据
      // 组件刷新控制
      refreshBusinessData: 0,
      refreshPlace: '', // 数据刷新的时机，二级页返回或者下拉等
      isOverDue: false,
    };

    this.onPulling = this.onPulling.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onScrolling = this.onScrolling.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.refreshLedaData = this.refreshLedaData.bind(this);
    this.refreshCompontBusinessData = this.refreshCompontBusinessData.bind(this);
    this.isPullingDown = false;

    // 刷新控制数据
    this.needReAppearRefresh = false;
  }

  // 设置状态栏高度得提前设置，防止跳动
  componentWillMount() {
    console.log('componentWillMount');
    this.autoRetry(this.initStatusBarHeight.bind(this));
    // 渲染内置静态数据
    setStaticState({
      pageId: CONSTANTS.PAGE_ID,
      datas: staticDatas.data,
      debug: true,
      context: this,
      stateKeys: STATE_KEYS,
    });
  }

  async ledaDidMount(state) {
    const loginSuccess = await this.checkLogin();
    // 刷新用户相关的数据
    await this.refreshUserInfo(loginSuccess);
    this.updateUserTag(state.customerTag, loginSuccess);
    // 刷新业务组件的数据。额度卡片、消息中心、待办
    this.refreshCompontBusinessData();
    this.sendComponentSectionSO();
    this.sendPO();
    this.registerNoticeEvent();
  }

  updateTheme = (theme) => {
    // 更新缓存中的主题颜色
    setLocalStorage(this.themeCacheKey, theme);
    this.setState({ currentTheme: theme });
  };

  updateUserTag = (customerTag, isLogin) => {
    // const { isLogin } = this.state;
    let currentUserTag = CONSTANTS.USER_TAG.DEFAULT;
    let isOverDue = false;
    if (lodashHas(customerTag, 'customerGroupTag') && customerTag.customerGroupTag === 'FDZ') {
      //   用户标签为奋斗者
      currentUserTag = CONSTANTS.USER_TAG.FDZ;
    }
    // 重度逾期版面不上2APP，后续2APP需要时去掉 this.channel.toUpperCase() === '0APP' 的渠道判断
    if (this.channel.toUpperCase() === '0APP' && lodashHas(customerTag, 'overDaylevel')) {
      switch (`${customerTag.overDaylevel}`) {
        case '1': {
          // 用户有逾期标签 且 标签值 overDaylevel = 1 代表当前用户轻度逾期, 修改用户标签为轻度逾期
          currentUserTag = CONSTANTS.USER_TAG.SLIGHT_OVERDUE;
          isOverDue = true;
          break;
        }
        case '2': {
          //   用户有逾期标签 且 标签值 overDaylevel = 2 代表当前用户重度逾期, 修改用户标签为重度逾期，切换到重度逾期版面
          currentUserTag = CONSTANTS.USER_TAG.SEVERE_OVERDUE;
          isOverDue = true;
          break;
        }
        default:
          break;
      }
    }
    this.setState({
      currentUserTag,
      isOverDue: !!isLogin && isOverDue, // 仅登陆时 isOverDue 才可能为true，否则会影响展位数据渲染
    });
    // 更新缓存中的标签数据
    setLocalStorage(this.currentUserTagCacheKey, currentUserTag);
  };

  onPullUpRefresh(cancelRefresh) {
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

  onPullRefresh(direction, cancelRefresh) {
    if (direction === DIRECTION.DOWN) {
      this.onPullDownRefreshTemp(cancelRefresh);
    } else if (direction === DIRECTION.UP) {
      this.onPullUpRefresh(cancelRefresh);
    }
  }

  // 拉到全屏程度的回调
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

      // this.hideTabBar();
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

  // 正在拉动回调
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

  // 下拉结束的回调
  onPullingEnd(direction, status) {
    // console.log('status=======', status);
    // console.log('this.isTabBarHide=======', this.isTabBarHide);
    // // 如果不是进入二楼就展示原生tab
    // if (status !== COMP_STATUS.CAN_FULL_SCREEN) {
    // console.log('展示tab~~~~~~~~~~~');
    // eventNotification(APP_NOTICE_EVENT.SHOW_TAB);
    // this.isTabBarHide = false;
    // this.showTabBar();
    // }
    this.hideTabBar();
  }

  // 正在滚动回调
  onScrolling() {
    // console.log(`onScrolling run ${offset}`);
  }

  onReset() {
    // 显示导航栏
    this.setState({
      isShowNavigateBar: true,
    });
    if (this.isPullingDown) {
      this.isPullingDown = false;
    }
  }

  // 拉到刷新程度的回调，自定义不能命名为onPullDownRefresh，否则会采用taro的下拉刷新
  async onPullDownRefreshTemp(cancelRefresh) {
    this.refreshData(true, CONSTANTS.REFRESH_PLACE.PULL_REFRESH);
    setTimeout(() => {
      cancelRefresh();
    }, 1000);
  }

  get enableNavigate() {
    const { pullDownNavigate = {} } = this.state;
    // eslint-disable-next-line max-len
    const { enableNavigate, targetUrl, imgUrl } = (pullDownNavigate && pullDownNavigate.dataObj) || {};
    return !!(
      enableNavigate === '1'
      && targetUrl
      && imgUrl
    );
  }

  get pullDownNavigateUrl() {
    const { pullDownNavigate } = this.state;
    const { targetUrl } = (pullDownNavigate && pullDownNavigate.dataObj) || {};
    return targetUrl;
  }

  get pullUpNavigateUrl() {
    const { pullUpNavigate } = this.state;
    const { contentList = [] } = (pullUpNavigate && pullUpNavigate.dataObj) || {};
    const itemList = typeof contentList === 'string' ? JSON.parse(contentList) : contentList;
    const { targetUrl = '' } = itemList.length && itemList[0];
    return targetUrl;
  }

  get showBigPromotion() {
    const { bigPromotionImage } = this.state;
    const { contentList } = (bigPromotionImage && bigPromotionImage.dataObj) || {};
    return !!(contentList
      && contentList.length
      && contentList[0].imgUrl
    );
  }

  get beaconContent() {
    const { customerTag = {}, customerTagPage = {} } = this.state;
    const beaconContent = {
      cus: {
        cstGrp: customerTag.customerGroupTag,
        optSubj: customerTag.operationSubjectTag,
        cstGrpPage: customerTagPage.customerGroupTagPage,
        optSubjPage: customerTagPage.operationSubjectTagPage,
      }
    };
    return beaconContent;
  }

  removeSk() {
    triggerFmp();
    setTimeout(() => {
      const skNode = document.getElementById('skapp');
      const parentNode = skNode && skNode.parentNode;
      const styleNode = parentNode && parentNode.firstElementChild;
      parentNode && parentNode.removeChild(skNode);
      parentNode && parentNode.removeChild(styleNode);
    });
  }

  async initStatusBarHeight() {
    console.log('initStatusBarHeight');
    if (isMuapp()) {
      console.log('initStatusBarHeight isMuapp');
      const height = await getStatusBarHeightTaroPx();
      console.log('statusBarHeight:', height);
      if (!height) {
        return Promise().reject();
      }
      this.setState({
        statusBarHeight: height
      });
    }
  }

  async autoRetry(func, retryTime = 5) {
    if (retryTime > 0) {
      try {
        await func();
      } catch (e) {
        // console.log('navigatebar Statusheight auto retry', retryTime);
        setTimeout(() => {
          this.autoRetry(func, retryTime - 1);
        }, 1000);
      }
    }
  }

  sendPO() {
    try {
      const { customerTag, customerTagPage } = this.state;
      dispatchTrackEvent({
        beaconId: `coscomponents.${CONSTANTS.PAGE_ID}`,
        event: EventTypes.PO,
        beaconContent: {
          cus: {
            cstGrp: customerTag.customerGroupTag,
            optSubj: customerTag.operationSubjectTag,
            cstGrpPage: customerTagPage.customerGroupTagPage,
            optSubjPage: customerTagPage.operationSubjectTagPage,
          },
        },
      });
    } catch (e) {
      console.log('页面曝光失败');
    }
  }

  refreshUserInfo = async (loginSuccess) => {
    let theme = this.currentDefaultTheme; // 无特殊情况使用默认主题
    const customerTagCache = JSON.parse(Madp.getStorageSync('__customerTag', 'LOCAL') || '{}');
    const userFunctionSwitchCache = Madp.getStorageSync(this.userFunctionSwitchCacheKey, 'LOCAL') || 'N';
    // 仅奋斗者用户做尊享主题开关的判断
    if (loginSuccess && customerTagCache.customerGroupTag === 'FDZ') {
      // 查询尊享开关状态
      const premiumSwitcherInfo = await this.checkUserFunction();
      setLocalStorage(this.userFunctionSwitchCacheKey, premiumSwitcherInfo && premiumSwitcherInfo.state);
      if (premiumSwitcherInfo && premiumSwitcherInfo.state === 'Y') {
        // 尊享开关打开时使用尊享主题 - 黑金
        theme = CONSTANTS.USER_THEME.BLACK;
      }
    } else if (customerTagCache.customerGroupTag === 'FDZ' && userFunctionSwitchCache && userFunctionSwitchCache === 'Y') {
      //  奋斗者用户缓存中的用户开关状态
      // 尊享开关打开时使用尊享主题 - 黑金
      theme = CONSTANTS.USER_THEME.BLACK;
    }
    this.updateTheme(theme); // 设置主题
  };

  async checkLogin() {
    try {
      const data = await getSessionInfo();
      console.log('[homepage] checkLogin loginSuccess', !!data.loginSuccess);
      this.setState({
        isLogin: !!data.loginSuccess,
        userId: data.userId,
        maskMobile: data.maskMobile,
        mobileValid: data.mobileValid,
        maskRealName: data.maskRealName,
        userInfo: data,
      });
      console.log('[homepage] loginSuccess', data.loginSuccess);
      return !!data.loginSuccess;
    } catch (e) {
      this.setState({
        isLogin: false,
      });
      return false;
    }
  }

  checkUserFunction = async () => {
    // 接口请求入参的个数与返回结果中列表数据的个数一致，即入参只有一个时，返回结果中最多只有一个数据，直接取返回结果的第一个即可
    const res = await queryUserFunction([CONSTANTS.USER_FUNCTINON_CODE.PREMIUM_VER_SWITCHER]);
    return res && res.userFunctionList && res.userFunctionList[0];
  };

  // 刷新时不会重新触发didmount,需要手动调用组件重新获取业务接口数据
  refreshCompontBusinessData(refreshPlace) {
    const { refreshBusinessData } = this.state;
    this.setState({
      refreshBusinessData: refreshBusinessData + 1,
      refreshPlace,
    });
  }

  isCanRefreshData(isForce) {
    if (isForce || this.needReAppearRefresh) {
      this.needReAppearRefresh = false;
      return true;
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

  hideTabBar() {
    eventNotification(APP_NOTICE_EVENT.HIDE_TAB);
    this.isTabBarHide = true;
  }

  showTabBar() {
    this.isTabBarHide && eventNotification(APP_NOTICE_EVENT.SHOW_TAB);
    this.isTabBarHide = false;
  }

  navigateTo(url) {
    Madp.navigateTo({
      url,
      useAppRouter: true,
    });
  }

  // 刷新渲染函数
  renderRefresh(direction, status) {
    if (direction === DIRECTION.DOWN) {
      return this.renderPullDownRefresh(status);
    } else if (direction === DIRECTION.UP) {
      return this.renderPullUpRefresh(status);
    }
  }

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

  // 全屏渲染函数
  renderFullScreen(direction, status) {
    if (direction === DIRECTION.DOWN) {
      const { pullDownNavigate = {} } = this.state;
      const { imgUrl } = pullDownNavigate.dataObj || {};
      // const isFullScreen = (status === COMP_STATUS.CAN_FULL_SCREEN_RELEASE);
      // const translateY = isFullScreen ? 0 : window.screen.height / 2;
      return this.enableNavigate && (
        <MUView
          className="pull-out-full-screen-img-box"
          style={{
            // transform: `translate(0px, ${translateY}px)`,
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

  shouldComponentUpdate(nextProp, nextState) {
    const { pageId: tempPageId } = nextState;
    return !!tempPageId;
  }

  render() {
    const {
      pullDownNavigate,
      pullUpNavigate,
      customerTag,
      aboutUs,
      dialog,
      isLogin,
      userId,
      userInfo,
      maskRealName,
      maskMobile,
      mobileValid,
      urgingPaymentDialog,
      ifHasLoan,
    } = this.state;
    if (aboutUs) {
      this.removeSk();
    }
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
    // 集中处理是否有贷的参数
    const data = ifHasLoan.dataObj || {};
    const E19contentList = data.contentList || {};
    const ifE19hasLoan = (E19contentList && E19contentList[0] && E19contentList[0].ifE19hasLoan) || {};

    const cusProps = {
      showBigPromotion: this.showBigPromotion,
      reAppearRefresh: this.reAppearRefresh,
      ifE19hasLoan,
      beaconContent: this.beaconContent,
    };

    const { enableRefresh } = (pullDownNavigate && pullDownNavigate.dataObj) || {};
    const { contentList = [] } = (pullUpNavigate && pullUpNavigate.dataObj) || {};
    const itemList = typeof contentList === 'string' ? JSON.parse(contentList) : contentList;
    const pullUpNavigateInfo = (itemList.length && itemList[0]) || {};
    const { targetUrl = '' } = pullUpNavigateInfo;
    // const isAdmin = window.parent !== window;

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
          <MUView className="app-home" style={{ display: customerTag ? 'block' : 'none' }}>
            <ContentBlock {...this.props} {...this.state} {...cusProps} />
            {/* 首页所有弹窗 弹窗优先级管理处理 */}
            {/* <DialogManage {...dialogManageProps} isLogin={isLogin} userInfo={userInfo} maskRealName={maskRealName} /> */}
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
