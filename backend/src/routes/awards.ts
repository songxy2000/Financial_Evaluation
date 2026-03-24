import { Router } from "express";
import { z } from "zod";
import { query } from "../db/client";
import { asyncHandler } from "../utils/http";

export const awardsRouter = Router();

awardsRouter.get(
  "/years",
  asyncHandler(async (_req, res) => {
    const rows = await query<{ year: number }>(`SELECT DISTINCT year FROM awards ORDER BY year DESC`);
    res.json({ years: rows.rows.map((r) => Number(r.year)) });
  }),
);

awardsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const querySchema = z.object({ year: z.coerce.number().int().optional() });
    const parsed = querySchema.safeParse(req.query);

    const years = await query<{ year: number }>(`SELECT DISTINCT year FROM awards ORDER BY year DESC`);
    const latestYear = years.rows[0]?.year;
    const year = parsed.success ? parsed.data.year ?? latestYear : latestYear;

    if (!year) {
      res.json({ year: null, items: [] });
      return;
    }

    const items = await query(
      `
      SELECT year, award_name AS "awardName", winner, organization, category
      FROM awards
      WHERE year = $1
      ORDER BY award_name ASC
    `,
      [year],
    );

    res.json({
      year,
      displayYearLabel: `${year} 年度获奖名单`,
      items: items.rows,
    });
  }),
);
