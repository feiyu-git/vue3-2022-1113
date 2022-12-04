const fse = require('fs-extra');
const path = require('path');

function switchFn() {
  const packageDir = process.env.PACKAGE || 'project';
  const type = process.env.TYPE;

  // 将当前的 package.json 保存到指定文件
  const pagkageDirPre = packageDir === 'project' ? 'npm' : 'project';
  const dirPre = path.join(__dirname, '..', 'package.json');
  const destPre = path.join(__dirname, '..', `packagejsonBackups/${pagkageDirPre}/package.json`);
  fse.copySync(dirPre, destPre);
  if (type === 'auto' && packageDir === 'npm') {
    return;
  }

  // 保存之后再替换
  const dir = path.join(__dirname, '..', `packagejsonBackups/${packageDir}`);
  const dest = path.join(__dirname, '..');
  // copy 之前要把当前的 package.json 保存
  fse.copySync(dir, dest);
}

switchFn();
