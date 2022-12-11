## Vscode设置用户代码片段



##### 1、安装插件：Vetur、vueHelper

##### 2、Vscode：文件 -> 首选项 -> 用户代码片段

```json
{
  "vue": {
    "prefix": "vue3c",	// 触发代码片段的关键字
    "body": [
        "<template>",
        "  <div class=''>",
        "    ",
        "  </div>",
        "</template>",
        "",
        "<script>",
        "export default {",
        "  components: {},",
        "  setup(props, ctx) {",
        "    return {",
        "      ",
        "    }",
        "  }",
        "}",
        "</script>",
        "",
        "<style lang='less' scoped>",
        "</style>",
    ],
    "description": "vue3 组件",
  }
}
```



