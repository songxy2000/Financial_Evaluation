import { Router } from "express";
import { z } from "zod";
import { query } from "../db/client";
import { ApiError, asyncHandler } from "../utils/http";
import { parseJsonArray } from "../utils/json";

const querySchema = z.object({
  category: z.enum(["金融大模型", "金融智能体", "MCP", "Skill", "其他"]).optional(),
});

export const arenaRouter = Router();

arenaRouter.get(
  "/results",
  asyncHandler(async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, "INVALID_QUERY", parsed.error.issues[0]?.message ?? "Invalid query");
    }

    const category = parsed.data.category ?? "金融大模型";
    const rows = await query<{
      category: string;
      generatedAt: string;
      benchmark: string;
      prompt: string;
      questions_json: unknown;
      suitability_json: unknown;
      items_json: unknown;
    }>(
      `
      SELECT category, generated_at AS "generatedAt", benchmark, prompt,
             questions_json, suitability_json, items_json
      FROM arena_result_sets
      WHERE category = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [category],
    );

    const row = rows.rows[0];
    if (!row) {
      throw new ApiError(404, "EVALUATION_NOT_FOUND", `Arena result not found for category=${category}`);
    }

    res.json({
      category: row.category,
      generatedAt: row.generatedAt,
      benchmark: row.benchmark,
      prompt: row.prompt,
      questions: parseJsonArray(row.questions_json, []),
      suitability: parseJsonArray(row.suitability_json, []),
      items: parseJsonArray(row.items_json, []),
    });
  }),
);
