import Madp from '@mu/madp';
// import { goURL } from '../../../../../../../src/utils/common'; 本地使用相对路径编译通过
import { goURL } from '@global/utils/common';

const mixJump = (options) => {
  if (process.env.TARO_ENV === 'alipay') {
    // 支付宝走壳工程跳转
    goURL(options);
  } else {
    Madp.navigateTo(options);
  }
};

export default mixJump;
