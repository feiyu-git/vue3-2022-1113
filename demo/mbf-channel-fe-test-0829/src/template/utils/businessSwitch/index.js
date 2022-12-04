export const checkLocalShow = (name, virtualLocalComponent) => {
  if (virtualLocalComponent && !virtualLocalComponent.dataObj) return true;
  const { contentList } = (virtualLocalComponent && virtualLocalComponent.dataObj) || [];
  let flag = true;
  // eslint-disable-next-line no-unused-expressions
  contentList && contentList.forEach((item) => {
    if (item.key === name) {
      // hidden 为 false 时展示该组件，该值展位配置的是字符串
      flag = item.hidden === 'false';
    }
  });
  console.log(`virtualLocalComponent 是否展示${name}`, flag);
  return flag;
};
