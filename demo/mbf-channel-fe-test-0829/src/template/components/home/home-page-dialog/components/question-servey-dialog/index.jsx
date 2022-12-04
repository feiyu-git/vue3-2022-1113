import { MUDialog, MUView } from '@mu/zui';
import Madp, { useState, useEffect } from '@mu/madp';
import { isMuapp } from '@mu/madp-utils';
import { EventTypes, dispatchTrackEvent } from '@mu/madp-track';
import './index.scss';

const QuestionServeyDialog = (props) => {
  const { isShow, surveyUrl, parent } = props;
  const [isOpened, setIsOpened] = useState(false);
  const [questionUrl, setQuestionUrl] = useState(false);

  useEffect(() => {
    if (isShow) {
      setIsOpened(true);
      setQuestionUrl(surveyUrl);
    }
  }, [isShow]);

  // 关闭时传回给父组件
  const handleDialogChange = () => {
    props.onCallQuestionServery(false);
  };

  const handleCancel = () => {
    setIsOpened(false);
    handleDialogChange();
  };

  const toServey = () => {
    dispatchTrackEvent({
      target: parent,
      beaconId: 'questionServeyDialogConfirmClick',
      event: EventTypes.EV,
    });
    setIsOpened(false);
    handleDialogChange();
    Madp.navigateTo({
      url: questionUrl,
      useAppRouter: isMuapp()
    });
  };

  return (
    <MUView className="question-servey-dailog">
      <MUDialog
        title="调查问卷"
        isOpened={isOpened}
        onClose={handleCancel}
        buttons={[
          {
            label: '取消',
            onClick: handleCancel
          },
          {
            label: '开始答题',
            onClick: toServey
          }
        ]}
      >
        尊敬的用户，您好，为了向您提供更好的服务，我们准备了一份问卷，以便了解您在借款后的资金使用情况，麻烦您抽出一分钟的时间填写，我们将在完成填写的用户中抽取100名赠与7天免息券一张。
      </MUDialog>
    </MUView>
  );
};

export default QuestionServeyDialog;
