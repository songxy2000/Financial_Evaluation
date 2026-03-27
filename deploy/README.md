# 服务器部署说明

## 1. 准备服务器

- 安装 Docker 和 Docker Compose 插件
- 安装 Nginx
- 准备可解析到服务器的域名
- 开放 `80/443` 端口

## 2. 准备生产环境变量

在项目根目录创建 `.env.prod`，可参考根目录的 `.env.prod.example`：

```bash
cp .env.prod.example .env.prod
```

必须至少替换：

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `PUBLIC_DOMAIN`
- `PUBLIC_ORIGIN`
- `INTERNAL_API_KEY`
- `ADMIN_API_KEY`

## 3. 启动生产容器

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
```

如果是第一次部署，且需要初始化演示数据：

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec backend node dist/db/reset.js
```

## 4. 配置 Nginx

复制 `deploy/nginx/financial_evaluation_v2.conf` 到服务器的 Nginx 配置目录，并把 `server_name` 改成真实域名。

常见位置示例：

```bash
sudo cp deploy/nginx/financial_evaluation_v2.conf /etc/nginx/conf.d/financial_evaluation_v2.conf
```

然后重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. 验证部署

容器状态：

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

本机回环检查：

```bash
curl http://127.0.0.1:4100/health
curl http://127.0.0.1:3000
```

域名检查：

```bash
curl http://your-domain/health
curl http://your-domain/api/v1/evaluations
```

## 6. 访问受保护接口

内部导入接口和报名列表接口都需要 API Key。

方式一：`Authorization: Bearer <key>`

方式二：`x-api-key: <key>`

示例：

```bash
curl -H "x-api-key: ${ADMIN_API_KEY}" http://127.0.0.1:4100/api/v1/applications
```
