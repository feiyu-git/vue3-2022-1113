import Madp from '@mu/madp';
import apiHost from '../api';

const channel = Madp.getChannel();

export const querySecurityLevel = async () => {
  let info = {};
  await Madp.request({
    url: `${apiHost.mgp}?operationId=mucfc.user.userCommon.getChannelConfig`,
    method: 'POST',
    data: { data: { channel } },
  })
    .then(async (res) => {
      info = await res.json();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  const level = info && info.data && info.data.securityLevel;
  let route = '';
  if (level === 'H') {
    route = '/vlogin/first-rank';
  } else if (level === 'M') {
    route = '/vlogin/second-rank';
  } else {
    route = '/vlogin/third-rank';
  }
  return route;
};
