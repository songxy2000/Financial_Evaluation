# 金融AI产品评测平台

## Docker 启动

根目录的 `docker-compose.yml` 现在统一管理三套服务：

```shell
docker compose up --build -d
```

会启动：

- `postgres`：PostgreSQL，端口 `5432`
- `backend`：Express API，端口 `4100`
- `frontend`：Next.js 前端，端口 `3000`

数据库现在使用当前项目自己的 Docker volume，便于后续维护和代码审查理解。

容器启动后访问：

- 前端首页：`http://localhost:3000`
- 后端健康检查：`http://localhost:4100/health`

如果本机已经有服务占用了 `3000` 或 `4100`，可以临时改成别的宿主机端口：

```shell
FRONTEND_HOST_PORT=3001 BACKEND_HOST_PORT=4101 docker compose up --build -d
```

这时访问地址变为：

- 前端首页：`http://localhost:3001`
- 后端健康检查：`http://localhost:4101/health`

#### 可选：确认容器状态

```shell
docker compose ps
```

#### 第一次启动或需要重置演示数据

```shell
docker compose exec backend node dist/db/reset.js
```

#### 停止容器

```shell
docker compose down
```

如需连数据库卷一起清空：

```shell
docker compose down -v
```

## 本地开发启动

如果你想继续保留本机直接开发的方式，也可以分别启动前后端。

## 后端启动

```shell
# 先切换到 backend 目录
npm install
npm run dev
```

第一次或者需要重置数据：

```shell
npm run db:reset
```

## 前端启动

```shell
# 先切换到 frontend 目录
npm install
npm run dev
```
