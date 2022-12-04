import { Component } from '@mu/madp';
import { debounce } from '@mu/madp-utils';
import classNames from 'classnames';
import StaticRenderer from './static-renderer';
import './pull-out-refresh.scss';

const isWebView = typeof navigator !== 'undefined' && /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
export const DIRECTION = {
  DOWN: 'down',
  UP: 'up',
};
export const COMP_STATUS = {
  DEACTIVATE: 'deactivate',
  ACTIVATE: 'activate',
  FINISH: 'finish',
  AUTO_PULL: 'autoPull',
  CAN_NOT_REFRESH: 'cannotRefresh',
  CAN_REFRESH: 'canRefresh',
  CAN_REFRESH_RELEASE: 'canRefreshRelease',
  CAN_FULL_SCREEN: 'canFullScreen',
  CAN_FULL_SCREEN_RELEASE: 'canFullScreenRelease',
};
const TRANSITION_DURATION = 300;
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    // eslint-disable-next-line getter-return
    get() {
      supportsPassive = true;
    },
  });
  // @ts-ignore
  window.addEventListener('test', null, opts);
} catch (e) {
  console.error(e);
}
const willPreventDefault = supportsPassive ? { passive: false } : false;
const ANIMATION_NAME = 'auto-pull-down-animation';
export default class PullOutRefresh extends Component {
  // https://github.com/yiminghe/zscroller/blob/2d97973287135745818a0537712235a39a6a62a1/src/Scroller.js#L355
  constructor(pros) {
    super(pros);
    this.contentRef = null;
    this._to = {
      touchstart: () => {
      },
      touchmove: () => {
      },
      touchend: () => {
      },
      touchcancel: () => {
      },
    };
    this._ScreenY = 0;
    this._startScreenY = 0;
    this._lastScreenY = 0;
    this._isMounted = false;
    this.shouldUpdateChildren = false;
    this.scrollContainer = document.querySelector('.taro-tabbar__panel') || document.body;
    this.touchElement = null;
    this.direction = '';
    this.scrollDireciton = '';
    this.state = {
      currentState: COMP_STATUS.DEACTIVATE,
      dragOnEdge: false, // 触发滑动状态,并且未松手
      animationClassName: ''
    };
    this.uuid = '_BAIDNHHB';
  }

  shouldComponentUpdate(nextProps) {
    /* eslint-disable-next-line */
    this.shouldUpdateChildren = this.props.children !== nextProps.children;
    return true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props || prevProps.refreshing === this.props.refreshing) {
      return;
    }
    // triggerPullDownRefresh 需要尽可能减少 setState 次数
    this.triggerPullDownRefresh();
  }

  componentDidMount() {
    this.init();
    this.triggerPullDownRefresh();
    this._isMounted = true;
    this.contentRef.addEventListener('animationstart', this.animationstartCallback, false);
    this.contentRef.addEventListener('animationend', this.animationendCallback, false);
    // setInterval(() => {
    //   console.log(this.state.currentState, this.scrollDireciton, this.direction);
    // }, 200);
  }

  componentWillUnmount() {
    this.contentRef.addEventListener('animationstart', this.animationstartCallback, false);
    this.contentRef.addEventListener('animationend', this.animationendCallback, false);
  }

  render() {
    const { className, children } = this.props;
    const {
      dragOnEdge, currentState, animationClassName
    } = this.state;
    const cls = `pull-out-refresh-content pull-out-refresh-${this.direction}`;
    const cla = classNames(cls, className, !dragOnEdge && 'pull-out-refresh-transition', animationClassName && `${animationClassName}-node`);
    return (
      <div
        className={classNames('pull-out-refresh-content-wrapper', `pull-out-refresh-${this.uuid}`)}
      >
        <div
          className={cla}
          ref={(el) => {
            this.contentRef = el;
          }}
        >
          {this.getPullOutDom(DIRECTION.DOWN)}
          <div
            style={{
              display: currentState !== COMP_STATUS.CAN_FULL_SCREEN_RELEASE
                ? 'block' : 'none'
            }}
          >
            <StaticRenderer
              shouldUpdate={this.shouldUpdateChildren}
              render={() => children}
            />
          </div>
          {this.getPullOutDom(DIRECTION.UP)}
        </div>
      </div>
    );
  }

  // 自动下拉动画开始回调
  animationstartCallback=(e) => {
    const { animationClassName } = this.state;
    if (e.animationName === animationClassName) {
      const { showAutoAnimationStartCallback: callback } = this.props;
      if (callback && typeof callback === 'function') {
        callback(this.direction);
      }
    }
  };

  // 自动下拉动画结束回调
  animationendCallback=(e) => {
    const { animationClassName } = this.state;
    if (e.animationName === animationClassName) {
      this.setState({
        currentState: COMP_STATUS.DEACTIVATE,
        animationClassName: ''
      }, () => {
        const { showAutoAnimationEndCallback: callback } = this.props;
        if (callback && typeof callback === 'function') {
          callback(this.direction);
        }
      });
    }
  };

  // 播放自动下拉动画
  startAnimation=(direction) => {
    const { currentState } = this.state;
    if (currentState === COMP_STATUS.AUTO_PULL) return;
    if (!direction || (direction !== DIRECTION.DOWN && direction !== DIRECTION.UP)) return;
    this.direction = direction;
    this.setState({
      currentState: COMP_STATUS.AUTO_PULL,
      animationClassName: `auto-pull-${this.direction}-animation`
    });
  }

  // 在这里统一处理方向
  get pullDamping() {
    const { pullDownDamping, pullUpDamping } = this.props;
    return this.direction === DIRECTION.DOWN ? pullDownDamping : pullUpDamping;
  }

  get pullRefreshDistance() {
    const { pullDownRefreshDistance, pullUpRefreshDistance } = this.props;
    return this.direction === DIRECTION.DOWN ? pullDownRefreshDistance : pullUpRefreshDistance;
  }

  get pullFullScreenDistance() {
    const { pullDownFullScreenDistance, pullUpFullScreenDistance } = this.props;
    return this.direction === DIRECTION.DOWN
      ? pullDownFullScreenDistance : pullUpFullScreenDistance;
  }

  // 获取拉出来部分的dom
  getPullOutDom(directionWhenShow) {
    if (this.direction !== directionWhenShow) return;
    const { currentState } = this.state;
    const { renderFullScreen, renderRefresh } = this.props;
    // if (currentState === COMP_STATUS.DEACTIVATE) return;
    const isShowFull = currentState === COMP_STATUS.CAN_FULL_SCREEN_RELEASE
      && this.direction === directionWhenShow;
    const isDown = directionWhenShow === DIRECTION.DOWN;
    return (
      <div className="pull-out-block">
        <div
          className={classNames({
            'pull-out-full-screen-block': true,
            'pull-out-block-bottom': isDown,
            'pull-out-block-top': !isDown,
            'pull-out-full-screen-block-to-full-screen': isShowFull,
          })}
        >
          {/* {renderFullScreen(this.direction, currentState)} */}
          {currentState !== COMP_STATUS.DEACTIVATE && renderFullScreen(this.direction, currentState)}
        </div>
        <div
          className={classNames({
            'pull-out-refresh-block': true,
            'pull-out-refresh-block-absolute': true,
            'pull-out-block-bottom': isDown,
            'pull-out-block-top': !isDown,
          })}
        >
          {renderRefresh(this.direction, currentState)}
        </div>
      </div>
    );
  }

  triggerPullDownRefresh = () => {
    // 在初始化时、用代码 自动 触发 pullDownRefresh
    // 添加this._isMounted的判断，否则组建一实例化，currentState就会是finish
    const { refreshing } = this.props;
    const { dragOnEdge } = this.state;
    // feat: 在调用外部传入的onRefresh方法时，若用户不断上滑或下拉进入onTouchMove，则可能导致在onRefresh结束时，
    // dragOnEdge已在onTouchMove中被置为true，从而无法设置currentState为finish，故需要加入对refreshing的判断
    if ((!dragOnEdge || !refreshing) && this._isMounted) {
      if (refreshing) {
        if (this.direction === DIRECTION.UP) {
          this._lastScreenY = -this.pullRefreshDistance - 1;
        }
        if (this.direction === DIRECTION.DOWN) {
          this._lastScreenY = this.pullRefreshDistance + 1;
        }
      } else {
        this.setState({ currentState: COMP_STATUS.FINISH }, () => this.reset());
      }
    }
  };

  init = () => {
    this.touchElement = this.vnode.dom;
    const ele = this.touchElement;
    this._to = {
      touchstart: this.onTouchStart.bind(this, ele),
      touchmove: this.onTouchMove.bind(this, ele),
      touchend: this.onTouchEnd.bind(this, ele),
      touchcancel: this.onTouchEnd.bind(this, ele),
    };
    Object.keys(this._to)
      .forEach((key) => {
        ele && ele.addEventListener(key, this._to[key], willPreventDefault);
      });
  };

  destroy = () => {
    const ele = this.touchElement;
    Object.keys(this._to)
      .forEach((key) => {
        ele && ele.removeEventListener(key, this._to[key]);
      });
  };

  onTouchStart = (_ele, e) => {
    // 初始化 transition
    this.initTransition();
    const { currentState } = this.state;
    if (currentState === COMP_STATUS.AUTO_PULL) return;
    if (currentState === COMP_STATUS.CAN_FULL_SCREEN_RELEASE) return;
    if (currentState === COMP_STATUS.CAN_REFRESH_RELEASE) return;
    this._startScreenY = e.touches[0].screenY;
    this._ScreenY = e.touches[0].screenY;
    // 一开始 refreshing 为 true 时 this._lastScreenY 有值
    this._lastScreenY = this._lastScreenY || 0;
  };

  isEdge = (ele) => {
    const container = this.scrollContainer;
    if (container && container === document.body) {
      // In chrome61 `document.body.scrollTop` is invalid
      const scrollNode = document.scrollingElement ? document.scrollingElement : document.body;
      if (this.direction === DIRECTION.UP) {
        return this._lastScreenY ? this._lastScreenY < 0
          : scrollNode.scrollHeight - scrollNode.scrollTop - window.innerHeight < 1;
      }
      if (this.direction === DIRECTION.DOWN) {
        return this._lastScreenY ? this._lastScreenY > 0
          : scrollNode.scrollTop < 1;
      }
    } else {
      if (this.direction === DIRECTION.UP) {
        return this._lastScreenY ? this._lastScreenY < 0
          : ele.scrollHeight - ele.scrollTop - ele.clientHeight < 1;
      }
      if (this.direction === DIRECTION.DOWN) {
        return this._lastScreenY ? this._lastScreenY > 0
          : ele.scrollTop < 1;
      }
    }
  };

  damping = (dy) => {
    const ratio = Math.abs(this._ScreenY - this._startScreenY) / window.screen.height;
    const ratioDy = dy * ((1 - ratio) * 0.6);
    // 如果大于是可以距离减少，但是不能变更多
    if (Math.abs(this._lastScreenY + ratioDy) > this.pullDamping) {
      if (Math.abs(this._lastScreenY + ratioDy) < Math.abs(this._lastScreenY)) {
        return ratioDy;
      } else {
        return 0;
      }
    } else {
      return ratioDy;
    }
  };

  onTouchMove = (ele, e) => {
    const { currentState, dragOnEdge } = this.state;
    if (currentState === COMP_STATUS.AUTO_PULL) return;
    if (currentState === COMP_STATUS.CAN_FULL_SCREEN_RELEASE) return;
    if (currentState === COMP_STATUS.CAN_REFRESH_RELEASE) return;
    // 使用 pageY 对比有问题
    const _screenY = e.touches[0].screenY;
    // 拖动方向不符合的不处理
    // 修改成方向由滑动方向来决定，不写死
    if (this.scrollDireciton !== DIRECTION.DOWN && this._startScreenY < _screenY) {
      this.scrollDireciton = DIRECTION.DOWN;
    }
    if (this.scrollDireciton !== DIRECTION.UP && this._startScreenY > _screenY) {
      this.scrollDireciton = DIRECTION.UP;
    }
    if (!dragOnEdge) {
      this.direction = this.scrollDireciton;
    }
    // 被禁止的方向不处理
    const {
      pullDownEnable, pullUpEnable, onScrolling, onPulling
    } = this.props;
    if (this.direction === DIRECTION.UP && !pullUpEnable) return;
    if (this.direction === DIRECTION.DOWN && !pullDownEnable) return;
    if (this.isEdge(ele)) {
      if (!dragOnEdge) {
        // 当用户开始往上滑的时候isEdge还是false的话，会导致this._ScreenY不是想要的，只有当isEdge为true时，再上滑，才有意义
        // 下面这行代码解决了上面这个问题
        this._startScreenY = e.touches[0].screenY;
        this._ScreenY = e.touches[0].screenY;
        this.setState({ dragOnEdge: true });
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      if (this._ScreenY === null) {
        this._ScreenY = e.touches[0].screenY;
      }
      // add stopPropagation with fastclick will trigger content onClick event. why?
      // ref https://github.com/ant-design/ant-design-mobile/issues/2141
      // e.stopPropagation();
      const _diff = Math.round(_screenY - this._ScreenY);
      this._ScreenY = _screenY;
      this._lastScreenY += this.damping(_diff);

      // 大于最大拉动距离，就不做什么
      const lastScreenYAbs = Math.abs(this._lastScreenY);
      if (lastScreenYAbs > this.pullDamping) return;
      this.setContentStyle(this._lastScreenY);
      // feat: 根据UI2.0设计图，在拉动刷新后的release状态下不需要根据拉动距离设置状态为deactivate
      // 防止在上一次刷新未结束时进入下一次刷新
      if (currentState !== COMP_STATUS.CAN_REFRESH_RELEASE) {
        if (lastScreenYAbs <= this.pullRefreshDistance) {
          // 小于刷新距离
          this.setState({ currentState: COMP_STATUS.CAN_NOT_REFRESH });
        } else if (lastScreenYAbs <= this.pullFullScreenDistance
          || this.pullFullScreenDistance <= this.pullRefreshDistance) {
          // 小于全屏距离 || 全屏距离小于刷新距离，即不存在全屏的情况
          this.setState({ currentState: COMP_STATUS.CAN_REFRESH });
        } else {
          // 全屏
          this.setState({ currentState: COMP_STATUS.CAN_FULL_SCREEN });
        }
      }
      // https://github.com/ant-design/ant-design-mobile/issues/573#issuecomment-339560829
      // iOS UIWebView issue, It seems no problem in WKWebView
      if (isWebView && e.changedTouches[0].clientY < 0) {
        this.onTouchEnd();
      }
      onPulling(this.direction, this._lastScreenY);
    } else {
      if (currentState !== COMP_STATUS.DEACTIVATE) {
        this._ScreenY = null;
        this.reset();
        this.setState({ currentState: COMP_STATUS.DEACTIVATE });
      }
      const scrollNode = document.scrollingElement ? document.scrollingElement : document.body;
      onScrolling(scrollNode.scrollTop);
    }
  };

  onTouchEnd = () => {
    this.initTransition(true);
    const { currentState, dragOnEdge } = this.state;
    if (currentState === COMP_STATUS.AUTO_PULL) return;
    const {
      onPullRefresh, onPullFullScreen, refreshTimeOut, onPullingEnd
    } = this.props;
    // 下拉结束的回调
    // onPullingEnd(this.direction, currentState);
    if (currentState === COMP_STATUS.CAN_FULL_SCREEN_RELEASE) return;
    if (currentState === COMP_STATUS.CAN_REFRESH_RELEASE) return;
    if (dragOnEdge) {
      this.setState({ dragOnEdge: false });
    }
    // 获取屏幕高度
    const screenHeight = window.screen.height || window.innerHeight;
    // feat: 根据UI2.0最新设计图进行页面逻辑调整
    switch (currentState) {
      case COMP_STATUS.CAN_NOT_REFRESH:
        this.setState({ currentState: COMP_STATUS.DEACTIVATE });
        this.reset();
        break;
      case COMP_STATUS.CAN_REFRESH:
        this.setState({ currentState: COMP_STATUS.CAN_REFRESH_RELEASE }, () => {
          if (this.direction === DIRECTION.UP) {
            this.toBottom();
          }
          // 避免卡死
          if (refreshTimeOut) {
            setTimeout(() => {
              const { currentState: state } = this.state;
              if (state === COMP_STATUS.CAN_REFRESH_RELEASE) {
                this.cancelRefresh();
              }
            }, refreshTimeOut);
          }
        });
        this.resetRefreshRelease();
        onPullRefresh(this.direction, this.cancelRefresh);
        break;
      case COMP_STATUS.CAN_FULL_SCREEN:
        onPullingEnd(this.direction, currentState);
        this.setContentStyle(screenHeight);
        setTimeout(() => {
          this.setState({ currentState: COMP_STATUS.CAN_FULL_SCREEN_RELEASE }, () => {
            if (this.direction === DIRECTION.UP) {
              this.toBottom();
            }
            // 避免卡死
            if (refreshTimeOut) {
              setTimeout(() => {
                const { currentState: state } = this.state;
                if (state === COMP_STATUS.CAN_FULL_SCREEN_RELEASE) {
                  this.cancelRefresh();
                }
              }, refreshTimeOut);
            }
          });
          // this.reset();
          this.resetFn('clear');
          onPullFullScreen(this.direction, this.cancelRefresh);
        }, TRANSITION_DURATION);
        break;
      default:
        break;
    }
  };

  toBottom = () => {
    const scrollNode = document.scrollingElement ? document.scrollingElement : document.body;
    scrollNode.scrollTop = scrollNode.scrollHeight; // 自动滚到最大值后停止
  };

  reset = debounce(() => {
    const { onReset } = this.props;
    this._lastScreenY = 0;
    this.setContentStyle(0);
    onReset(this.direction);
  }, 100, { leading: false, trailing: true });

  // 不用 reset 的原因是由于 debounce 会导致白屏
  resetFn = (tag) => {
    const { onReset } = this.props;
    this._lastScreenY = 0;
    this.setContentStyle(0, tag);
    onReset(this.direction);
  }

  resetRefreshRelease = () => {
    if (this.direction === DIRECTION.UP) {
      this._lastScreenY = -this.pullRefreshDistance;
      this.setContentStyle(-this.pullRefreshDistance);
    } else {
      this._lastScreenY = this.pullRefreshDistance;
      this.setContentStyle(this.pullRefreshDistance);
    }
  };

  setContentStyle = (ty, flag) => {
    // todos: Why sometimes do not have `this.contentRef` ?
    if (this.contentRef) {
      const nodeStyle = this.contentRef.style;
      const value = `translate3d(0px,${ty}px,0)`;
      nodeStyle.transform = ty === 0 ? null : value;
      nodeStyle.webkitTransform = ty === 0 ? null : value;
      nodeStyle.MozTransform = ty === 0 ? null : value;
      // 清除transition
      if (flag === 'clear') {
        nodeStyle.transitionDuration = '0s';
      }
    }
  };

  initTransition = (flag) => {
    const nodeStyle = this.contentRef.style;
    if (flag) {
      nodeStyle.transitionDuration = `${TRANSITION_DURATION / 1000}s`;
    } else {
      nodeStyle.transitionDuration = '0s';
    }
  }

  cancelRefresh = () => {
    this.reset();
    this.setState({
      currentState: COMP_STATUS.DEACTIVATE,
    });
  };
}
PullOutRefresh.defaultProps = {
  // 打开拉开的方向
  pullDownEnable: true,
  pullUpEnable: true,
  // 拉到刷新程度的回调
  onPullRefresh: (direction, cancelRefresh) => {
    setTimeout(() => {
      cancelRefresh();
    }, 2000);
  },
  // 拉到全屏程度的回调
  onPullFullScreen: (direction, cancelRefresh) => {
    // console.log('onPullFullScreen run', direction);
    setTimeout(() => {
      cancelRefresh();
    }, 2000);
  },
  // 刷新渲染函数
  renderRefresh: (direction, status) => {
    let showStr = '';
    switch (status) {
      case COMP_STATUS.CAN_NOT_REFRESH:
        showStr = '下拉刷新';
        break;
      case COMP_STATUS.CAN_REFRESH:
        showStr = '松手刷新';
        break;
      case COMP_STATUS.CAN_REFRESH_RELEASE:
        showStr = '刷新中';
        break;
      case COMP_STATUS.CAN_FULL_SCREEN:
        showStr = '松手进入二楼';
        break;
      default:
        break;
    }
    return (
      showStr && (
        <div className="pull-out-refresh-loading">
          <div className="indicator" />
          <span>{showStr}</span>
        </div>
      )
    );
  },
  // 全屏渲染函数
  renderFullScreen: (direction, status) =>
    // console.log(`renderFullScreen run ${status}`, direction);
    (
      <div className="pull-out-full-screen-img-box">
        {/* <img */}
        {/*  className="pull-out-full-screen-img" */}
        {/*  src={closeImg} */}
        {/*  alt="" */}
        {/* /> */}
      </div>
    ),
  // 正在拉动回调
  onPulling: (direction, offset) => {
    // console.log(`onPulling run ${offset}`, direction);
  },
  // 正在滚动回调
  onScrolling: () => {
    // console.log(`onScrolling run ${offset}`);
  },
  // 回到初始位置回调
  onReset: (direction) => {
    // console.log('onReset', direction);
  },
  // 最大下拉距离，默认200
  pullDownDamping: 140,
  // 最大上拉距离，默认200
  pullUpDamping: 120,
  // 触发下拉刷新距离，默认100
  pullDownRefreshDistance: 60,
  // 触发上拉刷新距离，默认100
  pullUpRefreshDistance: 60,
  // 触发下拉全屏距离
  pullDownFullScreenDistance: 150,
  // 触发上拉全屏距离
  pullUpFullScreenDistance: 200,
  // 超时时间,ms
  refreshTimeOut: undefined,
  showAutoAnimationStartCallback: () => {
    console.log('showAutoAnimationStartCallback run');
  },
  showAutoAnimationEndCallback: () => {
    console.log('showAutoAnimationEndCallback run');
  }
};
