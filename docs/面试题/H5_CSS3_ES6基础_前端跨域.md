## H5_CSS3_ES6基础_前端跨域



### 一、H5 新特性

1. 语义化标签：header、footer、section、nav、aside、article

2. 增强型表单：input 的多个 type

3. 新增表单元素：datalist、keygen、output

4. 新增表单属性：placehoder、required、min 和 max

5. 音频视频：audio、video

6. canvas

7. 拖拽：ondragstart 、ondrag、ondragend 

8. 本地存储：localStorage - 没有时间限制的数据存储；sessionStorage - 针对一个 session 的数据存储，当用户关闭浏览器窗口后，数据会被删除

9. 新事件：onresize、ondrag、onscroll、onmousewheel、onerror、onplay、onpause

   参考文档：<https://www.cnblogs.com/ainyi/p/9777841.html>



### 二、css3 新特性

##### CSS3 新特性

> 1. 选择器 （伪类 / 属性）
>
> 2. flex 布局
>
> 3. 背景、边框、RBGA透明度、边框图片
>
> 4. 文本效果
>
> 5. 2D/3D 转换
>
> 6. 媒体查询（@media）
>
> 7. 转换(transform) 、过渡(transition)、动画(animation)
>
> [transform语法](https://www.w3school.com.cn/cssref/pr_transform.asp)：transform: none(默) | transform-functions(translateX(*x*) / scale(x，y));【注意兼容】
>
> [transition语法](https://www.w3school.com.cn/cssref/pr_transition.asp)：transition: property duration timing-function delay;
>
> [animation语法](https://www.runoob.com/cssref/css3-pr-animation.html)：animation: name duration timing-function(ease) delay(0) iteration-count(1) direction(normal) fill-mode(none) play-state(running);
>
> 
>
> animation必要属性：name / duration
>
> ##### 举例：
>
> animation: myfirst 5s linear 2s infinite alternate;
>
> 
>
> **property 说明**：
>
> [timing-function](https://www.runoob.com/cssref/css3-pr-animation-timing-function.html)：动画如何完成一个周期
>
> [iteration-count](https://www.runoob.com/cssref/css3-pr-animation-iteration-count.html)：播放的次数
>
> [direction](https://www.runoob.com/cssref/css3-pr-animation-direction.html)：指定是否应该轮流反向播放动画。
>
> fill-mode  :规定当动画不播放时(当动画完成时，或当动画有一个延迟未开始播放时)要应用到元素的样式
>
> [play-state](https://www.runoob.com/cssref/css3-pr-animation-play-state.html)：指定动画是否正在运行或已暂停。【就两个值：paused / running(默认)】

参考文档：<https://www.cnblogs.com/ainyi/p/9777841.html>

##### CSS 基础

> CSS 盒模型
>
> - W3C盒子模型：可通过box-sizing: content-box来设置，他包含content+padding+border+margin。
> - IE盒子模型：可通过box-sizing: border-box来设置，content+margin。其中content包含width , border，padding。
>
> BFC 
>
> 1. 什么是 BFC  ?【块级格式化上下文。产生了BFC的，形成了独立容器，他的特性就是不会再布局中影响到外边的元素。】
> 2. BFC 的特点  ？
> 3. 如何触发 BFE ?

参考文档：https://juejin.im/post/6867715946941775885



### 三、ES6 新特性

1. let/const
2. `` 模板字符串
3. ... 拓展运算符
4. 对象、数组 的解构赋值
5. Class 类
6. import/export 模块的导入导出
7. Map / Set
8. ?. 可选链运算符【ES2020】
9. 字符串方法
10. 箭头函数
11. Promise / async await
12. 新增的字符串方法 startsWidth/endsWidth/includes/padStart/padEnd



### 四、数组常用的方法

1. splice ：数组值的增、删、改
2. forEach ：此方法是将数组中的每个元素执行传进提供的函数，没有返回值
3. map ： 将数组映射成另一个数组【不改变原数组】
4. filter：对所有元素进行判断，将满足条件的元素作为一个新的数组返回【不改变原数组】
5. some ：对所有元素进行判断返回一个布尔值，如果存在元素都满足判断条件，则返回true【不改变原数组】
6. every ：对所有元素进行判断返回一个布尔值，则返回true，否则为false【不改变原数组】
7. reduce ：该方法 **reduce()** 应用了一个“累加器”功能，将数组合成一个值
8. reverse：颠倒数组元素顺序【改变了数组】
9. find ：将所有元素进行判断 **返回第一个返回值为true的成员**
10. push ：在数组的后面添加新加元素，此方法改变了原数组的长度
11. shift：删除数组第一个元素，并返回数组【改变了数组的长度】
12. pop ：删除数组最后一个元素，并返回数组【改变了数组的长度】
13. unshift：将一个或多个元素添加到数组的开头【改变了数组的长度】
14. Array.isArray() ：判断一个对象是不是数组，返回的是布尔值
15. concat：可以将多个数组拼接成一个数组，返回拼接后的数组【不改变原数组】
16. toString：将数组转化为字符串
17. join：将数组元素转化为字符串
18. sort：对数组元素进行排序【改变了数组】



### 五、字符串常用的方法

1. toLowerCase()：把字符串转为小写，返回新的字符串
2. toUpperCase()：把字符串转为大写，返回新的字符串
3. charAt()：返回指定下标位置的字符。如果index不在0-str.length(不包含str.length)之间，返回空字符串
4. indexOf()：返回某个指定的子字符串在字符串中第一次出现的位置
5. lastIndexOf()：返回某个指定的子字符串在字符串中最后出现的位置
6. slice()：字符串截取
7. split()：按照指定的字符把字符串分割成数组
8. replace()：在字符串中用一些字符替换另一些字符，或替换一个与正则表达式匹配的子串
9. match()：返回所有查找的关键字内容的数组
10. substring()：提取字符串中介于两个指定下标之间的字符





参考文档：<https://www.cnblogs.com/Yimi/p/10362214.html>


