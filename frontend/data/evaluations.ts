import { apiGet } from "@/data/http";
import type {
  EvaluationFilterParams,
  EvaluationProduct,
  EvaluationSort,
  ProductCategory,
} from "@/types/evaluation";

const defaultCategories = ["金融大模型", "金融智能体", "MCP", "Skill", "其他"] as const;

export interface RankingMonthOption {
  value: string;
  label: string;
}

export interface EvaluationsResponse {
  items: EvaluationProduct[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
  };
  meta: {
    month: string;
    monthLabel: string;
    categories: ProductCategory[];
    rankingMonths: RankingMonthOption[];
  };
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
  return [...items].toSorted((a, b) => scoreValueBySort(b, sort) - scoreValueBySort(a, sort));
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getAllCategories() {
  return [...defaultCategories];
}

export async function getCategoriesFromApi(): Promise<ProductCategory[]> {
  try {
    const payload = await apiGet<{ categories: ProductCategory[] }>("/api/v1/evaluations/meta/categories");
    if (!Array.isArray(payload.categories) || payload.categories.length === 0) {
      return [...defaultCategories];
    }
    return payload.categories;
  } catch {
    return [...defaultCategories];
  }
}

export async function getEvaluationsResponse(
  filters?: EvaluationFilterParams & {
    page?: number;
    pageSize?: number;
    source?: "mock" | "official";
  },
): Promise<EvaluationsResponse> {
  const query = toQueryString({
    category: filters?.category,
    month: filters?.month,
    scenario: filters?.scenario,
    status: filters?.status,
    award: filters?.award,
    sort: filters?.sort,
    q: filters?.q,
    page: filters?.page,
    pageSize: filters?.pageSize,
    source: filters?.source,
  });

  try {
    return await apiGet<EvaluationsResponse>(`/api/v1/evaluations${query}`);
  } catch {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentMonthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
    return {
      items: [],
      paging: { page: 1, pageSize: 20, total: 0 },
      meta: {
        month: currentMonth,
        monthLabel: currentMonthLabel,
        categories: [...defaultCategories],
        rankingMonths: [{ value: currentMonth, label: currentMonthLabel }],
      },
    };
  }
}

export async function getEvaluations(
  filters?: EvaluationFilterParams & {
    page?: number;
    pageSize?: number;
    source?: "mock" | "official";
  },
): Promise<EvaluationProduct[]> {
  const payload = await getEvaluationsResponse(filters);
  return sortEvaluationItems(payload.items, filters?.sort ?? "overall");
}

export async function getEvaluationBySlug(
  slug: string,
  options?: { month?: string; source?: "mock" | "official" },
): Promise<EvaluationProduct | undefined> {
  const query = toQueryString({
    month: options?.month,
    source: options?.source,
  });

  try {
    return await apiGet<EvaluationProduct>(`/api/v1/evaluations/${encodeURIComponent(slug)}${query}`);
  } catch {
    return undefined;
  }
}
