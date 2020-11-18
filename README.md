# 模版页面的开发工具

### 启动开发

```bash
yarn start templateName
// 如,此处不区分大小写
yarn start EmptyPage
```

### 魔改的配置

在 package 里面，增加了 `template` 配置，主要是用来设置 `navbar` 和 页面背景色
> 请注意，是在模版目录下的 `package.json` 里面配置，不是在最外层的 `package.json`。

```json
  "template": {
    "navbar": {
      "title": "空白页",
      "backgroundColor": "#FFFFFF",
      "display": "flex",
      "color": "#333333"
    },
    "backgroundColor": "#F5F5F5"
  },
```

### 增加默认首页

使用 yarn start 启动时，会增加一个默认的首页，用于展示所有的页面。

### 手动查找的路由

手动查找了所有执行目录下的文件夹，取得所有模版的页面，在全部预览模式下，可以通过模块文件夹名的全小写匹配访问。
