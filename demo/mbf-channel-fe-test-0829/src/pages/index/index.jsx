import Madp, { Component } from '@mu/madp';
import { MUView } from '@mu/zui';

class MyPage extends Component {
  constructor(props) {
    super(props);
    // 重定向到首页
    Madp.redirectTo({
      url: '/pages/homepage/index'
    });
    this.state = {};
  }

  render() {
    return (
      <MUView />
    );
  }
}

export default MyPage;
