
$ git tag       # 在控制台打印出当前仓库的所有标签

git标签分为两种类型：轻量标签和附注标签。轻量标签是指向提交对象的引用，附注标签则是仓库中的一个独立对象。建议使用附注标签。

### 创建轻量标签

$ git tag v0.1.2-light

标签可以针对某一时间点的版本做标记，常用于版本发布。

- 列出标签

$ git tag       # 在控制台打印出当前仓库的所有标签

- 打标签

git标签分为两种类型：轻量标签和附注标签。轻量标签是指向提交对象的引用，附注标签则是仓库中的一个独立对象。建议使用附注标签。

### 创建轻量标签

$ git tag v0.1.2-light

### 创建附注标签

$ git tag -a v0.1.2 -m “0.1.2版本”

创建轻量标签不需要传递参数，直接指定标签名称即可。
 创建附注标签时，参数a即annotated的缩写，指定标签类型，后附标签名。参数m指定标签说明，说明信息会保存在标签对象中。

- 切换到标签

与切换分支命令相同，用`git checkout [tagname]`
 查看标签信息
 用`git show`命令可以查看标签的版本信息：
 $ git show v0.1.2

- 删除标签

误打或需要修改标签时，需要先将标签删除，再打新标签。
 $ git tag -d v0.1.2 # 删除标签

参数d即delete的缩写，意为删除其后指定的标签。

------

如果标签打错了，也可以删除：



```ruby
$ git tag -d v0.1Deleted tag 'v0.1' (was e078af9)
```

因为创建的标签都只存储在本地，不会自动推送到远程。所以，打错的标签可以在本地安全删除。

如果要推送某个标签到远程，使用命令`git push origin `：



```dart
$ git push origin v1.0Total 0 (delta 0), reused 0 (delta 0)To git@github.com:michaelliao/learngit.git * [new tag]         v1.0 -> v1.0
```

或者，一次性推送全部尚未推送到远程的本地标签：



```dart
$ git push origin --tagsCounting objects: 1, done.Writing objects: 100% (1/1), 554 bytes, done.Total 1 (delta 0), reused 0 (delta 0)To git@github.com:michaelliao/learngit.git * [new tag]         v0.2 -> v0.2 * [new tag]         v0.9 -> v0.9
```

如果标签已经推送到远程，要删除远程标签就麻烦一点，先从本地删除：



```ruby
$ git tag -d v0.9Deleted tag 'v0.9' (was 6224937)
```

然后，从远程删除。删除命令也是push，但是格式如下：



```ruby
$ git push origin :refs/tags/v0.9To git@github.com:michaelliao/learngit.git - [deleted]         v0.9
```

要看看是否真的从远程库删除了标签，可以登陆GitHub查看。

- 给指定的commit打标签

打标签不必要在head之上，也可在之前的版本上打，这需要你知道某个提交对象的校验和（通过`git log`获取）。

参考文档：https://www.jianshu.com/p/046bf2956178

参考文档：https://blog.csdn.net/jiaofeng_hou/article/details/78793854