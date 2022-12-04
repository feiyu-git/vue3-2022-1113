import { getUrlParams } from '../index';

function getExtendInfoData() {
  const extendInfoData = {
    // 是否合规控制页面的标识，后台会根据该字段决定是否去要处理合规相关的内容
    compliancePageFlag: true,
  };

  // 只有游客 getPageConfig 接口才需要加入参 businessHandleStatus
  if (process.env.TARO_ENV === 'h5' && getUrlParams().visitor === '1') {
    extendInfoData.businessHandleStatus = 'VISITOR';
  }

  return extendInfoData;
}

export {
  getExtendInfoData,
};
