import { Router } from "express";
import { z } from "zod";
import { query } from "../db/client";
import { ApiError, asyncHandler } from "../utils/http";
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

async function readMonths(): Promise<string[]> {
  const rows = await query<{ month: string }>(
    `SELECT DISTINCT month FROM evaluation_records ORDER BY month DESC`,
  );
  return rows.rows.map((r) => r.month);
}

async function readCategories(): Promise<string[]> {
  const rows = await query<{ category: string }>(
    `SELECT DISTINCT category FROM evaluation_records ORDER BY category ASC`,
  );
  return rows.rows.map((r) => r.category);
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
    year: Number(row.year),
    overallScore: Number(row.overall_score),
    businessScore: Number(row.business_score),
    complianceScore: Number(row.compliance_score),
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
    revision: Number(row.revision),
  };
}

export const evaluationsRouter = Router();

evaluationsRouter.get(
  "/meta/categories",
  asyncHandler(async (_req, res) => {
    res.json({ categories: await readCategories() });
  }),
);

evaluationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, "INVALID_QUERY", parsed.error.issues[0]?.message ?? "Invalid query");
    }

    const userQuery = parsed.data;
    const months = await readMonths();
    const effectiveMonth = userQuery.month ?? months[0];
    if (!effectiveMonth) {
      res.json({
        items: [],
        paging: { page: 1, pageSize: 20, total: 0 },
        meta: { month: "", monthLabel: "", categories: [], rankingMonths: [] },
      });
      return;
    }

    const sort = userQuery.sort ?? "overall";
    const page = userQuery.page ?? 1;
    const pageSize = userQuery.pageSize ?? 20;
    const award = userQuery.award ?? "all";
    const offset = (page - 1) * pageSize;

    const values: unknown[] = [];
    const bind = (value: unknown) => {
      values.push(value);
      return `$${values.length}`;
    };

    const where: string[] = [`month = ${bind(effectiveMonth)}`];
    if (userQuery.category) {
      where.push(`category = ${bind(userQuery.category)}`);
    }
    if (userQuery.status && userQuery.status !== "全部") {
      where.push(`status = ${bind(userQuery.status)}`);
    }
    if (userQuery.source) {
      where.push(`data_source = ${bind(userQuery.source)}`);
    }
    if (award === "yes") {
      where.push(`jsonb_array_length(award_tags_json) > 0`);
    }
    if (userQuery.scenario) {
      where.push(`scenarios_json::text ILIKE ${bind(`%${userQuery.scenario}%`)}`);
    }
    if (userQuery.q) {
      const keyword = `%${userQuery.q}%`;
      where.push(`(name ILIKE ${bind(keyword)} OR organization ILIKE ${bind(keyword)} OR summary ILIKE ${bind(keyword)})`);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;
    const orderByMap: Record<string, string> = {
      overall: "overall_score DESC, report_updated_at DESC, id ASC",
      business: "business_score DESC, report_updated_at DESC, id ASC",
      compliance: "compliance_score DESC, report_updated_at DESC, id ASC",
      updated: "report_updated_at DESC, overall_score DESC, id ASC",
    };

    const totalRows = await query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM evaluation_records ${whereSql}`,
      values,
    );
    const listValues = [...values, pageSize, offset];
    const rows = await query(
      `
      SELECT *
      FROM evaluation_records
      ${whereSql}
      ORDER BY ${orderByMap[sort]}
      LIMIT $${listValues.length - 1} OFFSET $${listValues.length}
    `,
      listValues,
    );

    const items = rows.rows.map(parseEvaluationRow);
    const categories = await readCategories();
    const rankingMonths = months.map((m) => ({ value: m, label: monthLabel(m) }));

    res.json({
      items,
      paging: {
        page,
        pageSize,
        total: Number(totalRows.rows[0]?.total ?? 0),
      },
      meta: {
        month: effectiveMonth,
        monthLabel: monthLabel(effectiveMonth),
        categories,
        rankingMonths,
      },
    });
  }),
);

evaluationsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const slug = req.params.slug;
    const month = typeof req.query.month === "string" ? req.query.month : (await readMonths())[0];
    const source = typeof req.query.source === "string" ? req.query.source : undefined;

    if (!month) {
      throw new ApiError(404, "EVALUATION_NOT_FOUND", "No evaluation data available");
    }

    const values: unknown[] = [slug, month];
    const where = ["slug = $1", "month = $2"];
    if (source) {
      values.push(source);
      where.push(`data_source = $${values.length}`);
    }

    const rows = await query(
      `
      SELECT *
      FROM evaluation_records
      WHERE ${where.join(" AND ")}
      ORDER BY revision DESC
      LIMIT 1
    `,
      values,
    );

    const row = rows.rows[0];
    if (!row) {
      throw new ApiError(404, "EVALUATION_NOT_FOUND", `Evaluation not found for slug=${slug}`);
    }

    res.json(parseEvaluationRow(row));
  }),
);

