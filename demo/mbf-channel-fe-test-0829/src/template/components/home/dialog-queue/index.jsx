/**
 * 首页弹窗队列
 * this.state.dialogList 中按优先级存储弹窗
 * */
import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { Dialog, UrgingPaymentDialog } from '@mu/lui';
import HomePageDialog from '../home-page-dialog';

/**
 * 弹窗优先级
 * 逾期弹窗
 * 首页弹窗 homePageDialog(无效手机号、问卷)
 * 广告弹窗dialog
 */

export default class DialogQueue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDialogIndex: 0, // 需要展示的弹窗的下标
      dialogList: [], // 弹窗数据列表，按优先级排，排在前面的优先级更高
    };
  }

  componentDidMount() {
    this.initDialogList();
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps) !== this.props) {
      this.initDialogList();
    }
  }

  initDialogList = () => {
    // 初始化弹窗列表数据
    const {
      urgingPaymentDialog,
      dialog = {},
      userInfo,
      isLogin,
      maskRealName,
      userId,
      maskMobile,
      mobileValid,
      parent,
    } = this.props || {};
    // 按优先级顺序填入弹窗配置数据
    const dialogList = [
      {
        title: '催收弹窗',
        content: UrgingPaymentDialog,
        props: {
          ...urgingPaymentDialog,
          isLogin,
          userInfo,
          maskRealName,
        },
      },
      {
        title: '首页弹窗', // 无效手机号弹窗
        content: HomePageDialog,
        props: {
          isLogin,
          userInfo,
          maskRealName,
          mobileValid,
          userId,
          maskMobile,
          parent,
        },
      },
      {
        title: '广告弹窗',
        content: Dialog,
        props: {
          ...dialog,
        },
      },
    ];
    // 将弹窗元素在列表中的下标给到元素，方便做优先级控制
    // eslint-disable-next-line no-param-reassign
    dialogList.forEach((item, index) => { item.index = index; });
    this.setState({ dialogList });
  };

  handleNext = (currentIndex) => {
    // 回调函数传入当前展示弹窗的index，需要展示下一个时 当前 index+1
    const nextIndex = currentIndex + 1;
    if (currentIndex) {
      this.setState({
        currentDialogIndex: nextIndex,
      });
    }
  };

  render() {
    const {
      currentDialogIndex,
      dialogList,
    } = this.state;

    if (!dialogList || !dialogList.length) return;

    const Content = dialogList[currentDialogIndex].content;
    const properties = dialogList[currentDialogIndex].props;

    return (
      <MUView>
        <Content {...properties} handleNext={this.handleNext} index={currentDialogIndex} />
      </MUView>
    );
  }
}
