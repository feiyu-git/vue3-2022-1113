import { urlDomain, apiHost } from '@mu/business-basic';
import { getCurrentPageUrlWithArgs } from '@mu/madp-utils';
import { currentChannel, currentMapCodeList } from '../../../../../config/constants';
import { apiHostRun } from '../../../../utils/url_config';

export const URL_CONFIG = {
  CREDIT: `${urlDomain}/${currentChannel}/adjust/#/adjust-home?titleBarColor=226BFF&creditType=1`,
  CREDIT_FROZEN: `${urlDomain}/${currentChannel}/guidance/#/loan-frozen/index`,
  APPLY_BASE: `${urlDomain}/${currentChannel}/apply/#/index`,
  APPLY_NEW: `${urlDomain}/${currentChannel}/apply/#/index?mapCode=${currentMapCodeList.apply}`,
  // APP借款链接
  LOAN_BASE: currentChannel === '0APP' ? (
    `${apiHost.mgp}/?operationId=mucfc.content.business.router&functionId=FTBF003&channel=0APP&cashLoanMode=1?redirectUrl=${getCurrentPageUrlWithArgs()}`)
    : (`${urlDomain}/${currentChannel}/loan/#/pages/index/index?redirectUrl=${getCurrentPageUrlWithArgs()}`),
  // 小程序借款链接
  MINI_LOAN_BASE: `${urlDomain}/${currentChannel}/safecenter/#/cancel-ancount-loss/index?needLogin=1&redirectUrl=${encodeURIComponent(`/${getCurrentPageUrlWithArgs()}`)}`,
  // 生活号abUrl
  AB__LOAN_BASE: `${apiHostRun.mgp}?operationId=mucfc.content.business.router&functionId=FTBF003&channel=${currentChannel}&cashLoanMode=1&redirectUrl=${getCurrentPageUrlWithArgs()}`,
  REPAY: `${urlDomain}/${currentChannel}/repayment/#/pages/index/index?mapCode=${currentMapCodeList.repayment}`,
  LOSE_CANCEL: `${urlDomain}/${currentChannel}/safecenter/#/cancel-ancount-loss/index`,
  SUPPLE_INFO: `${urlDomain}/${currentChannel}/usercenter/#/pages/base-info/BaseInfo`,
};
