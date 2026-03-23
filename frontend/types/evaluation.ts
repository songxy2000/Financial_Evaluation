export type ProductCategory =
  | "金融大模型"
  | "金融智能体"
  | "MCP"
  | "Skill"
  | "其他";

export type ProductStatus = "已评测" | "评测中" | "即将发布";

export type EvaluationSort = "overall" | "business" | "compliance" | "updated";

export type PersonaAssessment = "适配较好" | "需要谨慎" | "不建议";

export type ScoreDimensionGroup = "business" | "compliance";

export interface ScoreBreakdown {
  dimensionCode: string;
  dimensionName: string;
  score: number;
  weight: number;
  comment: string;
  evidenceType: string[];
  group: ScoreDimensionGroup;
}

export interface PersonaFit {
  code: string;
  label: string;
  assessment: PersonaAssessment;
  note: string;
}

export interface EvaluationProduct {
  id: string;
  slug: string;
  name: string;
  organization: string;
  category: ProductCategory;
  subCategory: string;
  summary: string;
  status: ProductStatus;
  year: number;
  overallScore: number;
  businessScore: number;
  complianceScore: number;
  awardTags: string[];
  certificationLevel: string;
  scenarios: string[];
  highlights: string[];
  risks: string[];
  reportUpdatedAt: string;
  scoreBreakdown: ScoreBreakdown[];
  personaFits: PersonaFit[];
}

export interface AwardItem {
  year: number;
  awardName: string;
  winner: string;
  organization: string;
  category: ProductCategory;
}

export interface MethodologyBlock {
  title: string;
  description: string;
  points: string[];
}

export interface EvaluationFilterParams {
  category?: ProductCategory;
  month?: string;
  scenario?: string;
  status?: ProductStatus | "全部";
  award?: "all" | "yes";
  sort?: EvaluationSort;
  q?: string;
}
