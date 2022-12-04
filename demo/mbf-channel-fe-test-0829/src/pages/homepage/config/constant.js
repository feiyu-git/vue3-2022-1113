// 自定义的组件 key,用于虚拟展位控制自定义组件的展示与隐藏
export const LOCAL_COMPONENT = {
  TopNav: 'TopNav',
  UserInfo: 'UserInfo', // 用户信息APP
  UserInfoLife: 'UserInfoLife', // 用户信息生活号
  CoreFunction: 'CoreFunction',
  MyService: 'MyService', // 全部服务APP
  CreditList: 'CreditList',
  AboutUs2APP: 'AboutUs2APP',
  WoScoreEntry: 'WoScoreEntry',
  Reservation: 'Reservation'
};

/**
 * 首页组件类型
 *  APP_HOME：有自定义的下拉刷新、下拉二楼、顶部
*/
export const HOME_COMP_TYPE = {
  APP_HOME: 'app',
  ALIPAY_LIFE_HOME: 'alipayLife',
  STANDARD_HOME: 'standard',
  UNICOM_HOME: 'unicom'
};
