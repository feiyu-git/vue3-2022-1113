// 游客版面仅0APP
import Madp from '@mu/madp';
import classNames from 'classnames';
import { MUView } from '@mu/zui';
import {
  AboutUs, BrandText, CmbWelfare, Row2Column2Swiper, TopTextPropaganda, RowsColumnOneTextbox
} from '@mu/lui';
import BackgroundImage from '@tempComp/home/background-image';
import HomeNavigateBar from '@tempComp/home/home-navigatebar';
import CreditCardWrapper from '@tempComp/home/credit-card-wrapper';
import Sologan from '@tempComp/home/slogan';
import { USER_TAG } from '@global/utils/constants';
// import './styles/default.scss';

const { ITEM_TYPES } = HomeNavigateBar;

// 导航栏元素配置，0APP展示全部元素，2APP不展示搜索，0APP轻度逾期用户不展示运营位，2APP轻度逾期只有消息icon
const NAVIGATE_BAR_CONFIG = {
  default: [], // 默认无导航栏
  '0APP': [ITEM_TYPES.SEARCH, ITEM_TYPES.PRODUCT_ICONS, ITEM_TYPES.MSG_ICON], // 0APP 默认：[搜索、运营位、消息]
  '2APP': [ITEM_TYPES.PRODUCT_ICONS, ITEM_TYPES.MSG_ICON], // 2APP 默认：[运营位、消息]
};

class VisitorBlock extends Madp.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      homeNavigateBar = {},
      homeNavigateBarSearch = {},
      backgroundImage,
      bigPromotionImage,
      sologan,
      cmbWelfare,
      row2Column2Swiper,
      aboutUs,
      brandText,
      statusBarHeight,
      isShowNavigateBar,
      // showUnhandleNotice,
      isLogin,
      userInfo,
      currentUserTag,
      currentTheme,
      showBigPromotion,
      virtualChannelOverdueSlogan,
      topTextPropaganda,
      rowsColumnOneTextbox
    } = this.props;
    const channel = Madp.getChannel();
    const backgroundImageProps = showBigPromotion ? bigPromotionImage : backgroundImage;
    const sloganConfig = {
      default: sologan,
      [USER_TAG.SLIGHT_OVERDUE]: virtualChannelOverdueSlogan,
    };
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
            isVisitor // 游客版面的参数，处理点击时使用，其他版面不需要传入默认false
          />
        )}
        <MUView className="navigatebar-status-height" style={{ paddingTop: statusBarHeight }} />
        {/* 顶部文案展位 */}
        {!showBigPromotion && (
          <TopTextPropaganda {...topTextPropaganda} />
        )}
        <MUView
          className="position-fix"
          style={showBigPromotion ? { height: Madp.pxTransform(250) } : { height: Madp.pxTransform(30) }}
        />
        {/* 额度卡片选择器：标准额度卡片、第三方借呗额度卡片、一口借卡片 */}
        <CreditCardWrapper
          {...this.props}
          isVisitor
        />
        {/* APP专项福利 展位名称：尊享特权 */}
        <Row2Column2Swiper {...row2Column2Swiper} />
        {/* 分期花 */}
        <CmbWelfare {...cmbWelfare} />
        {/* 热门话题展位 */}
        <RowsColumnOneTextbox {...rowsColumnOneTextbox} />
        {/* 关于我们 */}
        <AboutUs {...aboutUs} />
        {/* 品牌文案 */}
        <BrandText {...brandText} />
      </MUView>
    );
  }
}

export default VisitorBlock;
