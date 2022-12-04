import { apiHost } from '@mu/business-basic';
import fetch from '../../utils/fetch';

export const getSessionInfo = async () => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.userInformation.getUserInfo`, {
      autoLoading: false,
    });
    return res || {};
  } catch (e) {
    return {};
  }
};

/**
 * 参考文档：https://new-docs.mucfc.com/weboffice/l/cn2EkacWvG0P
 * @param {*} sceneFuction 可选入参说明
 *    QUERY_PERSONAL_INFO：需配合其他入参查询信息
 *    QUERY_USER_INFO：非登录的情况下查询用户信息【加上 flag=1 对应查询到的是老接口信息】
 *
 *  @param {*} updateUserInfoTypeList 可选入参说明（多个传入数组）
 *    USER_BUSINESS_INFO:更新用户业务信息到会话属性;
      USER_TAG_INFO:更新用户标签信息到会话属性中
 */
export const getUserInfo = async (data = {}) => {
  const { sceneFuction, updateUserInfoTypeList } = data;
  const params = {
    sceneFuction: 'QUERY_USER_INFO',
    flag: '1'
  };
  if (sceneFuction) {
    params.sceneFuction = sceneFuction;
  }
  if (updateUserInfoTypeList) {
    params.updateUserInfoTypeList = updateUserInfoTypeList;
  }
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.infoMaintain.getUserInfo`, {
      autoLoading: false,
      data: {
        data: params
      }
    });
    return res || {};
  } catch (e) {
    return {};
  }
};

export const unBind = async (data) => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.login.logout`, {
      data: {
        data,
      },
    });
    return res;
  } catch (e) {
    return null;
  }
};

export const queryAccountInfo = async (data) => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.loan.account.queryAccountInfo`, {
      autoLoading: false,
      data: {
        data,
      },
    });
    return res;
  } catch (e) {
    return null;
  }
};

export const queryUserFunction = async (functionCodeList) => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.userInformation.queryUserFunction`, {
      autoLoading: false,
      data: {
        data: {
          functionCodeList,
        },
      },
    });
    return res;
  } catch (e) {
    return null;
  }
};

export const queryCustomerTag = async () => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.recommend.content.queryCustomerTag`, {
      autoLoading: false,
    });
    return res;
  } catch (e) {
    return null;
  }
};

export const getSendSms = async (params) => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.login.validIdentitySendSms`, {
      autoLoading: false,
      data: {
        data: {
          ...params,
        }
      },
    });
    return res;
  } catch (e) {
    return null;
  }
};

export const getSmsLogin = async (params) => {
  try {
    const res = await fetch(`${apiHost.mgp}?operationId=mucfc.user.login.smsLogin`, {
      autoLoading: false,
      data: {
        data: {
          ...params,
        }
      },
    });
    return res;
  } catch (e) {
    return null;
  }
};
