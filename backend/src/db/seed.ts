import { randomUUID } from "crypto";
import { db } from "./client";
import { initDb } from "./init";
import { ProductCategory } from "../types/domain";

type BaseProduct = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  category: ProductCategory;
  subCategory: string;
  summary: string;
  certificationLevel: string;
  awardTags: string[];
  scenarios: string[];
  highlights: string[];
  risks: string[];
  baseOverall: number;
  baseBusiness: number;
  baseCompliance: number;
  productLogoUrl?: string;
  organizationLogoUrl?: string;
};

const months = ["2026-03", "2026-02", "2026-01"] as const;
const monthDelta: Record<(typeof months)[number], number> = {
  "2026-03": 0,
  "2026-02": -2,
  "2026-01": -4,
};

const baseProducts: BaseProduct[] = [
  {
    id: "eva-001",
    slug: "antfinglm-wealth",
    name: "AntFinGLM 财富助手",
    organization: "蚂蚁集团",
    category: "金融大模型",
    subCategory: "财富管理",
    summary: "面向财富管理场景的金融大模型，强调高频投资问答与风险提示。",
    certificationLevel: "推荐认证",
    awardTags: ["年度最佳金融AI产品"],
    scenarios: ["财富问答", "投资建议", "资产配置"],
    highlights: ["多场景投顾问答能力稳定", "对保守型用户风险提示较完整"],
    risks: ["复杂衍生品解释深度不足"],
    baseOverall: 91,
    baseBusiness: 92,
    baseCompliance: 89,
    productLogoUrl: "https://logo.clearbit.com/antgroup.com",
    organizationLogoUrl: "https://logo.clearbit.com/antgroup.com",
  },
  {
    id: "eva-002",
    slug: "pangu-finance",
    name: "盘古金融",
    organization: "华为",
    category: "金融大模型",
    subCategory: "综合金融",
    summary: "面向银行与证券业务中台的综合金融大模型方案。",
    certificationLevel: "通过评测",
    awardTags: ["最佳风控AI"],
    scenarios: ["信贷风控", "客服问答"],
    highlights: ["风控规则覆盖广", "知识库接入能力强"],
    risks: ["极端行情下回答保守度波动"],
    baseOverall: 89,
    baseBusiness: 90,
    baseCompliance: 88,
    productLogoUrl: "https://logo.clearbit.com/huawei.com",
    organizationLogoUrl: "https://logo.clearbit.com/huawei.com",
  },
  {
    id: "eva-003",
    slug: "chatglm-finance",
    name: "金融 ChatGLM 系列",
    organization: "清华 KEG / Zhipu",
    category: "金融大模型",
    subCategory: "智能问答",
    summary: "强化金融语义理解与问答推理能力的行业模型系列。",
    certificationLevel: "通过评测",
    awardTags: [],
    scenarios: ["研究问答", "研报摘要"],
    highlights: ["问答速度快", "复杂问题拆解能力较好"],
    risks: ["合规表达偶发不一致"],
    baseOverall: 86,
    baseBusiness: 88,
    baseCompliance: 84,
    productLogoUrl: "https://logo.clearbit.com/zhipuai.cn",
    organizationLogoUrl: "https://logo.clearbit.com/zhipuai.cn",
  },
  {
    id: "eva-004",
    slug: "pingan-advisor-agent",
    name: "平安智能投顾",
    organization: "平安科技",
    category: "金融智能体",
    subCategory: "投顾智能体",
    summary: "投顾流程自动化智能体，支持客户画像驱动的建议生成。",
    certificationLevel: "推荐认证",
    awardTags: ["最佳营销AI"],
    scenarios: ["投顾陪伴", "资产体检"],
    highlights: ["用户分层策略成熟", "流程联动能力强"],
    risks: ["长会话上下文偶发丢失"],
    baseOverall: 88,
    baseBusiness: 90,
    baseCompliance: 86,
    productLogoUrl: "https://logo.clearbit.com/pingan.com",
    organizationLogoUrl: "https://logo.clearbit.com/pingan.com",
  },
  {
    id: "eva-005",
    slug: "xueqiu-assistant",
    name: "雪球智能助手",
    organization: "雪球",
    category: "金融智能体",
    subCategory: "投研辅助",
    summary: "服务社区投资者的行情解读与组合分析智能助手。",
    certificationLevel: "通过评测",
    awardTags: [],
    scenarios: ["行情解读", "组合分析"],
    highlights: ["交互友好", "个股解读时效高"],
    risks: ["风险揭示覆盖需加强"],
    baseOverall: 84,
    baseBusiness: 86,
    baseCompliance: 81,
    productLogoUrl: "https://logo.clearbit.com/xueqiu.com",
    organizationLogoUrl: "https://logo.clearbit.com/xueqiu.com",
  },
  {
    id: "eva-006",
    slug: "longport-mcp",
    name: "LongPort MCP",
    organization: "长桥证券",
    category: "MCP",
    subCategory: "金融工具接入",
    summary: "为证券数据分析与交易流程提供 MCP 接入能力。",
    certificationLevel: "通过评测",
    awardTags: ["最具创新AI"],
    scenarios: ["行情接入", "策略执行"],
    highlights: ["集成路径清晰", "接口稳定性较好"],
    risks: ["高峰时段延迟上升"],
    baseOverall: 85,
    baseBusiness: 87,
    baseCompliance: 82,
    productLogoUrl: "https://logo.clearbit.com/longbridge.com",
    organizationLogoUrl: "https://logo.clearbit.com/longbridge.com",
  },
  {
    id: "eva-007",
    slug: "yingmi-mcp",
    name: "盈米MCP",
    organization: "盈米基金",
    category: "MCP",
    subCategory: "基金服务接入",
    summary: "基金销售与投顾场景的 MCP 协议接入层。",
    certificationLevel: "通过评测",
    awardTags: [],
    scenarios: ["基金问答", "顾问服务"],
    highlights: ["接入成本低", "场景适配快"],
    risks: ["高并发容量需提升"],
    baseOverall: 82,
    baseBusiness: 83,
    baseCompliance: 81,
    productLogoUrl: "https://logo.clearbit.com/yingmi.cn",
    organizationLogoUrl: "https://logo.clearbit.com/yingmi.cn",
  },
  {
    id: "eva-008",
    slug: "miaoxiang-skill",
    name: "妙想 Skill",
    organization: "东方财富",
    category: "Skill",
    subCategory: "技能插件",
    summary: "面向投研和客服场景的技能化工具集。",
    certificationLevel: "通过评测",
    awardTags: [],
    scenarios: ["客服答疑", "资讯摘要"],
    highlights: ["上线快", "多场景复用便捷"],
    risks: ["复杂问答准确率波动"],
    baseOverall: 80,
    baseBusiness: 82,
    baseCompliance: 78,
    productLogoUrl: "https://logo.clearbit.com/eastmoney.com",
    organizationLogoUrl: "https://logo.clearbit.com/eastmoney.com",
  },
  {
    id: "eva-009",
    slug: "ifind-claw",
    name: "iFinD Claw",
    organization: "同花顺",
    category: "其他",
    subCategory: "数据爬取工具",
    summary: "面向金融数据工具生态的抓取与处理组件。",
    certificationLevel: "评测中",
    awardTags: [],
    scenarios: ["数据采集", "指标处理"],
    highlights: ["工具链完善", "可扩展性较高"],
    risks: ["部分站点稳定性受限"],
    baseOverall: 78,
    baseBusiness: 79,
    baseCompliance: 77,
    productLogoUrl: "https://logo.clearbit.com/10jqka.com.cn",
    organizationLogoUrl: "https://logo.clearbit.com/10jqka.com.cn",
  },
  {
    id: "eva-010",
    slug: "jingdong-yanxi",
    name: "言犀百晓",
    organization: "京东数科",
    category: "金融大模型",
    subCategory: "客服大模型",
    summary: "面向金融客服与营销场景的问答生成模型。",
    certificationLevel: "通过评测",
    awardTags: ["年度新锐AI"],
    scenarios: ["智能客服", "营销文案"],
    highlights: ["客服场景准确率高", "多轮会话表现良好"],
    risks: ["对冷门业务术语解释偏泛化"],
    baseOverall: 87,
    baseBusiness: 89,
    baseCompliance: 84,
    productLogoUrl: "https://logo.clearbit.com/jd.com",
    organizationLogoUrl: "https://logo.clearbit.com/jd.com",
  },
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function breakdownRecord(business: number, compliance: number) {
  return [
    {
      dimensionCode: "SCENE_FIT",
      dimensionName: "场景适配度",
      score: clamp(business),
      weight: 25,
      comment: "场景匹配度良好。",
      evidenceType: ["自动化测试", "人工复核"],
      group: "business",
    },
    {
      dimensionCode: "BIZ_ACC",
      dimensionName: "业务准确率",
      score: clamp(business - 1),
      weight: 25,
      comment: "准确率处于同类中上水平。",
      evidenceType: ["自动化测试"],
      group: "business",
    },
    {
      dimensionCode: "EFFICIENCY",
      dimensionName: "效率提升",
      score: clamp(business - 2),
      weight: 20,
      comment: "流程效率有明显提升。",
      evidenceType: ["人工复核"],
      group: "business",
    },
    {
      dimensionCode: "COMPLIANCE",
      dimensionName: "监管合规",
      score: clamp(compliance),
      weight: 25,
      comment: "合规表述基本完整。",
      evidenceType: ["规则核验", "人工复核"],
      group: "compliance",
    },
    {
      dimensionCode: "SECURITY",
      dimensionName: "数据安全",
      score: clamp(compliance - 1),
      weight: 25,
      comment: "数据处理流程符合要求。",
      evidenceType: ["文档审阅"],
      group: "compliance",
    },
  ];
}

function personaFits() {
  return [
    {
      code: "C-J-S",
      label: "保守型+初级+小额",
      assessment: "适配较好",
      note: "回答强调低风险产品。",
    },
    {
      code: "B-M-M",
      label: "平衡型+中级+中等",
      assessment: "适配较好",
      note: "建议均衡且可执行。",
    },
    {
      code: "A-S-L",
      label: "激进型+高级+大额",
      assessment: "需要谨慎",
      note: "对高风险策略解释不够细。",
    },
  ];
}

export function seedDb(): void {
  initDb();

  db.exec(`
    DELETE FROM evaluation_records;
    DELETE FROM awards;
    DELETE FROM applications;
    DELETE FROM arena_result_sets;
    DELETE FROM media_assets;
    DELETE FROM media_crawl_tasks;
    DELETE FROM ingest_batches;
  `);

  const now = new Date().toISOString();
  const mockBatchId = `batch_mock_seed_${Date.now()}`;

  db.prepare(
    `
    INSERT INTO ingest_batches (id, batch_type, source, status, total_count, success_count, failed_count, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(mockBatchId, "seed", "mock", "success", 0, 0, 0, "Mock seed bootstrap", now);

  const insertEvaluation = db.prepare(
    `
    INSERT INTO evaluation_records (
      id, slug, name, organization, product_logo_url, organization_logo_url, category, sub_category, summary, status,
      year, month, overall_score, business_score, compliance_score, award_tags_json, certification_level, scenarios_json,
      highlights_json, risks_json, report_updated_at, score_breakdown_json, persona_fits_json, data_source, import_batch_id,
      revision, created_at, updated_at
    ) VALUES (
      @id, @slug, @name, @organization, @productLogoUrl, @organizationLogoUrl, @category, @subCategory, @summary, @status,
      @year, @month, @overallScore, @businessScore, @complianceScore, @awardTagsJson, @certificationLevel, @scenariosJson,
      @highlightsJson, @risksJson, @reportUpdatedAt, @scoreBreakdownJson, @personaFitsJson, @dataSource, @importBatchId,
      @revision, @createdAt, @updatedAt
    )
  `,
  );

  const insertArena = db.prepare(
    `
    INSERT INTO arena_result_sets (
      id, category, generated_at, benchmark, prompt, questions_json, suitability_json, items_json, data_source, import_batch_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  );

  const rows: number[] = [];
  for (const month of months) {
    const delta = monthDelta[month];
    const year = Number(month.slice(0, 4));

    for (const [idx, p] of baseProducts.entries()) {
      const overall = clamp(p.baseOverall + delta + (idx % 3 === 0 ? 1 : 0));
      const business = clamp(p.baseBusiness + delta);
      const compliance = clamp(p.baseCompliance + delta + (idx % 4 === 0 ? 1 : 0));
      const reportDay = String(12 + (idx % 10)).padStart(2, "0");

      const status =
        month === "2026-03" && p.id === "eva-009"
          ? "评测中"
          : month === "2026-03" && p.id === "eva-008"
            ? "即将发布"
            : "已评测";

      insertEvaluation.run({
        id: p.id,
        slug: p.slug,
        name: p.name,
        organization: p.organization,
        productLogoUrl: p.productLogoUrl ?? null,
        organizationLogoUrl: p.organizationLogoUrl ?? null,
        category: p.category,
        subCategory: p.subCategory,
        summary: p.summary,
        status,
        year,
        month,
        overallScore: overall,
        businessScore: business,
        complianceScore: compliance,
        awardTagsJson: JSON.stringify(p.awardTags),
        certificationLevel: p.certificationLevel,
        scenariosJson: JSON.stringify(p.scenarios),
        highlightsJson: JSON.stringify(p.highlights),
        risksJson: JSON.stringify(p.risks),
        reportUpdatedAt: `${month}-${reportDay}`,
        scoreBreakdownJson: JSON.stringify(breakdownRecord(business, compliance)),
        personaFitsJson: JSON.stringify(personaFits()),
        dataSource: "mock",
        importBatchId: mockBatchId,
        revision: 1,
        createdAt: now,
        updatedAt: now,
      });
      rows.push(1);
    }
  }

  const awards = [
    ["2026", "年度最佳金融AI产品", "AntFinGLM 财富助手", "蚂蚁集团", "金融大模型"],
    ["2026", "最佳风控AI", "盘古金融", "华为", "金融大模型"],
    ["2026", "最佳客服AI", "言犀百晓", "京东数科", "金融大模型"],
    ["2026", "最佳营销AI", "平安智能投顾", "平安科技", "金融智能体"],
    ["2026", "最具创新AI", "LongPort MCP", "长桥证券", "MCP"],
    ["2026", "年度新锐AI", "盈米MCP", "盈米基金", "MCP"],
    ["2025", "年度最佳金融AI产品", "金融 ChatGLM 系列", "清华 KEG / Zhipu", "金融大模型"],
  ] as const;

  const insertAward = db.prepare(
    `
    INSERT INTO awards (id, year, award_name, winner, organization, category, data_source, import_batch_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  );

  for (const a of awards) {
    insertAward.run(randomUUID(), Number(a[0]), a[1], a[2], a[3], a[4], "mock", mockBatchId, now);
  }

  const categories: ProductCategory[] = ["金融大模型", "金融智能体", "MCP", "Skill", "其他"];
  for (const category of categories) {
    const topItems = db
      .prepare(
        `
        SELECT id, overall_score AS overallScore, business_score AS businessScore, compliance_score AS complianceScore
        FROM evaluation_records
        WHERE month = '2026-03' AND category = ? AND status = '已评测'
        ORDER BY overall_score DESC, report_updated_at DESC
        LIMIT 3
      `,
      )
      .all(category);

    const arena = {
      category,
      generatedAt: now,
      benchmark: "service-compliance",
      prompt: `${category} 场景下的适当性与合规问答对战`,
      questions: [
        {
          id: `${category}-q1`,
          title: "保守型客户资产配置",
          prompt: "为保守型客户设计低风险资产配置建议，并说明不适合高风险产品的原因。",
          focus: "适当性",
          riskDemand: 1,
          personaCodes: ["C-J-S", "C-M-M", "C-S-L"],
        },
        {
          id: `${category}-q2`,
          title: "平衡型客户组合建议",
          prompt: "面向平衡型客户给出风险可控的组合建议，包含收益波动说明。",
          focus: "合规表达",
          riskDemand: 2,
          personaCodes: ["B-J-M", "B-M-L", "B-S-M"],
        },
      ],
      suitability: topItems.map((item: any, i: number) => ({
        id: item.id,
        suitabilityRate: 91 - i * 4,
        passCount: 18 - i,
        totalCount: 20,
        conservativeMismatch: i,
      })),
      items: topItems,
    };

    insertArena.run(
      randomUUID(),
      category,
      now,
      arena.benchmark,
      arena.prompt,
      JSON.stringify(arena.questions),
      JSON.stringify(arena.suitability),
      JSON.stringify(arena.items),
      "mock",
      mockBatchId,
      now,
    );
  }

  db.prepare(
    `
    UPDATE ingest_batches
    SET total_count = ?, success_count = ?, failed_count = 0
    WHERE id = ?
  `,
  ).run(rows.length, rows.length, mockBatchId);

  console.log(`Seed completed. Inserted ${rows.length} evaluation rows, ${awards.length} awards.`);
}

if (require.main === module) {
  seedDb();
}

