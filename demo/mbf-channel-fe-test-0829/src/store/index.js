import { commonStore } from '@mu/business-basic';
// import IndexStore from '../pages/index/store';

class GlobalStore {
  constructor() {
    this.text = 'globalText';
  }
}

// 这里需要暴露一个函数，并返回状态对象，目的了为了延后commonStore的获取
export default function () {
  return {
    globalStore: new GlobalStore(),
    commonStore: commonStore(),
    // IndexStore: new IndexStore()
  };
}
