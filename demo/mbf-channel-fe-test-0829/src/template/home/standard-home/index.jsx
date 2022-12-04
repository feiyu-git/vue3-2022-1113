import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { login } from '../../utils/login/index'; // 注意Login是否需要重写？
import HomeCommon from '../home-common';
import './index.scss';

class StandardHome extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

   doLogin = async () => {
     if (this.props.onLogin) {
       this.props.onLogin();// 壳工程的Login
     } else {
       login(); // 注意Login是否需要重写？
     }
   }

   render() {
     return (
       <MUView className="standard-home">
         <HomeCommon
           {...this.props}
           {...this.state}
           doLogin={this.doLogin}
           ref={(e) => { this.instanceRef = e; }}
         />
       </MUView>
     );
   }
}

export default StandardHome;
