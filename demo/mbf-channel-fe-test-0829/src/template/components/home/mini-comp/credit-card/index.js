import Madp from '@mu/madp';
import { getCurrentPageUrlWithArgs, Url } from '@mu/madp-utils';
import {
  CreditCard as CreditCardAPP,
} from '@mu/credit-card';
import { CARD_ACTION } from '@mu/credit-card/common';
import mixJump from '../../../../utils/mixJump';
import { urlDomain } from '../../../../utils/constants';

export default class CreditCard extends Madp.Component {
  get parentBeaconId() {
    return 'Mini.Homepage';
  }

  creditProps = {
    busiType: 'XJ',
  };

  styleProps = {
    cardType: 'app',
    // 支付宝流程不一样 不能显示步骤和进度球
    isShowApplyStep: process.env.TARO_ENV !== 'alipay',
  }

  get applyProductInfo() {
    const mapCode = Url.getParam('mapCode');
    const dic = {
      '0MNP': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || 'e5763dbaea9b2419'
      }],
      '1MNP': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || 'c6d2d702f0b32e74'
      }],
      '0ZFBMNPJD': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || 'a6d2ce2e91cfcb66'
      }],
      '0JD1ZFBMNP': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || '65a959d40c7d2a30'
      }],
      '0JD2ZFBMNP': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || 'e7301cd70245fd4e'
      }],
      '0JD3ZFBMNP': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || '1bafc3e25a234f95'
      }],
      '0JD4ZFBMNP': [{
        applyProductCode: 'XJXE001',
        applyMapcode: mapCode || '5e318204cd8565bd'
      }],
      '0ZFB': [{
        applyProductCode: 'XJXE001',
        applyMapcode: '7b7fe209824bda61'
      }],
      '2ZFB': [{
        applyProductCode: 'XJXE001',
        applyMapcode: '6f592e740446258f'
      }],
      '16ZFB': [{
        applyProductCode: 'XJXE001',
        applyMapcode: 'b97151c6b6f7582d'
      }],
      '17ZFB': [{
        applyProductCode: 'XJXE001',
        applyMapcode: 'f480f81cae5e775d'
      }],
      '15ZFB': [{
        applyProductCode: 'XJXE001',
        applyMapcode: 'd48b7fafa602c963'
      }],
      '18ZFB': [{
        applyProductCode: 'XJXE001',
        applyMapcode: 'f3f5038e05adb8b3'
      }]
    };
    const channel = Madp.getChannel();
    return dic[channel] || dic['0MNP'];
  }

  customerAciton = (cradActionType) => {
    if (cradActionType === CARD_ACTION.ACTION_UNLOGIN) {
      return () => {
        this.props.onLogin();
      };
    } else if (cradActionType === CARD_ACTION.ACTION_CREDIT_LOSE_CANCEL) {
      return () => {
        mixJump({
          // eslint-disable-next-line max-len
          url: `${urlDomain}/${Madp.getChannel()}/safecenter/#/cancel-ancount-loss/index?needLogin=1&redirectUrl=${encodeURIComponent(`/${getCurrentPageUrlWithArgs()}`)}`,
        });
      };
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      applyData: {},
    };

    props.instanceRef && props.instanceRef(this);

    this.init = this.init.bind(this);
  }

  async init() {
    const data = await this.creditCard.init();
    return data;
  }

  render() {
    return (
      <CreditCardAPP
        instanceRef={(e) => { this.creditCard = e; }}
        creditProps={this.creditProps}
        applyProductInfo={this.applyProductInfo}
        configProps={{ isCommonLoan: true }}
        customerAciton={this.customerAciton}
        styleProps={this.styleProps}
        beaconId={this.parentBeaconId}
      />
    );
  }
}
