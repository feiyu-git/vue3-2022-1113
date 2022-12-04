import { getCurrentPageUrl } from '@mu/madp-utils';
import Madp from '@mu/madp';
import FeLogger from '@mu/fe-logger';

export function checkIfCrossChannel() {
  const { referrer } = window.document;
  // 没有来源页面，无需判断
  if (!referrer) return;

  const zlReg = /https?:\/\/[\w-]+\.(?:mucfc|cfcmu|mucf).(?:cn|com|cc)/g;
  const zlMatch = referrer.match(zlReg);
  // 不为招联相关页面，无需判断
  if (!zlMatch) return;

  // 配合构建发布系统改动，渠道码会做大写限制
  const reg = /\/([0-9A-Z])+\//g;
  const rChannelMatch = referrer.match(reg);
  const { pathname } = window.location;
  const channelMatch = pathname.match(reg);

  // 跳转而来的页面不带渠道码，表示非移动开发平台构建发布系统的页面工程跳转而来，无需检测
  if (!rChannelMatch || !channelMatch) {
    return;
  }

  // 设置上报概率为1%
  const ifNeedSentry = Math.random() <= 0.01;
  const rChannel = rChannelMatch[0].replace(/\//g, '');
  const channel = channelMatch[0].replace(/\//g, '');
  // 存在跨渠道跳转，需要在sentry进行上报
  if (rChannel !== channel && ifNeedSentry) {
    const currentPage = getCurrentPageUrl();
    const sentryMsg = `存在跨渠道跳转！来源：${encodeURIComponent(referrer)} 跳转地址：${encodeURIComponent(currentPage)}`;
    setTimeout(() => {
      FeLogger.captureMessage(sentryMsg);
    }, 2000);
  }
}

/**
 * 检测访问的接口地址
 * 由于sentry会默认对包含url格式的上报信息进行合并，故需要对url进行编码将issue区分开来
 */
export function checkRequestUrl(options) {
  const pageUrl = getCurrentPageUrl();
  const { url } = options;

  // 该正则用于匹配新老接口参数部分，为后续上报时去参做准备
  const paramsIndexReg = /((?<=(operationId=[\w.]+))&[\w+=\w+&?]+)|(\?(?!operationId)[\w+=\w+&?]+)/g;
  const paramsIndex = url.indexOf(url.match(paramsIndexReg));
  const formatUrl = paramsIndex > -1 ? url.slice(0, paramsIndex) : url;

  const domainReg = /^https?:\/\/[\w.-]+\.(?:mucfc|cfcmu|mucf).(?:cn|com|cc)(?:$|\/|\?)/g;

  // 设置上报概率为1%
  const ifNeedSentry = Math.random() <= 0.01;

  let sentryMsg;

  // 判断是否调用了老中台接口
  const domainRes = url.match(domainReg);
  if (!domainRes) return;

  if (domainRes[0].indexOf('mgp') === -1) {
    sentryMsg = `页面地址${encodeURIComponent(pageUrl)}调用了老中台接口${encodeURIComponent(formatUrl)}，不符合规范！`;
    ifNeedSentry && FeLogger.captureMessage(sentryMsg);
    return;
  }

  // 部署后的页面路径格式为"域名/渠道/模块/#/页面"
  // 判断是否漏传、错传渠道码
  const channel = Madp.getChannel();
  const channelReg = /\/([0-9A-Z])+\/?/g;
  const channelRes = url.match(channelReg);
  let concatMsg;
  if (!channelRes || channelRes.length <= 0) {
    concatMsg = '漏传了渠道码';
  } else {
    const urlChannel = channelRes[0].replace(/\//g, '');
    if (urlChannel !== channel) {
      concatMsg = '错传了渠道码';
    }
  }

  sentryMsg = `页面地址${encodeURIComponent(pageUrl)}调用的接口${encodeURIComponent(formatUrl)}${concatMsg}，不符合规范！`;
  concatMsg && ifNeedSentry && FeLogger.captureMessage(sentryMsg);
}

/**
 * 给未携带渠道码的网关接口地址增加渠道码
 * @param {接口地址} url
 */
export function createProperUrl(url) {
  let properUrl = url;
  const channel = Madp.getChannel();

  const reg = /(\/?\?operationId=)/g;
  const matchRes = url.match(reg);
  const properReg = /\/[0-9A-Z]+\/?\?operationId=/g;

  // 若不为网关接口 或 调用的网关接口地址中已包含渠道码，将不做处理
  if (matchRes && !url.match(properReg)) {
    properUrl = url.replace(reg, `/${channel}$1`);
  }
  return properUrl;
}
