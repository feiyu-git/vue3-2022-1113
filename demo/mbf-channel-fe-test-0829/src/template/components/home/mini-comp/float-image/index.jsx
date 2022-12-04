import Madp from '@mu/madp';
import { isMuapp, debounce } from '@mu/madp-utils';
import { MUImage, MUView } from '@mu/zui';
import { isReddotCanShow, reddotClickHandle } from '../../../../utils/reddot';
import { sendEV, sendSO, sendContentSO } from '../../../../utils/dispatchTrackEventProxy';
import mixJump from '../../../../utils/mixJump/index';
import IMAGE_URL from '../imgs/index';

export default class FloatImage extends Madp.Component {
  constructor(props) {
    super(props);

    let radio = 0.5;
    this.data = {};
    const { windowWidth, windowHeight } = Madp.getSystemInfoSync();
    radio = windowWidth / 750;
    this.staticData = { // 初始位置
      topOriginBottom: windowHeight - (250 + 400) * radio,
      bottomOriginBottom: 250 * radio,
    };
    this.data = { // 拖动数据 以750px为基准缩放
      oldTouchY: 0,
      currentBottom: this.staticData.bottomOriginBottom, // touchmove中实时更新的bottom
      minBottom: 200 * radio,
      maxBottom: windowHeight - 350 * radio,
    };

    this.state = {
      show: false,
      showClose: false,
      dataList: [],
      showIndex: -1,
      renderCurrentBottom: this.staticData.bottomOriginBottom,
    };

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    this.initData(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.initData(newProps);
  }

  initData(props) {
    const { showClose, contentList = [] } = props.dataObj || {};
    const dataList = contentList;
    const index = this.getShowItemIndex(dataList);
    const show = index > -1;
    // 判断初始位置
    // 就算显示的是同一个元素 也有可能存在元素位置改变 新leda图片可以修改上下位置 所以这里调整
    // if (show && this.state.showIndex !== index) {
    if (show) {
      const { topOriginBottom, bottomOriginBottom } = this.staticData;
      const item = dataList[index];
      const orginBottom = item.position === '1' ? topOriginBottom : bottomOriginBottom;
      this.data.currentBottom = orginBottom;
      this.setState({
        renderCurrentBottom: orginBottom
      });
    }

    this.setState({
      showClose,
      dataList,
      showIndex: index,
      show,
    }, () => {
      this.sendComponentSO();
    });
  }

  sendComponentSO() {
    const { show, showClose } = this.state;
    if (show) {
      sendSO(this.props);
      showClose && sendContentSO(this.props, {
        title: '关闭',
        position: -1,
        cusContentId: 'CloseBtn',
      });
    }
  }

  onClick = debounce((item) => {
    const { showIndex } = this.state;
    const beaconContent = {
      title: item.contentTitle,
      position: showIndex,
      contentId: item.hash,
    };
    sendEV(this.props, beaconContent);

    if (item.targetUrl) {
      mixJump({
        url: item.targetUrl,
        useAppRouter: isMuapp(),
      });
    }
  }, 1000, { leading: true, trailing: false });

  onClose(item) {
    // 处理埋点
    const beaconContent = {
      title: '关闭',
      position: -1,
      contentId: 'CloseBtn',
    };
    sendEV(this.props, beaconContent);

    reddotClickHandle('gbl-basic-floatImage', item, true);
    this.setState({
      show: false,
    });
  }

  onTouchStart(event) {
    const touch = event.targetTouches[0];
    if (touch.clientY < 0) { // 手指已经超出页面有效范围
      return;
    }
    this.data.oldTouchY = touch.clientY; // 手机上screenY与pageY相等,使用有问题,物体移动跟不上手指移动
  }

  onTouchMove(event) {
    const {
      oldTouchY, currentBottom, minBottom, maxBottom
    } = this.data;
    const touch = event.targetTouches[0];
    if (touch.clientY < 0) { // 手指已经超出有效范围
      return;
    }
    const indexY = oldTouchY - touch.clientY;
    let newBottom = currentBottom + indexY;
    newBottom = newBottom > maxBottom ? maxBottom : newBottom;
    newBottom = newBottom < minBottom ? minBottom : newBottom;
    // 更新样式
    this.data.currentBottom = newBottom;
    this.setState({
      renderCurrentBottom: newBottom
    });
    this.data.oldTouchY = touch.clientY;

    this.preventBubble(event);
  }

  preventBubble(event) {
    // 阻止页面滚动
    event.preventDefault();
    // 阻止触发上下拉刷新
    if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  // 获取第一个能展示的元素
  getShowItemIndex(dataList) {
    for (let i = 0; i < dataList.length; i += 1) {
      if (isReddotCanShow('gbl-basic-floatImage', dataList[i]) && dataList[i].imgUrl) {
        return i;
      }
    }
    return -1;
  }

  render() {
    const {
      show, showClose, showIndex, dataList, renderCurrentBottom,
    } = this.state;
    const { compClassName, id } = this.props;
    if (!show) {
      return null;
    }

    const item = dataList[showIndex];

    return (
      <MUView
        className={[
          compClassName,
          'float-image'
        ].join(' ')}
        dataId={id}
        style={{ bottom: `${renderCurrentBottom}px` }}
        ontouchstart={this.onTouchStart}
        ontouchmove={this.onTouchMove}
      >
        <MUImage
          className="float-image__content-img"
          src={item.imgUrl}
          alt=""
          onClick={() => this.onClick(item)}
        />
        {showClose === '1' && (
          <MUView className="float-image__close-icon">
            <MUImage
              className="float-image__close-icon__img"
              src={IMAGE_URL.float_close_icon}
              alt=""
              onClick={() => this.onClose(item)}
            />
          </MUView>
        )}
      </MUView>
    );
  }
}
