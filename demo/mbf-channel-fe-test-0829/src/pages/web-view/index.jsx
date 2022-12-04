import Taro, { Component } from '@tarojs/taro';
import { Url } from '@mu/madp-utils';
import { MUWebView } from '@mu/zui';

export default class WebviewPage extends Component {
  state = {
    type: '',
    src: ''
  }

  componentWillMount() {
    let jumpUrl = Url.getParam('jumpUrl') || Url.getParam('url');
    if (process.env.TARO_ENV !== 'weapp') { // 小程序下jumpUrl可能带有encoded的url参数，不额外encode
      jumpUrl = encodeURI(decodeURIComponent(jumpUrl));
    } else if (!/^(https?:)\/\//.test(jumpUrl)) { // 小程序下判断jumpUrl是否被encoded，避免重复decode
      jumpUrl = decodeURIComponent(jumpUrl);
    }

    const type = Url.getParam('type');
    this.setState({
      type,
      src: jumpUrl,
    });
  }

  render() {
    const { type = 'default', src = '' } = this.state;
    return (
      <MUWebView src={src} type={type} />
    );
  }
}
