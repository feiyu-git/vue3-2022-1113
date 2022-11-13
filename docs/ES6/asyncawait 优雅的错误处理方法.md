# async/await 优雅的错误处理方法



##### 一般情况下 async/await 在错误处理方面，主要使用 `try/catch`，像这样。

```javascript
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('fetch data is me')
        }, 1000)
    })
}

(async () => {
    try {
        const data = await fetchData()
        console.log('data is ->', data)
    } catch(err) {
        console.log('err is ->', err)
    }
})()
```

##### 优雅处理方式：

```javascript
(async () => {
    const fetchData = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('fetch data is me')
            }, 1000)
        })
    }

    // 抽离成公共方法，将上面的函数返回结果进行处理
    const awaitWrap = (promise) => {
        return promise
            .then(data => [null, data])
            .catch(err => [err, null])
    }

    const [err, data] = await awaitWrap(fetchData())  // 注意这里 awaitwrap 传的参数是一个函数调用
    console.log('err', err)
    console.log('data', data)
})()
```



参考文档：https://zhuanlan.zhihu.com/p/79118227