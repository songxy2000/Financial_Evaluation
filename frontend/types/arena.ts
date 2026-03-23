import type { ProductCategory } from "./evaluation";

export interface ArenaQuestion {
  id: string;
  title: string;
  prompt: string;
  focus: string;
  riskDemand: 1 | 2 | 3;
  personaCodes: string[];
}

export interface ArenaSuitabilitySummary {
  id: string;
  suitabilityRate: number;
  passCount: number;
  totalCount: number;
  conservativeMismatch: number;
}

export interface ArenaScoreOverride {
  id: string;
  overallScore: number;
  businessScore: number;
  complianceScore: number;
}

export interface ArenaGeneratedSet {
  category: ProductCategory;
  generatedAt: string;
  benchmark: string;
  prompt: string;
  questions: ArenaQuestion[];
  suitability: ArenaSuitabilitySummary[];
  items: ArenaScoreOverride[];
}

export type ArenaStore = Partial<Record<ProductCategory, ArenaGeneratedSet>>;
