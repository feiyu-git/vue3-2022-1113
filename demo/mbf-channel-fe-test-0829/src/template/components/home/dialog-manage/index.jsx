import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { Dialog, UrgingPaymentDialog } from '@mu/lui';
import HomePageDialog from '../home-page-dialog';

const URGINGPAYMENG = 'Urging_payment_dialog';
const HOMEPAGED = 'HomePage_dialog';
const DIALOG = 'dialog';
/**
   * 弹窗优先级
   * 逾期弹窗
   * 首页弹窗 homePageDialog(无效手机号、问卷)
   * 广告弹窗dialog
  */

const SEQUECE = {
  UrgingPaymentDialog: {
    current: URGINGPAYMENG,
    next: HOMEPAGED
  },
  HomePageDialog: {
    current: HOMEPAGED,
    next: DIALOG
  }
};

export default class DialogManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyFlag: ''
    };
    this.callBackFn1 = this.callBackFn1.bind(this);
  }


  callBackFn1(status) {
    this.setState({
      keyFlag: status
    });
  }

  render() {
    const {
      urgingPaymentDialog,
      dialog = {},
      userInfo,
      maskRealName,
      homePageDialog: {
        isLogin,
        userId,
        maskMobile,
        mobileValid
      } = {}
    } = this.props || {};
    const { keyFlag } = this.state;
    return (
      <MUView>
        {/* 催收弹窗 */}
        <UrgingPaymentDialog
          {...urgingPaymentDialog}
          isLogin={isLogin}
          userInfo={userInfo}
          maskRealName={maskRealName}
          onCallBackFn={this.callBackFn1}
          status={SEQUECE.UrgingPaymentDialog}
        />
        {/* 首页弹窗 */}
        {keyFlag === HOMEPAGED
          && (
            <HomePageDialog
              isLogin={isLogin}
              userId={userId}
              maskMobile={maskMobile}
              mobileValid={mobileValid}
              parent={this}
              onCallBackFn={this.callBackFn1}
              status={SEQUECE.HomePageDialog}
            />
          )}
        {/* 广告弹窗展位 */}
        {keyFlag === DIALOG && <Dialog {...dialog} />}
      </MUView>
    );
  }
}
