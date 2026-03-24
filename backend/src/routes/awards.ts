import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client";

export const awardsRouter = Router();

awardsRouter.get("/years", (_req, res) => {
  const rows = db
    .prepare(`SELECT DISTINCT year FROM awards ORDER BY year DESC`)
    .all() as Array<{ year: number }>;

  res.json({ years: rows.map((r) => r.year) });
});

awardsRouter.get("/", (req, res) => {
  const querySchema = z.object({
    year: z.coerce.number().int().optional(),
  });
  const parsed = querySchema.safeParse(req.query);

  const years = db
    .prepare(`SELECT DISTINCT year FROM awards ORDER BY year DESC`)
    .all() as Array<{ year: number }>;

  const latestYear = years[0]?.year;
  const year = parsed.success ? parsed.data.year ?? latestYear : latestYear;

  if (!year) {
    res.json({ year: null, items: [] });
    return;
  }

  const items = db
    .prepare(
      `
      SELECT year, award_name AS awardName, winner, organization, category
      FROM awards
      WHERE year = ?
      ORDER BY award_name ASC
    `,
    )
    .all(year);

  res.json({
    year,
    displayYearLabel: `${year} 年度获奖名单`,
    items,
  });
});
