import Madp from '@mu/madp';
import { MUView } from '@mu/zui';
import { UnhandleNotice } from '@mu/unhandle-notice';
import {
  TopTextPropaganda,
  BannerWithoutBorder,
  NewCustomerCoupons,
  RownColumn3Card,
  TwoColumnAdv,
  ContentInformation,
  AboutUs,
  BrandText,
  BottomLogin,
  FloatTopNotice,
  Dialog,
  MarqueeTips,
  RownColumn2Card,
  ListAdv,
  WechatGuideCollect,
  UrgingPaymentDialog,
  ChannelShortcutMenu,
  Row2Column2Swiper,
  SaveMoneyCard,
  VideoPlayColumn2,
  RowsColumnOneTextbox,
  ChannelNewFinancialServices,
  FloatImage,
  CmbWelfare,
  LargeLoan,
  ImageTextSwiper
} from '@mu/lui';
import { USER_TAG, currenBackgroundImage } from '../../../utils/constants';
// import CreditCard from '../../../components/home/credit-card/index';
import CreditCardWrapper from '../../../components/home/credit-card-wrapper/index';
import BackgroundImage from '../../../components/home/background-image';
import LoginManage from '../../../components/home/login-manage';
// import FloatImage from '../../../components/home/mini-comp/float-image';

class OtherDefaultBlock extends Madp.Component {
  constructor(props) {
    super(props);
    const channel = Madp.getChannel();
    this.state = {
      // 联通半屏登录相关
      loginFlag: false,
      flag: false,
      needLoginSimplify: channel === '3CUAPP', // 是否需要联通半屏登录
    };
  }

  componentDidMount() {
    console.log('other-default-block');
    this.initData();
  }

  initData = () => {
    // this.initCreditCardAndRelated(); // 申请步骤组件需要data
    this.updateSaveMoneyCard();
  }

  initCreditCardAndRelated = async (data) => {
    //  const data = this.creditCard && (await this.creditCard.init());
    // 子组件传参改变
    // this.setState({
    //   creditCardData: data || {}
    // });
  }

  updateSaveMoneyCard = () => {
    // eslint-disable-next-line no-unused-expressions
    this.saveMoneyCardRef && this.saveMoneyCardRef.initData();
  }

  renderLifesytle() {
    if (process.env.TARO_ENV === 'alipay') {
      return (
        <MUView className="life-style">
          <lifestyle publicId="2015031700036863" />
        </MUView>
      );
    }
    return <MUView />;
  }

  setUnicomLoginSim = (info) => {
    const { loginFlag, flag } = info;
    this.setState({
      loginFlag,
      flag
    });
  }


  /**
   * { otherFuncs && otherFuncs.dataObj && <OtherFuncs {...otherFuncs} />}
   * 这种写法不是为了避免空数据报错，
   * 是处理小程序特殊场景
   * 当小程序打开页面展位显示后，在CC中隐藏展位，下拉刷新，发现展位中的props并不是替换 而是{...oldprops, ...newprops}这种形式
   * 而隐藏的展位，接口不返回数据，leda中设置state中otherFuncs为{} 于是展位还是显示直接未隐藏的数据，导致下拉刷新展位没有隐藏
   */
  render() {
    const {
      // virtualAlipayBigPromotionImg,
      topTextPropaganda,
      bannerWithoutBorder,
      bannerWithoutBorder$2,
      newCustomerCoupons,
      rownColumn3Card,
      rownColumn3Card$2,
      twoColumnAdv$1,
      contentInformation$1,
      contentInformation$2,
      contentInformation$3,
      aboutUs,
      brandText,
      bottomLogin,
      floatTopNotice,
      dialog,
      marqueeTips,
      isLogin,
      saveMoneyCard,
      row2Column2Swiper,
      rownColumn2Card$1,
      rownColumn2Card$2,
      listAdv,
      floatImage,
      wechatGuideCollect,
      urgingPaymentDialog,
      userInfo,
      maskRealName,
      channelShortcutMenu,
      currentUserTag,
      virtualChannelOverdueSlogan,
      isOverDue,
      refreshBusinessData,
      currChannelConfig,
      showBigPromotion,
      bigPromotionImage,
      videoPlayColumn2,
      rowsColumnOneTextbox,
      channelNewFinancialServices,
      cmbWelfare,
      largeLoan,
      imageTextSwiper
    } = this.props;
    const sloganConfig = {
      default: topTextPropaganda,
      [USER_TAG.SLIGHT_OVERDUE]: virtualChannelOverdueSlogan,
    };
    const isH5 = process.env.TARO_ENV === 'h5';
    // 如配置大促图，展示大促图；无则使用本地背景图
    const currentDefaultBg = {
      dataObj: {
        imgUrl: currenBackgroundImage
      }
    };
    const backgroundImageProps = showBigPromotion ? bigPromotionImage : currentDefaultBg;
    const { needLoginSimplify, loginFlag, flag } = this.state;
    // 额度卡片联通相关配置
    const unicomeConfig = {
      setUnicomLoginSim: this.setUnicomLoginSim,
      needLoginSimplify,
      flag
    };
    const loginSimplifyParams = {
      loginFlag, flag, isLogin, partnerMaskMobile: userInfo && userInfo.partnerMaskMobile, needLoginSimplify
    };
    return (
      <MUView
        className="home"
        style={{
          position: 'relative',
          minHeight: '100vh',
          paddingBottom: `${Madp.pxTransform(100)}`,
          overflow: 'hidden'
        }}
      >
        {/* <BackgroundImage
          data={
            this.showBigPromotion
              ? {
                ...virtualAlipayBigPromotionImg,
                ...virtualAlipayBigPromotionImg.dataObj.contentList[0]
              }
              : {}
          }
        /> */}
        <BackgroundImage
          // statusBarHeight={statusBarHeight}
          // backgroundImageProps={backgroundImageProps}
          {...backgroundImageProps}
        />
        {/* {...bigPromotionImage} */}
        {/* 跑马灯展位 */}
        <MUView className="marguee-seat">
          { marqueeTips && marqueeTips.dataObj && <MarqueeTips {...marqueeTips} />}
        </MUView>
        {/* 顶部文案展位 */}
        {topTextPropaganda && topTextPropaganda.dataObj && (
          <TopTextPropaganda
            {...topTextPropaganda}
            showTopText={!showBigPromotion}
          />
        )}
        <MUView
          className="position-fix"
          style={
            showBigPromotion
              ? { height: Madp.pxTransform(250) } // 默认300 由于配置需要展示顶部文案(高度50) 最终值为300-50
              : { height: Madp.pxTransform(36) }
          }
        />
        {/* <CreditCard
          ref={(e) => { this.creditCard = e; }}
          onLogin={this.props.doLogin}
          // beaconContent={this.beaconContent}
        /> */}
        {/* 卡片选择器：标准额度卡、一口借、第三个回家卡片三选一 */}
        <CreditCardWrapper
          {...this.props}
          onInitCreditCardAndRelated={this.initCreditCardAndRelated}
          unicomeConfig={unicomeConfig}
          onLogin={this.props.doLogin}
        />
        {/* 待办组件 h5使用 小程序暂不接入 */}
        {isH5 && (
          <UnhandleNotice
            {...this.props}
            beaconId="alipay-home"
            onSuccess={this.onUnHandleNoticeSuccess}
            isPage={false}
          />
        )}
        {/* 新渠道八宫格， 所有元素可配置 */}
        {channelShortcutMenu && channelShortcutMenu.dataObj
        && (
          <ChannelShortcutMenu
            {...channelShortcutMenu}
            isLogin={isLogin}
            userInfo={userInfo}
            isOverDue={isOverDue}
            refreshBusinessData={refreshBusinessData}
          />
        )}
        {/* 新渠道尊享服务 */}
        {channelNewFinancialServices && channelNewFinancialServices.dataObj
        && (
          <ChannelNewFinancialServices
            type="card"
            {...channelNewFinancialServices}
            userInfo={userInfo}
            isLogin={isLogin}
            isOverDue={isOverDue}
            pageId={currChannelConfig.pageId}
            refreshBusinessData={refreshBusinessData}
          />
        )}
        {/* 新人专享领券 */}
        { newCustomerCoupons && newCustomerCoupons.dataObj && <NewCustomerCoupons {...newCustomerCoupons} /> }
        {/* 尊享特权 （精选福利/新人福利） */}
        { row2Column2Swiper && row2Column2Swiper.dataObj && <Row2Column2Swiper {...row2Column2Swiper} /> }
        {/* 轮播图不带边框 */}
        { bannerWithoutBorder && bannerWithoutBorder.dataObj && <BannerWithoutBorder {...bannerWithoutBorder} />}
        {/* 大额贷款 功能保留 不进行配置 */}
        {largeLoan && largeLoan.dataObj && <LargeLoan {...largeLoan} isLogin={isLogin} isShowComp={isLogin} />}
        {this.renderLifesytle()}
        {/* 微光省钱卡 */}
        { saveMoneyCard && saveMoneyCard.dataObj && <SaveMoneyCard {...saveMoneyCard} isLogin={isLogin} /> }
        {/* 上下翻页带背景图文展位 周三会员日  */}
        { imageTextSwiper && imageTextSwiper.dataObj && <ImageTextSwiper {...imageTextSwiper} />}
        {/* 分期花 */}
        { cmbWelfare && cmbWelfare.dataObj && <CmbWelfare {...cmbWelfare} />}
        {/* 一行两列带分隔图文展位 赚钱有道 */}
        { twoColumnAdv$1 && twoColumnAdv$1.dataObj && <TwoColumnAdv {...twoColumnAdv$1} /> }
        {/* N行三列图片跳转列表 信用服务 */}
        { rownColumn3Card && rownColumn3Card.dataObj && <RownColumn3Card {...rownColumn3Card} /> }
        {/* 列表运营位 精选活动 */}
        { listAdv && listAdv.dataObj && <ListAdv {...listAdv} /> }
        {/* 轮播图不带边框 2 */}
        {/* { bannerWithoutBorder$2 && bannerWithoutBorder$2.dataObj && <BannerWithoutBorder {...bannerWithoutBorder$2} /> } */}
        {/* N行两列图文跳转列表 1 */}
        {/* { rownColumn2Card$1 && rownColumn2Card$1.dataObj && <RownColumn2Card {...rownColumn2Card$1} /> } */}
        {/* N行两列图文跳转列表 2 */}
        {/* { rownColumn2Card$2 && rownColumn2Card$2.dataObj && <RownColumn2Card {...rownColumn2Card$2} /> } */}
        {/* <RowsImgs2Title {...rowsImgs2Title} /> */}
        {/* N行三列图片跳转列表 1 */}
        {/* { rownColumn3Card$1 && rownColumn3Card$1.dataObj && <RownColumn3Card {...rownColumn3Card$1} /> } */}
        {/* N行三列图片跳转列表 2 */}
        {/* { rownColumn3Card$2 && rownColumn3Card$2.dataObj && <RownColumn3Card {...rownColumn3Card$2} /> } */}
        {/* 内容资讯 3个 */}
        {/* { contentInformation$1 && contentInformation$1.dataObj && <ContentInformation {...contentInformation$1} /> }
        { contentInformation$2 && contentInformation$2.dataObj && <ContentInformation {...contentInformation$2} /> }
        { contentInformation$3 && contentInformation$3.dataObj && <ContentInformation {...contentInformation$3} /> } */}
        {/* 热门话题 */}
        {rowsColumnOneTextbox && rowsColumnOneTextbox.dataObj && <RowsColumnOneTextbox {...rowsColumnOneTextbox} />}
        {/* 关于我们 */}
        { aboutUs && aboutUs.dataObj && <AboutUs {...aboutUs} /> }
        {/* 品牌文案 */}
        { brandText && brandText.dataObj && <BrandText {...brandText} /> }
        {/* 吸底登录 */}
        { bottomLogin && bottomLogin.dataObj && <BottomLogin {...bottomLogin} onClick={this.props.doLogin} /> }
        {/* 浮动强提醒 */}
        { floatTopNotice && floatTopNotice.dataObj && <FloatTopNotice {...floatTopNotice} /> }
        {/* 浮动图片 h5使用lui展位 */}
        { isH5 && floatImage && floatImage.dataObj && (
          <FloatImage {...floatImage} />
        )}
        {/* 催收弹窗 */}
        {urgingPaymentDialog && urgingPaymentDialog.dataObj
        && (
          <UrgingPaymentDialog
            {...urgingPaymentDialog}
            isLogin={isLogin}
            userInfo={userInfo}
            maskRealName={maskRealName}
          />
        )}
        {/* 广告弹窗展位 */}
        { dialog && dialog.dataObj && <Dialog {...dialog} /> }
        {/* 微信收藏引导 */}
        { process.env.TARO_ENV === 'weapp' && wechatGuideCollect && wechatGuideCollect.dataObj && <WechatGuideCollect {...wechatGuideCollect} />}
        <LoginManage loginSimplifyParams={loginSimplifyParams} />
      </MUView>
    );
  }
}

export default OtherDefaultBlock;
