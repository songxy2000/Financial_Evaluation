import {
  type EvaluationFilterParams,
  type EvaluationProduct,
  type EvaluationSort,
  type ProductStatus,
} from "@/types/evaluation";

const evaluations: EvaluationProduct[] = [
  {
    id: "eva-001",
    slug: "antfinglm-wealth",
    name: "AntFinGLM 财富助手",
    organization: "蚂蚁集团",
    category: "金融大模型",
    subCategory: "财富管理",
    summary: "面向理财问答与客户适当性引导的金融大模型能力套件。",
    status: "已评测",
    year: 2026,
    overallScore: 91,
    businessScore: 92,
    complianceScore: 89,
    awardTags: ["年度最佳金融AI产品"],
    certificationLevel: "推荐认证",
    scenarios: ["财富管理问答", "投顾辅助", "风险揭示"],
    highlights: [
      "在复杂产品说明场景中具备稳定表达能力",
      "对保守型用户的风险提示完整度较高",
      "多轮追问下的逻辑一致性表现优秀",
    ],
    risks: ["高波动行情下策略解释仍偏模板化", "少量长文本响应存在冗余信息"],
    reportUpdatedAt: "2026-03-12",
    scoreBreakdown: [
      {
        dimensionCode: "BA-01",
        dimensionName: "场景适配度",
        score: 93,
        weight: 0.25,
        comment: "财富管理问答场景覆盖完整。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "BA-02",
        dimensionName: "业务准确率",
        score: 91,
        weight: 0.25,
        comment: "产品条款解释准确性较高。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "CR-01",
        dimensionName: "监管合规",
        score: 88,
        weight: 0.25,
        comment: "具备明确风险揭示语句，但个别用词可进一步规范。",
        evidenceType: ["材料核验", "专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-02",
        dimensionName: "模型可解释性",
        score: 90,
        weight: 0.2,
        comment: "结论来源说明较完整，可审计记录结构清晰。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "C-J-M",
        label: "保守型+初级+中等资产",
        assessment: "适配较好",
        note: "默认推荐以低风险资产配置与风险揭示为先。",
      },
      {
        code: "B-M-M",
        label: "平衡型+中级+中等资产",
        assessment: "适配较好",
        note: "能给出分层配置建议并说明波动区间。",
      },
      {
        code: "A-J-S",
        label: "激进型+初级+小额资产",
        assessment: "需要谨慎",
        note: "对新手激进画像会增加风险提示但执行建议仍偏积极。",
      },
    ],
  },
  {
    id: "eva-002",
    slug: "pingan-advisor-agent",
    name: "平安智能投顾",
    organization: "平安科技",
    category: "金融智能体",
    subCategory: "智能投顾",
    summary: "结合客户画像和市场信号的投顾智能体，支持问答与组合建议。",
    status: "已评测",
    year: 2026,
    overallScore: 88,
    businessScore: 90,
    complianceScore: 84,
    awardTags: ["最佳营销AI"],
    certificationLevel: "通过评测",
    scenarios: ["客户分层运营", "组合建议", "售后解释"],
    highlights: ["画像映射效率高", "营销转化场景表现突出", "策略说明结构化较好"],
    risks: ["激进策略边界提示偶有不足", "跨品类比较解释深度需增强"],
    reportUpdatedAt: "2026-03-08",
    scoreBreakdown: [
      {
        dimensionCode: "BA-01",
        dimensionName: "场景适配度",
        score: 92,
        weight: 0.25,
        comment: "客户分层运营场景表现突出。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "BA-03",
        dimensionName: "效率提升",
        score: 89,
        weight: 0.2,
        comment: "投顾话术生成效率明显提升。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "CR-03",
        dimensionName: "数据安全",
        score: 86,
        weight: 0.25,
        comment: "敏感字段脱敏策略完善，日志治理可继续强化。",
        evidenceType: ["材料核验"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-04",
        dimensionName: "风险控制",
        score: 82,
        weight: 0.15,
        comment: "高波动期的风险动作阈值仍需优化。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "B-J-M",
        label: "平衡型+初级+中等资产",
        assessment: "适配较好",
        note: "推荐逻辑易理解，能结合目标期限给出建议。",
      },
      {
        code: "A-M-L",
        label: "激进型+中级+大额资产",
        assessment: "适配较好",
        note: "策略结构完整，风险说明相对充分。",
      },
      {
        code: "C-J-S",
        label: "保守型+初级+小额资产",
        assessment: "需要谨慎",
        note: "仍会出现偏进取表达，需增强约束。",
      },
    ],
  },
  {
    id: "eva-003",
    slug: "longport-mcp",
    name: "LongPort MCP",
    organization: "长桥证券",
    category: "MCP",
    subCategory: "交易接入",
    summary: "面向策略助手与研究工具的证券数据/交易能力接入网关。",
    status: "已评测",
    year: 2026,
    overallScore: 85,
    businessScore: 84,
    complianceScore: 87,
    awardTags: ["最具创新AI"],
    certificationLevel: "通过评测",
    scenarios: ["投研数据调用", "策略执行辅助", "自动化任务编排"],
    highlights: ["接入文档规范", "接口稳定性较高", "权限控制颗粒度清晰"],
    risks: ["跨市场场景覆盖不足", "复杂权限链路配置门槛较高"],
    reportUpdatedAt: "2026-03-10",
    scoreBreakdown: [
      {
        dimensionCode: "BA-04",
        dimensionName: "集成便利性",
        score: 83,
        weight: 0.15,
        comment: "标准接入流程清晰，复杂业务仍需工程支持。",
        evidenceType: ["自动化测试", "材料核验"],
        group: "business",
      },
      {
        dimensionCode: "BA-05",
        dimensionName: "可扩展性",
        score: 86,
        weight: 0.15,
        comment: "多工具编排潜力较好。",
        evidenceType: ["专家评分"],
        group: "business",
      },
      {
        dimensionCode: "CR-03",
        dimensionName: "数据安全",
        score: 90,
        weight: 0.25,
        comment: "鉴权链路完整，审计日志规范。",
        evidenceType: ["材料核验"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-05",
        dimensionName: "合规文档",
        score: 86,
        weight: 0.15,
        comment: "关键文档齐全，部分场景说明可细化。",
        evidenceType: ["材料核验", "专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "B-S-M",
        label: "平衡型+高级+中等资产",
        assessment: "适配较好",
        note: "更适合机构专业人员使用。",
      },
      {
        code: "A-S-L",
        label: "激进型+高级+大额资产",
        assessment: "适配较好",
        note: "复杂策略链路支持较好。",
      },
      {
        code: "C-J-M",
        label: "保守型+初级+中等资产",
        assessment: "不建议",
        note: "产品定位偏专业，不适合初级用户直接使用。",
      },
    ],
  },
  {
    id: "eva-004",
    slug: "hithinkgpt-service",
    name: "问财 HithinkGPT 客服版",
    organization: "同花顺",
    category: "金融大模型",
    subCategory: "智能客服",
    summary: "面向券商与财富平台客服业务的智能问答与工单辅助系统。",
    status: "已评测",
    year: 2026,
    overallScore: 86,
    businessScore: 88,
    complianceScore: 83,
    awardTags: ["最佳客服AI"],
    certificationLevel: "通过评测",
    scenarios: ["客服应答", "业务办理指引", "工单摘要"],
    highlights: ["问题归类准确率高", "多轮问答连贯性较好", "工单摘要可读性强"],
    risks: ["极端投诉场景情绪处理策略需强化", "个别规则答复模板化明显"],
    reportUpdatedAt: "2026-03-05",
    scoreBreakdown: [
      {
        dimensionCode: "BA-02",
        dimensionName: "业务准确率",
        score: 89,
        weight: 0.25,
        comment: "客服问答准确率表现稳定。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "BA-03",
        dimensionName: "效率提升",
        score: 90,
        weight: 0.2,
        comment: "工单处理时长缩短明显。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "CR-01",
        dimensionName: "监管合规",
        score: 82,
        weight: 0.25,
        comment: "合规回答覆盖率较好，极端场景仍有提升空间。",
        evidenceType: ["材料核验", "专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-02",
        dimensionName: "模型可解释性",
        score: 84,
        weight: 0.2,
        comment: "回答依据可追溯能力中等偏上。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "C-J-S",
        label: "保守型+初级+小额资产",
        assessment: "适配较好",
        note: "基础业务问答和风险提示相对稳健。",
      },
      {
        code: "B-M-M",
        label: "平衡型+中级+中等资产",
        assessment: "适配较好",
        note: "信息完整性较好，流程指引清晰。",
      },
      {
        code: "A-J-L",
        label: "激进型+初级+大额资产",
        assessment: "需要谨慎",
        note: "复杂策略解释场景仍可能回答简化。",
      },
    ],
  },
  {
    id: "eva-007",
    slug: "pangu-finance",
    name: "盘古金融",
    organization: "华为",
    category: "金融大模型",
    subCategory: "综合金融问答",
    summary: "面向银行与证券场景的综合金融大模型，覆盖知识问答、流程指引与风险提示。",
    status: "已评测",
    year: 2026,
    overallScore: 89,
    businessScore: 90,
    complianceScore: 87,
    awardTags: [],
    certificationLevel: "推荐认证",
    scenarios: ["财富问答", "投研助手", "风控解释"],
    highlights: ["多业务线知识覆盖广", "跨任务一致性较好", "复杂语义理解表现稳定"],
    risks: ["极端行情下结论保守性略有波动", "个别场景答案长度偏长"],
    reportUpdatedAt: "2026-03-16",
    scoreBreakdown: [
      {
        dimensionCode: "BA-01",
        dimensionName: "场景适配度",
        score: 91,
        weight: 0.25,
        comment: "银行与券商多场景迁移能力良好。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "BA-02",
        dimensionName: "业务准确率",
        score: 89,
        weight: 0.25,
        comment: "核心金融术语与产品描述准确度高。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "CR-01",
        dimensionName: "监管合规",
        score: 86,
        weight: 0.25,
        comment: "风控语句覆盖良好，边缘场景可继续细化。",
        evidenceType: ["材料核验", "专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-03",
        dimensionName: "数据安全",
        score: 88,
        weight: 0.25,
        comment: "数据权限与访问控制策略清晰。",
        evidenceType: ["材料核验"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "C-M-M",
        label: "保守型+中级+中等资产",
        assessment: "适配较好",
        note: "默认策略以稳健配置为主，风险揭示较完整。",
      },
      {
        code: "B-S-M",
        label: "平衡型+高级+中等资产",
        assessment: "适配较好",
        note: "资产配置逻辑较清晰，解释层次完整。",
      },
      {
        code: "A-J-L",
        label: "激进型+初级+大额资产",
        assessment: "需要谨慎",
        note: "激进策略建议前需增加回撤提醒。",
      },
    ],
  },
  {
    id: "eva-008",
    slug: "chatglm-finance-series",
    name: "金融 ChatGLM 系列",
    organization: "清华 KEG / Zhipu",
    category: "金融大模型",
    subCategory: "知识推理",
    summary: "面向金融知识问答与研究辅助的系列化模型能力方案。",
    status: "已评测",
    year: 2026,
    overallScore: 87,
    businessScore: 88,
    complianceScore: 85,
    awardTags: [],
    certificationLevel: "通过评测",
    scenarios: ["金融知识问答", "投研摘要", "产品解读"],
    highlights: ["推理链条较清晰", "知识问答稳定性高", "训练与部署生态完善"],
    risks: ["特定监管新规更新时效需增强", "个别回答可解释性表达不够简练"],
    reportUpdatedAt: "2026-03-14",
    scoreBreakdown: [
      {
        dimensionCode: "BA-02",
        dimensionName: "业务准确率",
        score: 89,
        weight: 0.25,
        comment: "金融知识问答准确率表现优良。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "BA-05",
        dimensionName: "可扩展性",
        score: 87,
        weight: 0.15,
        comment: "可扩展到更多研究与咨询子场景。",
        evidenceType: ["专家评分"],
        group: "business",
      },
      {
        dimensionCode: "CR-02",
        dimensionName: "模型可解释性",
        score: 86,
        weight: 0.2,
        comment: "推理过程可追溯，解释完整性较高。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-05",
        dimensionName: "合规文档",
        score: 84,
        weight: 0.15,
        comment: "文档结构完整，专项审计细节可补充。",
        evidenceType: ["材料核验"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "B-J-M",
        label: "平衡型+初级+中等资产",
        assessment: "适配较好",
        note: "解释友好，建议较易理解。",
      },
      {
        code: "C-S-S",
        label: "保守型+高级+小额资产",
        assessment: "适配较好",
        note: "风险提示覆盖充分，回答较稳健。",
      },
      {
        code: "A-M-M",
        label: "激进型+中级+中等资产",
        assessment: "需要谨慎",
        note: "收益导向建议中需进一步强化边界提醒。",
      },
    ],
  },
  {
    id: "eva-009",
    slug: "yanxi-baixiao",
    name: "言犀百晓",
    organization: "京东数科",
    category: "金融大模型",
    subCategory: "运营服务",
    summary: "支持金融客服、运营支持与投教内容生成的一体化智能模型。",
    status: "已评测",
    year: 2026,
    overallScore: 84,
    businessScore: 86,
    complianceScore: 82,
    awardTags: [],
    certificationLevel: "通过评测",
    scenarios: ["智能客服", "投教内容生成", "运营触达"],
    highlights: ["运营场景响应速度快", "模板化内容生成效率高", "流程类问答覆盖完整"],
    risks: ["个别投资建议语气需更审慎", "复杂产品解释深度仍可提升"],
    reportUpdatedAt: "2026-03-09",
    scoreBreakdown: [
      {
        dimensionCode: "BA-03",
        dimensionName: "效率提升",
        score: 88,
        weight: 0.2,
        comment: "客服与运营场景处理效率提升明显。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "BA-01",
        dimensionName: "场景适配度",
        score: 85,
        weight: 0.25,
        comment: "客服与投教场景适配度良好。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "CR-01",
        dimensionName: "监管合规",
        score: 81,
        weight: 0.25,
        comment: "常规合规提示较完整，异常场景仍需加强。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-04",
        dimensionName: "风险控制",
        score: 83,
        weight: 0.15,
        comment: "风险边界识别较稳定，可继续提高保守型约束。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "C-J-S",
        label: "保守型+初级+小额资产",
        assessment: "需要谨慎",
        note: "部分营销话术需进一步降低风险暴露。",
      },
      {
        code: "B-M-L",
        label: "平衡型+中级+大额资产",
        assessment: "适配较好",
        note: "组合建议完整性与可读性较好。",
      },
      {
        code: "A-S-M",
        label: "激进型+高级+中等资产",
        assessment: "适配较好",
        note: "策略类问题回答速度和结构表现较好。",
      },
    ],
  },
  {
    id: "eva-010",
    slug: "tencent-finance-model",
    name: "腾讯金融大模型",
    organization: "腾讯 AI Lab",
    category: "金融大模型",
    subCategory: "综合智能",
    summary: "服务金融机构多业务线的模型底座，聚焦问答、分析与流程协同。",
    status: "已评测",
    year: 2026,
    overallScore: 88,
    businessScore: 89,
    complianceScore: 86,
    awardTags: [],
    certificationLevel: "推荐认证",
    scenarios: ["业务问答", "流程协同", "研究分析"],
    highlights: ["多任务稳定性较好", "跨场景迁移能力强", "结构化输出一致性高"],
    risks: ["复杂策略建议仍需增加适当性前置询问", "少数场景风险用语不够统一"],
    reportUpdatedAt: "2026-03-13",
    scoreBreakdown: [
      {
        dimensionCode: "BA-01",
        dimensionName: "场景适配度",
        score: 90,
        weight: 0.25,
        comment: "综合金融场景适配稳定。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "BA-03",
        dimensionName: "效率提升",
        score: 88,
        weight: 0.2,
        comment: "业务流程协同效率提升明显。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "CR-03",
        dimensionName: "数据安全",
        score: 87,
        weight: 0.25,
        comment: "权限控制与脱敏机制较完善。",
        evidenceType: ["材料核验"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-02",
        dimensionName: "模型可解释性",
        score: 85,
        weight: 0.2,
        comment: "解释链路清晰，追溯信息可继续细化。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "B-M-M",
        label: "平衡型+中级+中等资产",
        assessment: "适配较好",
        note: "建议结构与风险提醒较均衡。",
      },
      {
        code: "C-S-M",
        label: "保守型+高级+中等资产",
        assessment: "适配较好",
        note: "保守型约束清晰，风险暴露低。",
      },
      {
        code: "A-J-L",
        label: "激进型+初级+大额资产",
        assessment: "需要谨慎",
        note: "需加强对新手激进画像的行为约束。",
      },
    ],
  },
  {
    id: "eva-011",
    slug: "xuanyuan-finance-model",
    name: "轩辕大模型",
    organization: "度小满",
    category: "金融大模型",
    subCategory: "信贷与风控",
    summary: "聚焦信贷辅助与风控问答的金融垂直模型能力。",
    status: "已评测",
    year: 2026,
    overallScore: 83,
    businessScore: 82,
    complianceScore: 85,
    awardTags: [],
    certificationLevel: "通过评测",
    scenarios: ["信贷问答", "风险识别辅助", "合规审阅"],
    highlights: ["风控解释逻辑清晰", "信贷术语理解准确", "审阅类任务稳定"],
    risks: ["开放问答场景覆盖度一般", "复杂投资类问题表现波动"],
    reportUpdatedAt: "2026-03-11",
    scoreBreakdown: [
      {
        dimensionCode: "BA-02",
        dimensionName: "业务准确率",
        score: 83,
        weight: 0.25,
        comment: "信贷相关问答准确率较高。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "BA-04",
        dimensionName: "集成便利性",
        score: 81,
        weight: 0.15,
        comment: "接入成本中等，定制能力良好。",
        evidenceType: ["材料核验", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "CR-04",
        dimensionName: "风险控制",
        score: 86,
        weight: 0.15,
        comment: "风险边界控制稳定，异常识别较敏感。",
        evidenceType: ["专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-05",
        dimensionName: "合规文档",
        score: 84,
        weight: 0.15,
        comment: "资质与审阅材料完整度较好。",
        evidenceType: ["材料核验"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "C-M-L",
        label: "保守型+中级+大额资产",
        assessment: "适配较好",
        note: "保守型客户建议更稳健，风险提示明确。",
      },
      {
        code: "B-J-S",
        label: "平衡型+初级+小额资产",
        assessment: "适配较好",
        note: "建议可执行性较好，表达清晰。",
      },
      {
        code: "A-S-L",
        label: "激进型+高级+大额资产",
        assessment: "需要谨慎",
        note: "高风险策略建议中需增加更多限制条件。",
      },
    ],
  },
  {
    id: "eva-012",
    slug: "lightgpt-hundsun",
    name: "LightGPT",
    organization: "恒生电子",
    category: "金融大模型",
    subCategory: "机构中台智能",
    summary: "面向机构系统的智能中台能力，覆盖业务问答、运营协同与流程自动化。",
    status: "评测中",
    year: 2026,
    overallScore: 0,
    businessScore: 0,
    complianceScore: 0,
    awardTags: [],
    certificationLevel: "评测中",
    scenarios: ["机构中台问答", "流程自动化", "运营协同"],
    highlights: ["评测进行中，预期下月发布完整评分"],
    risks: ["当前为评测阶段，公开结论尚未发布"],
    reportUpdatedAt: "2026-03-18",
    scoreBreakdown: [],
    personaFits: [],
  },
  {
    id: "eva-013",
    slug: "tianji-risk-model",
    name: "天机认知风控大模型",
    organization: "网商银行",
    category: "金融大模型",
    subCategory: "风险控制",
    summary: "以风险识别、预警与合规辅助为核心能力的金融风控大模型。",
    status: "已评测",
    year: 2026,
    overallScore: 90,
    businessScore: 88,
    complianceScore: 93,
    awardTags: ["最佳风控AI"],
    certificationLevel: "推荐认证",
    scenarios: ["风险识别", "合规审查", "异常预警"],
    highlights: ["风险场景命中率高", "保守型适当性约束明确", "合规审查链路完整"],
    risks: ["跨营销场景迁移能力一般", "对非风控语义任务支持有限"],
    reportUpdatedAt: "2026-03-18",
    scoreBreakdown: [
      {
        dimensionCode: "BA-01",
        dimensionName: "场景适配度",
        score: 87,
        weight: 0.25,
        comment: "在风控主场景表现突出。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "business",
      },
      {
        dimensionCode: "BA-02",
        dimensionName: "业务准确率",
        score: 89,
        weight: 0.25,
        comment: "风险识别准确率表现优异。",
        evidenceType: ["自动化测试"],
        group: "business",
      },
      {
        dimensionCode: "CR-01",
        dimensionName: "监管合规",
        score: 94,
        weight: 0.25,
        comment: "规则命中与合规表达规范性高。",
        evidenceType: ["材料核验", "专家评分"],
        group: "compliance",
      },
      {
        dimensionCode: "CR-04",
        dimensionName: "风险控制",
        score: 92,
        weight: 0.15,
        comment: "风险边界控制能力强，错配率较低。",
        evidenceType: ["自动化测试", "专家评分"],
        group: "compliance",
      },
    ],
    personaFits: [
      {
        code: "C-J-M",
        label: "保守型+初级+中等资产",
        assessment: "适配较好",
        note: "低风险建议优先，错配控制表现优秀。",
      },
      {
        code: "B-M-M",
        label: "平衡型+中级+中等资产",
        assessment: "适配较好",
        note: "风险收益平衡建议较稳健。",
      },
      {
        code: "A-M-L",
        label: "激进型+中级+大额资产",
        assessment: "适配较好",
        note: "在激进策略下仍能保持合规边界提醒。",
      },
    ],
  },
  {
    id: "eva-005",
    slug: "windclaw-research",
    name: "WindClaw 研究助手",
    organization: "万得",
    category: "Skill",
    subCategory: "投研分析",
    summary: "聚焦投研场景的金融数据检索与结论摘要生成工具。",
    status: "评测中",
    year: 2026,
    overallScore: 0,
    businessScore: 0,
    complianceScore: 0,
    awardTags: [],
    certificationLevel: "评测中",
    scenarios: ["宏观研究", "行业比较", "事件跟踪"],
    highlights: ["评测进行中，预计本季度发布结果"],
    risks: ["评测进行中，结论尚未发布"],
    reportUpdatedAt: "2026-03-15",
    scoreBreakdown: [],
    personaFits: [],
  },
  {
    id: "eva-006",
    slug: "jingdong-skill-kb",
    name: "京小贝 金融运营助手",
    organization: "京东",
    category: "金融智能体",
    subCategory: "运营营销",
    summary: "针对金融活动运营与客户触达的自动化智能体。",
    status: "即将发布",
    year: 2026,
    overallScore: 0,
    businessScore: 0,
    complianceScore: 0,
    awardTags: [],
    certificationLevel: "待发布",
    scenarios: ["活动运营", "用户召回", "营销素材生成"],
    highlights: ["评测报告即将发布"],
    risks: ["结果未发布，暂不提供公开评分"],
    reportUpdatedAt: "2026-03-17",
    scoreBreakdown: [],
    personaFits: [],
  },
];

const rankingMonthOptions = [
  { value: "2026-03", label: "2026年3月" },
  { value: "2026-02", label: "2026年2月" },
  { value: "2026-01", label: "2026年1月" },
] as const;

interface RankingMonthSnapshot {
  includeIds?: string[];
  overrides: Record<
    string,
    Partial<Pick<EvaluationProduct, "overallScore" | "businessScore" | "complianceScore" | "reportUpdatedAt">> & {
      status?: ProductStatus;
    }
  >;
}

const rankingSnapshots: Record<string, RankingMonthSnapshot> = {
  "2026-02": {
    includeIds: [
      "eva-001",
      "eva-002",
      "eva-003",
      "eva-004",
      "eva-007",
      "eva-008",
      "eva-009",
      "eva-010",
      "eva-013",
    ],
    overrides: {
      "eva-001": { overallScore: 88, businessScore: 89, complianceScore: 86, reportUpdatedAt: "2026-02-28" },
      "eva-002": { overallScore: 84, businessScore: 86, complianceScore: 80, reportUpdatedAt: "2026-02-24" },
      "eva-003": { overallScore: 80, businessScore: 79, complianceScore: 83, reportUpdatedAt: "2026-02-22" },
      "eva-004": { overallScore: 82, businessScore: 84, complianceScore: 79, reportUpdatedAt: "2026-02-21" },
      "eva-007": { overallScore: 86, businessScore: 87, complianceScore: 84, reportUpdatedAt: "2026-02-27" },
      "eva-008": { overallScore: 83, businessScore: 84, complianceScore: 81, reportUpdatedAt: "2026-02-20" },
      "eva-009": { overallScore: 78, businessScore: 80, complianceScore: 76, reportUpdatedAt: "2026-02-19" },
      "eva-010": { overallScore: 85, businessScore: 86, complianceScore: 83, reportUpdatedAt: "2026-02-26" },
      "eva-013": { overallScore: 92, businessScore: 89, complianceScore: 95, reportUpdatedAt: "2026-02-25" },
    },
  },
  "2026-01": {
    includeIds: ["eva-001", "eva-002", "eva-004", "eva-007", "eva-008", "eva-010", "eva-013"],
    overrides: {
      "eva-001": { overallScore: 82, businessScore: 83, complianceScore: 80, reportUpdatedAt: "2026-01-28" },
      "eva-002": { overallScore: 79, businessScore: 81, complianceScore: 76, reportUpdatedAt: "2026-01-26" },
      "eva-004": { overallScore: 77, businessScore: 79, complianceScore: 74, reportUpdatedAt: "2026-01-24" },
      "eva-007": { overallScore: 88, businessScore: 89, complianceScore: 86, reportUpdatedAt: "2026-01-27" },
      "eva-008": { overallScore: 81, businessScore: 82, complianceScore: 79, reportUpdatedAt: "2026-01-22" },
      "eva-010": { overallScore: 80, businessScore: 81, complianceScore: 78, reportUpdatedAt: "2026-01-25" },
      "eva-013": { overallScore: 85, businessScore: 82, complianceScore: 90, reportUpdatedAt: "2026-01-27" },
    },
  },
};

function getDefaultRankingMonth() {
  return rankingMonthOptions[0].value;
}

export function normalizeRankingMonth(month?: string) {
  if (!month) return getDefaultRankingMonth();
  return rankingMonthOptions.some((item) => item.value === month) ? month : getDefaultRankingMonth();
}

function applyRankingMonthSnapshot(items: EvaluationProduct[], month?: string): EvaluationProduct[] {
  const normalizedMonth = normalizeRankingMonth(month);
  const snapshot = rankingSnapshots[normalizedMonth];
  if (!snapshot) return items;

  const scoped = snapshot.includeIds
    ? items.filter((item) => snapshot.includeIds?.includes(item.id))
    : items;

  return scoped.map((item) => {
    const override = snapshot.overrides[item.id];
    if (!override) return item;
    return {
      ...item,
      ...override,
    };
  });
}

function scoreValueBySort(item: EvaluationProduct, sort: EvaluationSort): number {
  if (sort === "business") return item.businessScore;
  if (sort === "compliance") return item.complianceScore;
  if (sort === "updated") return new Date(item.reportUpdatedAt).getTime();
  return item.overallScore;
}

export function sortEvaluationItems(
  items: EvaluationProduct[],
  sort: EvaluationSort = "overall",
): EvaluationProduct[] {
  return [...items].toSorted((a, b) => {
    const bValue = scoreValueBySort(b, sort);
    const aValue = scoreValueBySort(a, sort);
    return bValue - aValue;
  });
}

export function getEvaluations(filters?: EvaluationFilterParams): EvaluationProduct[] {
  const normalizedSort: EvaluationSort = filters?.sort ?? "overall";
  const keyword = filters?.q?.trim().toLowerCase();
  const monthAdjustedEvaluations = applyRankingMonthSnapshot(evaluations, filters?.month);

  const filtered = monthAdjustedEvaluations.filter((item) => {
    if (filters?.category && item.category !== filters.category) {
      return false;
    }

    if (filters?.status && filters.status !== "全部" && item.status !== filters.status) {
      return false;
    }

    if (filters?.award === "yes" && item.awardTags.length === 0) {
      return false;
    }

    if (filters?.scenario && filters.scenario !== "全部") {
      const matchScenario = item.scenarios.some((scenario) => scenario.includes(filters.scenario!));
      if (!matchScenario) {
        return false;
      }
    }

    if (keyword) {
      const text = `${item.name} ${item.organization} ${item.summary}`.toLowerCase();
      if (!text.includes(keyword)) {
        return false;
      }
    }

    return true;
  });

  return sortEvaluationItems(filtered, normalizedSort);
}

export function getEvaluationBySlug(slug: string): EvaluationProduct | undefined {
  return evaluations.find((item) => item.slug === slug);
}

export function getFeaturedEvaluations(limit = 4): EvaluationProduct[] {
  return getEvaluations({ sort: "overall", status: "已评测" }).slice(0, limit);
}

export function getAllScenarios(): string[] {
  const set = new Set<string>();
  evaluations.forEach((item) => {
    item.scenarios.forEach((scenario) => set.add(scenario));
  });
  return Array.from(set);
}

export function getAllCategories() {
  return ["金融大模型", "金融智能体", "MCP", "Skill", "其他"] as const;
}

export function getRankingMonthOptions() {
  return rankingMonthOptions;
}

export function getRankingMonthLabel(month?: string) {
  const normalized = normalizeRankingMonth(month);
  return rankingMonthOptions.find((item) => item.value === normalized)?.label ?? rankingMonthOptions[0].label;
}

export function getAllStatuses() {
  return ["全部", "已评测", "评测中", "即将发布"] as const;
}

export function getRawEvaluations(): EvaluationProduct[] {
  return evaluations;
}
