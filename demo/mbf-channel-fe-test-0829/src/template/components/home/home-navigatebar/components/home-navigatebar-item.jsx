import Madp, { Component } from '@mu/madp';
import { MUView, MUImage } from '@mu/zui';
import { isMuapp, debounce } from '@mu/madp-utils';
import { isReddotCanShow, reddotClickHandle } from '../../../../utils/reddot';
import './home-navigatebar-item.scss';

const SOTRE_KEY = 'gbl-basic-homeNaviagatebar';

/**
 * 通用元素
 *
 * @param item
 * {
 *  whiteImgUrl 白色图片
 *  blackImgUrl 黑色图片
 *  targetUrl 跳转链接
 *  reddotOpen 红点开关
 *  reddotStr 红点描述
 *  cycleType 红点循环类型
 *  cycleStartTime 周期循环类型开始时间
 *  cycleEndTime 周期循环类型结束时间
 * }
 * @param showBlackStyle {bool} 是否展示黑色风格
 * @param updateStyleFunc {func} 向父组件传递更新方法
 */
export default class HomeNavigatebarItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showReddot: false,
    };
    // 向父组件传递方法
    const { updateStyleFunc } = props;
    if (updateStyleFunc) {
      updateStyleFunc(this.updateStyle.bind(this));
    }

    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const { item, sendSO } = this.props;
    const beaconContent = {
      title: item.contentTitle,
      position: 0,
      contentId: item.hash,
    };
    sendSO(beaconContent);

    const showReddot = isReddotCanShow(SOTRE_KEY, this.props.item);
    this.setState({
      showReddot,
    });
  }

  onClick = debounce(() => {
    const { item } = this.props;
    // 处理埋点
    const { sendBeacon } = this.props;
    if (sendBeacon) {
      const beaconContent = {
        title: item.contentTitle,
        position: 0,
        contentId: item.hash,
      };
      sendBeacon(beaconContent);
    }

    const { showReddot } = this.state;
    showReddot && reddotClickHandle(SOTRE_KEY, item, true);
    this.setState({
      showReddot: false
    });

    if (item.targetUrl) {
      Madp.navigateTo({
        url: this.props.item.targetUrl,
        useAppRouter: isMuapp(),
      });
    }
  }, 1000, { leading: true, trailing: false });

  updateStyle(showBlackStyle) {
    const whiteImgRef = this.whiteImgRef && this.whiteImgRef.vnode && this.whiteImgRef.vnode.dom;
    const blackImgRef = this.blackImgRef && this.blackImgRef.vnode && this.blackImgRef.vnode.dom;
    if (showBlackStyle) { // 黑色风格
      whiteImgRef.style.display = 'none';
      blackImgRef.style.display = 'block';
    } else { // 白色风格
      blackImgRef.style.display = 'none';
      whiteImgRef.style.display = 'block';
    }
  }

  render() {
    const { showReddot } = this.state;
    const { showBlackStyle, item } = this.props;
    const { whiteImgUrl, blackImgUrl, reddotStr } = item || {};

    // iOS上UIWebView scroll在滚动期间不会触发js渲染, 只能用两张图片操作dom刷新
    const whiteImgStyle = showBlackStyle ? 'display: none' : 'display: block';
    const blackImgStyle = showBlackStyle ? 'display: block' : 'display: none';

    return (
      <MUView className="home-navigatebar-item" onClick={this.onClick}>
        <MUImage
          className="home-navigatebar-item__img"
          style={whiteImgStyle}
          alt=""
          imgProps={{ 'data-src': whiteImgUrl }}
          src={whiteImgUrl}
          ref={(ref) => { this.whiteImgRef = ref; }}
        />
        <MUImage
          className="home-navigatebar-item__img"
          style={blackImgStyle}
          alt=""
          imgProps={{ 'data-src': blackImgUrl }}
          src={blackImgUrl}
          ref={(ref) => { this.blackImgRef = ref; }}
        />
        {
          showReddot && (
            reddotStr ? (
              <MUView className="home-navigatebar-item__reddot">{reddotStr}</MUView>
            ) : (
              <MUView className="home-navigatebar-item__reddot circle" />
            )
          )
        }
      </MUView>
    );
  }
}
