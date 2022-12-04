import Madp from '@mu/madp';
import AppDefaultBlock from './app-default-block';
import OtherDefaultBlock from './other-default-block/index';
import SevereOverdueBlock from './severe-overdue-block';
import VisitorBlock from './visitor-block';
import { USER_TAG } from '../../utils/constants';

const ContentBlock = (props) => {
  if (process.env.TARO_ENV !== 'h5') {
    // 小程序
    if (props.currentUserTag === USER_TAG.SEVERE_OVERDUE) {
      return <SevereOverdueBlock {...props} />;
    }
    return (<OtherDefaultBlock {...props} />);
  } else {
    // 小程序无游客版面，故在h5判断即可
    const {
      visitor, currentUserTag, currChannelConfig: { isAppChannel } = {}
    } = props;
    if (visitor === '1') return <VisitorBlock {...props} />;
    // app及其他非小程序渠道,isAppChanne 仅包括 0APP/2APP
    const DefaultBlock = isAppChannel ? <AppDefaultBlock {...props} /> : <OtherDefaultBlock {...props} />;
    // 根据用户标签展示不同版面，重度逾期展示中的古逾期版面，其他标签均为默认版面
    switch (currentUserTag) {
      case USER_TAG.SEVERE_OVERDUE: {
        return <SevereOverdueBlock {...props} />;
      }
      default: {
        return DefaultBlock;
      }
    }
  }
};

export default ContentBlock;
