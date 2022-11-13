JSONP 跨域



1、前端代码

```javascript
<script>
        var script = document.createElement("script")
        script.src = "http://localhost:8888?callback=getData"
        document.body.appendChild(script)
        
        function getData(res) {
            console.log(res)
        }
</script>
```



2、用koa启一个服务

```javascript
const Koa = require("koa")

const app = new Koa()

app.use((ctx) => {
    // 接收前端传过来的参数
    let callback = ctx.query.callback
    let data = {
        code:666,
        msg:"success",
        data:{
            username:"laohu",
            age:100
        }
    }
    let dataStr = JSON.stringify(data)
    let res = callback + "(" + dataStr + ")"
    // 返回给前端的数据
    ctx.body = res
})

app.listen(8888, () => {
    console.log("http://localhost:8888")
})
```

