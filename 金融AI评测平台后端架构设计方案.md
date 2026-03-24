# 金融AI评测平台后端架构设计方案（展示与数据接入版）

## 1. 设计目标与边界

本方案基于以下两份文档并结合最新边界调整：

- `金融AI评测平台需求与设计.md`
- `金融AI评测平台详细设计.md`

最新边界（本版核心前提）：

1. 评测过程与评分计算由公司其他部门负责。
2. 本后端不负责计算分数，仅负责数据接入、存储、查询、展示。
3. 为尽快联调前端，V1 先使用模拟数据入库。
4. 产品/机构图片先通过网络爬取或人工整理后入库。

V1 目标：

1. 前端页面可完整展示榜单、详情、奖项、报名、竞技场页面所需数据。
2. 后端具备“模拟数据 -> 真实评测数据”平滑切换能力。
3. 全链路保留可追溯能力（批次、版本、更新时间、数据来源）。

---

## 2. 总体架构建议

## 2.1 架构形态

建议采用 **模块化单体（Modular Monolith）**：

- `NestJS + TypeScript`
- `PostgreSQL`（主存储）
- `Redis`（榜单缓存，可选）
- 对象存储（OSS / MinIO，用于图片落地与托管）

说明：

1. 当前业务重点是“稳定展示和快速联调”，模块化单体交付最快。
2. 评分计算不在本系统，后端复杂度显著下降。
3. 后续如数据量增长，可将“数据接入模块”独立拆分。

## 2.2 逻辑分层

1. **API 层**：提供前端接口，做参数校验、错误码、追踪 ID。
2. **应用层**：榜单查询、详情查询、报名提交、奖项查询、竞技场结果查询。
3. **数据接入层**：接收外部评测部门数据（文件或 API），写入数据库。
4. **基础设施层**：DB、缓存、对象存储、日志监控。

## 2.3 核心模块

1. `evaluation-read-module`：评测榜单/详情只读接口。
2. `evaluation-ingest-module`：外部评分结果导入（批次化）。
3. `award-module`：年度奖项读取。
4. `application-module`：报名提交与审核状态。
5. `arena-module`：竞技场展示数据读取（不在本系统做评分计算）。
6. `media-module`：图片抓取任务、图片元数据、CDN URL 管理。
7. `meta-module`：类别、月份、筛选项等元数据。

---

## 3. 业务边界与数据职责

## 3.1 评分职责边界

本系统仅保存并展示以下分数：

1. `overallScore`
2. `businessScore`
3. `complianceScore`

这些字段由外部评测团队提供，后端仅做：

1. 格式校验（0~100、整数、必填检查）
2. 批次落库
3. 接口查询与分页排序

本系统不做：

1. 权重计算
2. 自动化评测脚本执行
3. 专家评分聚合

## 3.2 数据源分层

建议明确两类数据源：

1. `mock`：模拟数据（联调/演示阶段）
2. `official`：外部评测团队正式数据

接口可返回：

- `dataSource: mock | official`
- `importBatchId`
- `updatedAt`

## 3.3 月度快照策略

按前端约定保留 `month=YYYY-MM` 维度：

1. 每月数据视为一个快照。
2. 若同月修订，保留 `revision` 字段。
3. 默认查询同月最新 `revision`。

---

## 4. 数据库设计（PostgreSQL）

## 4.1 核心表清单

1. `organizations`（机构）
2. `products`（产品）
3. `evaluation_snapshots`（月度快照头）
4. `evaluation_records`（榜单展示主记录）
5. `evaluation_breakdowns`（可选分项明细，来自外部）
6. `persona_fit_results`（画像适配结果，来自外部）
7. `awards`（奖项）
8. `applications`（报名）
9. `media_assets`（图片资产）
10. `media_crawl_tasks`（图片抓取任务）
11. `arena_result_sets`（竞技场结果展示）
12. `audit_logs`（审计日志）

## 4.2 关键表字段建议

## `evaluation_records`

- `id` (PK)
- `snapshot_id` (FK)
- `product_id` (FK)
- `slug`
- `name`
- `organization`
- `category`
- `status`
- `overall_score` (int)
- `business_score` (int)
- `compliance_score` (int)
- `certification_level`
- `award_tags` (jsonb)
- `report_updated_at` (date)
- `data_source` (`mock`/`official`)
- `import_batch_id`
- `revision`
- `created_at`, `updated_at`

约束建议：

1. `unique(snapshot_id, product_id, revision)`
2. 分数字段 check 约束 `0 <= score <= 100`

## `media_assets`

- `id`
- `entity_type` (`product` / `organization`)
- `entity_id`
- `asset_type` (`logo` / `cover`)
- `source_url`（抓取来源 URL）
- `storage_url`（落地后 URL）
- `status` (`pending`/`available`/`failed`)
- `copyright_note`（版权来源备注）
- `created_at`, `updated_at`

## `media_crawl_tasks`

- `id`
- `keyword`（产品名/机构名）
- `target_type` (`product_logo` / `org_logo`)
- `status` (`queued`/`running`/`success`/`failed`)
- `result_asset_id`
- `error_message`
- `created_at`, `updated_at`

---

## 5. 数据接入方案（重点）

## 5.1 外部评测数据接入（正式）

推荐两种方式并行支持：

1. **文件批量导入**：CSV/JSON 上传后解析入库。
2. **接口推送导入**：外部部门调用 `ingest` API 推送。

统一落地流程：

1. 写入 `import_batch`（可内嵌在 `evaluation_snapshots`）
2. 校验格式与枚举值
3. 入 `evaluation_records`
4. 记录成功/失败数量
5. 输出批次报告（供追踪）

## 5.2 模拟数据接入（V1）

V1 先准备一批 mock 数据写入数据库，满足前端展示：

1. 类别覆盖：金融大模型、金融智能体、MCP、Skill、其他。
2. 月份覆盖：至少 `2026-03 / 2026-02 / 2026-01`。
3. 每个类别至少 5~10 条，保证榜单、筛选、详情都有数据。
4. 奖项数据与榜单产品保持可关联。

建议执行方式：

1. 建立 `db/seeds/mock_evaluations.sql` 或 `scripts/seed/mock-data.ts`
2. 用固定随机种子生成分数，保证每次环境一致
3. `data_source` 统一写 `mock`

## 5.3 图片爬取与入库（V1）

目标：补齐 `productLogoUrl / organizationLogoUrl`，支持前端展示。

建议流程：

1. 先根据产品名、机构名创建 `media_crawl_tasks`。
2. Worker 抓取公开可访问图片 URL（优先官方站点/logo 资源）。
3. 下载后转存到对象存储，写入 `media_assets.storage_url`。
4. 人工抽检后将 `products.product_logo_url / organization_logo_url` 回填。

合规建议：

1. 仅抓取公开页面可访问素材，遵守目标站点 robots 与使用条款。
2. 记录 `source_url` 与 `copyright_note`，便于后续追溯与替换。
3. 对疑似版权风险素材标记 `failed` 或 `pending_review`（可扩展状态）。

---

## 6. API 设计（与前端对齐）

## 6.1 前端已需接口（V1）

1. `GET /api/v1/evaluations`
2. `GET /api/v1/evaluations/{slug}`
3. `GET /api/v1/evaluations/meta/categories`
4. `GET /api/v1/awards/years`
5. `GET /api/v1/awards?year=YYYY`
6. `POST /api/v1/applications`
7. `GET /api/v1/arena/results?category=...`（展示型接口）

说明：

1. 竞技场结果可先返回 mock 数据或预置结果。
2. 本系统不负责计算竞技场分数，只负责返回已存在结果。

## 6.2 数据接入接口（内部）

1. `POST /api/v1/internal/ingest/evaluations`（导入评测结果）
2. `POST /api/v1/internal/ingest/awards`（导入奖项）
3. `POST /api/v1/internal/media/crawl`（提交图片抓取任务）
4. `GET /api/v1/internal/ingest/batches/{batchId}`（查看导入批次结果）

## 6.3 查询参数规范

支持参数：

- `category`
- `month`
- `status`
- `award`
- `scenario`
- `q`
- `sort`（`overall | business | compliance | updated`）
- `page` / `pageSize`

排序行为：

1. `overall`：按 `overall_score` 降序
2. `business`：按 `business_score` 降序
3. `compliance`：按 `compliance_score` 降序
4. `updated`：按 `report_updated_at` 降序

---

## 7. 报名系统设计

## 7.1 校验规则（与前端一致）

1. 必填字段必须存在且非空。
2. `contactPhone` 校验 `^1\\d{10}$`。
3. `contactEmail` 基础邮箱校验。
4. `agreementAccepted` 必须为 `true`。

## 7.2 状态流转

`SUBMITTED -> UNDER_REVIEW -> MATERIAL_PENDING -> APPROVED -> REJECTED`

每次变更写入审计日志，保留操作人和备注。

---

## 8. 错误码与返回规范

保留并沿用：

- `EVALUATION_NOT_FOUND`
- `INVALID_QUERY`
- `INVALID_APPLICATION`
- `INTERNAL_ERROR`

建议补充：

- `INGEST_SCHEMA_INVALID`（导入格式不合法）
- `INGEST_BATCH_FAILED`（导入批次失败）
- `MEDIA_CRAWL_FAILED`（图片抓取失败）

统一返回结构建议：

```json
{
  "code": "INVALID_QUERY",
  "message": "month 参数非法",
  "requestId": "req_xxx"
}
```

---

## 9. 安全、审计与可观测性

## 9.1 安全

1. 报名联系人字段（手机号、邮箱）加密存储或脱敏展示。
2. 内部导入接口必须鉴权（IP 白名单 + Token 或 mTLS）。
3. 图片抓取任务仅允许白名单域名（可配置），避免 SSRF 风险。

## 9.2 审计

审计日志至少包含：

1. 操作人/调用方
2. 批次号
3. 变更对象
4. 变更前后摘要
5. 时间戳
6. requestId

## 9.3 可观测性

1. 指标：接口延迟、错误率、导入成功率、图片抓取成功率。
2. 日志：结构化 JSON，按 `requestId` 贯穿。
3. 告警：导入失败率过高、抓取任务积压、数据库慢查询。

---

## 10. 实施路线（4 周）

## 第 1 周：数据模型与 mock 入库

1. 建表（evaluation_records、awards、applications、media_assets 等）。
2. 生成并导入 mock 榜单与详情数据。
3. 对齐前端字段命名与枚举值。

## 第 2 周：前端读接口联调

1. 完成 `evaluations`、`awards`、`applications` 基础接口。
2. 前端页面完成首页、榜单、详情、奖项、报名联调。
3. 增加缓存与分页优化。

## 第 3 周：图片抓取链路

1. 实现 `media_crawl_tasks` 与 Worker。
2. 批量抓取并回填 logo 地址。
3. 人工抽检并修正失败样本。

## 第 4 周：外部数据接入打通

1. 上线内部导入接口（或文件导入脚本）。
2. 跑通 `mock -> official` 切换流程。
3. 输出接入操作手册与故障回滚方案。

---

## 11. 技术决策结论

1. 后端定位为 **评测结果展示系统**，不是评测计算系统。
2. V1 以 mock 数据优先，先保证前端上线展示。
3. 图片采用“抓取 + 落库存储 + 人工抽检”组合方案。
4. 通过数据源标记（`mock/official`）和导入批次机制保证可追溯。

---

## 12. 需要你拍板的 4 个关键点

1. 外部评测部门最终提供的数据格式是 CSV 还是 JSON API（两者都做也可以）？

   答：两个都做。

2. V1 mock 数据规模是否按“每类 10 条、3 个月”执行？

   答：是。

3. 图片抓取是否允许第三方站点素材，还是仅允许官网素材？

   答：允许从第三方站点抓取素材，但优先从官网抓取素材。

4. 竞技场页面 V1 是否只展示预置结果（不接实时对战数据）？

   答：竞技场页面先只展示预置结果，后续会进行调整。
