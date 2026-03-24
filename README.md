# 金融AI产品评测平台

## 后端启动

####  启动 PostgreSQL（若已启动会复用）
```shell
docker compose up -d
```

#### 可选：确认数据库容器状态
```shell
docker compose ps
```

#### 启动后端

```shell
#先切换到前端项目backend目录下
npm run dev
```

#### 第一次或者重置数据

```shell
npm run db:reset
```

## 前端启动

如果是第一次或依赖有变化，先安装再启动：

```shell
#先切换到前端项目frontend目录下
npm install
npm run dev
```

