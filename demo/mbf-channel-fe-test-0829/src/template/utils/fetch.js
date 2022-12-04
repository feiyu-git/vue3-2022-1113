import { fetch } from '@mu/business-basic';

const excludeKeys = ['reqEnvParams'];
// 是否是忽略的key
const isExcludeKey = (key) => excludeKeys.indexOf(key) > -1;

// 请求拦截器
fetch.interceptor.request((chain) => {
  const { requestParams = {} } = chain || {};
  // 这里可以扩展自己的请求入参
  const {
    url = '',
    operationId = '',
    data,
  } = requestParams;
  // console.log('newfetch', url, requestParams);

  if (operationId && url) {
    requestParams.url = `${url}?operationId=${operationId}`;
  } else {
    requestParams.url = url;
  }
  // data.data = JSON.stringify(data);
  if (!data.data) {
    // 接口获取的data实际是data.data，需要自己处理下传递的数据,遍历data的key值，把没有忽略的添加到data.data中
    const reqData = {};
    Object.entries(data).forEach(([key, val]) => {
      if (!isExcludeKey(key)) {
        reqData[key] = val;
        // delete data[key];
      }
    });
    data.data = JSON.stringify(reqData);
  }
  requestParams.autoLoading = false;
  return chain.proceed(requestParams);
});

export default fetch;
