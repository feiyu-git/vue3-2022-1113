# Promise.all



Promise.all的使用

```javascript
<script src="https://cdn.bootcss.com/axios/0.19.0-beta.1/axios.min.js"></script>
<script>
    let p1 = axios.get("http://132.232.94.151:3000/api/film/getList")
    let p2 = axios.get("http://132.232.94.151:3000/api/city/getList")
    let p3 = axios.get("http://132.232.94.151:3000/api/film/getList1111")
    Promise.all([p1,p2,p3]).then(res => {
        console.log(res)
    }).catch(err => {
        console.log(err)
    })

</script>
```

