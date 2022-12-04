import Madp, { Component } from '@mu/madp';
import { MUView } from '@mu/zui';
import { apiHost } from '@mu/business-basic';
import fetch from '@utils/fetch';
import lodashEq from 'lodash/isEqual';
import InvalidPhoneDialog from './components/invalid-phone-dialog';
import QuestionServeyDialog from './components/question-servey-dialog';

const MGP_URL = apiHost.mgp;
export default class HomePageDialog extends Component {
  static DIALOG_STORAGE = {
    QuestionStorageKey: 'home_dialog_question',
    MessageStorageKey: 'home_dialog_message'
  };

  constructor(props) {
    super(props);
    this.state = {
      isInvalidPhoneDialogShow: false, // 无效手机号弹窗
      isQuestionServeyDialogShow: false, // 问卷调查弹窗
      surveyUrl: '', // 问卷调查链接
    };
    this.callOnClose = this.callOnClose.bind(this);
  }

  componentDidMount() {
    this.initData();
  }

  /**
   * 弹窗按照优先级
   * 1. 无效手机号弹窗
   * 2. 登录后弹窗引导消息
   * 3. 问卷调查弹窗
   */
  async componentDidUpdate(prevProps) {
    if (lodashEq(prevProps, this.props)) return;
    this.initData();
  }

  initData() {
    const { isLogin, userId, mobileValid } = this.props;
    // eslint-disable-next-line react/destructuring-assignment
    if (!isLogin) {
      this.setState({
        isInvalidPhoneDialogShow: false,
        isQuestionServeyDialogShow: false
      });
      return;
    }
    if (!mobileValid && isLogin) {
      // 手机号无效展示无效弹窗
      this.setState({
        isInvalidPhoneDialogShow: true
      });
      this.handleDialogChange(true);
      return null;
    } else if (mobileValid && isLogin) {
      // 手机号有效 查问卷
      this.setState({
        isInvalidPhoneDialogShow: false
      });
      this.querySurveyUrl(userId);
    }
    // 登录态有改变，且当前是已登录状态，弹窗处理
    // eslint-disable-next-line react/destructuring-assignment
    // if (isLogin !== this.props.isLogin && isLogin) {
    //   this.querySurveyUrl(userId);
    // }
  }

  // 查询问卷调查Url
  querySurveyUrl = async (userId) => {
    const { DIALOG_STORAGE } = HomePageDialog;
    const isShowed = Madp.getStorageSync(DIALOG_STORAGE.QuestionStorageKey, 'SESSION');
    if (isShowed) return;
    try {
      const data = await fetch(MGP_URL, {
        method: 'POST',
        operationId: 'mucfc.custservice.survey.querySurveyUrl',
        data: {
          surveyUseScene: '03',
          userId
        }
      });
      const { surveyUrl = {} } = data;
      if (!surveyUrl) {
        this.setState({
          isQuestionServeyDialogShow: false
        });
        this.handleDialogChange(false);
      } else {
        this.setState({
          surveyUrl,
          isQuestionServeyDialogShow: true
        }, () => {
          Madp.setStorageSync(DIALOG_STORAGE.QuestionStorageKey, true, 'SESSION');
        });
        this.handleDialogChange(true);
      }
    } catch (e) {
      console.log('问卷接口报错，继续展示下一个弹窗');
      this.handleDialogChange(false);
      return false;
    }
  }

  // 用于首页的弹窗优先级管理 在弹窗展示(true or false)发生变化时调用
  handleDialogChange = (isOpen) => {
    // const { isQuestionServeyDialogShow, isInvalidPhoneDialogShow } = this.state;
    const { status: { current, next } = {} } = this.props;
    const homeDialogStatus = isOpen ? current : next;
    this.props.onCallBackFn(homeDialogStatus);
  }


  callOnClose(isShow) {
    if (!isShow) {
      const { status: { next } = {} } = this.props;
      this.props.onCallBackFn(next);
    }
  }

  render() {
    const {
      isQuestionServeyDialogShow,
      isInvalidPhoneDialogShow,
      surveyUrl,
    } = this.state;
    const { parent, maskMobile } = this.props;

    return (
      <MUView className="home-page-dialog">
        <InvalidPhoneDialog
          parent={parent}
          maskMobile={maskMobile}
          isShow={isInvalidPhoneDialogShow}
          onCallInvalidPhone={this.callOnClose}
        />
        <QuestionServeyDialog
          isShow={isQuestionServeyDialogShow}
          surveyUrl={surveyUrl}
          parent={parent}
          onCallQuestionServery={this.callOnClose}
        />
      </MUView>
    );
  }
}
