import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { debounce } from '@mu/madp-utils';
import { login } from '../../utils/login/index'; // 注意Login是否需要重写？
import HomeCommon from '../home-common';
import './index.scss';

class StandardHome extends Component {
  constructor(props) {
    super(props);
    this.commonRef = null;
    this.state = {
      refreshBusinessData: 0
    };
    this.data = {
      firstShow: true
    };
    props.instanceRef && props.instanceRef(this);
    this.refreshCompontBusinessData = this.refreshCompontBusinessData.bind(this);
  }

  doLogin = async () => {
    if (this.props.onLogin) {
      this.props.onLogin();// 壳工程的Login
    } else {
      login(); // 注意Login是否需要重写？
    }
  }

  // 刷新页面数据
  refreshData = debounce(
    async () => {
      await this.commonRef.checkLogin();
      this.refreshCompontBusinessData();
      // leda 更新展位数据，刷新时需要刷新权益卡数据
      this.commonRef.refreshLedaData();
    },
    1000,
    { leading: true, trailing: false }
  );

  // 刷新时不会重新触发didmount,需要手动调用组件重新获取业务接口数据
  refreshCompontBusinessData = () => {
    const { refreshBusinessData } = this.state;
    this.setState({
      refreshBusinessData: refreshBusinessData + 1,
    });
  }

  // 页面登录态改变时执行刷新
  async componentDidShow() {
    this.refreshCompontBusinessData(); // 在二级页返回时刷新八宫格与尊享服务
    if (this.data.firstShow) {
      // 首次在didmount阶段调用
      this.data.firstShow = false;
    } else {
      this.refreshData();
    }
  }

  render() {
    return (
      <MUView className="mini-home">
        <HomeCommon
          {...this.props}
          doLogin={this.doLogin}
          instanceCommonRef={(e) => { this.commonRef = e; }}
        />
      </MUView>
    );
  }
}

export default StandardHome;
