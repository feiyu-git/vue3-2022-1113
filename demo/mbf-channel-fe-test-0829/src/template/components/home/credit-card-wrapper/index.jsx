/* eslint-disable no-console */
import Madp, { Component } from '@mu/madp';
import { apiHost, urlDomain } from '@mu/business-basic';
import { ShortLoanCard } from '@mu/short-loan-card';
import ShortLoanApi from '@mu/short-loan-card/short-loan-support';
import lodashHas from 'lodash/has';
import { MUView } from '@mu/zui';
import ThirdHome from '../third-home';
import CreditCard from '../credit-card';
import fetch from '../../../utils/fetch';
import { checkLocalShow } from '../../../utils/businessSwitch/index';
import needSwitchBusinessData from '../../../utils/businessSwitch/needSwitchBusinessData';
import themeColor from '../../../utils/homepage/constans';

import './index.scss';


// 申请状态
const APPLYSTEP = {
  0: ['Expire', '过期'],
  1: ['ApplyNone', '未申请'],
  2: ['ApplyContinue', '申请中断'],
  6: ['CreditOverdue', '被拒管控期'],
};

// 卡片类型
const CARDTYPE = {
  SHORTLOANCARD: 'ShortLoanCard',
  THIRDBACK: 'ThirdBack',
  CREDITCARD: 'CreditCard',
  LOADING: 'Loading'
};

const currentChannel = Madp.getChannel();


export default class CreditCardWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardType: CARDTYPE.LOADING, // 卡片类型
      refreshCreditCard: 0,
    };
    this.acctControlStatus = ''; // 管控状态
    this.limitInfoList = []; // 额度列表
    this.accountInfoList = null;
    this.fixedLimitE19 = -1;
    this.hasAvailableD01 = '';
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    // console.log('[homepage][credit-card-wrapper][initData]');
    this.initData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.refreshBusinessData !== this.props.refreshBusinessData || prevProps.isLogin !== this.props.isLogin) {
      this.initData(prevProps.isLogin !== this.props.isLogin);
    }
  }

  initData = async (isLoginChange = false) => {
    console.log('[homepage][credit-card-wrapper][initData]');
    const {
      isLogin,
    } = this.props;
    // 登录后选择卡片（三选一）
    // 当登录态变化时需要重置cardType状态；防止App登录后state状态仍为creditCard
    if (isLoginChange) {
      console.log('[homepage][credit-card-wrapper][initData] LoginChange');
      this.setState({
        cardType: CARDTYPE.LOADING,
      });
    }
    // 每次刷新前先重置数据
    this.resetData();
    if (isLogin) await this.queryAccountInfo();
    if (isLogin) {
      // 仅0APP渠道需要对额度卡片的展示内容做判断，其他渠道展示默认额度卡片
      this.chooseCard();
      console.log('[homepage][credit-card-wrapper]-已登录 选择卡片');
    } else {
      // 未登录、或其他渠道选择额度卡片
      this.chooseCreditCard();
      console.log('[homepage][credit-card-wrapper]-未登录 默认选择额度卡');
    }
  };

  // 选择卡片
  chooseCard = async () => {
    try {
      const creditGranted = await this.creditGranted();
      const { ifE19hasLoan, virtualLocalComponent } = this.props || {};
      console.log('[homepage][credit-card-wrapper][chooseCard]调用chooseCard 是否授信：', creditGranted);
      // 是否展示一口借
      if (creditGranted) {
        const shortLoanCardParam = await ShortLoanApi();
        const shortLoanCardOn = checkLocalShow(needSwitchBusinessData.SHORTLOANCARD, virtualLocalComponent);
        console.log('[homepage][credit-card-wrapper][chooseCard]一口借 参数信息', shortLoanCardParam);
        if (shortLoanCardOn && shortLoanCardParam && (shortLoanCardParam.showShortLoanFlag === 'Y')) {
          this.setState({
            cardType: CARDTYPE.SHORTLOANCARD,
            shortLoanCardParam,
          });
          return;
        }
      } else {
        // 是否展示第三方
        const thirdSatisfy = await this.thirdSatisfy();
        if (thirdSatisfy && ifE19hasLoan === 'noLoan' && Number(this.fixedLimitE19) > 0) {
          this.setState({
            cardType: CARDTYPE.THIRDBACK,
          });
          console.log('[homepage][credit-card-wrapper][chooseCard] 展示第三方');
          return;
        }
      }
      // 如不满足以上两个条件，展示额度卡片
      this.chooseCreditCard();
    } catch (e) {
      console.log('[homepage][credit-card-wrapper][chooseCard]报异常，展示额度卡片');
      this.chooseCreditCard();
    }
  }

  chooseCreditCard = async () => {
    console.log('[homepage][credit-card-wrapper][chooseCard] 展示标准额度卡片');
    // const { refreshCreditCard } = this.state;
    const data = this.creditCard && (await this.creditCard.init());
    this.props.onInitCreditCardAndRelated && this.props.onInitCreditCardAndRelated(data);
    this.setState({
      cardType: CARDTYPE.CREDITCARD,
      // refreshCreditCard: refreshCreditCard + 1,
    });
  }


  // 是否授信
  creditGranted = async () => {
    console.log('[homepage][credit-card-wrapper]调用creditGranted');
    // 管控状态正常&&有额度列表
    if (this.acctControlStatus === '1' && this.limitInfoList && this.limitInfoList.length > 0) {
      // 有D01额度 && Status = 'Y' && fixedLimt > 0
      const limitInfoListRes = this.limitInfoList.find((item) => item.limitType === 'D01' && item.status === 'Y' && Number(item.fixedLimit) > 0);
      // if (limitInfoListRes) return true;
      return !!limitInfoListRes;
    }
    return false;
  };

    // 是否满足第三方需求
    thirdSatisfy = async () => {
      const { IndexStore, ifE19hasLoan } = this.props || {};
      const { hasAvailableD01 } = IndexStore || {};
      const queryCoopCustTradeInfo = await this.queryCoopCustTradeInfo();
      const { tradeDetailInfoList } = queryCoopCustTradeInfo || {};
      const hasRecord = tradeDetailInfoList && tradeDetailInfoList.length >= 1;
      // （1）无可用D01+无贷+当日借呗渠道无支用记录
      if (hasAvailableD01 === 'noAvailableD01' && ifE19hasLoan === 'noLoan' && !hasRecord) {
        const res = await this.queryApplyInfo();
        const { applyStep } = res || {};
        const hasExpiredD01 = this.hasExpiredD01();
        // （2）满足以下五种状态：申请状态依次为（五种）:未申请、申请中断、被拒管控期外-6、 被拒七天超时-6、过期
        if ((applyStep && ['1', '2', '6'].indexOf(applyStep) > -1) || hasExpiredD01) {
          // 卡片状态埋点处理
          if (['1', '2', '6'].indexOf(applyStep) > -1) {
            this.setState({
              applyStep: APPLYSTEP[applyStep]
            });
          } else {
            this.setState({
              applyStep: APPLYSTEP[0]
            });
          }
          return true;
        }
      }
      return false;
    }


  // 申请状态是否过期
  hasExpiredD01 = () => {
    // const { limitInfoList } = this.state;
    const hasExpiredD01 = this.limitInfoList.find((item) => item.limitType === 'D01' && item.status === 'E');
    return !!hasExpiredD01;
  }


  // 获取申请状态
  queryApplyInfo = async () => {
    try {
      const res = await fetch(apiHost.mgp, {
        operationId: 'mucfc.apply.apply.applyInfo',
        data: {
          queryScene: '3'
        },
        autoLoading: false,
        autoToast: false,
      });
      return res;
    } catch (e) {
      console.log('[homepage][credit-card-wrapper][queryApplyInfo]applyInfo接口报错，不展示第三方回家', e);
    }
  };

  creditCardInit = () => {
    this.chooseCreditCard();
  };

  hasAvailableD01Action = () => {
    const hasAvailableD01RES = this.limitInfoList.find((item) => item.limitType === 'D01' && item.status === 'Y' && Number(item.availLimit) > 0);
    const hasD01 = this.limitInfoList.find((item) => item.limitType === 'D01');
    if (hasAvailableD01RES) {
      this.hasAvailableD01 = 'hasAvailableD01';
    } else if (hasD01) {
      this.hasAvailableD01 = 'noAvailableD01';
    }
  };

  fixedLimitE19Action() {
    const hasExpiredE19 = this.limitInfoList.find((item) => item.limitType === 'E19');
    if (hasExpiredE19) {
      this.fixedLimitE19 = hasExpiredE19.fixedLimit;
    } else {
      this.fixedLimitE19 = -1;
    }
  }

  resetData() {
    this.accountInfoList = null;
    this.fixedLimitE19 = -1;
    this.hasAvailableD01 = '';
  }

  // 获取额度
  queryAccountInfo = async () => {
    console.log('[homepage][credit-card-wrapper]调用额度接口额度接口额度接口');
    try {
      this.accountInfoList = await fetch(apiHost.mgp, {
        operationId: 'mucfc.loan.account.queryAccountInfo',
        data: {
          queryType: '01',
          busiType: 'XJ',
          limitFilterFlag: '01',
        },
        autoLoading: false,
        autoToast: false,
      });
      const {
        acctControlStatus, // 管控状态
        limitInfoList, // 额度列表
      } = (lodashHas(this, 'accountInfoList.accountInfoList') && this.accountInfoList.accountInfoList[0]) || {};
      this.limitInfoList = limitInfoList || [];
      this.acctControlStatus = acctControlStatus;
      this.hasAvailableD01Action();
      this.fixedLimitE19Action();
    } catch (e) {
      console.log('[homepage][credit-card-wrapper] queryAccountInfo接口报错，不展示第三方回家', e);
    }
  };

  // 当日借呗渠道有无支用记录
  queryCoopCustTradeInfo = async () => {
    console.log('调用额度接口额度接口额度接口');
    try {
      const res = await fetch(apiHost.mgp, {
        operationId: 'mucfc.coop.outer.queryCoopCustTradeInfo',
        data: {
          merchantNoList: ['40900007'],
          channelCodeList: ['3JBAPP'],
          transCodeList: ['TDN15'],
          pageSize: 1
        },
        autoLoading: false,
        autoToast: false,
      });
      const queryCoopCustTradeInfo = await res;
      return queryCoopCustTradeInfo;
    } catch (e) {
      console.log('queryCoopCustTradeInfo接口报错', e);
    }
  };

  thirdBackRender() {
    const {
      applyStep,
    } = this.state;
    return (
      <ThirdHome
        creditLimt={this.fixedLimitE19}
        applyStep={applyStep}
      />
    );
  }

  shortLoanCardRender() {
    const { shortLoanCardParam } = this.state;
    console.log('一口借主题色传参 themeColor[currentChannel]', themeColor[currentChannel]);
    return (
      <MUView className="shortLoan">
        <ShortLoanCard
          shortLoanCardParam={shortLoanCardParam}
          errCallback={this.creditCardInit}
          themeColor={themeColor[currentChannel]}
        />
      </MUView>
    );
  }

  onClick = () => {
    const visitorUrl = `${urlDomain}/0APP/loginregister/#/auth?mgpAuth=1&_needDialog=1`; // 游客版面隐私协议弹窗 加参数_needDialog=1
    Madp.navigateTo({
      url: visitorUrl,
    });
  }

  creditCardRender() {
    const {
      isLogin,
      beaconContent,
      isVisitor,
      // partnerMaskMobile,
      unicomeConfig,
      doLogin
    } = this.props;
    const { refreshCreditCard } = this.state;
    return (
      <MUView className="app-credit-card">
        {/* 游客版面点击额度卡需要弹隐私协议弹窗 使用遮罩层实现 */}
        {isVisitor && (<MUView className="visitorMask" onClick={this.onClick} />)}
        <CreditCard
          beaconContent={beaconContent}
          refreshBusinessData={refreshCreditCard}
          isLogin={isLogin}
          // partnerMaskMobile={partnerMaskMobile}
          ref={(e) => { this.creditCard = e; }}
          unicomeConfig={unicomeConfig}
          onLogin={doLogin}
        />
      </MUView>
    );
  }

  loadingRender() {
    return (
      <MUView className="card-with-btn-app homepage-loading">
        <MUView className="card-with-btn-app__main">
          <MUView className="content-left">
            <MUView className="content-left__title">现金可用额度(元)</MUView>
            <MUView className="content-left__loading" />
            <MUView className="content-left__desc">总额度...</MUView>
          </MUView>
          <MUView className="content-right homepage-loading__right"><MUView className="content-right__credit-crad-btn">加载中</MUView></MUView>
        </MUView>
      </MUView>
    );
  }

  renderCard(cardType) {
    if (cardType === CARDTYPE.THIRDBACK) {
      return <MUView>{this.thirdBackRender()}</MUView>;
    } else if (cardType === CARDTYPE.SHORTLOANCARD) {
      return <MUView>{this.shortLoanCardRender()}</MUView>;
    } else if (cardType === CARDTYPE.CREDITCARD) {
      return <MUView>{this.creditCardRender()}</MUView>;
    }
    return <MUView>{this.loadingRender()}</MUView>;
  }

  render() {
    const { cardType } = this.state;
    console.log('[homepage][credit-card-wrapper][render]cardType', cardType);
    return (
      <MUView>
        {this.renderCard(cardType)}
      </MUView>
    );
  }
}
