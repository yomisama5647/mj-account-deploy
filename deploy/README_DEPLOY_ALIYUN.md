# 阿里云 ECS + Nginx 部署说明

本项目是纯前端静态网站。上线只需要部署 `dist/` 目录，不需要后端、数据库或海外 CDN。

## 本地构建

```bash
npm install
npm run build
npm run check:release
```

构建成功后，本地会生成 `dist/`。不要把 `dist/` 提交到 GitHub。

## 上传到 ECS

准备好服务器 IP、SSH 用户和远程目录后执行：

```bash
SERVER_IP=your.server.ip SERVER_USER=root REMOTE_DIR=/var/www/mj-account ./deploy/deploy_ecs.sh
```

脚本会优先使用 `rsync` 上传；如果本机没有 `rsync`，会退回到 `scp` + `tar`。

## ECS 安全组

至少开放：

- `22`：SSH 登录
- `80`：HTTP 访问
- `443`：HTTPS 访问

生产环境建议只对可信 IP 开放 SSH。

## Nginx 配置

把示例配置复制到服务器：

```bash
sudo cp deploy/nginx.mj-account.conf /etc/nginx/conf.d/mj-account.conf
```

在服务器上编辑：

```bash
sudo nano /etc/nginx/conf.d/mj-account.conf
```

修改：

- `server_name your-domain.com;`
- `root /var/www/mj-account;`

检查配置并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

如果 Nginx 还没有启动：

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

## DNS

在域名 DNS 控制台添加 A 记录：

- 主机记录：`@` 或你的子域名
- 记录类型：`A`
- 记录值：ECS 公网 IP

DNS 生效后访问你的域名。

## ICP 和 HTTPS 提醒

大陆服务器绑定域名通常需要完成 ICP 备案。生产环境建议配置 HTTPS，可以使用阿里云证书或其他合规证书来源。

## 验证部署成功

用浏览器或 `curl` 检查：

```bash
curl -I http://your-domain.com/
curl -I http://your-domain.com/index.html
curl -I http://your-domain.com/manifest.json
curl -I http://your-domain.com/sw.js
curl -I http://your-domain.com/styles/main.css
curl -I http://your-domain.com/scripts/app.js
curl -I http://your-domain.com/fonts/zcool-kuaile-23-400-normal.woff2
curl -I http://your-domain.com/icon-192.png
```

重点确认：

- `index.html` 可以打开
- `manifest.json` 可以访问
- `sw.js` 可以访问，且响应头不要被长缓存
- CSS、JS、字体、图标可以访问
- 手机浏览器访问页面正常
- 添加到主屏幕后 PWA 能打开
