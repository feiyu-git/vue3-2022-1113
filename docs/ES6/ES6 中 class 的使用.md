# ES6 中 class 的使用



```
// 父类 
class Person {
    constructor(name,age) {
        this.name = name
        this.age = age
    }

    sayName() {
        console.log( "My name is " + this.name )
    }
}

// 子类通过extends继承父类属性和方法,同时必须调用 super()【super()内部的this指向的是worker非Person】
class worker extends Person {
    constructor(name,age,job) {
        super(name,age)
        this.job = job
    }

    sayMyInfo() {
        console.log( "姓名：" + this.name + " ；年龄：" + this.age + ";工作：" + this.job )
    }
}

let workers = new worker("张三",18,"teacher")
console.log(workers)
workers.sayName()       // 调用父类的方法
workers.sayMyInfo()     // 调用子类的方法
```



参考文档：https://www.php.cn/js-tutorial-384115.html