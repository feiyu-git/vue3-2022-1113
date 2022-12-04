import Madp, { Component } from '@mu/madp';
import { View, Image } from '@tarojs/components';
import { isMuapp, debounce } from '@mu/madp-utils';
import { addCalender, openLocation } from '../../../../utils/app-plugin-util';
import { currentChannel } from '../../../../../config/constants';
import { URL_CONFIG } from '../utils/url';
import { OTHER_ACTION_TYPE } from '../utils/constant';
import './applyFail.scss';

const faileIcons = {
  '0APP': {
    date: require('../image/fail-date.png'),
    local: require('../image/fail-local.png'),
    info: require('../image/fial-info.png'),
  },
  '2APP': {
    date: require('../image/2APP/fail-date.png'),
    local: require('../image/2APP/fail-local.png'),
    info: require('../image/2APP/fial-info.png'),
  },
};

const icons = faileIcons[currentChannel] || faileIcons['0APP'];

const isAPP = currentChannel === '0APP' || '2APP'

const DayMS = 24 * 60 * 60 * 1000;
export default class ApplyFail extends Component {
  static defaultProps = {
    reApplyDate: '', // 管控结束期
    // onClick: () => {},
  };

  static StoreKey = 'ApplyFailAddCalender';

  constructor(props) {
    super(props);

    const { reApplyDate } = this.props;
    const isAddCalender = Madp.getStorageSync(ApplyFail.StoreKey);
    this.state = {
      isLocationOpen: true, // 是否已经开启定位
      isAddCalender: isAddCalender === `${reApplyDate}`, // 是否已经添加提醒
    };

    openLocation(true, (data) => {
      const { result = '0' } = data;
      this.setState({
        isLocationOpen: result === '1',
      });
    });
  }

  componentDidMount() {
    this.sendBusinessSO();
  }

  sendBusinessSO() {
    const { sendSO } = this.props;
    const { isLocationOpen } = this.state;
    if (!isLocationOpen) {
      sendSO('Location', '额度卡-被拒定位');
    }
    sendSO('Calendar', '额度卡-被拒日历');
    sendSO('AddInfo', '额度卡-被拒补充信息');
  }

  onClick = debounce((type) => {
    const { sendEV } = this.props;
    switch (type) {
      case OTHER_ACTION_TYPE.ADD_INFO: { // 补充信息
        sendEV('AddInfo', '额度卡-被拒补充信息');

        const url = URL_CONFIG.SUPPLE_INFO;
        Madp.navigateTo({
          url,
          useAppRouter: isMuapp(),
        });
        break;
      }
      case OTHER_ACTION_TYPE.ADD_REMIND: { // 再次申请添加日历
        sendEV('Calendar', '额度卡-被拒日历');

        const { reApplyDate } = this.props;
        const reApplyDateAfter = parseInt(reApplyDate, 10) + DayMS;
        const newDate = new Date(reApplyDateAfter);
        const props = {
          title: `${newDate.getMonth() + 1}月${newDate.getDate()}日可再申请`,
          activeBeginTime: reApplyDateAfter,
        };
        addCalender(props, (data) => {
          this.addCalenderSuccess(data);
        });
        break;
      }
      case OTHER_ACTION_TYPE.ADD_REMIND_ALEARDY: { // 再次申请添加日历
        sendEV('Calendar', '额度卡-被拒日历');
        break;
      }
      case OTHER_ACTION_TYPE.OPEN_LOCATION: { // 打开定位
        sendEV('Location', '额度卡-被拒定位');

        openLocation(false, (data) => {
          const { result = '0' } = data;
          this.setState({
            isLocationOpen: result === '1',
          });
        });
        break;
      }
      default:
    }
  }, 1000, { leading: true, trailing: false });

  addCalenderSuccess(data) {
    if (data && data.code === 0) {
      Madp.setStorageSync(ApplyFail.StoreKey, `${this.props.reApplyDate}`);
      this.setState({
        isAddCalender: true,
      });
    }
  }

  getShowList() {
    const { isLocationOpen, isAddCalender } = this.state;
    const { reApplyDate } = this.props;
    const reApplyDateAfter = parseInt(reApplyDate, 10) + DayMS;
    const newDate = new Date(reApplyDateAfter);
    const reApplyData = {
      icon: icons.date,
      title: `${newDate.getMonth() + 1}月${newDate.getDate()}日可再申请`,
      subTitle: isAPP ? '添加到日历' : '保持良好信用',
      btnTitle: isAddCalender ? '已添加' : '去提醒',
      btnDisable: isAddCalender,
      onClick: () => this.onClick(
        isAddCalender ? OTHER_ACTION_TYPE.ADD_REMIND_ALEARDY : OTHER_ACTION_TYPE.ADD_REMIND,
      ),
    };
    const location = {
      icon: icons.local,
      title: '打开定位',
      subTitle: '授权定位通过率更高',
      btnTitle: '去打开',
      onClick: () => this.onClick(OTHER_ACTION_TYPE.OPEN_LOCATION),
    };
    const addInfo = {
      icon: icons.info,
      title: '补充资料',
      subTitle: '完善你的个人信息，更易通过',
      btnTitle: '去补充',
      onClick: () => this.onClick(OTHER_ACTION_TYPE.ADD_INFO),
    };
    let showList = [];
    // 管控时间超过365天 不再显示日期项 为true不展示
    const hiddenReApplyData = this.compareDate(reApplyDate);
    if (isLocationOpen) {
      showList = hiddenReApplyData ? [addInfo] : [reApplyData, addInfo];
    } else {
      showList = hiddenReApplyData ? [location, addInfo] : [reApplyData, location, addInfo];
    }
    return showList;
  }

  // 管控时间超过365天 不再显示日期项
  compareDate(reApplyDate) {
    const nowDate = new Date().getTime();
    const days = Math.ceil((reApplyDate - nowDate) / 1000 / 60 / 60 / 24);
    return days > 365;
  }

  render() {
    const { cardStyle } = this.props;
    const itemList = this.getShowList();
    return (
      <View className="apply-fail">
        <View className="content">
          {
            itemList.map((item) => (
              <View className="item">
                <Image className="item__icon" src={item.icon} />
                <View className="item__middle">
                  <View className="item__middle__title">{item.title}</View>
                  <View className="item__middle__subTitle">{item.subTitle}</View>
                </View>
                <View
                  className={`item__btn ${cardStyle} ${item.btnDisable ? 'disable' : ''} channel-${currentChannel}`}
                  onClick={item.onClick}
                >
                  {item.btnTitle}
                </View>
              </View>
            ))
          }
        </View>
        <View className="reset-padding" />
      </View>
    );
  }
}
