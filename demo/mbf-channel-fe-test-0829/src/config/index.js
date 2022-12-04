import Madp from '@mu/madp';
import channels from './channels';

const channel = Madp.getChannel();

// 兜底默认配置
const defaultConfig = {};

// 渠道自定义的配置
const channelConfig = channels[channel];

// 配置合并，优先使用自定义的配置
export default { ...defaultConfig, ...channelConfig };
