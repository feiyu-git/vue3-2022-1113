import Madp, { Component } from '@mu/madp';
import { isMuapp, debounce } from '@mu/madp-utils';
import { MUView, MUIcon } from '@mu/zui';
import { disableTrackAlert } from '@mu/madp-track';
import { sendEV } from '../../../utils/dispatchTrackEventProxy';
import './index.scss';

disableTrackAlert(); // 开发组件，假如组件包含有zui组件，由于zui组件集成了埋点，所有得禁止掉埋点提示弹窗

export default class Sologan extends Component {
  async componentDidMount() {
    // sendSectionSO(this.props.data);
  }

  onClick = debounce(() => {
    const beaconContent = {
      title: this.props.dataObj.boothTitle,
      position: -1,
      contentId: 'TextBtn',
    };
    sendEV(this.props, beaconContent);
    if (this.props.dataObj.targetUrl) {
      Madp.navigateTo({ url: this.props.dataObj.targetUrl, useAppRouter: isMuapp() });
    }
  }, 1000, { leading: true, trailing: false });

  render() {
    const {
      dataObj,
      show,
    } = this.props || {};
    if (!show || !dataObj) {
      return null;
    }
    const {
      title,
      subTitle,
      textColor = '#FFFFFF',
      targetUrl,
    } = dataObj || {};

    if (!title && !subTitle) {
      return null;
    }
    return (
      <MUView
        className="sologan"
        onClick={this.onClick.bind(this)}
      >
        <MUView className="title" style={{ color: textColor }}>
          {title}
        </MUView>
        <MUView className="subTitle" style={{ color: textColor }}>
          {subTitle}
        </MUView>
        {targetUrl && <MUIcon className="icon" value="caret-up" size={11} color={textColor} />}
      </MUView>
    );
  }
}
