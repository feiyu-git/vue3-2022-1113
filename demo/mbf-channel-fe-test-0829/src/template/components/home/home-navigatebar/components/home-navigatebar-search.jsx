import Madp, { Component } from '@mu/madp';
import { MUImage, MUView, MUSwiper } from '@mu/zui';
import { isMuapp, debounce } from '@mu/madp-utils';
import { urlDomain } from '@mu/business-basic';
import { sendEV } from '../../../../utils/dispatchTrackEventProxy';


import {
  searchIconWhite, searchIconBlack, aiServiceImg
} from '../util/imgLoad';
import './home-navigatebar-search.scss';

// 搜索栏
export default class HomeNavigatebarSearch extends Component {
  constructor(props) {
    super(props);
    // 向父组件传递方法
    const { updateStyleFunc } = props;
    if (updateStyleFunc) {
      updateStyleFunc(this.updateStyle.bind(this));
    }

    this.state = {
      swiperCurrent: 0
    };

    this.onClick = this.onClick.bind(this);
    this.onServiceClick = this.onServiceClick.bind(this);
    this.onSwiperChange = this.onSwiperChange.bind(this);
  }


  onClick = debounce(() => {
    const { swiperCurrent } = this.state;
    const { searchData, isVisitor } = this.props;
    const { contentList = [] } = searchData || {};
    // const item = contentList.length ? contentList[0] : '';
    const item = contentList.length ? contentList[swiperCurrent] : '';
    const searchKey = item ? item.searchKey : '';
    const searchUrl = item ? item.searchUrl : '';

    // 搜索报表专用埋点
    const beaconContent = item ? {
      title: item.elementTitle || item.searchKey,
      position: swiperCurrent,
      contentId: item.hash,
    } : {
      title: '无搜索词',
      position: -1,
      contentId: 'none',
    };
    sendEV(searchData, beaconContent);

    const targetUrl = `${searchUrl ? `&targetUrl=${encodeURIComponent(searchUrl)}` : ''}`;
    const searchDefaultUrl = `${urlDomain}/${Madp.getChannel()}/mainpage/#/search/index?scene=1&_hideNavBar=1${searchKey ? `&keyWord=${searchKey}` : ''}${targetUrl}`;
    const visitorUrl = `${searchDefaultUrl}&_needDialog=1`; // 游客url 拼接弹窗参数_needDialog=1
    const url = isVisitor ? visitorUrl : searchDefaultUrl;
    Madp.navigateTo({
      url,
      useAppRouter: isMuapp(),
    });
  }, 300, { leading: true, trailing: false });

  onServiceClick = (e) => {
    // 阻止冒泡
    e.stopPropagation();
    const { searchData, isVisitor } = this.props;
    // 搜索报表专用埋点
    const beaconContent = {
      title: '智能业务助理',
      position: -1,
      contentId: 'AiService',
    };
    sendEV(searchData, beaconContent);
    const aiServiceUrl = `${urlDomain}/${Madp.getChannel()}/csp/#/pages/intelligent-assistant/index?titleBarColor=030B18&_needLogin=1&useJumpListener=1`;
    const visitorUrl = `${aiServiceUrl}&_needDialog=1`;
    const url = isVisitor ? visitorUrl : aiServiceUrl;
    Madp.navigateTo({
      url,
      useAppRouter: isMuapp(),
    });
  };

  onSwiperChange(e) {
    const current = e && e.detail && e.detail.current;
    this.setState({
      swiperCurrent: current || 0
    });
  }

  updateStyle(showBlackStyle) {
    const whiteImgRef = this.whiteImgRef && this.whiteImgRef.vnode && this.whiteImgRef.vnode.dom;
    const descRef = this.descRef && this.descRef.vnode && this.descRef.vnode.dom;
    const searchRef = this.searchRef && this.searchRef.vnode && this.searchRef.vnode.dom;
    whiteImgRef.style.display = showBlackStyle ? 'none' : 'block';
    whiteImgRef.style.display = showBlackStyle ? 'block' : 'none';
    if (showBlackStyle) {
      // ios 10不支持ref style整个赋值
      searchRef.style.backgroundColor = 'rgba(243,243,243,0.95)';
      descRef.style.color = '#a6a6a6';
      descRef.style.opacity = '0.5';
    } else {
      // ios 10不支持ref style整个赋值
      searchRef.style.backgroundColor = 'rgba(255,255,255,0.3)';
      descRef.style.color = '#ffffff';
      descRef.style.opacity = '1';
    }
  }

  render() {
    const { swiperCurrent } = this.state;
    const { searchData, showBlackStyle } = this.props;
    const { showService = '0', contentList = [] } = searchData || {};
    // const item = contentList.length ? contentList[0] : '';
    // const searchKey = item ? item.searchKey : '';
    // iOS上UIWebView scroll在滚动期间不会触发js渲染, 只能用两张图片操作dom刷新
    const whiteImgStyle = showBlackStyle ? 'display: none' : 'display: block';
    const blackImgStyle = showBlackStyle ? 'display: block' : 'display: none';
    const searchStyle = showBlackStyle ? 'background-color: rgba(255,255,255,1)' : 'background-color: rgba(255,255,255,0.2)';
    const descStyle = showBlackStyle ? 'color: #000000;' : 'color: #ffffff;';
    const blackSwiperChildren = contentList.map((item) => ({
      className: 'home-navigatebar-search__desc__swiper__black-text',
      text: item.searchKey,
      onClick: () => {} // 此处不处理点击事件，具体点击留意 this.onSwiperChange 与 this.onClick
    }));
    const whiteSwiperChildren = contentList.map((item) => ({
      className: 'home-navigatebar-search__desc__swiper__white-text',
      text: item.searchKey,
      onClick: () => {} // 此处不处理点击事件，具体点击留意 this.onSwiperChange 与 this.onClick
    }));
    return (
      <MUView className="home-navigatebar-search" style={searchStyle} beaconId="NavigatebarSearch" onClick={this.onClick} ref={(ref) => { this.searchRef = ref; }}>
        <MUImage className="home-navigatebar-search__icon" style={whiteImgStyle} alt="" src={searchIconWhite} imgProps={{ 'data-src': searchIconWhite }} ref={(ref) => { this.whiteImgRef = ref; }} />
        <MUImage className="home-navigatebar-search__icon" style={blackImgStyle} alt="" src={searchIconBlack} imgProps={{ 'data-src': searchIconBlack }} ref={(ref) => { this.blackImgRef = ref; }} />
        <MUView className="home-navigatebar-search__desc" style={descStyle} ref={(ref) => { this.descRef = ref; }}>
          {
            // 解决MUSwiper组件在初始化时，生成的一个节点（为了循环播放）样式不能更新问题
            showBlackStyle ? (
              (blackSwiperChildren && blackSwiperChildren.length > 0) && (
                <MUSwiper
                  key="black-style"
                  className="home-navigatebar-search__desc__swiper"
                  beaconId="SearchSwiper"
                  vertical
                  autoplay
                  circular={blackSwiperChildren.length > 1}
                  interval={3000}
                  current={swiperCurrent}
                  childrenNodes={[...blackSwiperChildren]}
                  onChange={this.onSwiperChange}
                />
              )
            ) : (
              (whiteSwiperChildren && whiteSwiperChildren.length > 0) && (
                <MUSwiper
                  key="white-style"
                  className="home-navigatebar-search__desc__swiper"
                  beaconId="SearchSwiper"
                  vertical
                  autoplay
                  circular={whiteSwiperChildren.length > 1}
                  interval={3000}
                  current={swiperCurrent}
                  childrenNodes={[...whiteSwiperChildren]}
                  onChange={this.onSwiperChange}
                />
              )
            )
          }
        </MUView>
        {/* 该功能只用在6.0.0版本上 */}
        { showService === '1' && <MUView className="home-navigatebar-search__service" onClick={this.onServiceClick}><MUImage className="home-navigatebar-search__service__img" alt="" src={aiServiceImg} imgProps={{ 'data-src': aiServiceImg }} /></MUView>}
      </MUView>
    );
  }
}
