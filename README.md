# 麻将记账本

一个轻量的麻将盈亏记账 PWA。项目是纯前端静态应用，不包含后端、数据库或第三方云服务。

## 功能

- 设置昵称并在当前浏览器保存
- 记录每局输赢金额和日期
- 查看当月盈亏与累计盈亏
- 编辑、删除历史记录
- 支持 PWA 安装和离线缓存

## 数据保存限制

当前版本的数据只保存在当前浏览器的 `localStorage` 中：

- 数据保存在当前浏览器
- 清除浏览器数据会丢失
- 不支持跨设备同步
- 不支持多人共享同一个账本
- 换手机、换浏览器或无痕模式访问时，不会自动带出旧数据

## 本地安装

```bash
npm install
```

当前项目没有第三方运行依赖，保留 `npm install` 是为了标准化 GitHub 项目流程。

## 本地开发

```bash
npm run dev
```

默认启动一个零依赖静态文件服务，终端会显示访问地址。

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。构建脚本会复制上线所需静态文件，并排除 `.DS_Store` 等开发文件。

## 预览

```bash
npm run preview
```

也可以使用：

```bash
npm start
```

## 上线前检查

```bash
npm run check:release
```

检查内容包括：

- `dist/` 是否存在
- `dist/index.html`、`dist/manifest.json`、`dist/sw.js` 是否存在
- CSS、JS、字体、图标是否完整
- `dist/` 是否包含疑似敏感文件
- `dist/index.html` 是否包含本地地址或本机绝对路径

## GitHub 提交流程

首次创建仓库：

```bash
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin git@github.com:your-name/mj-account-deploy.git
git push -u origin main
```

后续更新：

```bash
npm run build
npm run check:release
git status
git add .
git commit -m "Update release files"
git push
```

## 为什么不提交 dist/

`dist/` 是构建产物，不是源代码。它已经写入 `.gitignore`，不建议提交到 GitHub：

- 避免仓库里同时存在源码和生成文件
- 避免每次构建产生无意义 diff
- 避免误把临时产物提交上线
- 部署时应由 `npm run build` 重新生成

## 资源路径和部署路径

项目资源使用相对路径，支持部署在站点根目录，也尽量支持 GitHub Pages 这类仓库子路径。PWA 的 Service Worker 会跟随部署目录注册。

生产环境需要确保 `sw.js` 不被长缓存。阿里云 Nginx 示例配置已经对 `sw.js` 设置 `no-cache, no-store, must-revalidate`。

## 环境变量

当前版本不需要任何环境变量。

不要提交 `.env`、`.env.local`、API key、secret、数据库密码或其他敏感配置。后续如果增加后端或第三方服务，请提供 `.env.example`，并把真实配置保存在服务器或部署平台的环境变量中。

## 部署到阿里云 ECS + Nginx

部署入口文档见：

[deploy/README_DEPLOY_ALIYUN.md](deploy/README_DEPLOY_ALIYUN.md)

推荐流程：

```bash
npm install
npm run build
npm run check:release
SERVER_IP=your.server.ip SERVER_USER=root REMOTE_DIR=/var/www/mj-account ./deploy/deploy_ecs.sh
```

服务器 Nginx 示例配置：

[deploy/nginx.mj-account.conf](deploy/nginx.mj-account.conf)
