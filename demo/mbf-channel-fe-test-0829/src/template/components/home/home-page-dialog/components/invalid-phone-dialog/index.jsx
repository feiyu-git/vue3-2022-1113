import Madp, { Component } from '@mu/madp';
import { MUView, MUModal } from '@mu/zui';
import { MUSafeSmsCodeHalf } from '@mu/safe-sms-code/components';
import { apiHost, urlDomain } from '@mu/business-basic';
import { isMuapp } from '@mu/madp-utils';
import { EventTypes, dispatchTrackEvent } from '@mu/madp-track';
import fetch from '@utils/fetch';
import './index.scss';

const MGP_URL = apiHost.mgp;
const channel = Madp.getChannel();

export default class InvalidPhoneDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRemindModalShow: false,
      isSmsModalShow: false,
    };
  }

  componentWillReceiveProps(props) {
    // eslint-disable-next-line react/destructuring-assignment
    if (props.isShow !== this.props.isShow) {
      this.setState({
        isRemindModalShow: props.isShow
      });
    }
  }

  // 去更换手机号
  toChangePhone = () => {
    const { parent } = this.props;
    dispatchTrackEvent({ event: EventTypes.BC, beaconId: 'invalidPhoneToChangePhone', target: parent });
    Madp.navigateTo({
      url: `${urlDomain}/${channel}/safecenter/#/memeber/reset-phone/select`,
      useAppRouter: isMuapp()
    });
  }

  // 发送短信验证码弹框
  openSmsModal = () => {
    const { parent } = this.props;
    dispatchTrackEvent({ event: EventTypes.BC, beaconId: 'invalidPhoneToSendSms', target: parent });
    this.setState({
      isRemindModalShow: false,
      isSmsModalShow: true,
    });
  }

  // 发送短信验证码
  handleSendSms = async () => {
    const { parent } = this.props;
    try {
      const data = await fetch(MGP_URL, {
        method: 'POST',
        operationId: 'mucfc.user.comSmsService.commonSendSms',
        data: {
          smsKey: 'UPDATE_CUSTINFO_SEND_KEY'
        }
      });
      dispatchTrackEvent({ event: EventTypes.EV, beaconId: 'SendSmsCodeSuccess', target: parent });
      return data;
    } catch (e) {
      dispatchTrackEvent({ event: EventTypes.EV, beaconId: 'SendSmsCodeFail', target: parent });
      return false;
    }
  }

  // 发送短信验证码弹框关闭，继续打开无效手机号弹框（产品要求）
  handleClose = () => {
    this.setState({
      isSmsModalShow: false,
      isRemindModalShow: true,
    });
  }

  onOk = async (token) => {
    try {
      // 更新客户手机号状态
      const data = await fetch(MGP_URL, {
        method: 'POST',
        operationId: 'mucfc.user.infoMaintain.modifyUserInfo',
        data: {
          sceneFuction: 'UPDATE_MOBILE_STATUS',
          token
        }
      });
      const { updateSuccess } = data;
      if (!updateSuccess) {
        Madp.showToast({
          title: '系统错误',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      Madp.showToast({
        title: '验证成功',
        icon: 'none',
        duration: 2000
      });
      const { parent } = this.props;
      dispatchTrackEvent({ event: EventTypes.EV, beaconId: 'verifySmsCodeSuccess', target: parent });
      this.setState({
        isSmsModalShow: false,
        isRemindModalShow: false,
      }, () => {
        this.handleDialogChange();
      });
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // 试校验失败情况
  onError = (errCode) => {
    console.log('无效手机号验证失败', errCode);
  }

  // 温馨提示和更换手机号都为false时传回给父组件
  handleDialogChange = () => {
    const { isSmsModalShow, isRemindModalShow } = this.state;
    const invaildPhoeStatus = isSmsModalShow && isRemindModalShow;
    this.props.onCallInvalidPhone(invaildPhoeStatus);
  }


  render() {
    const { isRemindModalShow, isSmsModalShow } = this.state;
    if (!isRemindModalShow && !isSmsModalShow) return null;
    const { maskMobile } = this.props;
    return (
      <MUView className="invalid-phone-dialog">
        <MUView className="invalid-phone-remind">
          <MUModal
            type="text"
            className="remind-dialog"
            closeOnClickOverlay={false}
            isOpened={isRemindModalShow}
            title="温馨提示"
            content={`我司识别到您的注册手机号${maskMobile}可能已过期，为不影响业务正常使用，建议您尽快更换。`}
            confirmText="手机号已停用，立即更换"
            cancelText="手机号使用中，无需更换"
            onConfirm={this.toChangePhone}
            onCancel={this.openSmsModal}
          />
        </MUView>
        <MUView className="invalid-phone-remind">
          <MUSafeSmsCodeHalf
            withLoginStatus
            isOpened={isSmsModalShow}
            scene="SCENE_VERIFY_PHONE_VALIDITY"
            replaceMsg="更换手机号"
            showToastOnOpSuccess={false}
            onClose={this.handleClose}
            onMobileReplaceClick={this.toChangePhone}
            onOk={this.onOk}
            onError={this.onError}
          />
        </MUView>
      </MUView>
    );
  }
}
