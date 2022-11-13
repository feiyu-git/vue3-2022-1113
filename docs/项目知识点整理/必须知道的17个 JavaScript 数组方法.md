
在JavaScript中，数组是一个特殊的变量，用于存储不同的元素。它具有一些内置属性和方法，可用于根据需要添加，删除，迭代或操作数。并且了解JavaScript数组方法可以提升你的开发技能。

![img](https://mmbiz.qpic.cn/mmbiz_png/eXCSRjyNYcZmdPTbbBAFNTQ8SkJ2mIODAwebwFA5YAHlZazujNiaw7ZNBsias0yicGXtalNtnibTLJptfovw2aMfwg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在本文中，我们将介绍15种关于JavaScript的数组方法，这些方法可以帮助你正确地处理数据。



- 1.some（）
- \2. reduce（）
- \3. Every（）
- \4. map（）
- \5. flat（）
- \6. filter（）
- \7. forEach（）
- \8. findIndex（）
- \9. find（）
- \10. sort（）
- \11. concat（）
- \12. fill（）
- \13. includes（）
- \14. reverse（）
- \15. flatMap（）

> 注意，大多数情况下，我们将简化作为参数传递的函数。

```
// Instead of using this waymyAwesomeArray.some(test => {  if (test === "d") {    return test  }})// We'll use the shorter onemyAwesomeArray.some(test => test === "d")
```

### 1、some()

**some()**  方法测试数组中的 **某些元素** 是否通过了指定函数的测试。

定义和用法：
some() 方法用于检测数组中的元素是否满足指定条件（函数提供）。

some() 方法会依次执行数组的每个元素：

如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测。
如果没有满足条件的元素，则返回false。
注意： some() 不会对空数组进行检测。

注意： some() 不会改变原始数组。

#### 语法

> array.some(function(currentValue,index,arr),thisValue)
>
> function(currentValue, index,arr) 必须。函数，数组中的每个元素都会执行这个函数函数参数:
>
> ##### 参数描述：
>
> currentValue  必须。当前元素的值
> index  可选。当前元素的索引值
> arr  可选。当前元素属于的数组对象
> thisValue  可选。对象作为该执行回调时使用，传递给函数，用作 "this" 的值。如果省略了 thisValue ，"this" 的值为 "undefined"



#### 用法示例：

```javascript
// 1、用于判断数组中的元素是否有符合条件的
var ages = [23, 44, 3]
if (ages.some(age => age < 10)) {	// 这里的 ages.some(age => age < 10) 结果为布尔值
    console.log('true666')
}
// 注意：1、some 的回调函数需要 return ，否则得不到预期的结果
// 		2、箭头函数如果函数体只有一行时可以直接简写 age => age < 10	等价于下面
        age => {
            return age < 10
        }

//**********************************************************************************

// 2、用于数组遍历，一旦有 return true 遍历就结束：
categoryList.some((item) => {
    if (item.id === currWorkInfo.categoryId) {
        defaultCatetoryKey = item.key;
        currWorkInfo.categoryKey = item.key;
        return true;
    }
    return false;
});

// *********************************************************************************

// 3、用于判断数组中的元素是否有符合条件的
function isBigEnough(element, index, array) {
  return (element >= 10);
}
var passed = [2, 5, 8, 1, 4].some(isBigEnough);
// passed is false
passed = [12, 5, 8, 1, 4].some(isBigEnough);
// passed is true

// 4
const myAwesomeArray = ["a", "b", "c", "d", "e"]
myAwesomeArray.some(test => test === "d")
//-------> Output : true
```



### 2、reduce（）

此方法接收一个函数作为累加器。它为数组中的每个元素依次执行回调函数，不包括数组中被删除或者从未被赋值的元素。函数应用于累加器，数组中的每个值最后只返回一个值。

译者注：reduce() 方法接受四个参数：初始值（上一次回调的返回值），当前元素值，当前索引，原数组。

```javascript
const myAwesomeArray = [1, 2, 3, 4, 5]
myAwesomeArray.reduce((total, value) => total * value)
// 1 * 2 * 3 * 4 * 5
//-------> Output = 120

// *****************************************************************

// 将数组转换成对象：
const userList = [
    {
        id: 1,
        username: 'john',
        sex: 1,
        email: 'john@163.com'
    },
    {
        id: 2,
        username: 'jerry',
        sex: 1,
        email: 'jerry@163.com'
    },
    {
        id: 3,
        username: 'nancy',
        sex: 0,
        email: ''
    }
    ];

    let result = userList.reduce((pre, current) => {
        return {...pre, [current.id]: current};  // 类似于数组的 push 方法
    }, {});
    console.log(result)

// *************************************************************************

// 求数组的最大值与最小值
const readings = [7,2,5,7,1,4,6,9];

let minValue = readings.reduce((x,y) => Math.min(x,y));
console.log(minValue);

let maxValue = readings.reduce((x,y) => Math.max(x,y));
console.log(maxValue)

//**************************************************************************
let arr = [ { "name":"www", "time":110 }, 
            { "name":"aaa", "time":180 }, 
            { "name":"aaa", "time":220 }, 
            { "name":"ddd", "time":30 }, 
            { "name":"aaa", "time":190 }, 
            { "name":"www", "time":80 }, 
            { "name":"www", "time":90 }, 
            { "name":"aaa", "time":220 }, 
            { "name":"bbb", "time":60 }];
去重数组的name并且计算相同name的次数，过滤相同name时time的最大值，
输出实例：
[{"name":"www","time":110,"count":3}, 
 {"name":"aaa","time":220,"count":4}, 
 {"name":"ddd","time":30,"count":1}
 {"name":"bbb","time":60,"count":1}]
// 解决方法：
function filterArr(arr) {
    if (!arr || !arr.length) {
        return [];
    }
    return arr.reduce((pre, item) => {
        const hasItem = pre.find(element => element.name === item.name);
        if (hasItem) {
            hasItem.count++;
            hasItem.time = Math.max(hasItem.time, item.time);
        } else {
            pre.push({
                ...item,
                count: 1,
            });
        }
        return pre;
    }, [])
}
console.log(filterArr(arr)); // 注意函数如果不 return 则这里的结果为 undefined
```


### 3、Every（）

此方法是对数组中每项运行给定函数，如果数组的每个元素都与测试匹配，则返回true，反之则返回false。

#### 语法

```
arr.every(callback[, thisArg])
```

#### 参数

- `callback`

  用来测试每个元素的函数。

- `thisArg`

  执行 `callback` 时使用的 `this` 值。

#### 实例：

```javascript
// 检测数组中的元素是否都大于 10
function isBigEnough(element, index, array) {
  return (element >= 10);
}
var passed = [12, 5, 8, 130, 44].every(isBigEnough);
// passed is false
passed = [12, 54, 18, 130, 44].every(isBigEnough);
// passed is true

// *********************************************************

const myAwesomeArray = ["a", "b", "c", "d", "e"]
myAwesomeArray.every(test => test === "d")
// -------> Output : falseconst myAwesomeArray2 = ["a", "a", "a", "a", "a"]
myAwesomeArray2.every(test => test === "a")
//-------> Output : true
```



### 4、map（）

该方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。它按照原始数组元素顺序依次处理元素。

译者注：map() 不会对空数组进行检测；map() 不会改变原始数组。

```
const myAwesomeArray = [5, 4, 3, 2, 1]
myAwesomeArray.map(x => x * x)
//-------> Output : 25
//                  16
//                  9
//                  4
//                  1
```



### 5、flat（）

此方法创建一个新数组，其中包含子数组上的holden元素，并将其平整（数组扁平化）到新数组中。请注意，此方法只能进行一个级别的深度。

```javascript
const myAwesomeArray = [[1, 2], [3, 4], 5]
myAwesomeArray.flat()
//-------> Output : [1, 2, 3, 4, 5]
```



### 6、filter（）

该方法接收一个函数作为参数。并返回一个新数组，该数组包含该数组的所有元素，作为参数传递的过滤函数对其返回true。

译者注：filter（）方法是对数据中的元素进行过滤，也就是说是不能修改原数组中的数据，只能读取原数组中的数据，callback需要返回布尔值；为true的时候，对应的元素留下来；为false的时候，对应的元素过滤掉。

译者注：filter方法只能筛选数组元素，不能改变数组元素的内容（注意与map的区别）

```javascript
const myAwesomeArray = [  { id: 1, name: "john" },  { id: 2, name: "Ali" },  { id: 3, name: "Mass" },  { id: 4, name: "Mass" },]
myAwesomeArray.filter(element => element.name === "Mass")
//-------> Output : 0:{id: 3, name: "Mass"},
//                  1:{id: 4, name: "Mass"}

// *********************************************************************

filter() 去掉空字符串、undefined、null

let arr = ['','1','2',undefined,'3.jpg',null]
let newArr = arr.filter(item => item)	// return 条件为true的元素
console.log(newArr)
```



### 7、forEach（）

此方法用于调用数组的每个元素。并将元素传递给回调函数。

译者注: forEach() 对于空数组是不会执行回调函数的。

```javascript
const myAwesomeArray = [  { id: 1, name: "john" },  { id: 2, name: "Ali" },  { id: 3, name: "Mass" },]
myAwesomeArray.forEach(element => console.log(element.name))
//-------> Output : john
//                  Ali
//                  Mass
```

#### map 和 forEach 区别及应用说明

在forEach中return语句是没有任何效果的，而map则**可以改变当前循环的值，返回一个新的被改变过值之后的数组（map需return）**，一般用来处理需要修改某一个数组的值。如果需要改变数组对象中的元素，一般需要配合拓展运算符（...）

```javascript
//微信小程序项目
let url = "/cart/updateNum"
app.$get( url,data ).then(res => {
    console.log( res )
    console.log(this.data.cartList[0].buyNum)
    if(res.code === 666){
        let tempArr = this.data.cartList.map(item => {
            if( item.cartId == cartid ){
                return {
                    ...item,
                    buyNum:detail			//步进器更新购买数量
                    //也可在此添加一个 item 中不存在的属性如（ checked:true ）
                }
            }
            return item
        })
        // 修改数量成功后需要重新计算合计价格
        this.setData({
            cartList:tempArr,
            totalMoney:this.getTotalMoney( tempArr )
        })
    }
}).catch(err => {
    console.log( err )
})
```



### 8、 findIndex（）

此方法返回传入一个测试条件（函数）符合条件的数组第一个元素位置。它为数组中的每个元素都调用一次函数执行，当数组中的元素在测试条件时返回 true 时, findIndex() 返回符合条件的元素的索引位置，之后的值不会再调用执行函数。如果没有符合条件的元素返回 -1

译者注：findIndex() 对于空数组，函数是不会执行的， findIndex() 并没有改变数组的原始值。

```javascript
const myAwesomeArray = [  { id: 1, name: "john" },  { id: 2, name: "Ali" },  { id: 3, name: "Mass" },]
myAwesomeArray.findIndex(element => element.id === 3)
// -------> Output : 2
myAwesomeArray.findIndex(element => element.id === 7)
//-------> Output : -1
```



### 9、 find（）

此方法返回通过测试（函数内判断）的数组的**第一个元素的值**。find() 方法为数组中的每个元素都调用一次函数执行：当数组中的元素在测试条件时回 true 时, find() 返回符合条件的元素，之后的值不会再调用执行函数。如果没有符合条件的元素返回 undefined。

译者注: find() 对于空数组，函数是不会执行的；find() 并没有改变数组的原始值。

```javascript
const myAwesomeArray = [  { id: 1, name: "john" },  { id: 2, name: "Ali" },  { id: 3, name: "Mass" },]
myAwesomeArray.find(element => element.id === 3) 
// -------> Output : {id: 3, name: "Mass"}
myAwesomeArray.find(element => element.id === 7) 
//-------> Output : undefined

// ************************************************************************

// ES6的 find / findIndex 方法区别
var stu = [
        {
            name: '张三',
            gender: '男',
            age: 20
        },
        {
            name: '王小毛',
            gender: '男',
            age: 20
        },
        {
            name: '李四',
            gender: '男',
            age: 20
        }
    ]

    let temp = stu.find(element => {
        return element.name == '李四'
    })
    
    let ind = stu.findIndex( elem => {
        return elem.name == '李四'
    } )
    console.log(temp)       // 返回元素（是个对象）
    console.log(ind)        // 返回的是下标
```



### 10、 sort（）

此方法接收一个函数作为参数。它对数组的元素进行排序并返回它。也可以使用含有参数的sort()方法进行排序。

```javascript
const myAwesomeArray = [5, 4, 3, 2, 1]
// Sort from smallest to largestmyAwesomeArray.sort((a, b) => a - b)
//  -------> Output : [1, 2, 3, 4, 5]
// Sort from largest to smallestmyAwesomeArray.sort((a, b) => b - a)
//-------> Output : [5, 4, 3, 2, 1]
```

**注意：** Arrary.sort() 排序【比如 element UI 的 table 排序就是按照这个规则】

```javascript
const myAwesomeArray = [5, 4, 3, 2, 1, 11, 12, 22]
let result = myAwesomeArray.sort()
// --> [1, 11, 12, 2, 22, 3, 4, 5]	--> 这里的排序是按照 ASCII 进行排序的，即将所有的元素先比较首字母，首字母相同在比较次字母，依此类推...

// 升序排列
// 降序排列
// 按照数组对象中某个属性值进行排序
```

参考文档：<https://www.cnblogs.com/saifei/p/9043821.html>



### 11、 [concat（）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)

此方法用于连接两个或多个数组/值，它不会改变现有的数组。而仅仅返回被连接数组的一个新数组。

```javascript
const myAwesomeArray = [1, 2, 3, 4, 5]
const myAwesomeArray2 = [10, 20, 30, 40, 50]
myAwesomeArray.concat(myAwesomeArray2)
//-------> Output : [1, 2, 3, 4, 5, 10, 20, 30, 40, 50]
```

##### 补充说明：

- 连接两个数组

```js
const arr1 = [1, 2];
const arr2 = [3, 4];
const arr3 = arr1.concat(arr2);
```

- 连接三个数组

```js
var num1 = [1, 2, 3],
    num2 = [4, 5, 6],
    num3 = [7, 8, 9];
var nums = num1.concat(num2, num3);
console.log(nums); 
// results in [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

- 将值连接到数组【容易被忽略的点】

```js
var alpha = ['a', 'b', 'c'];
var alphaNumeric = alpha.concat(1, [2, 3]);
console.log(alphaNumeric); 
// results in ['a', 'b', 'c', 1, 2, 3]

var alphaNumeric1 = alpha.concat(1);
console.log(alphaNumeric1); 
// results in ['a', 'b', 'c', 1]
```

### 12、 fill（）

此方法的作用是使用一个固定值来替换数组中的元素。该固定值可以是字母、数字、字符串、数组等等。它还有两个可选参数，表示填充起来的开始位置（默认为0）与结束位置（默认为array.length）。

译者注：fill() 方法用于将一个固定值替换数组的元素。

```javascript
const myAwesomeArray = [1, 2, 3, 4, 5]
// The first argument (0) is the value
// The second argument (1) is the starting index
// The third argument (3) is the ending indexmyAwesomeArray.fill(0, 1, 3)
//-------> Output : [1, 0, 0, 4, 5]
```



### 13、 includes（）

includes() 方法用来判断一个数组是否包含一个指定的值，如果是返回 true，否则false。

译者注：includes() 方法区分大小写。

```javascript
const myAwesomeArray = [1, 2, 3, 4, 5]
myAwesomeArray.includes(3)
// -------> Output : truemyAwesomeArray.includes(8)/
/ -------> Output : false
```

##### 应用举例 filter + includes 过滤数组

简单demo：

```javascript
// 从 arr01 中删除含有 arr02 中的元素
let arr01 = [9,2,5,2,8,9,'a','b',2,6]
let arr02 = [5,9]
let arr03 = arr01.filter(item => {
	return !arr02.includes(item)
})
console.log( arr03 )        // [2, 2, 8, "a", "b", 2, 6]
```

vue 项目应用案例：购物车勾选删除

```javascript
this.cartList = this.cartList.filter(item => {
	return !cartId.includes(item.cartId);
})
```



### 14、 reverse（）

此方法用于颠倒数组中元素的顺序。第一个元素成为最后一个，最后一个元素将成为第一个。

```javascript
const myAwesomeArray = ["e", "d", "c", "b", "a"]
myAwesomeArray.reverse()
// -------> Output : ['a', 'b', 'c', 'd', 'e']
```



### 15、 flatMap（）

该方法将函数应用于数组的每个元素，然后将结果压缩为一个新数组。它在一个函数中结合了flat（）和map（）。

```javascript
const myAwesomeArray = [[1], [2], [3], [4], [5]]
myAwesomeArray.flatMap(arr => arr * 10)
//-------> Output : [10, 20, 30, 40, 50]
// With .flat() and .map()myAwesomeArray.flat().map(arr => arr * 10)
//-------> Output : [10, 20, 30, 40, 50]
```



### 16、set()方法【数组去重推荐使用】

```vbscript
var arr = [1, 2, 8, 4, 5, 6, 3, 2, 1, 1, 2,'test',false,false,true]
// 方法一：
let resultArr = []
arr.forEach((item,index) => {
    if( !resultArr.includes(item) ) {
        resultArr.push(item)
    }
})
console.log( resultArr )

// 方法二：
let resultArr2 = []
arr.forEach((item,index,arr) => {
    if( arr.indexOf(item) == index ) {
        resultArr2.push( item )
    }
})
console.log( resultArr2 )

// 方法三：
// Array.from() 方法从一个类似数组或可迭代对象中创建一个新的数组实例。
let resultArr3 = Array.from( new Set( arr ) )
// 或者(两种写法均可)
let resultArr3 = [...new Set(arr)]
console.log( "resultArr3",resultArr3 ) // [1, 2, 8, 4, 5, 6, 3, "test", false, true]
```

##### Set 方法原理：

> 1、定义：新数据结构Set，类似于数组（类数组）的对象，但成员值不重复；
>
> 2、使用： new Set()；
>
> ```javascript
> var set = new Set([1,2,3,4,3,2,1]); […set] // [1,2,3,4]
> ```
>
> 3、new Set() 接受一个数组或类数组对象,在Set内部， NAN相等，两个对象不等，可以用length检测，可以用for...of遍历
>
> ##### Set有四个操作方法和属性：
>
> size：返回值的个数
>
> add(val)：添加值，返回set结构；// new Set(arr).add(99)
>
> delete(val)：删除值，返回布尔值
>
> has(val)：是否包含，返回布尔值
>
> clear()：清除所有成员，无返回值

参考文档：<https://www.jianshu.com/p/630800e6d2af>



### 17、splice方法【数组的删除或者添加元素】

splice（index ，howmany，item1，...，item1）	**返回的是删除的元素形成的一个数组**


```javascript
let filtratedArr = this.data.cartList
for( let i = 0 ; i < filtratedArr.length ; i++ ){
    for( let j = 0 ; j < cartIdArr.length ; j++ ){
        if( filtratedArr[i].cartId == cartIdArr[j] ){
            filtratedArr.splice(i,1)
        }
    }
}
console.log( filtratedArr )
this.setData({
    cartList:filtratedArr,
    selectArr:[],
    selectAll:false
})
// 可能还有更好的方法，目前没找到。
```

**注意：**slice / splice / split 方法的区别

```javascript
slice(start,end)		// 数组的截取（左开右闭区间）
splic(index ，howmany，item1，...，item1)	// 数组同时删除并修改（添加）某个（或几个）元素
split【 字符串方法 】					// 根据分割符，将字符串转化成数组
```





