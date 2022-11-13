#### 简易的命令行入门教程:

Git 全局设置:

```
git config --global user.name "北冥有鱼"
git config --global user.email "2462858146@qq.com"
```

创建 git 仓库:

```
mkdir app-store
cd app-store
git init 
touch README.md
git add README.md
git commit -m "first commit"
git remote add origin git@gitee.com:AAC-12321/app-store.git
git push -u origin "master"
```

已有仓库?

```
cd existing_git_repo
git remote add origin git@gitee.com:AAC-12321/app-store.git
git push -u origin "master"
```