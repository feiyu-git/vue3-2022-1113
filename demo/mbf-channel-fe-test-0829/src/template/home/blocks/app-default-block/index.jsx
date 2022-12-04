/**
 * 默认首页版面
 * */
import Madp from '@mu/madp';
import classNames from 'classnames';
import { MUView } from '@mu/zui';
import {
  AboutUs, BannerWithoutBorder, BottomLogin, BrandText, CmbWelfare, ContentInformation,
  FloatImage, FloatTopNotice, LargeLoan, ListAdv, NewCustomerCoupons,
  Row2Column2Swiper, Row2Column2TextImg, RownColumn3Card, SaveMoneyCard, ChannelShortcutMenu, TwoColumnAdv,
  TopTextPropaganda, RowsColumnOneTextbox, ChannelNewFinancialServices, ImageTextSwiper
} from '@mu/lui';
import { UnhandleNotice } from '@mu/unhandle-notice';
// import UnhandleNotice from '@global/components/unhandle-notice';
import BackgroundImage from '@tempComp/home/background-image';
import HomeNavigateBar from '@tempComp/home/home-navigatebar';
import CreditCardWrapper from '@tempComp/home/credit-card-wrapper';
import Sologan from '@tempComp/home/slogan';
import { USER_TAG } from '@global/utils/constants';
import './styles/index.scss';

const { ITEM_TYPES } = HomeNavigateBar;

// 导航栏元素配置，0APP展示全部元素，2APP不展示搜索，0APP轻度逾期用户不展示运营位，2APP轻度逾期只有消息icon
const NAVIGATE_BAR_CONFIG = {
  default: [], // 默认无导航栏
  '0APP': [ITEM_TYPES.SEARCH, ITEM_TYPES.PRODUCT_ICONS, ITEM_TYPES.MSG_ICON], // 0APP 默认：[搜索、运营位、消息]
  '2APP': [ITEM_TYPES.PRODUCT_ICONS, ITEM_TYPES.MSG_ICON], // 2APP 默认：[运营位、消息]
  [`0APP_${USER_TAG.SLIGHT_OVERDUE}`]: [ITEM_TYPES.SEARCH, ITEM_TYPES.MSG_ICON], // 0APP 轻度逾期：[搜索、消息]
  [`2APP_${USER_TAG.SLIGHT_OVERDUE}`]: [ITEM_TYPES.MSG_ICON], // 2APP 轻度逾期：[消息]
};

export default class DefaultBlock extends Madp.Component {
  onUnHandleNoticeSuccess = (list) => {
    if (!list || !list.length) console.log('[homepage] 没有待办可展示');
  };

  render() {
    const {
      isOverDue,
      homeNavigateBar = {},
      homeNavigateBarSearch = {},
      backgroundImage,
      bigPromotionImage,
      sologan,
      // shortcutMenu,
      largeLoan,
      saveMoneyCard,
      cmbWelfare,
      // financialServices,
      listAdv,
      listAdv$2,
      newCustomerCoupons,
      row2Column2Swiper,
      rownColumn3Card,
      bannerWithoutBorder,
      twoColumnAdv$1,
      twoColumnAdv$2,
      twoColumnAdv$3,
      row2Column2TextImg,
      contentInformation$1,
      contentInformation$2,
      contentInformation$3,
      aboutUs,
      brandText,
      floatTopNotice,
      bottomLogin,
      floatImage,
      statusBarHeight,
      isShowNavigateBar,
      // showUnhandleNotice,
      isLogin,
      userInfo,
      currentUserTag,
      currentTheme,
      showBigPromotion,
      virtualChannelOverdueSlogan,
      channelShortcutMenu,
      topTextPropaganda,
      rowsColumnOneTextbox,
      channelNewFinancialServices,
      imageTextSwiper
    } = this.props;
    const channel = Madp.getChannel();
    const backgroundImageProps = showBigPromotion ? bigPromotionImage : backgroundImage;
    const sloganConfig = {
      default: topTextPropaganda,
      [USER_TAG.SLIGHT_OVERDUE]: virtualChannelOverdueSlogan,
    };
    console.log('this.props', this.props.bottomLogin)
    // 如果不需要首页顶部导航，如果需要展示就定义初始值不为 undefined 【参考app-home】
    const showNavigate = typeof (isShowNavigateBar) !== 'undefined';
    return (
      <MUView className={classNames('homepage-block-container', currentTheme)}>
        {/* 大促图的优先级 > 背景图 */}
        <BackgroundImage
          statusBarHeight={statusBarHeight}
          {...backgroundImageProps}
        />
        { showNavigate && (
          <HomeNavigateBar
            {...this.props}
            data={{ ...homeNavigateBar, ...homeNavigateBar.dataObj }}
            searchData={{ ...homeNavigateBarSearch, ...homeNavigateBarSearch.dataObj }}
            isShow={isShowNavigateBar}
            itemsConfig={NAVIGATE_BAR_CONFIG[`${channel}_${currentUserTag}`] || NAVIGATE_BAR_CONFIG[channel] || NAVIGATE_BAR_CONFIG.default}
          />
        )}
        <MUView className="navigatebar-status-height" style={{ paddingTop: statusBarHeight }} />
        {/* <Sologan {...(sloganConfig[currentUserTag] || sloganConfig.default)} show={!showBigPromotion} />
         */}
        {/* 顶部文案展位 */}
        {!showBigPromotion && (
          <TopTextPropaganda {...topTextPropaganda} />
        )}
        <MUView
          className="position-fix"
          style={showBigPromotion ? { height: Madp.pxTransform(250) } : { height: Madp.pxTransform(30) }}
        />
        {/* 额度卡片选择器：标准额度卡片、第三方借呗额度卡片、一口借卡片 */}
        <CreditCardWrapper {...this.props} />
        <UnhandleNotice
          {...this.props}
          beaconId="homepage"
          onSuccess={this.onUnHandleNoticeSuccess}
          isPage={false}
        />
        {/* 快捷菜单, 不可以在含有内部状态的组件里采用类似如下判断在进行渲染否则nervejs会replaceChild渲染出错 */}
        {/* 这个只是一个错误实例，目前只在iphone 6s ios14.4.1机子复现可以举一反三 */}
        {/* {isLogin && (<ShortcutMenu {...shortcutMenu} isLogin={isLogin} />)} */}
        {/* 新渠道八宫格， 所有元素可配置 */}
        <ChannelShortcutMenu {...channelShortcutMenu} isLogin={isLogin} userInfo={userInfo} isOverDue={isOverDue} />
        {/* 新渠道尊享服务 */}
        <ChannelNewFinancialServices type="card" {...channelNewFinancialServices} userInfo={userInfo} isLogin={isLogin} isOverDue={isOverDue} />
        {/* 新人专享领券 */}
        <NewCustomerCoupons {...newCustomerCoupons} />
        {/* 尊享特权 APP专项福利/精选福利 */}
        <Row2Column2Swiper {...row2Column2Swiper} />
        {/* 轮播图不带边框  */}
        <BannerWithoutBorder {...bannerWithoutBorder} />
        {/* 大额贷款 功能保留 不进行配置 */}
        <LargeLoan {...largeLoan} isLogin={isLogin} isShowComp={isLogin} />
        {/* 微光省钱卡 */}
        <SaveMoneyCard {...saveMoneyCard} isLogin={isLogin} />
        {/* 上下翻页带背景图文展位 周三会员日  */}
        <ImageTextSwiper {...imageTextSwiper} />
        {/* 分期花 */}
        <CmbWelfare {...cmbWelfare} />
        {/* 一行两列带分隔图文展位 （赚钱有道）  */}
        <TwoColumnAdv {...twoColumnAdv$1} />
        {/* <TwoColumnAdv {...twoColumnAdv$2} /> */}
        {/* <TwoColumnAdv {...twoColumnAdv$3} /> */}
        {/* N行三列图片跳转列表 （信用服务） */}
        <RownColumn3Card {...rownColumn3Card} />
        {/* 两行两列图文列表 */}
        {/* <Row2Column2TextImg {...row2Column2TextImg} /> */}
        {/* 内容资讯 3个 */}
        {/* <ContentInformation {...contentInformation$1} />
        <ContentInformation {...contentInformation$2} />
        <ContentInformation {...contentInformation$3} /> */}
        {/* 列表运营 （精选活动 */}
        <ListAdv {...listAdv} />
        {/* <ListAdv {...listAdv$2} /> */}
        {/* 热门话题 */}
        <RowsColumnOneTextbox {...rowsColumnOneTextbox} />
        {/* 关于我们 */}
        <AboutUs {...aboutUs} />
        {/* 品牌文案 */}
        <BrandText {...brandText} />
        {/* 吸底登录 */}
        <BottomLogin {...bottomLogin} isLogin={isLogin} />
        {/* 浮动强提醒 */}
        <FloatTopNotice {...floatTopNotice} />
        {/* 浮动图片 */}
        <FloatImage {...floatImage} />
      </MUView>
    );
  }
}
