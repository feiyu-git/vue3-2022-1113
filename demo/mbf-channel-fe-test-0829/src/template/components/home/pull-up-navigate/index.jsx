import { Component } from '@mu/madp';
import { MUImage, MUView } from '@mu/zui';
import pullUpImage from './img/pull_up.png';
import './index.scss';

/**
 * 下拉跳转组件
 */
export default class PullUpNavigate extends Component {
  render() {
    const {
      title, keyColor,
    } = this.props;

    return title && (
      <MUView className="pull-up-navigate">
        <MUView className="pull-up-text-wrapper" style={{ color: keyColor || '#CACACA' }}>
          <MUImage className="pull-up-image" src={pullUpImage} imgProps={{ 'data-src': pullUpImage }} />
          <MUView className="pull-up-text">{title}</MUView>
        </MUView>
      </MUView>
    );
  }
}
