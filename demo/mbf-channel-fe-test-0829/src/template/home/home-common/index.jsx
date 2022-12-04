/**
 * home-common 用于处理不同平台的公共逻辑
 *  1、展位数据请求
 *  2、checkLogin
 *  3、主题色控制
 *  4、sendPO
 *  5、refreshLedaData
*/
import Madp, { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { dispatchTrackEvent, EventTypes } from '@mu/madp-track';
import { injectState, refresh, setStaticState } from '@mu/leda';
import { triggerFmp } from '@mu/business-basic';
import lodashHas from 'lodash/has';
import { queryUserFunction, getSessionInfo, getUserInfo } from '../../api/home';
import * as CONSTANTS from '../../utils/constants';
import { setLocalStorage } from '../../utils/index';
import { getExtendInfoData } from '../../utils/homepage';
import STATE_KEYS from './stateKeys.config';
import staticDatas from './data';
import Blocks from '../blocks';

let loginInfo = {};
@injectState({
  debug: true,
  isOpenCache: true,
  isCacheCustomerTag: true,
  async pageId() {
    // 在获取展位数据之前先检查登陆
    await this.checkLogin();
    const { pageId: currPageid } = this.props.currChannelConfig || {};
    let pageId = '96ad9015-af98-47be-80f0-4ef599591a3c';
    if (currPageid) {
      pageId = currPageid;
    }
    return pageId;
  },
  stateKeys: STATE_KEYS,
  extendInfo: {
    data: getExtendInfoData(),
  },
})
export default class HomeCommon extends Component {
  // 是否展示大促图
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
      // 用户数据
      isLogin: false,
      userId: '',
      maskMobile: '',
      mobileValid: true,
      userInfo: null, // getUserInfo接口返回的数据
      // 组件刷新控制
      refreshBusinessData: 0,
      isOverDue: false,
      // partnerMaskMobile: ''
    };
    // eslint-disable-next-line no-unused-expressions
    props.instanceCommonRef && props.instanceCommonRef(this);
  }

  componentWillMount() {
    const { pageId } = this.props.currChannelConfig;
    const { staticDatas: staticDatasObj } = this.props;
    // 渲染内置静态数据
    setStaticState({
      pageId,
      datas: staticDatasObj || staticDatas.data,
      debug: true,
      context: this,
      stateKeys: STATE_KEYS,
    });
    // this.getPartnerMaskMobile();
  }

  async ledaDidMount(state) {
    const { getCommonDataFn = () => { } } = this.props;
    const { customerTag, businessHandleStatus } = this.state;
    const { loginSuccess } = loginInfo;
    // 刷新用户相关的数据
    // await this.refreshUserInfo();
    await this.refreshUserInfo(loginSuccess);
    this.updateUserTag(customerTag, businessHandleStatus, loginSuccess);
    getCommonDataFn({ ...state, ...this.state });
    this.sendPO();
    this.setState({
      isLogin: !!loginInfo.loginSuccess,
      userId: loginInfo.userId,
      maskMobile: loginInfo.maskMobile,
      mobileValid: loginInfo.mobileValid,
      maskRealName: loginInfo.maskRealName,
      userInfo: loginInfo,
    });
  }

  async ledaDidMountCallFn(state, loginStatus) {
    const { getCommonDataFn = () => { } } = this.props;
    // 刷新用户相关的数据
    await this.refreshUserInfo(loginStatus);
    getCommonDataFn({ ...state, ...this.state });
    this.updateUserTag(state.customerTag, state.businessHandleStatus, loginStatus);
    this.sendPO();
  }

  // leda 更新展位数据
  refreshLedaData = () => {
    const { pageId } = this.props.currChannelConfig || {};
    // 切换tab时需要更新微光卡数据
    refresh({
      pageId,
      saveMoneyCard: {
        refreshCount: this.refreshCount, // 通过refreshCount属性强制刷新展位数据
      },
    }, () => {
      const {
        customerTag,
        isLogin,
        businessHandleStatus // 业务办理状态
      } = this.state;
      this.updateUserTag(customerTag, businessHandleStatus, isLogin);
      this.refreshUserInfo(isLogin);
    });
    this.refreshCount += 1;
  }

  // 检查用户是否登录
  async checkLogin() {
    try {
      // const data = await getSessionInfo();
      // USER_BUSINESS_INFO:更新用户业务信息到会话属性;
      // USER_TAG_INFO:更新用户标签信息到会话属性中
      const res = await getUserInfo({
        updateUserInfoTypeList: ['USER_BUSINESS_INFO', 'USER_TAG_INFO']
      });
      const data = res.apiUserInfo || {};
      loginInfo = data;
      this.setState({
        isLogin: !!data.loginSuccess,
        userId: data.userId,
        maskMobile: data.maskMobile,
        mobileValid: data.mobileValid,
        maskRealName: data.maskRealName,
        userInfo: data,
      });
      return !!data.loginSuccess;
    } catch (e) {
      this.setState({ isLogin: false });
      return false;
    }
  }

  // async getPartnerMaskMobile() {
  //   const res = await getSessionInfo();
  //   this.setState({
  //     partnerMaskMobile: res.partnerMaskMobile
  //   });
  // }

  // 更新首页主题
  refreshUserInfo = async (isLogin) => {
    // 无特殊情况使用默认主题
    let theme = this.currentDefaultTheme;
    const customerTagCache = JSON.parse(Madp.getStorageSync('__customerTag', 'LOCAL') || '{}');
    const userFunctionSwitchCache = Madp.getStorageSync(this.userFunctionSwitchCacheKey, 'LOCAL') || 'N';
    // 仅奋斗者用户做尊享主题开关的判断
    if (isLogin && customerTagCache.customerGroupTag === 'FDZ') {
      // 查询尊享开关状态
      const premiumSwitcherInfo = await this.checkUserFunction();
      setLocalStorage(this.userFunctionSwitchCacheKey, premiumSwitcherInfo && premiumSwitcherInfo.state);
      if (premiumSwitcherInfo && premiumSwitcherInfo.state === 'Y') {
        // 尊享开关打开时使用尊享主题 - 黑金
        theme = CONSTANTS.USER_THEME.BLACK;
      }
    } else if (customerTagCache.customerGroupTag === 'FDZ' && userFunctionSwitchCache && userFunctionSwitchCache === 'Y') {
      // 未登录奋斗者用户使用缓存中的用户开关状态
      // 尊享开关打开时使用尊享主题 - 黑金
      theme = CONSTANTS.USER_THEME.BLACK;
    }

    // 更新缓存中的主题颜色
    setLocalStorage(this.themeCacheKey, theme);
    this.setState({ currentTheme: theme });
  };

  // 查询尊享开关状态
  checkUserFunction = async () => {
    // 接口请求入参的个数与返回结果中列表数据的个数一致，即入参只有一个时，返回结果中最多只有一个数据，直接取返回结果的第一个即可
    const res = await queryUserFunction([CONSTANTS.USER_FUNCTINON_CODE.PREMIUM_VER_SWITCHER]);
    return res && res.userFunctionList && res.userFunctionList[0];
  };

  /**
 * 参考接口文档：http://upaas.cfcmu.cn/#/iframe/http%3A%2F%2Fupaas.cfcmu.cn%2Fviews%2F%23%2Finternet-api%2Flist
 * businessHandleStatus
 *  VISITOR：游客模式
 *  NOT_LOGIN:未登录
 *  NOT_CREDIT：未授信
 *  APPLY_REFUSED：申请被拒（管控期内）
 *  HAS_CREDIT_NOT_LOAN：已授信（未首借）
 *  HAS_CREDIT_HAS_LOAN：已授信（已首借）
 *  LIGHT_OVERDUE：轻度逾期，
 *  SERIOUS_OVERDUE：重度逾期）
 *  default：不限
 */
  updateUserTag = (customerTag, businessHandleStatus, isLogin) => {
    let currentUserTag = CONSTANTS.USER_TAG.DEFAULT;
    let isOverDue = false;

    // 用户标签为奋斗者
    if (lodashHas(customerTag, 'customerGroupTag') && customerTag.customerGroupTag === 'FDZ') {
      currentUserTag = CONSTANTS.USER_TAG.FDZ;
    }

    if (businessHandleStatus) { // 业务办理状态
      switch (businessHandleStatus) {
        case 'LIGHT_OVERDUE': {
          // 用户有逾期标签 且 标签值 LIGHT_OVERDUE 代表当前用户轻度逾期, 修改用户标签为轻度逾期
          currentUserTag = CONSTANTS.USER_TAG.SLIGHT_OVERDUE;
          isOverDue = true;
          break;
        }
        case 'SERIOUS_OVERDUE': {
          //   用户有逾期标签 且 标签值 overDaylevel = 2 代表当前用户重度逾期, 修改用户标签为重度逾期，切换到重度逾期版面
          currentUserTag = CONSTANTS.USER_TAG.SEVERE_OVERDUE;
          isOverDue = true;
          break;
        }
        case 'NOT_LOGIN': {
          // 未登录但缓存中上次的用户标签为重度逾期，展示重度逾期版面
          const initUserTag = Madp.getStorageSync(this.currentUserTagCacheKey, 'LOCAL') || CONSTANTS.USER_TAG.DEFAULT;
          if (initUserTag.toLowerCase() === CONSTANTS.USER_TAG.SEVERE_OVERDUE) {
            currentUserTag = CONSTANTS.USER_TAG.SEVERE_OVERDUE;
            isOverDue = true;
          }
          break;
        }
        case 'VISITOR': {
          currentUserTag = CONSTANTS.USER_TAG.VISITOR;
          isOverDue = false;
          break;
        }
        default:
          break;
      }
    }
    // 更新缓存中的标签数据
    setLocalStorage(this.currentUserTagCacheKey, currentUserTag);
    this.setState({
      currentUserTag,
      isOverDue: !!isLogin && isOverDue, // 仅登陆时 isOverDue 才可能为true，否则会影响展位数据渲染
    });
  };

  // 页面曝光
  sendPO() {
    try {
      const { customerTag, customerTagPage } = this.state;
      const { pageId } = this.props.currChannelConfig;
      dispatchTrackEvent({
        beaconId: `coscomponents.${pageId}`,
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

  // 去除骨架屏
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

  render() {
    const { ifHasLoan = {}, customerTag, aboutUs } = this.state;
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
    if (aboutUs) {
      this.removeSk();
    }
    return (
      <MUView style={{ display: customerTag ? 'block' : 'none' }}>
        <Blocks {...this.state} {...this.props} {...cusProps} />
      </MUView>
    );
  }
}
