import fetch from '@global/utils/fetch';
import Madp from '@mu/madp';
import { apiHost, urlDomain } from '@mu/business-basic';

// 查额度
export const isHaveCredit = async () => {
  try {
    const res = await fetch(apiHost.mgp, {
      operationId: 'mucfc.loan.account.queryAccountInfo',
      data: { busiType: 'XJ', queryType: '01' },
      autoLoading: false
    });
    const { accountInfoList } = res || {};
    if (!accountInfoList || !accountInfoList[0]) return true;
    // 账户管控状态为1表示状态正常
    const { acctControlStatus } = accountInfoList[0];
    if (acctControlStatus !== '1') return true;
    const { limitInfoList } = accountInfoList[0];
    let isHave = true;
    limitInfoList && limitInfoList.forEach(({ status, fixedLimit }) => {
      // 限制固定额度大于0 ,状态为待激活、正常当做有额度
      if ((fixedLimit > 0) && (status === 'Y' || status === 'P')) {
        isHave = false;
      }
    });
    return isHave;
  } catch (e) {
    return true;
  }
};

// 身份证上传待办项
export const initIdCard = async () => {
  const isNoCredit = await isHaveCredit();
  if (isNoCredit) return;
  const channel = Madp.getChannel();
  try {
    const res = await fetch(apiHost.mgp, {
      operationId: 'mucfc.user.infocompletion.queryStatus',
      data: {
        componentTypeList: ['CP_TYPE_IDENTITY'],
        scene: 'SCENE_COMPLEMENT_PHOTO_INDEPENDENT'
      },
      autoLoading: false,
    });
    const { isNeedIdCard } = res;
    // eslint-disable-next-line no-useless-return
    if (!isNeedIdCard) return;
    return {
      title: '上传身份证',
      cdpTitle: '为保障您的账户安全，请完成身份验证',
      targetUrl: `${urlDomain}/${channel}/usercenter/#/bio-addIdCard?isNeedIdCard=1&scene=SCENE_COMPLEMENT_PHOTO_INDEPENDENT`,
      btnTitle: '去上传',
      hash: 'IdCard',
    };
  } catch (err) {
    console.log('idCardError', err);
  }
};

// 银行卡绑定待办项
export const initBankCard = async () => {
  const isNoCredit = await isHaveCredit();
  if (isNoCredit) return;
  const channel = Madp.getChannel();
  try {
    const res = await fetch(apiHost.mgp, {
      operationId: 'mucfc.user.bankCard.queryBankCards',
      data: {
        scene: 'bank_card_management',
        cardTypes: ['0'],
        mapCodeAction: 'bindcard'

      },
      autoLoading: false,
    });
    const { bankCards } = res;
    const bankCardsLength = bankCards.length;
    // eslint-disable-next-line no-useless-return
    if (bankCardsLength !== 0) return;
    return {
      title: '绑定银行卡',
      cdpTitle: '提前添加收款账号，借款更便捷',
      targetUrl: `${urlDomain}/${channel}/usercenter/#/bankcard/bind-card`,
      btnTitle: '去绑定',
      hash: 'bankCard',
    };
  } catch (err) {
    console.log('bankCardError', err);
  }
};

// 设置交易密码待办项
export const initDealPassword = async () => {
  const isNoCredit = await isHaveCredit();
  if (isNoCredit) return;
  const channel = Madp.getChannel();
  try {
    const res = await fetch(apiHost.mgp, {
      operationId: 'mucfc.user.userInformation.getUserInfo',
      autoLoading: false,
    });
    const { hasTradePassword } = res;
    // eslint-disable-next-line no-useless-return
    if (hasTradePassword) return;
    return {
      title: '设置交易密码',
      cdpTitle: '您尚未设置交易密码，点击立即设置',
      targetUrl: `${urlDomain}/${channel}/safecenter/#/member/reset-password/now-phone-check`,
      btnTitle: '去设置',
      hash: 'DealPassword',
    };
  } catch (err) {
    console.log('DealPasswordError', err);
  }
};
