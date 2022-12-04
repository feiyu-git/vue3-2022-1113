/**
 * 重度逾期版面
 * 组件内容与其他不一样
 * */
import Madp from '@mu/madp';
import { MUView } from '@mu/zui';
import classNames from 'classnames';
import {
  BrandText,
  ChannelLoanSpecialist,
  FloatTopNotice
} from '@mu/lui';
import { urlDomain } from '@mu/business-basic';
import ChannelRepayServices from '@mu/channel-repay-services';
import LoanHelp from '@mu/loan-help';
import HomeNavigateBar from '../../../components/home/home-navigatebar';
import BackgroundImage from '../../../components/home/background-image';
import Slogan from '../../../components/home/slogan';
import CreditCard from '../../../components/home/credit-card';
import { USER_TAG } from '../../../utils/constants';
import './index.scss';

// 贷款帮帮二级页链接
const LOAN_HELP_LIST_URL = `${urlDomain}/${Madp.getChannel()}/mainpage/#/pages/loan-help-list/index`;

export default class SevereOverdueBlock extends Madp.Component {
  getHomeNavigateBar() {
    const {
      currChannelConfig: { isAppChannel } = {}, homeNavigateBar = {}, isShowNavigateBar, currentUserTag
    } = this.props;
    if (process.env.TARO_ENV === 'h5') {
      const channel = Madp.getChannel();
      const { ITEM_TYPES } = HomeNavigateBar;
      // 导航栏元素配置，0APP重度逾期用户搜索+消息，2APP重度逾期只有消息icon
      const NAVIGATE_BAR_CONFIG = {
        default: [ITEM_TYPES.MSG_ICON],
        [`0APP_${USER_TAG.SEVERE_OVERDUE}`]: [ITEM_TYPES.SEARCH, ITEM_TYPES.MSG_ICON], // 0APP 重度逾期：[搜索、消息]
        [`2APP_${USER_TAG.SEVERE_OVERDUE}`]: [ITEM_TYPES.MSG_ICON], // 2APP 重度逾期：[消息]
      };
      return (
        isAppChannel && (
          <HomeNavigateBar
            {...this.props}
            data={{ ...homeNavigateBar, ...homeNavigateBar.dataObj }}
            searchData={{ showService: '0' }}
            isShow={isShowNavigateBar}
            itemsConfig={NAVIGATE_BAR_CONFIG[`${channel}_${currentUserTag}`] || NAVIGATE_BAR_CONFIG.default}
          />
        )
      );
    }
    return (<MUView />);
  }

  render() {
    const {
      isLogin,
      refreshBusinessData,
      brandText,
      statusBarHeight,
      virtualChannelRepayServices,
      channelLoanSpecialist,
      floatTopNotice,
      virtualIdCommon,
      // virtualChannelOverdueSlogan,
    } = this.props;
    // 重度逾期 slogan 写死
    const overdueSlogan = {
      dataObj: {
        title: '诚信价值千金，让信用不负期待！',
        subTitle: '',
      },
    };
    const loanHelpId = (virtualIdCommon && virtualIdCommon.dataObj && virtualIdCommon.dataObj.id) || '';
    return (
      <MUView className={classNames('homepage-block-container severe-overdue', { is_login: isLogin })}>
        {/* 大促图的优先级 > 背景图 */}
        <BackgroundImage statusBarHeight={statusBarHeight} />
        {/* APP 首页导航栏 */}
        {this.getHomeNavigateBar()}
        <MUView className="navigatebar-status-height" style={{ paddingTop: statusBarHeight }} />
        <Slogan {...overdueSlogan} show />
        <MUView
          className="position-fix"
          style={{ height: Madp.pxTransform(30) }}
        />
        {/* 额度卡片 */}
        <CreditCard {...this.props} />
        {/* 还款服务卡片 仅登陆时展示 */}
        {isLogin && (
          <ChannelRepayServices
            beaconId="ChannelRepayServicesCard"
            type="card"
            refreshBusinessData={refreshBusinessData}
            configData={virtualChannelRepayServices && virtualChannelRepayServices.dataObj}
          />
        )}
        {/* 贷后专家 */}
        <ChannelLoanSpecialist {...channelLoanSpecialist} />
        {/* 贷款帮帮 */}
        {loanHelpId && (
          <LoanHelp
            sectionId={loanHelpId}
            maxNum={4}
            beaconId="LoanHelpCard"
            type="card"
            title="贷款帮帮"
            moreMsg="更多内容"
            moreUrl={LOAN_HELP_LIST_URL}
          />
        )}
        {/* 品牌文案 */}
        <BrandText {...brandText} />
        {/* 浮动强提醒 */}
        {floatTopNotice && floatTopNotice.dataObj && <FloatTopNotice {...floatTopNotice} />}
      </MUView>
    );
  }
}
