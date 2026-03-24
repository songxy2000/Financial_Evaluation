# 金融AI评测平台详细设计（前后端对接版）

## 1. 文档目标

本文档基于当前前端原型（Next.js App Router + TypeScript + 本地 mock 数据）整理，目标是为后端提供可直接落地的接口与数据契约说明，确保后端上线后可与现有前端无缝对接。

适用范围：
- 评测榜单与评测详情
- 奖项认证
- 评测竞技场（含匿名对战结果回写榜单）
- 报名参评
- 首页焦点榜单与全局基础信息

不包含：
- 用户登录/权限系统（当前前端未实现）
- 支付、后台管理、CMS、运营配置台

---

## 2. 当前前端实现概览

### 2.1 技术栈
- 框架：Next.js 16（App Router）
- 语言：TypeScript
- 样式：CSS Modules + 全局样式变量
- 数据源：本地 mock（`data/*.ts`）
- 状态与缓存：
  - 页面参数：URL query
  - 竞技场结果：当前使用 `localStorage`（键：`fin-ai-arena-results-v1`）

### 2.2 路由结构
- `/` 首页
- `/arena` 评测竞技场
- `/evaluations` 评测榜单
- `/evaluations/[slug]` 评测详情
- `/awards` 奖项认证
- `/apply` 报名参评
- `/about` 关于我们
- `not-found` 404 页面

### 2.3 默认业务规则（已在前端生效）
- 榜单默认类别：`金融大模型`
- 榜单仅在同类别内比较，不跨类别混排
- 榜单支持月份快照切换（当前 mock：`2026-03 / 2026-02 / 2026-01`）
- 当月份为“当前月（2026-03）”时，允许被竞技场结果覆盖

---

## 3. 核心领域模型（后端需对齐）

## 3.1 枚举类型

### ProductCategory
- `金融大模型`
- `金融智能体`
- `MCP`
- `Skill`
- `其他`

### ProductStatus
- `已评测`
- `评测中`
- `即将发布`

### EvaluationSort
- `overall`（综合分）
- `business`（业务能力分）
- `compliance`（合规分）
- `updated`（按更新时间）

### PersonaAssessment
- `适配较好`
- `需要谨慎`
- `不建议`

---

## 3.2 评测产品模型 `EvaluationProduct`

```ts
interface EvaluationProduct {
  id: string;
  slug: string;
  name: string;
  organization: string;
  productLogoUrl?: string;    // 可选：产品 logo
  organizationLogoUrl?: string; // 可选：机构 logo（产品 logo 缺失时回退）
  logoCandidates?: string[];  // 可选：前端按顺序兜底尝试
  brandSite?: string;         // 可选：机构官网，用于跳转或兜底图标
  category: ProductCategory;
  subCategory: string;
  summary: string;
  status: ProductStatus;
  year: number;
  overallScore: number;       // 0~100，整数
  businessScore: number;      // 0~100，整数
  complianceScore: number;    // 0~100，整数
  awardTags: string[];
  certificationLevel: string; // 如：通过评测、推荐认证
  scenarios: string[];
  highlights: string[];
  risks: string[];
  reportUpdatedAt: string;    // YYYY-MM-DD
  scoreBreakdown: ScoreBreakdown[];
  personaFits: PersonaFit[];
}
```

字段补充说明：
- 当前前端已支持“产品 logo 不可用时回退机构 logo，再回退字母占位”的展示策略。
- 后端若可直接提供 `productLogoUrl / organizationLogoUrl / logoCandidates`，可减少前端维护机构映射表成本。

### ScoreBreakdown
```ts
interface ScoreBreakdown {
  dimensionCode: string;
  dimensionName: string;
  score: number;
  weight: number;
  comment: string;
  evidenceType: string[];
  group: "business" | "compliance";
}
```

### PersonaFit
```ts
interface PersonaFit {
  code: string;
  label: string;
  assessment: "适配较好" | "需要谨慎" | "不建议";
  note: string;
}
```

---

## 3.3 奖项模型 `AwardItem`

```ts
interface AwardItem {
  year: number;
  awardName: string;
  winner: string;
  organization: string;
  category: ProductCategory;
}
```

---

## 3.4 竞技场模型

```ts
interface ArenaQuestion {
  id: string;
  title: string;
  prompt: string;
  focus: string;
  riskDemand: 1 | 2 | 3;
  personaCodes: string[];
}

interface ArenaSuitabilitySummary {
  id: string;                 // productId
  suitabilityRate: number;    // 0~100
  passCount: number;
  totalCount: number;
  conservativeMismatch: number;
}

interface ArenaScoreOverride {
  id: string;                 // productId
  overallScore: number;
  businessScore: number;
  complianceScore: number;
}

interface ArenaGeneratedSet {
  category: ProductCategory;
  generatedAt: string;        // ISO datetime
  benchmark: string;          // 文案型基准任务名称
  prompt: string;
  questions: ArenaQuestion[];
  suitability: ArenaSuitabilitySummary[];
  items: ArenaScoreOverride[]; // 排序后结果
}
```

---

## 3.5 报名表单模型 `ApplicationFormInput`

```ts
interface ApplicationFormInput {
  companyName: string;
  productName: string;
  productCategory: string;
  coreScenario: string;
  intro: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  attachments: string;
  agreementAccepted: boolean;
}
```

---

## 4. 页面与接口对接需求

## 4.1 首页 `/`

### 前端使用数据
- 焦点榜单 Top3：来自评测榜单数据，条件固定为：
  - `category=金融大模型`
  - `month=当前默认月`
  - `status=已评测`
  - `sort=overall`
- 评测对象类别：取分类集合（用于 chips）

### 建议接口
- `GET /api/v1/evaluations?category=金融大模型&month=2026-03&status=已评测&sort=overall&limit=3`
- `GET /api/v1/evaluations/meta/categories`

---

## 4.2 评测榜单 `/evaluations`

### Query 参数（前端已使用）
- `category`: `金融大模型 | 金融智能体 | MCP | Skill | 其他`
- `month`: `YYYY-MM`（当前支持 2026-03/02/01）
- `sort`: `overall | business | compliance | updated`（当前页面默认 overall）
- 预留参数（类型已定义，前端未来可能恢复）：`scenario`, `status`, `award`, `q`

### 页面行为
- “本期排行”右上有两个下拉：
  - 类别下拉（切换同类排名）
  - 月份下拉（切换历史快照）
- 排名卡展示：No.X、产品、机构、业务能力、合规安全、状态、综合分
- 数据为空时显示“暂无匹配结果”

### 建议接口
- `GET /api/v1/evaluations`

#### 请求示例
```http
GET /api/v1/evaluations?category=金融大模型&month=2026-03&sort=overall
```

#### 返回示例
```json
{
  "items": [
    {
      "id": "eva-001",
      "slug": "antfinglm-wealth",
      "name": "AntFinGLM 财富助手",
      "organization": "蚂蚁集团",
      "productLogoUrl": "https://cdn.example.com/logo/antfinglm.png",
      "organizationLogoUrl": "https://cdn.example.com/logo/antgroup.png",
      "category": "金融大模型",
      "status": "已评测",
      "overallScore": 91,
      "businessScore": 92,
      "complianceScore": 89,
      "reportUpdatedAt": "2026-03-12",
      "awardTags": ["年度最佳金融AI产品"],
      "certificationLevel": "推荐认证"
    }
  ],
  "paging": {
    "page": 1,
    "pageSize": 20,
    "total": 9
  },
  "meta": {
    "month": "2026-03",
    "monthLabel": "2026年3月",
    "categories": ["金融大模型", "金融智能体", "MCP", "Skill", "其他"],
    "rankingMonths": [
      { "value": "2026-03", "label": "2026年3月" },
      { "value": "2026-02", "label": "2026年2月" },
      { "value": "2026-01", "label": "2026年1月" }
    ]
  }
}
```

### 竞技场覆盖规则（当前前端行为）
- 当 `month=当前月` 时，前端会尝试叠加竞技场结果（按 `id` 覆盖三项分数）
- 建议后端化后改为：
  - `GET /api/v1/evaluations?category=...&month=...&source=arena|official`
  - 或在返回中附 `effectiveSource` 字段

---

## 4.3 评测详情 `/evaluations/[slug]`

### 页面行为
- 根据 `slug` 查询详情
- 不存在时返回 404 页面
- 展示信息：
  - 基本信息（名称、机构、分类、摘要、状态、认证、奖项）
  - 分数（综合/业务/合规）
  - 核心亮点与风险提醒
  - 业务与合规分项明细
  - 用户画像适配结果
  - 适用场景

### 建议接口
- `GET /api/v1/evaluations/{slug}`

#### 404 行为
- 返回 `404 + code=EVALUATION_NOT_FOUND`

---

## 4.4 奖项认证 `/awards`

### 页面行为
- 读取年度列表后默认取最新年份数据
- 前三名独立展示，剩余作为“年度专项荣誉”展示

### 建议接口
- `GET /api/v1/awards/years`
- `GET /api/v1/awards?year=2026`

### 注意事项（当前前端存在文案与数据差异）
- 页面标题文案当前固定为“2025 年度获奖名单”
- 数据源仍按 `currentYear`（最新年份）读取
- 建议后端对接时同时返回 `displayYearLabel`，前端统一使用服务端年份文案

---

## 4.5 报名参评 `/apply`

### 前端校验规则（必须与后端一致）
- 必填：
  - `companyName`
  - `productName`
  - `productCategory`
  - `coreScenario`
  - `intro`
  - `contactName`
  - `contactTitle`
  - `contactPhone`（正则：`^1\d{10}$`）
  - `contactEmail`（基础邮箱格式）
  - `agreementAccepted=true`

### 建议接口
- `POST /api/v1/applications`

#### 请求示例
```json
{
  "companyName": "某科技公司",
  "productName": "某金融AI产品",
  "productCategory": "金融大模型",
  "coreScenario": "智能客服",
  "intro": "产品简介...",
  "contactName": "张三",
  "contactTitle": "产品经理",
  "contactPhone": "13800138000",
  "contactEmail": "pm@example.com",
  "attachments": "https://xxx.com/material",
  "agreementAccepted": true
}
```

#### 成功返回建议
```json
{
  "id": "app_202603230001",
  "status": "SUBMITTED",
  "submittedAt": "2026-03-23T09:30:00+08:00"
}
```

---

## 4.6 评测竞技场 `/arena`

### 交互目标
- 生成题目并绑定用户画像
- 匿名模型 A/B 对战 + 投票
- 计算适当性指标与分数，生成结果
- 将结果应用到评测榜单（当前基于本地存储）

### 前端参数
- `category`：产品类别
- `benchmark`：`invest-advice | service-compliance | risk-control`
- `rounds`：4~20

### 核心输出
- `ArenaGeneratedSet`
  - 包含题目列表、适当性统计、产品分数覆盖数据

### 建议后端接口（推荐）
- `POST /api/v1/arena/generate`
  - 输入：`category, benchmark, rounds, mode(direct|duel), duelVotes/questions(optional)`
  - 输出：`ArenaGeneratedSet`
- `GET /api/v1/arena/results?category=金融大模型`
  - 获取最新一轮竞技场结果

### 适当性判定规则（来自前端逻辑，可服务端化）
- 风险等级映射：
  - C：仅允许风险 1
  - B：允许风险 1~2
  - A：允许风险 2~3
- 重点检查：
  - `conservativeMismatch`（保守型错配次数）
- 通过率：
  - `suitabilityRate = passCount / totalCount * 100`

---

## 4.7 关于我们 `/about`

该页面目前为静态信息页，后端可暂不提供接口。若后续运营化，建议预留：
- `GET /api/v1/site/about`

---

## 5. 查询参数与后端过滤排序规范

统一支持以下参数（与前端类型保持一致）：

- `category`：产品类别
- `month`：月份快照，格式 `YYYY-MM`
- `status`：`已评测 | 评测中 | 即将发布 | 全部`
- `award`：`all | yes`
- `scenario`：业务场景关键字
- `q`：关键字（产品名/机构名/摘要）
- `sort`：`overall | business | compliance | updated`
- `page` / `pageSize`

排序规则：
- `overall`：按 `overallScore` 降序
- `business`：按 `businessScore` 降序
- `compliance`：按 `complianceScore` 降序
- `updated`：按 `reportUpdatedAt` 降序

---

## 6. 错误码建议

- `EVALUATION_NOT_FOUND`：详情不存在（404）
- `INVALID_QUERY`：筛选参数非法（400）
- `INVALID_APPLICATION`：报名参数校验失败（400）
- `ARENA_BASE_ITEMS_NOT_ENOUGH`：竞技场样本不足（400）
- `ARENA_DUEL_NOT_FINISHED`：匿名对战未完成不可结算（400）
- `INTERNAL_ERROR`：系统异常（500）

统一返回建议：
```json
{
  "code": "INVALID_QUERY",
  "message": "month 参数非法",
  "requestId": "req_xxx"
}
```

---

## 7. 时区与时间规范

- 展示时区：`Asia/Shanghai`
- `updatedAt` 页面展示格式：`YYYY年M月D日 HH:mm:ss`
- API 传输建议统一 ISO8601（带时区），前端负责格式化展示

### 7.1 字段与展示文案映射（建议固定）
- `complianceScore`：前端展示文案为“合规安全”
- `businessScore`：前端展示文案为“业务能力”
- 排名序号：前端展示为 `No.1 / No.2 / No.3`（非 `#1`）

---

## 8. 对接实施建议（后端开发顺序）

1. 先实现评测榜单与详情接口（`/evaluations`, `/evaluations/{slug}`）
2. 实现奖项接口（`/awards`）
3. 实现报名提交接口（`/applications`）
4. 实现竞技场结果接口（`/arena/*`）
5. 前端移除 `localStorage` 覆盖逻辑，改为读取后端竞技场结果

---

## 9. 联调验收清单

- 榜单页：
  - 类别与月份切换后 URL 参数正确
  - 同类别内排序正确
  - 空数据场景渲染正常
- 详情页：
  - 有效 slug 可访问
  - 无效 slug 返回 404
- 奖项页：
  - 年份与名单一致
- 报名页：
  - 前后端校验一致
  - 提交成功态可展示
- 竞技场：
  - 生成结果可回写榜单
  - 适当性统计字段完整

---

## 10. 当前前端文件映射（便于后端联调定位）

- 榜单页入口：`app/evaluations/page.tsx`
- 榜单展示组件：`components/evaluation/EvaluationStatistics.tsx`
- 详情页：`app/evaluations/[slug]/page.tsx`
- 奖项页：`app/awards/page.tsx`
- 竞技场页：`app/arena/page.tsx`
- 报名页：`app/apply/page.tsx` + `components/forms/ApplicationForm.tsx`
- 类型定义：`types/evaluation.ts`, `types/arena.ts`, `types/application.ts`
- mock 数据：`data/evaluations.ts`, `data/awards.ts`, `data/personas.ts`, `data/arenaStorage.ts`
