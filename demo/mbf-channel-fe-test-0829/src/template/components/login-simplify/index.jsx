import Madp, { Component } from '@mu/madp';
import { Url } from '@mu/madp-utils';
import { apiHost, urlDomain } from '@mu/business-basic';
import { MUView, MUContractChecker, MUAuthCode } from '@mu/zui';
import { track, EventTypes, dispatchTrackEvent } from '@mu/madp-track';
import { AgreementDrawer } from '@mu/agreement';
import { startGeetest } from '@mu/geestest';
import MUBioMetrics from '@mu/biometrics';
import { debounce } from 'lodash';
import MUSafeSms from '@mu/safe-sms-code/interfaces';
import { LoginArea, IdArea } from '@mu/login-popup';
import '@mu/agreement/dist/style/components/index.scss';
import { getSendSms, getSmsLogin } from '../../api/home';
import fetch from '../../utils/fetch';
import './index.scss';

const Channel = Madp.getChannel();

@track((props) => ({
  beaconId: props.beaconId,
  beaconContent: props.beaconContent,
}))

class LoginSimplify extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      contractNameString: '用户注册协议、招联金融隐私政策',
      contractInfo: [{ contractType: 'REGIST', text: '用户注册协议' }, { contractType: 'PRIVACY', text: '招联金融隐私政策' }],
      checkBoxChecked: false,
      contractList: [],  // 合同集合
      forceTime: 0, // 强制阅读时间
      isForceRead: false, // 是否强制阅读
      showForce: false, // 强制阅读弹窗
      onePassLogin: false,
      authCodeOpened: false,
      authCodeToken: '',
      partnerMaskMobile: '',
      isLoginOpen: false,
      isNeedOnePass: false,
      idAreaOpen: false,
      unicomCheckResult: false
    }
  }

  async componentDidMount() {
    const { partnerMaskMobile } = this.props;
    const unicomCheckResult = Url.getParam('unicomCheckResult') || false;
    dispatchTrackEvent({
      target: this,
      beaconId: 'LoginState',
      event: EventTypes.EV,
      beaconContent:{
        cus: {
          isAgreement: partnerMaskMobile ? true : false,
          isLogin: false
        }
      }
    });
    this.setState({ partnerMaskMobile, unicomCheckResult }, () => {
      this.initOnePassH5();
    });
  }

  componentWillReceiveProps(nextProps) {
    const { partnerMaskMobile, flag } = this.props;
    if (partnerMaskMobile !== nextProps.partnerMaskMobile) {
      this.setState({ partnerMaskMobile: nextProps.partnerMaskMobile })
    }

    if(flag !== nextProps.flag) {
      this.initOnePassH5();
    }
  }

  initOnePassH5() {
    const { onePassH5 } = MUBioMetrics;
    const { init } = onePassH5;
    Madp.showLoading({ title: '加载中...' });
    init((res) => {
      if (res.code === '1') {
        Madp.hideLoading();
        // alert('初始化本机校验成功')
        this.setState({
          onePassLogin: true
        }, () => {
          this.initPageDate();
        });
      } else {
        Madp.hideLoading();
        // alert(JSON.stringify(res.code + res.msg));
        this.initPageDate();
        console.log(res.code, res.msg);
      }
    });
  }

  initPageDate = () => {
    const { partnerMaskMobile, BtnDomStyle } = this.props;
    if (!BtnDomStyle) {
      if (!!partnerMaskMobile) {
        this.localVerification();
      } else {
        this.preJumpToApplyPage2();
      }
    } else {
      this.getContractConfig();
    }
  }

  async getContractInfo() {
    const paraDic = {
      scene: 'CONFIG',
      contractConfScene: 'LOGIN'
    }
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.contract.getContractInfo`, {
      autoLoading: false,
      data: {
        data: {
          ...paraDic
        }
      },
    });

    const { data } = await res.json();
    const { contractConfigInfoList = [] } = data;
    let contractName = [];
    contractConfigInfoList.forEach(item => { contractName.push(item.contractName); item.text = item.contractName; });
    return { contractName, contractConfigInfoList };
  }

  async getContractConfig() {
    const apiName = 'mucfc.content.channel.queryChannelParam';
    const params = { catalogueCodeList: ['1A'], paramTypeList: ['AGREEMENT'] };
    const res = await fetch(`${apiHost.mgp}?operationId=${apiName}`, {
      autoLoading: false,
      data: {
        data: {
          ...params
        }
      },
    });
    const {
      ret, data
    } = await res.json();
    const { contractName, contractConfigInfoList } = await this.getContractInfo();
    if (contractName && contractName.length > 0) {
      this.setState({ contractInfo: contractConfigInfoList, contractNameString: contractName.join('、') });
    }
    const list = data.channelAgreementPlanCfgDtoList[0].channelCatalogueAgreementDtoList;
    const displayItem = [{ contractCategory: 'REGIST', contractName: '注册协议' }, { contractCategory: 'PRIVACY', contractName: '隐私协议' }];
    let dataList = [];
    if (contractConfigInfoList && contractConfigInfoList.length > 0) {
      dataList = contractConfigInfoList;
    } else {
      dataList = displayItem;
    }
    const dataArr = this.filterAgreement(dataList, list);
    this.setState({
      contractList: dataArr
    });
  }

  filterAgreement(dataList, list) {
    let array = [];
    for (let i = 0; i < dataList.length; i++) {
      let contractType = dataList[i].contractCategory;
      for (let j = 0; j < list.length; j++) {
        if (contractType === list[j].contractType) {
          if (list[j].forceReadFlag === 'Y') {
            this.setState({
              isForceRead: true,
              forceTime: list[j].readDuration
            });

            let obj = {
              title: dataList[i].contractName,
              params: {
                contractType: dataList[i].contractCategory,
                contractCategory: dataList[i].contractCategory,
                contractEdition: dataList[i].contractEdition || '',
                contractVersion: dataList[i].contractVersion || ''
              },
            };
            array.push(obj);
          }
        }
      }
    }
    return array;
  }

  handlerCheckboxClick = () => {
    const { checkBoxChecked, isForceRead } = this.state;
    const { entrance } = this.props;
    dispatchTrackEvent({
      beaconId: `unicomuserfe.${entrance}.ContractChecker`,
      event: EventTypes.EV,
    });
    if (isForceRead) {
      this.setState({
        showForce: true
      });
    } else {
      this.setState({ checkBoxChecked: !checkBoxChecked });
    }
  }

  onFinishUnRead() {
    this.setState({
      showForce: false
    });
  }

  onFinishRead() {
    const { checkBoxChecked } = this.state;
    this.setState({ checkBoxChecked: !checkBoxChecked, isForceRead: false });
  }

  onContractClick = async (contract) => {
    const params = []
    Object.keys(contract).forEach((key) => { params.push(`${key}=${contract[key]}`) })
    const paramsStr = params.join('&')
    const url = `${urlDomain}/${Channel}/usercenter/#/contract/view?${paramsStr}&mapCode=63d6eaf6de4fa439`;
    Madp.navigateTo({ url })
  }

  // 本机校验
  localVerification = () => {
    const { onePassH5 } = MUBioMetrics;
    const { startOnePass } = onePassH5;
    const { unicomCheckResult, onePassLogin } = this.state;
    if(!onePassLogin) {
      if (unicomCheckResult) {
        const scene = 'UNICOM_SMS_LOGIN';
        const smsCode = false;
        this.authCodeOk(smsCode, scene);
      } else {
        this.setState({ authCodeOpened: true });
      }
      return
    }
    Madp.showLoading({ title: '加载中...' });
    startOnePass({
      scene: 'SCENE_LOGIN',
      onError: (errCode) => {
        Madp.hideLoading();
        // alert('本机校验验证发生异常 ' + JSON.stringify(errCode));
        if (unicomCheckResult) {
          const scene = 'UNICOM_SMS_LOGIN';
          const smsCode = false;
          this.authCodeOk(smsCode, scene);
        } else {
          this.setState({ authCodeOpened: true });
        }
      },
      onOk: (token) => {
        // alert('校验成功');
        Madp.hideLoading();
        this.dologin(token);
      }
    });
  }

  preJumpToApplyPage = (checkBoxChecked) => {
    if (!checkBoxChecked) {
      Madp.showToast({
        title: '请先阅读并同意相关协议',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    this.localVerification();
  }

  preJumpToApplyPage2 = () => {
    const { entrance } = this.props;
    dispatchTrackEvent({
      beaconId: `unicomuserfe.${entrance}.LoginArea`,
      event: EventTypes.SO,
    });
    this.setState({ isLoginOpen: true, isNeedOnePass: true })
  }

  dologin = async (token) => {
    const apiName = 'mucfc.user.login.login';
    const paraDic = { eventId: 'A70002', token, verifyScene: true };
    Madp.showLoading({ title: '正在登录...' });
    const res = await fetch(`${apiHost.mgp}?operationId=${apiName}`, {
      method: 'POST',
      autoLoading: false,
      data: {
        data: {
          ...paraDic
        }
      },
    });
    Madp.hideLoading();
    const {
      ret, data
    } = await res.json();
    // alert('登录成功' + JSON.stringify(data))
    if (ret === '0') {
      if (data.needVerify) {
        this.setState({ idAreaOpen: true })
      } else {
        this.idAreaSuccess('checkLogin');
      }
    }
  }

  sendSmsCodeFore = async () => {
    const params = {};
    const data = await MUSafeSms.init({ verifyType: 'SMP', scene: 'SCENE_LOGIN' });
    params.token = data.token;
    try {
      const geestestRet = await startGeetest({ scene: 'SCENE_LOGIN' });
      if (geestestRet && geestestRet.verifyResult === 1 && geestestRet.token) {
        params.geetestToken = geestestRet.token;
      }
      const { partnerMaskMobile } = this.state;
      params.mobile = partnerMaskMobile;
      params.scene = 'SCENE_LOGIN';
      this.sendSmsCodeAction(params);
    } catch (e) {
      alert(JSON.stringify(e));
    }
  }

  async sendSmsCodeAction(params) {
    await this.getSendSms(params);
    this.setState({ authCodeToken: params.token });
  }

  // 发送验证码
  async getSendSms(params) {
    try {
      await getSendSms(params);
      Madp.showToast({
        title: '验证码发送成功',
        icon: 'none',
        duration: 2000
      });
    } catch (e) {
      // this.setState({ authCodeOpened: false })
      console.error(JSON.stringify(e));
    }
  }

  // 发送验证码
  handleSendCode = () => {
    this.sendSmsCodeFore();
  }

  // 更换手机号
  handleMobileReplace = () => {
    const { entrance } = this.props;
    dispatchTrackEvent({
      beaconId: `unicomuserfe.${entrance}.LoginArea`,
      event: EventTypes.SO,
    });
    this.setState({ isNeedOnePass: true, isLoginOpen: true, authCodeOpened: false })
  }

  // 验证码验证
  authCodeOk = async (smsCode, scene) => {
    const { partnerMaskMobile } = this.state;
    const { authCodeToken } = this.state;
    const params = {
      mobile: partnerMaskMobile,
      verifyScene: true
    };
    if (authCodeToken) params.token = authCodeToken;
    if (smsCode) params.smsCode = smsCode;
    if (scene) params.scene = scene;
    const data = await this.getSmsLogin(params);
    if (data) {
      if (data.registered) {
        if (data.loginSuccess) {
          this.idAreaSuccess('codeLogin');
        }
        if (data.needVerify) {
          this.setState({ idAreaOpen: true })
        }
      } else {
        // alert('静默注册');
        this.registered();
      }
    }

  }

  getSmsLogin = async (params) => {
    try {
      const data = await getSmsLogin(params);
      return data;
    } catch (e) {
      const { entrance } = this.props;
      dispatchTrackEvent({
        beaconId: `unicomuserfe.${entrance}.ErrorPrompt`,
        event: EventTypes.SO,
      });
      console.error(JSON.stringify(e));
    }
  }

  // 静默注册
  async registered() {
    const apiName = 'mucfc.user.register.register';
    const {
      partnerMaskMobile
    } = this.state;
    const paraDic = {
      mobile: partnerMaskMobile
    };
    const res = await fetch(`${apiHost.mgp}?operationId=${apiName}`, {
      method: 'POST',
      autoLoading: false,
      data: {
        data: {
          ...paraDic
        }
      },
    });
    const { ret, data, errMsg } = await res.json();
    if (ret === '0') {
      const { loginSuccess } = data;
      if (loginSuccess) {
        this.idAreaSuccess('register');
      }
    } else {
      Madp.showToast({
        title: errMsg,
        icon: 'none',
        duration: 2000
      });
    }
  }

  idAreaSuccess = (scene) => {
    const { handLoginJump, entrance } = this.props;
    dispatchTrackEvent({
      beaconId: `unicomuserfe.${entrance}.LoginSuccess`,
      event: EventTypes.EV,
      beaconContent: { cus: {
        scene
      } }
    });
    this.setState({ idAreaOpen: false, isLoginOpen: false });
    setTimeout(() => {
      handLoginJump();
    }, 300);
  }

  render() {
    const { checkBoxChecked, contractNameString,
      contractInfo, contractList, showForce, forceTime,
      authCodeOpened, partnerMaskMobile, isLoginOpen, isNeedOnePass, onePassLogin, idAreaOpen } = this.state;
    const { loginSuccess, BtnDomStyle, entrance } = this.props;
    let hasMobileContent, noMobileContent;
    if (BtnDomStyle) {
      hasMobileContent = <MUView>
        <MUContractChecker
          className={`registerProtocolArea contract_${Channel}`}
          beaconId="ContractChecker"
          outerControl
          checkboxValue={checkBoxChecked}
          onCheckboxClick={(value) => this.handlerCheckboxClick(value)}
          contractText={contractNameString}
          contracts={contractInfo}
          onContractClick={(contract) => { this.onContractClick(contract); }}
        />
        <AgreementDrawer
          className={`agreement_${Channel}`}
          agreementViewProps={{
            type: contractList.length > 1 ? 1 : 2,
            list: contractList,
            current: 0,
          }}
          show={showForce}
          close={() => this.onFinishUnRead()}
          submit={() => this.onFinishRead()}
          totalCount={forceTime}
        />
        <MUView
          onClick={debounce(this.preJumpToApplyPage.bind(this, checkBoxChecked), 500)}
        >
          <BtnDomStyle />
        </MUView>
      </MUView>;
      noMobileContent = <MUView onClick={this.preJumpToApplyPage2}>
        <BtnDomStyle />
      </MUView>;
    }
    return (
      <MUView className='login-simplify'>
        {partnerMaskMobile && !loginSuccess ? hasMobileContent : noMobileContent}
        <MUView className='login-simplify__auth-code'>
          <MUAuthCode
            beaconId='AuthCode'
            isOpened={authCodeOpened}
            title='请输入短信验证码'
            replaceMsg='更换手机号'
            phoneCode={partnerMaskMobile}
            onSendCode={this.handleSendCode}
            onMobileReplace={this.handleMobileReplace}
            onOk={this.authCodeOk}
            onClose={() => this.setState({ authCodeOpened: false })}
          />
        </MUView>
        <LoginArea
          isOpen={isLoginOpen}
          needOnePass={isNeedOnePass}
          initOnePass={onePassLogin}
          needFocusInput={true}
          beaconContent={{
            cus: {
              entrance: entrance
            }
          }}
          onClose={() => {
            this.setState({ isLoginOpen: false });
          }}
          // redirectUrl={encodeURIComponent(getCurrentPageUrlWithArgs())}
          onSuccess={this.idAreaSuccess}
          goReal={() => {
            this.setState({ isLoginOpen: false })
            this.setState({ idAreaOpen: true })
          }}
          buttonText='确定'
        />
        <IdArea
          isOpen={idAreaOpen}
          onSuccess={this.idAreaSuccess}
          onClose={() => this.setState({ idAreaOpen: false })}
        />
      </MUView>
    )
  }
}

export default LoginSimplify;