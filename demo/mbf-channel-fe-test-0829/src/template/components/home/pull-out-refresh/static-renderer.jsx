import { Component } from '@mu/madp';
import { MUView } from '@mu/zui';

export default class StaticRenderer extends Component {
  shouldComponentUpdate(nextProps) {
    return !!nextProps.shouldUpdate;
  }

  render() {
    const { render } = this.props;
    return <MUView>{render()}</MUView>;
  }
}
