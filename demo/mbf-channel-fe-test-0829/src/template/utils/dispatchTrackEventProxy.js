import { dispatchTrackEvent, EventTypes } from '@mu/madp-track';
// 展位上报专属ID, 请勿修改
const moduleId = 'coscomponents';

/**
 * 发送点击事件, 详见readme
 * @param {object} props 构建beaconId
 * @param {string} props.name 组件config定义的名字
 * @param {string} props.boothDataId 服务器返回组件Id
 * @param {object} props.pagesData 服务器返回组件数据中的页面数据
 * @param {object} props.extendInfo 引擎返回的业务参数,包含了客群和运营主体标签
 * @param {object} beaconContent 自定义数据: position, title, contentId || cusContentId
 * @param {string} beaconContent.title 平台下发的内容标题
 * @param {string} beaconContent.position 内容位置
 * @param {string} beaconContent.contentId 内容hash
 * @param {string} [beaconContent.cusContentId] 无hash时传入自定义按钮id
 */
export const sendEV = (props, beaconContent) => {
  const {
    name,
    pagesData, boothDataId,
    extendInfo = {},
  } = props || {};
  const {
    customerGroupTag = '', // 客群标签
    operationSubjectTag = '', // 运营主体标签
    customerGroupTagPage = '', // 客群标签
    operationSubjectTagPage = '', // 运营主体标签
  } = extendInfo;
  const {
    title,
    position,
    contentId = '',
    cusContentId = '', // 内容点击为 contentId, 非内容点击为 cusContentId,
  } = beaconContent || {};

  const { pageId } = pagesData || {};

  if (!name || !pageId) { // 避免本地调试报错
    return;
  }
  dispatchTrackEvent({
    beaconId: `${moduleId}.${pageId}.${name}.${boothDataId}`,
    event: EventTypes.EV,
    beaconContent: {
      cus: {
        title,
        position,
        contentId: contentId || cusContentId,
        cstGrp: customerGroupTag,
        optSubj: operationSubjectTag,
        cstGrpPage: customerGroupTagPage,
        optSubjPage: operationSubjectTagPage,
      }
    }
  });
};

/**
 * 发送曝光事件, 详见readme
 * @param {object} props
 * @param {string} props.name 组件config定义的名字
 * @param {func}   props.tplEvents 乐高默认返回的曝光回调
 * @param {string} props.id 服务器返回组件数据中的id
 * @param {object} props.extendInfo 引擎返回的业务参数,包含了客群和运营主体标签
 * @param {string} props.pagesData 服务器返回组件数据中的页面数据
 * @param {object} props.boothDataId 服务器返回组件数据中的页面展位数据
 * @param {string} props.boothTitle 服务器返回的页面埋点标题
 */
export const sendSO = (props) => {
  const {
    id, name = '',
    tplEvents, boothDataId, boothTitle,
    pagesData,
    extendInfo = {},
  } = props || {};

  const { pageId } = pagesData || {};
  const {
    customerGroupTag = '', // 客群标签
    operationSubjectTag = '', // 运营主体标签
    customerGroupTagPage = '', // 客群标签
    operationSubjectTagPage = '', // 运营主体标签
  } = extendInfo;

  name && tplEvents && tplEvents.on('tplExposure', (tempId) => {
    if (+tempId === +id) {
      dispatchTrackEvent({
        target: this,
        beaconId: `${moduleId}.${pageId}.${name}.${boothDataId}`,
        event: EventTypes.SO,
        beaconContent: {
          cus: {
            title: boothTitle,
            cstGrp: customerGroupTag,
            optSubj: operationSubjectTag,
            cstGrpPage: customerGroupTagPage,
            optSubjPage: operationSubjectTagPage,
          }
        }
      });
    }
  });

  name && tplEvents && tplEvents.on('tplExposure_inner', (info) => {
    const {
      _id, index = -1, contentTitle, hash,
    } = info || {};
    if (+_id === +id && hash) {
      dispatchTrackEvent({
        beaconId: `${moduleId}.${pageId}.${name}.${boothDataId}`,
        event: EventTypes.SO,
        beaconContent: {
          cus: {
            title: contentTitle,
            position: index,
            contentId: hash,
            cstGrp: customerGroupTag,
            optSubj: operationSubjectTag,
            cstGrpPage: customerGroupTagPage,
            optSubjPage: operationSubjectTagPage,
          }
        }
      });
    }
  });
};


/**
 * 发送展位曝光事件, 详见readme
 * @param {object} props 构建beaconId
 * @param {string} props.name 组件config定义的名字
 * @param {object} props.pagesData 服务器返回组件数据中的页面数据
 * @param {object} props.boothDataId 服务器返回组件数据中的页面展位数据
 * @param {string} props.boothTitle 服务器返回的页面埋点标题
 * @param {object} props.extendInfo 引擎返回的业务参数,包含了客群和运营主体标签
 */
export const sendSectionSO = (props) => {
  const {
    name = '',
    boothDataId, boothTitle,
    pagesData,
    extendInfo = {},
  } = props || {};
  const {
    customerGroupTag = '', // 客群标签
    operationSubjectTag = '', // 运营主体标签
    customerGroupTagPage = '', // 客群标签
    operationSubjectTagPage = '', // 运营主体标签
  } = extendInfo || {};

  const { pageId } = pagesData || {};

  if (!name || !pageId) { // 避免本地调试报错
    return;
  }
  dispatchTrackEvent({
    beaconId: `${moduleId}.${pageId}.${name}.${boothDataId}`,
    event: EventTypes.SO,
    beaconContent: {
      cus: {
        title: boothTitle,
        cstGrp: customerGroupTag,
        optSubj: operationSubjectTag,
        cstGrpPage: customerGroupTagPage,
        optSubjPage: operationSubjectTagPage,
      }
    }
  });
};

/**
 * 发送内容曝光事件, 详见readme
 * @param {object} props 构建beaconId
 * @param {string} props.name 组件config定义的名字
 * @param {string} props.dataObj 服务器返回组件数据
 * @param {object} props.pagesData 服务器返回组件数据中的页面数据
 * @param {object} props.extendInfo 引擎返回的业务参数,包含了客群和运营主体标签
 * @param {object} beaconContent 自定义数据: position, title, contentId || cusContentId
 * @param {string} beaconContent.title 平台下发的内容标题
 * @param {string} beaconContent.position 内容位置
 * @param {string} beaconContent.contentId 内容hash
 * @param {string} [beaconContent.cusContentId] 无hash时传入自定义按钮id
 */
export const sendContentSO = (props, beaconContent) => {
  const {
    name,
    pagesData, boothDataId,
    extendInfo = {},
  } = props || {};
  const {
    customerGroupTag = '', // 客群标签
    operationSubjectTag = '', // 运营主体标签
    customerGroupTagPage = '', // 客群标签
    operationSubjectTagPage = '', // 运营主体标签
  } = extendInfo || {};
  const {
    title,
    position,
    contentId = '',
    cusContentId,
  } = beaconContent || {};

  const { pageId } = pagesData || {};

  if (!name || !pageId) { // 避免本地调试报错
    return;
  }
  dispatchTrackEvent({
    beaconId: `${moduleId}.${pageId}.${name}.${boothDataId}`,
    event: EventTypes.SO,
    beaconContent: {
      cus: {
        title,
        position,
        contentId: contentId || cusContentId,
        cstGrp: customerGroupTag,
        optSubj: operationSubjectTag,
        cstGrpPage: customerGroupTagPage,
        optSubjPage: operationSubjectTagPage,
      }
    }
  });
};
