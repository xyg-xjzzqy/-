# 资源库

一个部署在 Cloudflare Pages 的个人资源下载站。资源目录保存在 `data.json`，也可以用后台页面在线维护。

## 文件说明

- `index.html` — 前台页面
- `app.js` — 前台渲染与搜索逻辑（一般不用改）
- `data.json` — 资源数据，也是首次上线时的初始数据
- `admin.html` — 管理后台（在线增删资源）
- `functions/api/tools.js` — Cloudflare Pages Functions 后端接口

## 使用方式

### 方式一：只改数据文件（最省事）

直接编辑 `data.json`，在对应 `items` 数组里照抄一行：

```json
{ "name": "工具名称", "btn": "下载", "url": "https://..." }
```

字段说明：

- `title` 分类标题
- `emoji` 分类图标
- `style` 可选：`"推荐"`（顶部大卡）、`"宽卡"`（整行两列）
- `name` 资源名称
- `btn` 按钮文字；含「下载/安装」会自动变成实心按钮
- `url` 下载链接；留空会显示「待填写」

改完保存并推送到 GitHub，Cloudflare Pages 会自动重新部署。

### 方式二：在线后台（推荐，需配置一次 KV）

1. 在 Cloudflare 控制台创建 KV 命名空间（Workers & Pages → KV → Create a namespace）。
2. 打开 Pages 项目 → Settings → Functions → KV namespace bindings，添加绑定：
   - Variable name：`TOOLS`
   - KV namespace：刚创建的命名空间
3. 同页找到 Environment variables，添加：
   - Variable name：`ADMIN_TOKEN`
   - Value：自己设一个长一点的随机字符串
4. 重新部署项目，然后打开 `https://你的域名/admin.html`。
5. 右上角填入 `ADMIN_TOKEN`，增删资源后点「发布到网站」即可，前台几秒内更新。

> 没配置 KV 时，`admin.html` 会退化为「静态模式」：可以编辑并下载生成好的 `data.json`，再手动提交到仓库，同样很方便。

> 安全提示：`ADMIN_TOKEN` 一定要设置，否则发布接口对所有访客开放。

## 本地预览

直接用浏览器打开 `index.html` 可能因浏览器安全策略无法读取 `data.json`，建议起一个本地服务：

```bash
npx serve .
```

或

```bash
python -m http.server 8080
```

然后访问 `http://localhost:8080`。
