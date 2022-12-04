import Madp from '@mu/madp';
import channelsConfig from './channels';
import { LOCAL_COMPONENT } from './constant';

const channel = Madp.getChannel();
const currChannelConfig = channelsConfig[channel] || channelsConfig['0APP'];
// 自定义的组件 key,用于虚拟展位控制自定义组件的展示与隐藏
currChannelConfig.localComponent = LOCAL_COMPONENT;

export default currChannelConfig;
