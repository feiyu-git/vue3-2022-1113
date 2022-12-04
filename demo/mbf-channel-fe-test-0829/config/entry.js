
const fse = require('fs-extra');
const path = require('path');

function entry() {
  const entryDir = process.env.ENTRY || 'index';
  const src = path.join(__dirname, '..', `src/entry/${entryDir}`);
  const dest = path.join(__dirname, '..', 'src');
  fse.copySync(src, dest);
  // 针对小程序，将ocr和协议组件copy到components
  // if (process.env.BUILD_TYPE !== 'h5') {
  //   if (entryDir === 'index') {
  //   // 调额路由白名单，小程序调额路由用到
  //     const routeWhiteListAdjust = [
  //       'pages/index/index'
  //     ];
  //     const packageJson = path.join(__dirname, '..', './package.json');

  //     fse.readFile(packageJson, 'utf-8', (err, data) => {
  //       if (err) {
  //         console.error(err);
  //       } else {
  //         const dataJsonObj = JSON.parse(data);
  //         dataJsonObj.name = '@mumod/tabbar';
  //         dataJsonObj.routeWhiteList = routeWhiteListAdjust;
  //         fse.writeFile(packageJson, JSON.stringify(dataJsonObj, null, 2), (obj) => {
  //           console.error(obj);
  //         });
  //       }
  //     });
  //   }
  // }
}

entry();
