import Madp, { Component } from '@mu/madp';
import classNames from 'classnames';
import { isMuapp, debounce } from '@mu/madp-utils';
import { MUImage, MUView } from '@mu/zui';
import { sendEV } from '../../../utils/dispatchTrackEventProxy';
import './index.scss';


export default class BackgroundImage extends Component {
  onClick = debounce(() => {
    const { dataObj } = this.props;
    const {
      targetUrl,
      contentList = [],
    } = dataObj || {};
    if (!targetUrl) {
      // 仅大促图有链接
      const {
        elementTitle,
        hash,
      } = contentList;
      const beaconContent = {
        title: elementTitle,
        position: -1,
        contentId: hash,
      };
      const url = contentList[0] && contentList[0].targetUrl;

      sendEV(dataObj, beaconContent);

      url && Madp.navigateTo({
        url,
        useAppRouter: isMuapp(),
      });
    }
  }, 1000, {
    leading: true,
    trailing: false,
  });


  render() {
    const {
      statusBarHeight = 0,
      dataObj = {},
      // backgroundImageProps
    } = this.props;
    const {
      contentList = [],
    } = dataObj || {};
    // 背景图的配置在dataObj下，大促图的配置在contentList[0]中，两个只会存在一个
    // Todo: 父组件已经处理过展示促销图还是背景图，此处为什么还要选择？
    // const imgUrl = dataObj.imgUrl || (contentList[0] && contentList[0].imgUrl) || backgroundImageProps;
    const imgUrl = dataObj.imgUrl || (contentList[0] && contentList[0].imgUrl);
    const offestIndex = statusBarHeight - 20 > 15 ? 20 : statusBarHeight - 20;
    console.log('背景图img', imgUrl);
    return (
      <MUView className={classNames('backgroundImage', { has_content: !!imgUrl })}>
        {imgUrl && (
          <MUImage
            className="image"
            src={imgUrl || ''}
            imgProps={{ 'data-src': imgUrl || '' }}
            mode="widthFix" // todo 生活号中样式问题需要解决
            alt=""
            style={{ top: offestIndex }}
            onClick={this.onClick}
          />
        )}
      </MUView>

    );
  }
}
