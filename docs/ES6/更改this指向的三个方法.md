### 更改this指向的三个方法



##### 1.call() 方法

```
var Person = {
        name:"lixue",
        age:21
    }
    function fn(x,y){
        console.log(x+","+y);
        console.log(this);
    }
    fn("hh",20);
```

##### 2.apply() 方法


​		apply() 与call（）非常相似，不同之处在于提供参数的方式，apply（）使用参数数组，而不是参数列表。

##### 3.bind()方法

​		bind()创建的是一个新的函数（称为绑定函数），与被调用函数有相同的函数体，当目标函数被调用时this的值绑定到 bind()的第一个参数上。

