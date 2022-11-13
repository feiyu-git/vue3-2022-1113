

### 先确认安装好git

1、桌面右键 Git Bash Here 打开git命令行

2、ssh-keygen -t rsa -C "输入你的邮箱" （全部按enter）

3、cd ~/.ssh （如果没有执行第三步，则不会有这个文件夹）

4、cat id_rsa.pub 在命令行打开这个文件，会直接输出密钥

5、复制，打开github ，点自己头像 >> settings >> SSH and GPG keys >>New SSH key

6、titile 随便写

参考文档：[https://blog.csdn.net/weixin_42063071/article/details/80999690](https://blog.csdn.net/weixin_42063071/article/details/80999690)
