/* eslint-disable no-console */
import Madp, { Component } from '@mu/madp';
import {
  CreditCard as CreditCardAPP,
} from '@mu/credit-card';
import { MUView } from '@mu/zui';
import { CARD_ACTION, CARD_STATUS, CARD_TYPE } from '@mu/credit-card/common';
import {
  isMuapp, Url, mixJump
} from '@mu/madp-utils';
import { dispatchTrackEvent, EventTypes } from '@mu/madp-track';
import { apiHost } from '@mu/business-basic';
import fetch from '../../../utils/fetch';
import { muApiDomain } from '../../../utils/url_config';
import ApplyFail from './component/applyFail';
import { currentChannel, currentMapCodeList } from '../../../../config/constants';
import { URL_CONFIG } from './utils/url';
import './index.scss';

// 额度卡片申请进度的颜色无法通过css覆盖，需要额度卡片自己处理，额度卡片提供了两种主题色
const imgTheme = {
  '0APP': 'Blue',
  '2APP': 'Red',
  '3CUAPP': 'Red',
};

const steps = Madp.getChannel().indexOf('ZFB') > -1 ? 2 : 3;

export default class CreditCard extends Component {
  get parentBeaconId() {
    return 'coscomponents.f8a1902a-2cb9-456d-a903-acf335a7f976';
  }

  creditProps = {
    busiType: 'XJ',
  };

  styleProps = {
    cardType: CARD_TYPE.APP,
    isShowApplyStep: true,
    imgTheme: imgTheme[currentChannel] || imgTheme['0APP'],
  }

  applyProductInfo = [{
    applyProductCode: 'XJXE001',
    applyMapcode: currentMapCodeList.apply || Url.getParam('mapCode'), // Todo 临时兼容小程序与支付宝生活号mapcode
  }];


  // app额度卡跳转
  appCustomerAciton = (cradActionType) => {
    console.log('【额度卡】APP点击跳转');
    const { unicomeConfig: { setUnicomLoginSim, needLoginSimplify, flag } = {} } = this.props;
    if (cradActionType === CARD_ACTION.ACTION_UNLOGIN && needLoginSimplify && setUnicomLoginSim) {
      return () => {
        setUnicomLoginSim({
          loginFlag: true,
          flag: !flag
        });
      };
    }
    if (cradActionType === CARD_ACTION.ACTION_OTHER_GO_CREDIT) {
      return () => {
        Madp.navigateTo({
          url: URL_CONFIG.CREDIT,
          useAppRouter: isMuapp(),
        });
      };
    } else if (cradActionType === CARD_ACTION.ACTION_CREDIT_LOAN) {
      return () => {
        Madp.navigateTo({
          url: URL_CONFIG.LOAN_BASE,
          useAppRouter: isMuapp(),
        });
      };
    }
  }

  // 小程序额度卡跳转
  miniCustomerAciton = (cradActionType) => {
    console.log('【额度卡】小程序点击跳转');
    if (cradActionType === CARD_ACTION.ACTION_UNLOGIN) {
      return () => {
        this.props.onLogin();
      };
    } else if (cradActionType === CARD_ACTION.ACTION_CREDIT_LOSE_CANCEL) {
      return () => {
        mixJump({
          // eslint-disable-next-line max-len
          url: URL_CONFIG.MINI_LOAN_BASE
        });
      };
    }
  }

  // 生活号跳转ab链接
  alipayCustomerAciton = (cradActionType) => {
    console.log('【额度卡】生活号点击跳转');
    console.log(cradActionType, 'cradActionType');
    if (cradActionType === CARD_ACTION.ACTION_CREDIT_LOAN) {
      return () => {
        Madp.navigateTo({
          url: URL_CONFIG.AB__LOAN_BASE,
          useAppRouter: isMuapp(),
        });
      };
    }
  }

  customerText = (cardStatus) => {
    if (cardStatus === CARD_STATUS.APPLY_FAILURE) {
      return {
        desc: '不要气馁，可尝试以下操作，将提升获取额度的机会哦'
      };
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      cardStatus: CARD_STATUS.UNLOGIN_NEW,
      applyData: {},
      contractConfigInfoList: [
        { contractType: 'REGIST', contractName: '用户注册协议' },
        { contractType: 'PRIVACY', contractName: '招联金融隐私协议' }
      ],
      // loginFlag: false,
      // flag: false
    };

    this.init = this.init.bind(this);
    this.startAutoRefresh = this.startAutoRefresh.bind(this);
    this.stopAutoRefresh = this.stopAutoRefresh.bind(this);
  }

  async componentDidMount() {
    const contract = await this.getContractInfo();
    const { contractConfigInfoList } = contract;
    if (contractConfigInfoList.length > 0) {
      this.setState({ contractConfigInfoList }, () => {
        this.init();
      });
    } else {
      this.init();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refreshBusinessData !== this.props.refreshBusinessData) {
      this.init();
    }
  }

  async init() {
    const { onCreditCardInit = () => { } } = this.props;
    try {
      console.log('[homepage][credit-card] 调用额度卡片 init 方法');
      const data = await this.creditCard.init();
      const {
        status,
        applyData,
      } = data;
      this.setState({
        cardStatus: status,
        applyData,
      });

      // 请求失败自动重新刷新
      if (status === CARD_STATUS.NET_ERROR) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
      // 回传结果给父组件
      onCreditCardInit(data);

      return data;
    } catch (e) {
      console.log('[homepage][credit-card] 调用额度卡片 init 失败', e);
    }
  }

  chooseCustomerAciton = (cradActionType) => {
    // Todo 怎么判断环境比较好？
    if (process.env.TARO_ENV !== 'h5') {
      return this.miniCustomerAciton(cradActionType);
    } else if (Madp.getChannel().indexOf('ZFB') > -1) {
      return this.alipayCustomerAciton(cradActionType);
    }
    return this.appCustomerAciton(cradActionType);
  }

  async getContractInfo() {
    const res = await fetch(apiHost.mgp, {
      method: 'POST',
      autoLoading: false,
      operationId: 'mucfc.user.contract.getContractInfo',
      data: {
        scene: 'CONFIG',
        contractConfScene: 'LOGIN'
      }
    });
    return res;
  }

  // 失败自动刷新机制
  startAutoRefresh() {
    if (this.autoRefresh) {
      return;
    }
    this.autoRefreshCount = 0;
    this.autoRefresh = setInterval(() => {
      if (this.autoRefreshCount > 18) {
        this.stopAutoRefresh();
      } else {
        this.autoRefreshCount += 1;
        this.init();
      }
    }, 5000);
  }

  stopAutoRefresh() {
    if (this.autoRefresh) {
      clearInterval(this.autoRefresh);
      this.autoRefresh = null;
    }
  }

  showApplyFail(cardStatus) {
    return cardStatus === CARD_STATUS.APPLY_FAILURE;
  }

  sendSO(beaconId, title) {
    const { beaconContent } = this.props;

    dispatchTrackEvent({
      beaconId: `${this.parentBeaconId}.CreditCard.${beaconId}`,
      event: EventTypes.SO,
      beaconContent: {
        ...beaconContent,
        cus: {
          ...beaconContent.cus,
          title
        }
      }
    });
  }

  sendEV(beaconId, title) {
    const { beaconContent } = this.props;

    dispatchTrackEvent({
      beaconId: `${this.parentBeaconId}.CreditCard.${beaconId}`,
      event: EventTypes.EV,
      beaconContent: {
        ...beaconContent,
        cus: {
          ...beaconContent.cus,
          title
        }
      }
    });
  }

  // handLoginJump = () => {
  //   window.location.reload();
  // }


  render() {
    const { beaconContent, unicomeConfig: { needLoginSimplify } = {} } = this.props;
    const { cardStatus, applyData, contractConfigInfoList } = this.state;
    const showApplyFail = this.showApplyFail(cardStatus);
    // const showTips = Madp.getChannel().indexOf('3CUAPP') > -1;

    // console.log(showTips, contractConfigInfoList, 'showTips');
    // console.log( 'applyProductInfo', this.applyProductInfo);

    return (
      <MUView className="credit-card">
        <CreditCardAPP
          ref={(e) => { this.creditCard = e; }}
          creditProps={this.creditProps}
          applyProductInfo={this.applyProductInfo}
          configProps={{ isCommonLoan: true }}
          styleProps={this.styleProps}
          customerAciton={this.chooseCustomerAciton}
          customerText={this.customerText}
          beaconId={this.parentBeaconId}
          beaconContent={beaconContent}
          loginStep={steps}
          contractList={contractConfigInfoList}
          showChildTips={needLoginSimplify}
        />
        {/* {showApplyFail && ( */}
        {/*  <ApplyFail */}
        {/*    reApplyDate={applyData.endControlDate} */}
        {/*    sendSO={this.sendSO.bind(this)} */}
        {/*    sendEV={this.sendEV.bind(this)} */}
        {/*  /> */}
        {/* )} */}
        {/* {loginFlag && (
          <LoginSimplify
            loginSuccess={isLogin}
            partnerMaskMobile={partnerMaskMobile}
            handLoginJump={this.handLoginJump}
            flag={flag}
          />
        )} */}
      </MUView>
    );
  }
}
