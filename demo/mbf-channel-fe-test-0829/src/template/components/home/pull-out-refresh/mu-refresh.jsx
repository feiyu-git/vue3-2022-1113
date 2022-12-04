import { Component } from '@mu/madp';
import PropTypes from 'prop-types';
import { pxTransform } from '@global/utils';
import logo1 from './imgs/refresh_logo_01.png';
import logo2 from './imgs/refresh_logo_02.png';
import logo3 from './imgs/refresh_logo_03.png';
import logo4 from './imgs/refresh_logo_04.png';
import logo5 from './imgs/refresh_logo_05.png';
import logo6 from './imgs/refresh_logo_06.png';
import logo7 from './imgs/refresh_logo_07.png';
import logo8 from './imgs/refresh_logo_08.png';
import logo9 from './imgs/refresh_logo_09.png';

const REFRESH_LOGOS = [logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9];

const REFRESH_STATUS = {
  CAN_NOT_REFRESH: 'cannotRefresh',
  CAN_REFRESH: 'canRefresh',
  CAN_REFRESH_RELEASE: 'canRefreshRelease',
  CAN_FULL_SCREEN: 'canFullScreen',
  CAN_FULL_SCREEN_RELEASE: 'canFullScreenRelease',
};

export const REFRESH_STYLE = {
  LOGO: 1,
  TEXT: 2,
};

export default class MuRefresh extends Component {
  static defaultProps = {
    status: REFRESH_STATUS.CAN_NOT_REFRESH,
    notRefreshText: '下拉刷新',
    canRefreshText: '松手刷新',
    refreshReleaseText: '正在刷新',
    canFullScreenText: '松手进入二楼',
    fullScreenReleaseText: '正在进入二楼',
    refreshStyle: REFRESH_STYLE.LOGO,
  };

  static propTypes = {
    status: PropTypes.oneOf([
      REFRESH_STATUS.CAN_NOT_REFRESH,
      REFRESH_STATUS.CAN_REFRESH,
      REFRESH_STATUS.CAN_REFRESH_RELEASE,
      REFRESH_STATUS.CAN_FULL_SCREEN,
      REFRESH_STATUS.CAN_FULL_SCREEN_RELEASE,
    ]),
    refreshStyle: PropTypes.oneOf([
      REFRESH_STYLE.LOGO,
      REFRESH_STYLE.TEXT,
    ]),
  };

  constructor(props) {
    super(props);
    this.state = {
      logoIndex: 0,
    };
    this.timer = null;
  }

  render() {
    const {
      status,
      notRefreshText,
      canRefreshText,
      refreshReleaseText,
      canFullScreenText,
      fullScreenReleaseText,
      // imgUrl
    } = this.props;
    const { logoIndex } = this.state;
    let text;
    let showRefresh = true;
    switch (status) {
      case REFRESH_STATUS.CAN_NOT_REFRESH:
        text = notRefreshText;
        break;
      case REFRESH_STATUS.CAN_REFRESH:
        text = canRefreshText;
        break;
      case REFRESH_STATUS.CAN_REFRESH_RELEASE:
        text = refreshReleaseText;
        this.startAnim();
        break;
      case REFRESH_STATUS.CAN_FULL_SCREEN:
        text = canFullScreenText;
        break;
      case REFRESH_STATUS.CAN_FULL_SCREEN_RELEASE:
        showRefresh = false;
        text = fullScreenReleaseText;
        break;
      default:
        this.stopAnim();
        text = notRefreshText;
    }
    const logo = REFRESH_LOGOS[logoIndex];
    return showRefresh && (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: pxTransform(90),
        paddingLeft: pxTransform(20),
        paddingRight: pxTransform(20),
        marginBottom: pxTransform(15),
        // backgroundImage: `url(${imgUrl})`,
        // backgroundSize: '100vw 100vh',
        // backgroundPosition: 'center bottom'
      }}
      >
        {this.props.refreshStyle === REFRESH_STYLE.LOGO && (
          <div style={{
            height: pxTransform(80),
            width: pxTransform(80),
          }}
          >
            <img
              style={{
                height: pxTransform(80),
                marginLeft: pxTransform(-40),
              }}
              src={logo}
              alt=""
            />
          </div>
        )}
        {
          this.props.refreshStyle === REFRESH_STYLE.TEXT && (
            <div style={{
              fontSize: pxTransform(30),
              color: '#ffffff',
            }}
            >
              {text}
            </div>
          )
        }
      </div>
    );
  }

  startAnim() {
    if (!this.timer) {
      this.timer = setInterval(() => {
        const { logoIndex } = this.state;
        const nextIndex = (logoIndex + 1) % REFRESH_LOGOS.length;
        this.setState({ logoIndex: nextIndex });
      }, 200);
    }
  }

  stopAnim() {
    if (this.timer) {
      this.setState({ logoIndex: 0 });
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
