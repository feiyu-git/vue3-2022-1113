/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
import Madp, { Component } from '@mu/madp';
import { Swiper, SwiperItem } from '@tarojs/components';
import { debounce, isMuapp } from '@mu/madp-utils';
import fetch from '@utils/fetch';
import { observer, inject } from '@tarojs/mobx';
import { apiHost, urlDomain } from '@mu/business-basic';
import { EventTypes, dispatchTrackEvent } from '@mu/madp-track';
import { currentChannel, currentMapCodeList } from '@config/constants';
import { sendSectionSO } from '@utils/dispatchTrackEventProxy';
import { MUView, MUImage } from '@mu/zui';
import { initIdCard, initBankCard, initDealPassword } from './utils/querytask';
import './index.scss';
import iconImg from './img/ic_daiban@3x.png';
import iconRightBtn from './img/right_btn@2x.png';

// 代办通知
// 周期性由推荐系统处理, 一次性需要在点击后调用屏蔽接口

@inject('IndexStore')
@observer
export default class UnhandleNotice extends Component {
  constructor(props) {
    super(props);
    const { isPage = false } = props.dataObj || {};
    this.state = {
      // userName: '',
      itemList: [], // 展示数据, 重复第一个元素
      isPage,
      swiperCurrent: 0
    };
    this.onClick = this.onClick.bind(this);
    // 不绑定无法在父类中通过ref使用
    this.update = this.update.bind(this);
    this.onSwiperChange = this.onSwiperChange.bind(this);
  }

  async componentDidMount() {
    console.log('[unhandle-notice] componentDidMount');
    await this.initData();
  }

  // 当待办数据未改变的时候不重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(nextState) === JSON.stringify(this.state)) {
      return false;
    }
  }

  // 给父类暴露的刷新方法
  async update() {
    console.log('[unhandle-notice] update');
    await this.initData();
  }


  async componentWillReceiveProps(props) {
    if (!(props && props.show)) {
      this.setState({
        itemList: [],
      });
    }
  }

  async initData() {
    const { show } = this.props;
    if (!show) return;

    const originData = await this.initOriginData();
    const { itemList } = this.state;
    if (JSON.stringify(itemList) === JSON.stringify(originData)) return;
    if (originData.length >= 1) {
      this.setState({
        itemList: []
      });
      sendSectionSO(this.props);
      // 用于循环
      const list = [...originData];
      setTimeout(() => {
        this.setState({
          itemList: list
        }, () => {
          this.sendItemSO();
        });
      });
    } else {
      this.setState({
        itemList: []
      });
    }
  }

  async initOriginData() {
    try {
      const { isLogin } = this.props || {};
      if (!isLogin) return [];
      const [repayRes, incrementResList, idCardRes, bankCardRes, dealPasswordRes, bigRes, unhandleNoticeTird] = await Promise.all([
        this.initRepay(),
        this.initIncrement(),
        initIdCard(),
        initBankCard(),
        initDealPassword(),
        this.initBig(),
        this.unhandleNoticeTird()
      ]);
      const itemList = [];
      if (repayRes) itemList.push(repayRes);
      itemList.push(...incrementResList);
      if (idCardRes) itemList.push(idCardRes);
      if (bankCardRes) itemList.push(bankCardRes);
      if (dealPasswordRes) itemList.push(dealPasswordRes);
      if (bigRes) itemList.push(bigRes);
      if (unhandleNoticeTird) itemList.push(unhandleNoticeTird);
      return itemList;
    } catch (e) {
      return [];
    }
  }

  async initRepay() {
    const { userInfo = {} } = this.props;
    // 没有客户号不调用账单接口
    if (!userInfo || !userInfo.customerId) return;
    let item;
    try {
      const res = await fetch(apiHost.mgp, {
        operationId: 'mucfc.repayment.bill.recentBill',
        data: {
          newVersionFlag: 'Y',
          needQueryBadDebtsFlag: 'Y',
        },
        autoLoading: false,
        autoToast: false,
      });
      const {
        surplusTotalAmt, isDueTagCust, showStatus, repayDate, dueRepayInfo
      } = res || {};
      if (isDueTagCust === 'Y' && dueRepayInfo) {
        // 打标逾期
        const amt = Number(dueRepayInfo.duePayTotalAmt);
        // eslint-disable-next-line no-self-compare
        if (amt !== amt) {
          // 是NaN
        } else if (amt > 0) {
          item = {
            title: '逾期提醒',
            cdpTitle: '急！您有账单已逾期！请尽快还款。',
            btnTitle: '去还款',
            hash: 'OverDue'
          };
        }
      } else if (showStatus === '0') {
        // 非打标逾期
        const amt = Number(surplusTotalAmt);
        // eslint-disable-next-line no-self-compare
        if (amt !== amt) {
          // 是NaN
        } else if (amt > 0) {
          item = {
            title: '逾期提醒',
            cdpTitle: '急！您有账单已逾期！请尽快还款。',
            btnTitle: '去还款',
            hash: 'OverDue'
          };
        }
      } else if (showStatus === '1' || showStatus === '5') {
        // 7日待还
        item = {
          title: '账单提醒',
          cdpTitle: `hi，您有${surplusTotalAmt}元待还，还款日${repayDate}`,
          btnTitle: '去看看',
          hash: 'SevenRepay'
        };
      } else if (showStatus === '2') {
        // 还款日
        item = {
          title: '还款提醒',
          cdpTitle: 'hi，今天是您的还款日，请及时还款哦。',
          btnTitle: '去还款',
          hash: 'RepayDate',
        };
      }
      if (item) item.targetUrl = `${urlDomain}/${currentChannel}/repayment/#/pages/index/index?mapCode=63d6eaf6de4fa439`;
      return item;
    } catch (e) {
      return item;
    }
  }

  async initIncrement() {
    const { maskRealName = '' } = this.props.userInfo;
    try {
      // 调用接口传参的起始和终止时间
      const endTime = this.getYMDHMS(new Date());
      const startTime = this.getYMDHMS(new Date() - 2592000000);
      const { availableSceneList } = await fetch(`${apiHost.mgp}?operationId=mucfc.activity.adjust.queryPriceScene`, {
        autoLoading: false,
        method: 'POST',
        data: {
          // 周周提，临时包，惊喜包，小礼包
          activityCodeKeyList: ['week_limit_bag', 'tmp_limit_bag', 'task_limit_bag', 'gift_limit_bag'],
          queryType: '2',
          startTime,
          endTime
        },
      });
      const resList = [];
      const dayZeroTime = this.getTodayZeroTime(new Date());
      const { Monday, nextMonDay } = this.getMondayAndNextMonday(dayZeroTime);
      availableSceneList.forEach(({
        cdpListDTO, availableFlag, limitAdjustRecords, takeAndShowFlag
      }) => {
        if (cdpListDTO.code === 'l_limit_task' && cdpListDTO.value === 'Y' && takeAndShowFlag === 1) {
          // 提额任务
          let lastTwoDaysReceivedFailed = false;
          // 近两日领取失败
          if (Array.isArray(limitAdjustRecords) && limitAdjustRecords.length) {
            // 如果存在提额记录
            limitAdjustRecords.forEach((recordItem) => {
              const receiveTime = this.getTimeGap(new Date() - recordItem.adjustTime);
              // 近两日领取失败
              if (recordItem.adjustResult === '3' && receiveTime < 2) {
                lastTwoDaysReceivedFailed = true;
              }
            });
          }
          !lastTwoDaysReceivedFailed && resList.push({
            title: 'APP专享提额啦',
            cdpTitle: `您的额度可提至${cdpListDTO.a1}元，快来领取！`,
            targetUrl: `${urlDomain}/${currentChannel}/adjust/#/adjust-home?titleBarColor=226BFF&creditType=0`,
            btnTitle: '去领取',
            hash: 'TaskIncrement',
          });
        } else if (cdpListDTO.code === 'l_limit_week' && cdpListDTO.value === 'Y' && availableFlag === true) {
          // 周周提礼包
          // 领取记录，本周是否已领取礼包
          let thisWeekHasReceiveGift = false;
          if (Array.isArray(limitAdjustRecords) && limitAdjustRecords.length) {
            limitAdjustRecords.forEach((weekRecordsItem) => {
              if (weekRecordsItem.adjustTime > Monday && weekRecordsItem.adjustTime < nextMonDay) {
                // 领取记录时间在本周一之后且在下周一之前，表示本周礼包已领取
                thisWeekHasReceiveGift = true;
              }
            });
          }
          !thisWeekHasReceiveGift && maskRealName && resList.push({
            title: '周周提礼包',
            cdpTitle: `嗨~${maskRealName}，您当前有一个提额礼包待领取`,
            targetUrl: `${urlDomain}/${currentChannel}/adjust/#/adjust-home?titleBarColor=226BFF&creditType=0`,
            btnTitle: '去领取',
            hash: 'WeekIncrement'
          });
        } else if (cdpListDTO.code === 'l_limit_tmp' && cdpListDTO.value === 'Y' && takeAndShowFlag === 1) {
          // 临时惊喜包
          let lastTwoDaysReceivedFailed = false;
          // 近两日领取失败
          if (Array.isArray(limitAdjustRecords) && limitAdjustRecords.length) {
            // 如果存在提额记录
            limitAdjustRecords.forEach((recordItem) => {
              const receiveTime = this.getTimeGap(new Date() - recordItem.adjustTime);
              // 近两日领取失败
              if (recordItem.adjustResult === '3' && receiveTime < 2) {
                lastTwoDaysReceivedFailed = true;
              }
            });
          }
          !lastTwoDaysReceivedFailed && resList.push({
            title: '限时尊享提额',
            cdpTitle: `您的额度可提至${cdpListDTO.a1}元，限时有效！`,
            targetUrl: `${urlDomain}/${currentChannel}/adjust/#/adjust-home?titleBarColor=226BFF&creditType=0`,
            btnTitle: '去领取',
            hash: 'TempIncrement',
          });
        }
        // else if (cdpListDTO.code === 'l_limit_gift' && cdpListDTO.value === 'Y') {
        //   resList.push({ // 小礼包
        //     title: '提额小礼包',
        //     cdpTitle: `限时领取,最高可提额至${cdpListDTO.a1}元`,
        //     // targetUrl: `${urlDomain}/${channel}/adjust/#/adjust-home?titleBarColor=226BFF&creditType=0`,
        //     btnTitle: '去领取',
        //     hash: 'GiftIncrement',
        //   });
        // }
      });
      console.log('[unhandle-notice] initIncrement resList', resList);
      return resList;
    } catch (e) {
      return [];
    }
  }

  getTodayZeroTime(now) {
    const nowday = new Date(now);
    const year = nowday.getFullYear();
    const month = this.addZero(nowday.getMonth() + 1);
    const day = this.addZero(nowday.getDate());
    // 获取当前时间的yyyy/mm/dd 形式的时间
    const nowdate = `${year}/${month}/${day}`;
    // 转换为当天的0点的时间戳
    const dayZeroTime = new Date(nowdate);
    return dayZeroTime;
  }

  getDay = (time) => {
    const nowday = new Date(time);
    const year = nowday.getFullYear();
    const month = this.addZero(nowday.getMonth() + 1);
    const day = this.addZero(nowday.getDate());
    const nowday1 = `${year}/${month}/${day}`;
    return nowday1;
  };

  getMondayAndNextMonday(time) {
    const dayZeroTime = time.getTime();
    // 获取当天的星期几，0是星期天，1是星期一...6是星期六
    const whatDay = new Date(dayZeroTime).getDay();
    // 获取星期一0点的时间
    const Monday = whatDay === 0 ? dayZeroTime - 518400000 : dayZeroTime - (whatDay - 1) * 24 * 60 * 60 * 1000;
    // 获取下周一0点的时间
    const nextMonDay = whatDay === 0 ? dayZeroTime + 86400000 : dayZeroTime + (8 - whatDay) * 24 * 60 * 60 * 1000;
    return {
      Monday,
      nextMonDay: nextMonDay - 1000 // 下周一时间的0:00 减 1s，为这周结束时间
    };
  }

  // 时间戳换成yyyy-mm-dd HH:mm:ss
  getYMDHMS(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = this.addZero(date.getMonth() + 1);
    const day = this.addZero(date.getDate());
    const h = this.addZero(date.getHours());
    const m = this.addZero(date.getMinutes());
    const s = this.addZero(date.getSeconds());
    return `${year}-${month}-${day} ${h}:${m}:${s}`;
  }

  addZero(num) {
    return `0${num}`.slice(-2);
  }

  // 两个时间戳相差的时间 暂时用 天 为单位
  getTimeGap(time) {
    const day = Math.floor(time / 86400000);
    // const leave1 = time % (24 * 3600 * 1000);
    // const h = Math.floor(leave1 / (3600 * 1000));
    // const leave2 = leave1 % (3600 * 1000);
    // const m = Math.floor(leave2 / (60 * 1000));
    // const leave3 = leave2 % (60 * 1000);
    // const s = Math.floor(leave3 / 1000);
    // return `${day}天${h}:${m}:${s}`;
    return day;
  }

  async initBig() {
    // 大额产品-非白名单预约
    const isHaveBig = await this.isHaveBigCredit();
    if (isHaveBig) return;
    const isWhiteList = await this.isBigWhiteList();
    if (isWhiteList) return;
    const isReservation = await this.isReservation();
    if (isReservation) return;
    const isUnderRsix = await this.isUnderRsix();
    if (!isUnderRsix) return;
    return {
      title: '大额贷款可预约',
      cdpTitle: '你获得大额低息产品预约资格，快去看看吧！',
      targetUrl: `${urlDomain}/${currentChannel}/apply/#/dqd-intro?mapCode=${currentMapCodeList.dqd}`,
      btnTitle: '去预约',
      hash: 'BigCredit',
    };
  }

  async isUnderRsix() {
    try {
      const key = ['RISK_LEVEL'];
      const res = await fetch(apiHost.mgp, {
        operationId: 'mucfc.content.channel.getChannelContext',
        data: { tagType: 2, tagCodeList: key },
      });
      const risk = res && res.tagMap && res.tagMap.RISK_LEVEL;
      // const risk = 'R07';
      return ['R01', 'R02', 'R03', 'R04', 'R05'].indexOf(risk) > -1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async isHaveBigCredit() {
    try {
      const res = await fetch(apiHost.mgp, {
        operationId: 'mucfc.loan.account.queryAccountInfo',
        data: { busiType: 'XJ', queryType: '01' },
        autoLoading: false
      });
      const { accountInfoList } = res || {};
      if (!accountInfoList || !accountInfoList[0]) return true;
      const { limitInfoList } = accountInfoList[0];
      let isHave = false;
      limitInfoList && limitInfoList.forEach(({ status, limitType }) => {
        // /有失效/过期/ 当做无额度   待激活、正常当做有额度
        if ((limitType === 'F02' || limitType === 'F05') && (status === 'Y' || status === 'P')) {
          isHave = true;
        }
      });
      return isHave;
    } catch (e) {
      // 并不是真的在白名单，只是为了不走下一步
      return true;
    }
  }

  async isBigWhiteList() {
    const isF02WhiteList = await this.isF02WhiteList();
    const isF05WhiteList = await this.isF05WhiteList();
    return isF02WhiteList || isF05WhiteList;
  }

  async isF02WhiteList() {
    const { admissionDetails } = await this.queryAdmission('YYDED') || {};
    const { dedAdmissionResult } = admissionDetails.dedAdmissionDetails;
    // A2有效客户 dedAdmissionResult === 'A2Active'
    // 大E贷 dedAdmissionResult === 'A2Expired' || dedAdmissionResult === 'B0'
    return dedAdmissionResult === 'A2Active' || dedAdmissionResult === 'A2Expired' || dedAdmissionResult === 'B0';
  }

  async isF05WhiteList() {
    const DQDAdmission = await this.queryAdmission('YYDQD');
    return DQDAdmission.result;
  }

  queryAdmission = async (type) => {
    try {
      const res = await fetch(apiHost.mgp, {
        operationId: 'mucfc.apply.admission.doAdmission',
        data: {
          admissionType: type
        },
        autoLoading: false,
        autoToast: false,
      });
      return res;
    } catch (e) {
      console.log('大额区块查询额度接口出错', e);
    }
  }

  async isReservation() {
    try {
      const data = await fetch(apiHost.mgp, {
        autoLoading: false,
        operationId: 'mucfc.apply.assist.queryReservation',
      });
      const { reservationList } = data || {};
      // reservationType = 'YYDQD' && reservationStatus = ‘1‘   是已预约，其余为非预约（预约只有大期待，大e贷没有预约）
      let res = false;
      reservationList && reservationList.forEach(({ reservationType, reservationStatus }) => {
        if (reservationType === 'YYDQD' && reservationStatus === '1') {
          res = true;
        }
      });
      return res;
    } catch (e) {
      // 并不是真的预约了，只是为了不走下一步
      return true;
    }
  }

   // 第三方回家提醒
   unhandleNoticeTird = () => {
     const { IndexStore, ifE19hasLoan } = this.props || {};
     const { hasAvailableD01, fixedLimitE19 } = IndexStore || {};
     const channel = Madp.getChannel();

     if (hasAvailableD01 === 'hasAvailableD01') {
       if (ifE19hasLoan === 'hasLoan') {
         return {
           title: '额度待领取',
           cdpTitle: '你有一笔额度待领取，立即领取',
           targetUrl: `${urlDomain}/${channel}/adjust/#/index?busiType=adjLimit&busiSceneCode=JBHJYD`,
           btnTitle: '去领取',
           hash: 'hasLoan',
         };
       } else if (ifE19hasLoan === 'noLoan' && Number(fixedLimitE19) > 0) {
         return {
           title: '额度待领取',
           cdpTitle: `你有${fixedLimitE19}额度待领取，立即领取~`,
           targetUrl: `${urlDomain}/${channel}/adjust/#/index?busiType=adjLimit&busiSceneCode=JBHJWD`,
           btnTitle: '去领取',
           hash: 'noLoan',
         };
       } else if (ifE19hasLoan === 'noLoan' && Number(fixedLimitE19) === 0) {
         return {
           title: '额度待领取',
           cdpTitle: '你有一笔额度待领取，立即领取',
           targetUrl: `${urlDomain}/${channel}/adjust/#/index?busiType=adjLimit&busiSceneCode=JBHJWD`,
           btnTitle: '去领取',
           hash: 'noLoan',
         };
       }
     }
   }

   sendItemSO() {
     const { itemList } = this.state;
     itemList.forEach(({
       title, hash
     }) => {
       dispatchTrackEvent({
         target: this, // this
         beaconId: 'homepage.todoTask.todoTaskList',
         event: EventTypes.SO,
         beaconContent: {
           cus: {
             title: `待办-${title}`,
             contentId: hash,
           }
         },
       });
     });
   }

  onClick = debounce(() => {
    const { itemList, swiperCurrent } = this.state;
    const item = itemList.length ? itemList[swiperCurrent] : '';
    dispatchTrackEvent({
      target: this, // this
      beaconId: 'homepage.todoTask.todoTaskItem',
      event: EventTypes.BC,
      beaconContent: {
        cus: {
          title: `待办-${item.title}`,
          contentId: item.hash,
        }
      },
    });
    const url = `${urlDomain}/${currentChannel}/mainpage/#/todo-task/index`;
    Madp.navigateTo({
      url,
      useAppRouter: isMuapp(),
    });
  }, 1000, { leading: true, trailing: false });

  onSwiperChange(e) {
    const current = e && e.detail && e.detail.current;
    this.setState({
      swiperCurrent: current || 0
    });
  }

  renderComp() {
    const clientWidth = document.body.clientWidth || document.documentElement.clientWidth;
    const itemHeight = clientWidth / 750 * 40; // px
    const { itemList, swiperCurrent } = this.state;

    return (
      <MUView onClick={this.onClick}>
        <MUView className="unhandle-notice__comp">
          <MUImage className="unhandle-notice__comp__icon" src={iconImg} alt="" />
          <MUView className="unhandle-notice__comp__mask" style={`height: ${itemHeight}px`}>
            {
              itemList.length > 0 && (
                <Swiper
                  indicatorDots={0}
                  autoplay={itemList.length > 1}
                  vertical={1}
                  interval={3000}
                  duration={500}
                  circular={itemList.length > 1}
                  current={swiperCurrent}
                  onChange={this.onSwiperChange}
                >
                  {
                    itemList.map(({
                      cdpTitle
                    }) => (
                      <SwiperItem>
                        <MUView className="unhandle-notice__comp__swiper-item">
                          <MUView
                            className="unhandle-notice__comp__scroll-item"
                            style={`height: ${itemHeight}px;line-height: ${itemHeight + 2}px;`}
                            onClick=""
                          >
                            {cdpTitle}
                          </MUView>
                          <MUImage className="unhandle-notice__comp__right__icon" src={iconRightBtn} alt="" />
                        </MUView>
                      </SwiperItem>
                    ))
                  }
                </Swiper>
              )
            }

          </MUView>
        </MUView>
      </MUView>
    );
  }

  render() {
    const { id, compClassName, show } = this.props || {};
    const { itemList } = this.state;
    if (!show) {
      return null;
    }
    if (!itemList.length) {
      return <div />;
    }
    return <MUView className={`unhandle-notice ${compClassName}`} dataId={id}>{this.renderComp()}</MUView>;
  }
}
