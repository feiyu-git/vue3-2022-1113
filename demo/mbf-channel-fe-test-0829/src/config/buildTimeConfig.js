const buildTimeConfig = {
  sbd: {
    APP: 'sbd',
    userCenter: {
      copywriting2: '用户中心文案2'
    },
    mini: {
      set: 'https://file.mucfc.com/cop/6/31/202106/2021060418023520f029.png',
      headDefault: 'https://file.mucfc.com/cop/21/0/2021010/202110081631496e44de.png',
      arrow: 'https://file.mucfc.com/cop/21/0/2021010/202110081631262c152f.png',
      credit2: 'https://file.mucfc.com/cop/6/31/202106/2021060418030387125f.png',
      credit1: 'https://file.mucfc.com/cop/21/0/2021010/202110081630447a6450.png',
      paybill: 'https://file.mucfc.com/cop/21/0/2021010/202110081631177a0da2.png',
      bgImg: 'https://file.mucfc.com/cop/21/0/2021010/20211008163149b8df88.png'
    },
    apply: {
      copywriting1: '申请模块文案1',
      isHideBankcardEntry: true,
      isHideIdentityEntry: true,
      isHideIncrementEntry: true
    },
    prodStaticDomain: '.stech.muftc.com',
    apiHost: {
      st1: {
        mgp: 'https://mgp-stech-st1.api.muftc.com/stb-esi-mgp/'
      },
      se: {
        mgp: 'https://mgp-stech-se.api.muftc.com/stb-esi-mgp/'
      },
      prod: {
        mgp: 'https://mgp-stech.api.muftc.com/stb-esi-mgp/'
      },
      uat: {
        mgp: 'https://mgp-stech-uat.api.muftc.com/stb-esi-mgp/'
      }
    },
    logoTextWhiteStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/202109060931463f1856.png',
    fullName: '深圳市首帮科技有限公司',
    logoTextStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/202109031104596601f3.png',
    logoStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/202109031104456cba17.png',
    logoLongTextStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/202109060931462de53e.png',
    domain: {
      st: 'https://m-zl-st.stech.muftc.com',
      se: 'https://m-zl-se.stech.muftc.com',
      prod: 'https://m-zl.stech.muftc.com',
      uat: 'https://m-zl-uat.stech.muftc.com'
    },
    loginregister: {
      isHideWxZfbLoginWay: true
    },
    name: '首帮贷',
    shortName: '首帮科技',
    stStaticDomain: '.stech.muftc.com',
    repayment: {
      isHideWxZfbRepayWay: true
    }
  },
  mucfc: {
    APP: 'mucfc',
    userCenter: {
      copywriting2: '用户中心文案2'
    },
    mini: {
      set: 'https://file.mucfc.com/cop/6/31/202106/2021060418023520f029.png',
      headDefault: 'https://file.mucfc.com/cop/6/31/202106/202106041802242faac7.png',
      credit2: 'https://file.mucfc.com/cop/6/31/202106/2021060418030387125f.png',
      credit1: 'https://file.mucfc.com/cop/6/31/202106/20210604180256253352.png',
      bgImg: 'https://file.mucfc.com/cop/6/31/202106/202106041802107d25de.jpg'
    },
    apply: {
      copywriting1: '申请模块文案1',
      isHideBankcardEntry: false,
      isHideIdentityEntry: false,
      isHideIncrementEntry: false
    },
    prodStaticDomain: '.mucfc.com',
    logoTextWhiteStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/20210906093146f3c566.png',
    fullName: '招联消费金融有限公司',
    logoTextStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/202109031118277b8602.png',
    logoStaticUrl: 'https://file.mucfc.com/cop/21/0/202109/202109031118195bd560.png',
    logoLongTextStaticUrl: 'https://file.mucfc.com/cop/21/0/2021010/2021102809071056c37c.png',
    loginregister: {
      isHideWxZfbLoginWay: false
    },
    name: '招联',
    shortName: '招联金融',
    stStaticDomain: '.cfcmu.cn',
    repayment: {
      isHideWxZfbRepayWay: false
    }
  }
};

const env = process.env.APP || 'mucfc';

export default buildTimeConfig[env];
