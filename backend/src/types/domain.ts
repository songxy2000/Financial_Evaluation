export type ProductCategory =
  | "金融大模型"
  | "金融智能体"
  | "MCP"
  | "Skill"
  | "其他";

export type ProductStatus = "已评测" | "评测中" | "即将发布";
export type EvaluationSort = "overall" | "business" | "compliance" | "updated";

export interface EvaluationRecord {
  id: string;
  slug: string;
  name: string;
  organization: string;
  productLogoUrl?: string;
  organizationLogoUrl?: string;
  category: ProductCategory;
  subCategory: string;
  summary: string;
  status: ProductStatus;
  year: number;
  month: string;
  overallScore: number;
  businessScore: number;
  complianceScore: number;
  awardTags: string[];
  certificationLevel: string;
  scenarios: string[];
  highlights: string[];
  risks: string[];
  reportUpdatedAt: string;
  scoreBreakdown: Array<{
    dimensionCode: string;
    dimensionName: string;
    score: number;
    weight: number;
    comment: string;
    evidenceType: string[];
    group: "business" | "compliance";
  }>;
  personaFits: Array<{
    code: string;
    label: string;
    assessment: "适配较好" | "需要谨慎" | "不建议";
    note: string;
  }>;
  dataSource: "mock" | "official";
  importBatchId: string;
  revision: number;
}

export interface AwardItem {
  year: number;
  awardName: string;
  winner: string;
  organization: string;
  category: ProductCategory;
}

export interface ArenaGeneratedSet {
  category: ProductCategory;
  generatedAt: string;
  benchmark: string;
  prompt: string;
  questions: Array<{
    id: string;
    title: string;
    prompt: string;
    focus: string;
    riskDemand: 1 | 2 | 3;
    personaCodes: string[];
  }>;
  suitability: Array<{
    id: string;
    suitabilityRate: number;
    passCount: number;
    totalCount: number;
    conservativeMismatch: number;
  }>;
  items: Array<{
    id: string;
    overallScore: number;
    businessScore: number;
    complianceScore: number;
  }>;
}
