## JS 原理部分



1. #### 原型 / 原型链

   原型

   > 普通对象：每一个对象都有 __proto__ 属性，该属性指向其 prototype 原型对象
   >
   > 构造函数：每一个构造函数都有一个 prototype 属性指向其原型对象，原型对象都有一个 constructor 属性指向该构造函数

   原型链

   > 访问一个对象中的某个属性会先到该对象本身查找，如果找不到就会到其原型上去查找，依次层层搜索，知道找到该对象或者查到原型链的末尾。

   

2. #### [数据类型的判断](https://www.cnblogs.com/onepixel/p/5126046.html)

   > typeof：常用于基本类型判断  typeof '';  // string 有效
   >
   > instanceof：常用于引用类型判断  {} instanceof Object;  // true
   >
   > toString: Object.prototype.toString.call('')  ===  [object String]

   

3. #### instanceof

   ```js
   A instanceof B	// 判断 B 是否存在于 A 的原型链上
   ```

