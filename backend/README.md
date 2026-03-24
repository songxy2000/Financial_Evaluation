# Financial AI Evaluation Backend

基于《金融AI评测平台后端架构设计方案（展示与数据接入版）》实现的后端示例工程。

特性：

1. 使用 PostgreSQL 存储评测数据（非内存）。
2. 提供前端需要的核心展示接口。
3. 提供内部数据导入接口（评测/奖项）。
4. 提供图片抓取任务入库接口和任务处理脚本（占位实现）。

## 1. 环境准备

```bash
cd backend
cp .env.example .env
npm install
```

## 2. 启动 PostgreSQL

推荐使用 docker-compose：

```bash
cd backend
docker compose up -d
```

默认连接信息（已写入 `.env.example`）：

- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/financial_ai_eval`

## 3. 初始化数据库并注入 mock 数据

```bash
npm run db:reset
```

会在 PostgreSQL 中写入：

1. 三个月份（2026-03/02/01）的评测榜单 mock 数据
2. 奖项数据
3. 竞技场结果展示数据

## 4. 启动服务

```bash
npm run dev
```

默认地址：`http://localhost:4100`

健康检查：

```bash
curl http://localhost:4100/health
```

## 5. 主要接口

## 前端展示接口

1. `GET /api/v1/evaluations`
2. `GET /api/v1/evaluations/:slug`
3. `GET /api/v1/evaluations/meta/categories`
4. `GET /api/v1/awards/years`
5. `GET /api/v1/awards?year=2026`
6. `POST /api/v1/applications`
7. `GET /api/v1/arena/results?category=金融大模型`

示例：

```bash
curl "http://localhost:4100/api/v1/evaluations?category=金融大模型&month=2026-03&sort=overall"
```

## 内部接入接口

1. `POST /api/v1/internal/ingest/evaluations`
2. `POST /api/v1/internal/ingest/awards`
3. `GET /api/v1/internal/ingest/batches/:batchId`
4. `POST /api/v1/internal/media/crawl`

## 6. 图片抓取任务（占位实现）

提交任务：

```bash
curl -X POST http://localhost:4100/api/v1/internal/media/crawl \
  -H "Content-Type: application/json" \
  -d '{"keyword":"蚂蚁集团","targetType":"org_logo","sourceUrl":"https://logo.clearbit.com/antgroup.com"}'
```

执行任务处理：

```bash
npm run crawl:run
```

注意：当前 `crawl:run` 只是占位 worker，用于演示任务状态流，不是完整爬虫。生产环境请替换为真实抓取流程并处理版权/robots 合规要求。

## 7. 停止 PostgreSQL

```bash
docker compose down
```

如需连数据一起清空：

```bash
docker compose down -v
```

## 8. API 冒烟测试

在后端服务启动后执行：

```bash
npm run smoke:api
```

脚本会依次验证：

1. `GET /health`
2. `GET /api/v1/evaluations`
3. `GET /api/v1/evaluations/:slug`
4. `GET /api/v1/awards/years` + `GET /api/v1/awards`
5. `GET /api/v1/arena/results`
6. `POST /api/v1/applications` + `GET /api/v1/applications` 回查

可选参数：

```bash
SMOKE_BASE_URL=http://127.0.0.1:4100 npm run smoke:api
SMOKE_TIMEOUT_MS=15000 npm run smoke:api
SMOKE_CATEGORY=金融大模型 npm run smoke:api
```
