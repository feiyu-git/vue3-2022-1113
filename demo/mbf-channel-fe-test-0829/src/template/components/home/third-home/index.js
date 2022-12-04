/* eslint-disable no-console */
import Madp, { Component } from '@mu/madp';
import { MUView, MUButton, MUImage } from '@mu/zui';
import { urlDomain } from '@mu/business-basic';
import { dispatchTrackEvent, EventTypes } from '@mu/madp-track';
import { isMuapp } from '@mu/madp-utils';

import triangle from './imgs/triangle.png';
import './index.scss';


export default class ThirdCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    const { applyStep } = this.props || {};
    if (applyStep) {
      dispatchTrackEvent({
        target: this,
        beaconId: `homepage.thirdBackCard.${applyStep[0]}`,
        event: EventTypes.SO,
        beaconContent: { cus: { applyStep: `第三方卡片-${applyStep[1]}` } }
      });
    }
  }

  applyClick = () => {
    const { applyStep } = this.props || {};
    const currentChannel = Madp.getChannel();
    dispatchTrackEvent({
      target: this,
      beaconId: 'homepage.thirdBackClick',
      event: EventTypes.BC,
      beaconContent: { cus: { applyStep: `第三方卡片-${applyStep[1]}` } }
    });
    Madp.navigateTo({
      url: `${urlDomain}/${currentChannel}/apply/#/index?mapCode=c2cf09663197ca0b`,
      useAppRouter: isMuapp(),
    });
  }


  render() {
    const { creditLimt } = this.props;
    return (
      <MUView className="third-container">
        <MUView className="third-container__main">
          <MUView className="main-left">
            <MUView className="main-left__top">现金可用额度(元)</MUView>
            <MUView className="main-left__num">
              {creditLimt}
            </MUView>
            <MUView className="main-left__bottom">
              总额度
              <MUView className="main-left__bottom-num">{creditLimt}</MUView>
            </MUView>
          </MUView>
          <MUView className="main-right">
            <MUView className="main-right__cotain">
              <MUView className="main-right__text">激活后可借款</MUView>
              <MUImage
                className="main-right__img"
                src={triangle}
              />
              <MUButton
                className="main-right__btn"
                onClick={() => this.applyClick()}
              >
                去激活
              </MUButton>
            </MUView>
          </MUView>
        </MUView>
      </MUView>
    );
  }
}
