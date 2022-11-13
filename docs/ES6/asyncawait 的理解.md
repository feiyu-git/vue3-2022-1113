# async/await 的理解



### promise 对象的理解：

​		promise 是一个对象，对象就能用来进行存取数据。存成功用 resolve、存失败用 reject，通过.then/.catch来取数据。

### 1、async/await 进行异步处理：

​		其实前面加了async的函数,当我在这个函数调用的时候进行打印发现它输出的是一个promise对象,其实这个函数的本质就是返回了一个promise对象,在这个函数里里我们加上await后,即使调用的是异步代码,它也会变成类似于同步,只有让这个异步代码执行完后,才会执行下面的同步代码来执行，这就是它的本质。

​		async与await需要配合使用的，await后面必须跟的是一个 promise 对象。

利用定时器模拟 async/await 将异步变同步的问题。

```javascript
function f1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(1)
            resolve();          // 不写 resolve 为什么后面的代码不执行？不写是语法错误
        }, 2000)
    })
}
function f2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(2)
            resolve(2);
        }, 5000)
    })
}
function f3() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(3)
            resolve(3);
        }, 2000)
    })
}

async function test() {
    await f1();
    await f2();
    await f3();
}

test()
```

### 2、async/await 利用try/catch进行错误捕获：

​		async/await 一般是与 try/catch 配合使用来进行错误捕获。否则捕获不到失败，且遇到失败后面的代码就不在执行，也不知道是什么原因。有了 try/catch 就不存在这个问题了。注意，这里的 try/catch 是只要有一个失败，结果就是失败。

案例：利用 flag  模拟成功失败。

​		当有一个promise时：

```javascript
var promise = new Promise((resolve, reject) => {
    var flag = false;
    setTimeout(() => {
        if (flag) {
            resolve({
                code: 666,
                msg: 'success'
            })
        } else {
            reject({
                code: 600,
                msg: 'error'
            })
        }
    }, 2000)
})

async function test() {
    try {
        let res = await promise;    // 在此就能将上面的 promise 关联进来，如果有多个	promise就 										res1=.../res2=...
        console.log(res);
    } catch (error) {
        console.log(error);
    }
    console.log(22222);     // 如果不写 try/catch 22222 是不会打印的，因为上面出错
}

test();
```

​		当有多个promise时：

```javascript
var promise1 = new Promise((resolve, reject) => {
    var flag = true;
    setTimeout(() => {
        if (flag) {
            resolve({
                code: 666,
                msg: 'success'
            })
        } else {
            reject({
                code: 600,
                msg: 'error'
            })
        }
    }, 2000)
})
var promise2 = new Promise((resolve, reject) => {
    var flag = true;
    setTimeout(() => {
        if (flag) {
            resolve({
                code: 666,
                msg: 'success'
            })
        } else {
            reject({
                code: 600,
                msg: 'error'
            })
        }
    }, 5000)
})

async function test() {
    try {
        let res1 = await promise1;    // 在此就能将上面的 promise 关联进来
        let res2 = await promise2;    // 在此就能将上面的 promise 关联进来
        console.log(res1);
        console.log(res2);
    } catch (error) {
        console.log(error);
    }
    console.log(22222);     // 如果不写 try/catch ,22222 是不会打印的，因为上面出错
}

test();
```



参考文档：https://juejin.im/post/5a9516885188257a6b061d72/



