import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client";
import { ApiError } from "../utils/http";
import { parseJsonArray } from "../utils/json";

const productCategorySchema = z.enum(["金融大模型", "金融智能体", "MCP", "Skill", "其他"]);
const productStatusSchema = z.enum(["已评测", "评测中", "即将发布", "全部"]);
const sortSchema = z.enum(["overall", "business", "compliance", "updated"]);
const dataSourceSchema = z.enum(["mock", "official"]);

const listQuerySchema = z.object({
  category: productCategorySchema.optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  scenario: z.string().trim().optional(),
  status: productStatusSchema.optional(),
  award: z.enum(["all", "yes"]).optional(),
  sort: sortSchema.optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  source: dataSourceSchema.optional(),
});

function monthLabel(month: string): string {
  const [year, m] = month.split("-");
  return `${year}年${Number(m)}月`;
}

function readMonths(): string[] {
  const rows = db
    .prepare(`SELECT DISTINCT month FROM evaluation_records ORDER BY month DESC`)
    .all() as Array<{ month: string }>;
  return rows.map((r) => r.month);
}

function readCategories(): string[] {
  const rows = db
    .prepare(`SELECT DISTINCT category FROM evaluation_records ORDER BY category ASC`)
    .all() as Array<{ category: string }>;
  return rows.map((r) => r.category);
}

function parseEvaluationRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    organization: row.organization,
    productLogoUrl: row.product_logo_url ?? undefined,
    organizationLogoUrl: row.organization_logo_url ?? undefined,
    category: row.category,
    subCategory: row.sub_category,
    summary: row.summary,
    status: row.status,
    year: row.year,
    overallScore: row.overall_score,
    businessScore: row.business_score,
    complianceScore: row.compliance_score,
    awardTags: parseJsonArray<string[]>(row.award_tags_json, []),
    certificationLevel: row.certification_level,
    scenarios: parseJsonArray<string[]>(row.scenarios_json, []),
    highlights: parseJsonArray<string[]>(row.highlights_json, []),
    risks: parseJsonArray<string[]>(row.risks_json, []),
    reportUpdatedAt: row.report_updated_at,
    scoreBreakdown: parseJsonArray(row.score_breakdown_json, []),
    personaFits: parseJsonArray(row.persona_fits_json, []),
    dataSource: row.data_source,
    importBatchId: row.import_batch_id,
    revision: row.revision,
  };
}

export const evaluationsRouter = Router();

evaluationsRouter.get("/meta/categories", (_req, res) => {
  res.json({ categories: readCategories() });
});

evaluationsRouter.get("/", (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "INVALID_QUERY", parsed.error.issues[0]?.message ?? "Invalid query");
  }

  const query = parsed.data;
  const months = readMonths();
  const effectiveMonth = query.month ?? months[0];
  if (!effectiveMonth) {
    res.json({
      items: [],
      paging: { page: 1, pageSize: 20, total: 0 },
      meta: { month: "", monthLabel: "", categories: [], rankingMonths: [] },
    });
    return;
  }

  const sort = query.sort ?? "overall";
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const award = query.award ?? "all";

  const where: string[] = ["month = ?"];
  const params: Array<string | number> = [effectiveMonth];

  if (query.category) {
    where.push("category = ?");
    params.push(query.category);
  }
  if (query.status && query.status !== "全部") {
    where.push("status = ?");
    params.push(query.status);
  }
  if (query.source) {
    where.push("data_source = ?");
    params.push(query.source);
  }
  if (award === "yes") {
    where.push("award_tags_json != '[]'");
  }
  if (query.scenario) {
    where.push("scenarios_json LIKE ?");
    params.push(`%${query.scenario}%`);
  }
  if (query.q) {
    where.push("(name LIKE ? OR organization LIKE ? OR summary LIKE ?)");
    const kw = `%${query.q}%`;
    params.push(kw, kw, kw);
  }

  const orderByMap: Record<string, string> = {
    overall: "overall_score DESC, report_updated_at DESC, id ASC",
    business: "business_score DESC, report_updated_at DESC, id ASC",
    compliance: "compliance_score DESC, report_updated_at DESC, id ASC",
    updated: "report_updated_at DESC, overall_score DESC, id ASC",
  };

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS total FROM evaluation_records ${whereSql}`)
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `
      SELECT *
      FROM evaluation_records
      ${whereSql}
      ORDER BY ${orderByMap[sort]}
      LIMIT ? OFFSET ?
    `,
    )
    .all(...params, pageSize, offset);

  const items = rows.map(parseEvaluationRow);
  const categories = readCategories();
  const rankingMonths = months.map((m) => ({ value: m, label: monthLabel(m) }));

  res.json({
    items,
    paging: {
      page,
      pageSize,
      total: totalRow.total,
    },
    meta: {
      month: effectiveMonth,
      monthLabel: monthLabel(effectiveMonth),
      categories,
      rankingMonths,
    },
  });
});

evaluationsRouter.get("/:slug", (req, res) => {
  const slug = req.params.slug;
  const month = typeof req.query.month === "string" ? req.query.month : readMonths()[0];
  const source = typeof req.query.source === "string" ? req.query.source : undefined;

  if (!month) {
    throw new ApiError(404, "EVALUATION_NOT_FOUND", "No evaluation data available");
  }

  const where = ["slug = ?", "month = ?"];
  const params: Array<string> = [slug, month];
  if (source) {
    where.push("data_source = ?");
    params.push(source);
  }

  const row = db
    .prepare(
      `
      SELECT *
      FROM evaluation_records
      WHERE ${where.join(" AND ")}
      ORDER BY revision DESC
      LIMIT 1
    `,
    )
    .get(...params);

  if (!row) {
    throw new ApiError(404, "EVALUATION_NOT_FOUND", `Evaluation not found for slug=${slug}`);
  }

  res.json(parseEvaluationRow(row));
});

