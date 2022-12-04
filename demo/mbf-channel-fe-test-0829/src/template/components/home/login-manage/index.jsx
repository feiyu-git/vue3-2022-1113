import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import LoginSimplify from '../../login-simplify';

export default class LoginManage extends Component {
  handLoginJump = () => {
    if (process.env.TARO_ENV === 'h5') {
      window.location.reload();
    }
  }

  getLoginSimplify() {
    if (process.env.TARO_ENV === 'h5') {
      const {
        loginSimplifyParams: {
          loginFlag, flag, isLogin, partnerMaskMobile
        } = {}
      } = this.props;
      return (loginFlag && (
        <LoginSimplify
          loginSuccess={isLogin}
          partnerMaskMobile={partnerMaskMobile}
          handLoginJump={this.handLoginJump}
          flag={flag}
        />
      ));
    }
    return <MUView />;
  }

  render() {
    const {
      loginSimplifyParams: {
        needLoginSimplify,
      } = {}
    } = this.props;
    return (
      <MUView>
        {needLoginSimplify && this.getLoginSimplify()}
      </MUView>
    );
  }
}
