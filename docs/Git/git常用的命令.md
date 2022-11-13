## git常用的命令




### 一、主要的几个命令

```
git init # 初始化仓库

rm -rf .git # 删除 git init 初始化的仓库

git add # 将工作区的修改提交到暂存区

git commit # 将暂存区的修改提交到当前分支

git reset # 回退到某一个版本

git stash # 保存某次修改

git pull # 从远程更新代码

git push # 将本地代码更新到远程分支上

git reflog # 查看历史命令

git status # 查看当前仓库的状态

git diff # 查看修改

git log # 查看提交历史

git revert # 回退某个修改

// 提交的信息有问题，使用 git reset --soft 回退到某个版本，再commit

// git reset --soft HEAD~1  //撤销消最近一次commit：（取消commit动作，但是commit前的add文件操作不会取消（~ 后面的数字表示回退几次提交（上面1次为例））

// git pull 失败【本地分支与远程分支不匹配的情况,一般是远程分支被删除】
git remote prune origin	# 将仓库中已删除的分支与本地分支的追踪关系删除掉
git pull

```

1、git显示全部分支

> git branch //显示本地分支
> git branch -a //显示远程分支

2、git创建分支

> git branch 分支名

3、切换分支

> git checkout 分支名
> git checkout -b 分支名 若分支不存在，则创建它

4、删除分支

> git branch -d 分支名
> -d 当分支已经合并到主干后删除
> -D无论如何都删除分支

5、合并分支

> git merge 分支名

6、撤销前一次commit

> git revert HEAD

7、撤销所有本地修改

> git reset --hard

8、撤销所有本地到上一次修改

> git reset --hard HEAD^

9、撤销上一次commit，将commit的文件撤回暂存区

> git reset --soft HEAD^
> 要是想撤销到上上次，就是HEAD^^ ,以此类推。
> git revert 是撤销某次操作，此次操作之前的commit都会被保留
> git reset 是撤销某次提交，但是此次之后的修改都会被退回到暂存区

10、将此次更新文件并入到上次commit的记录中，不新添加commit

> git commit -amend



### 二、git进阶

1、git tag

> 可以将某个具体的版本打上一个标签，这样你就不需要记忆复杂的版本号哈希值了， 例如你可以使用 'git tag revert_version bbaf6fb5060b4875b18ff9ff637ce118256d6f20'来标记这个被你还原的版本，那么以后你想查看该版本时，就可以使用 revert_version标签名，而不是哈希值了

2、git stash

> 把所有本地修改都放到暂存区

3、git stash pop

> 把git stash放到暂存区的代码拿出来

tips：

> 1. 使用git stash保存当前的工作现场，那么就可以切换到其他分支进行工作，或者在当前分支上完成其他紧急的工作，比如修订一个bug测试提交。
> 2. 如果一个使用了一个git stash，切换到一个分支，且在该分支上的工作未完成也需要保存它的工作现场。再使用gitstash。那么stash 队列中就有了两个工作现场。
> 3. 可以使用git stash list。查看stash队列。
> 4. 如果在一个分支上想要恢复某一个工作现场怎么办：先用git stashlist查看stash队列。确定要恢复哪个工作现场到当前分支。然后用git stash pop stash@{num}。num就是你要恢复的工作现场的编号。
> 5. 如果想要清空stash队列则使用git stash clear。
> 6. 同时注意使用git stashpop命令是恢复stash队列中的stash@{0}即最上层的那个工作现场。而且使用pop命令恢复的工作现场，其对应的stash在队列中删除。使用git stash apply stash@{num}方法除了不在stash队列删除外其他和git stashpop 完全一样。



### 三、git reset 三种模式区别

1. **--hard**：【谨慎操作】

   重置位置的同时，直接将 **working Tree工作目录**、 **index 暂存区**及 **repository** 都重置成目标**Reset**节点的內容,所以效果看起来等同于清空暂存区和工作区。

2. **--soft**：【常用】

   重置位置的同时，保留**working Tree工作目录**和**index暂存区**的内容，只让**repository**中的内容和 **reset** 目标节点保持一致，因此原节点和**reset**节点之间的【差异变更集】会放入**index暂存区**中(**Staged files**)。所以效果看起来就是工作目录的内容不变，暂存区原有的内容也不变，只是原节点和**Reset**节点之间的所有差异都会放到暂存区中。

   ```
   // 回滚一个commit状态。能回到add之后那里。 	
   git reset --soft HEAD^
   
   //撤销消最近一次commit：（取消commit动作，但是commit前的add文件操作不会取消（~ 后面的数字表示回退几次提交（上面1次为例））
   git reset --soft HEAD~1  
   ```

3. **--mixed（默认）**：【没用过】

   重置位置的同时，只保留**Working Tree工作目录**的內容，但会将 **Index暂存区** 和 **Repository** 中的內容更改和reset目标节点一致，因此原节点和**Reset**节点之间的【差异变更集】会放入**Working Tree工作目录**中。所以效果看起来就是原节点和**Reset**节点之间的所有差异都会放到工作目录中。

### 四、Git 常见错误处理

1. Git错误fatal: CRLF would be replaced by LF in xxx

   参考文档：[链接](https://blog.csdn.net/whg18526080015/article/details/102861950)

   ```
   git config --global core.autocrlf false
   git config --global core.safecrlf false
   说明：一定要执行两个命令，只执行第一个不生效。
   ```



参考文档1：https://segmentfault.com/a/1190000020023683

参考文档2：https://www.jianshu.com/p/c2ec5f06cf1a

参考文档3：[git 更新本地分支信息](https://www.jianshu.com/p/83acc1211742)