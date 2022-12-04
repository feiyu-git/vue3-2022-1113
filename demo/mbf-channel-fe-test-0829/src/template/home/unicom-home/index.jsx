import Madp from '@mu/madp';
import { track } from '@mu/madp-track';
import { MUView } from '@mu/zui';
import HomeCommon from '../home-common';
import './index.scss';

@track({}, {
  pageId: 'UnicomHome',
  dispatchOnMount: true,
})

class UnicomHome extends Madp.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <MUView className="unicom-home">
        <HomeCommon {...this.props} />
      </MUView>
    );
  }
}

export default UnicomHome;
