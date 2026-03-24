import { randomUUID } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client";
import { ApiError } from "../utils/http";

const ingestEvalSchema = z.object({
  source: z.enum(["mock", "official"]),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  revision: z.number().int().min(1).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        slug: z.string().min(1),
        name: z.string().min(1),
        organization: z.string().min(1),
        category: z.enum(["金融大模型", "金融智能体", "MCP", "Skill", "其他"]),
        subCategory: z.string().min(1),
        summary: z.string().min(1),
        status: z.enum(["已评测", "评测中", "即将发布"]),
        overallScore: z.number().int().min(0).max(100),
        businessScore: z.number().int().min(0).max(100),
        complianceScore: z.number().int().min(0).max(100),
        awardTags: z.array(z.string()).default([]),
        certificationLevel: z.string().default("通过评测"),
        scenarios: z.array(z.string()).default([]),
        highlights: z.array(z.string()).default([]),
        risks: z.array(z.string()).default([]),
        reportUpdatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        scoreBreakdown: z.array(z.any()).default([]),
        personaFits: z.array(z.any()).default([]),
        productLogoUrl: z.string().url().optional(),
        organizationLogoUrl: z.string().url().optional(),
      }),
    )
    .min(1),
});

const ingestAwardsSchema = z.object({
  source: z.enum(["mock", "official"]),
  year: z.number().int(),
  items: z
    .array(
      z.object({
        awardName: z.string().min(1),
        winner: z.string().min(1),
        organization: z.string().min(1),
        category: z.enum(["金融大模型", "金融智能体", "MCP", "Skill", "其他"]),
      }),
    )
    .min(1),
});

const mediaCrawlSchema = z.object({
  keyword: z.string().min(1),
  targetType: z.enum(["product_logo", "org_logo"]),
  sourceUrl: z.string().url().optional(),
});

export const internalRouter = Router();

internalRouter.post("/ingest/evaluations", (req, res) => {
  const parsed = ingestEvalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "INGEST_SCHEMA_INVALID", parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const payload = parsed.data;
  const batchId = `batch_eval_${Date.now()}`;
  const revision = payload.revision ?? 1;
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO ingest_batches (id, batch_type, source, status, total_count, success_count, failed_count, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(batchId, "evaluations", payload.source, "running", payload.items.length, 0, 0, "", now);

  const stmt = db.prepare(
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
    ON CONFLICT(slug, month, data_source, revision)
    DO UPDATE SET
      name = excluded.name,
      organization = excluded.organization,
      category = excluded.category,
      sub_category = excluded.sub_category,
      summary = excluded.summary,
      status = excluded.status,
      overall_score = excluded.overall_score,
      business_score = excluded.business_score,
      compliance_score = excluded.compliance_score,
      award_tags_json = excluded.award_tags_json,
      certification_level = excluded.certification_level,
      scenarios_json = excluded.scenarios_json,
      highlights_json = excluded.highlights_json,
      risks_json = excluded.risks_json,
      report_updated_at = excluded.report_updated_at,
      score_breakdown_json = excluded.score_breakdown_json,
      persona_fits_json = excluded.persona_fits_json,
      import_batch_id = excluded.import_batch_id,
      updated_at = excluded.updated_at
  `,
  );

  const tx = db.transaction(() => {
    for (const item of payload.items) {
      stmt.run({
        id: item.id,
        slug: item.slug,
        name: item.name,
        organization: item.organization,
        productLogoUrl: item.productLogoUrl ?? null,
        organizationLogoUrl: item.organizationLogoUrl ?? null,
        category: item.category,
        subCategory: item.subCategory,
        summary: item.summary,
        status: item.status,
        year: Number(payload.month.slice(0, 4)),
        month: payload.month,
        overallScore: item.overallScore,
        businessScore: item.businessScore,
        complianceScore: item.complianceScore,
        awardTagsJson: JSON.stringify(item.awardTags),
        certificationLevel: item.certificationLevel,
        scenariosJson: JSON.stringify(item.scenarios),
        highlightsJson: JSON.stringify(item.highlights),
        risksJson: JSON.stringify(item.risks),
        reportUpdatedAt: item.reportUpdatedAt,
        scoreBreakdownJson: JSON.stringify(item.scoreBreakdown),
        personaFitsJson: JSON.stringify(item.personaFits),
        dataSource: payload.source,
        importBatchId: batchId,
        revision,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  tx();

  db.prepare(
    `
    UPDATE ingest_batches
    SET status = ?, success_count = ?, failed_count = ?, message = ?
    WHERE id = ?
  `,
  ).run("success", payload.items.length, 0, "Ingest completed", batchId);

  res.status(201).json({
    batchId,
    status: "success",
    totalCount: payload.items.length,
    successCount: payload.items.length,
    failedCount: 0,
  });
});

internalRouter.post("/ingest/awards", (req, res) => {
  const parsed = ingestAwardsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "INGEST_SCHEMA_INVALID", parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const payload = parsed.data;
  const batchId = `batch_award_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO ingest_batches (id, batch_type, source, status, total_count, success_count, failed_count, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(batchId, "awards", payload.source, "running", payload.items.length, 0, 0, "", now);

  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM awards WHERE year = ? AND data_source = ?`).run(payload.year, payload.source);
    const stmt = db.prepare(
      `
      INSERT INTO awards (id, year, award_name, winner, organization, category, data_source, import_batch_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    );
    for (const item of payload.items) {
      stmt.run(
        randomUUID(),
        payload.year,
        item.awardName,
        item.winner,
        item.organization,
        item.category,
        payload.source,
        batchId,
        now,
      );
    }
  });
  tx();

  db.prepare(
    `
    UPDATE ingest_batches
    SET status = ?, success_count = ?, failed_count = ?, message = ?
    WHERE id = ?
  `,
  ).run("success", payload.items.length, 0, "Ingest completed", batchId);

  res.status(201).json({
    batchId,
    status: "success",
    totalCount: payload.items.length,
    successCount: payload.items.length,
    failedCount: 0,
  });
});

internalRouter.post("/media/crawl", (req, res) => {
  const parsed = mediaCrawlSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "INVALID_QUERY", parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const payload = parsed.data;
  const id = `crawl_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO media_crawl_tasks (id, keyword, target_type, status, source_url, storage_url, error_message, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(id, payload.keyword, payload.targetType, "queued", payload.sourceUrl ?? null, null, null, now, now);

  res.status(201).json({
    id,
    status: "queued",
    message: "Task queued. Please process with your crawler worker.",
  });
});

internalRouter.get("/ingest/batches/:batchId", (req, res) => {
  const row = db
    .prepare(
      `
      SELECT id, batch_type AS batchType, source, status, total_count AS totalCount,
             success_count AS successCount, failed_count AS failedCount, message, created_at AS createdAt
      FROM ingest_batches
      WHERE id = ?
    `,
    )
    .get(req.params.batchId);

  if (!row) {
    throw new ApiError(404, "NOT_FOUND", `Batch not found: ${req.params.batchId}`);
  }

  res.json(row);
});

