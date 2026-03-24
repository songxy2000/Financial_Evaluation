import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client";
import { ApiError } from "../utils/http";

const applicationSchema = z.object({
  companyName: z.string().trim().min(1),
  productName: z.string().trim().min(1),
  productCategory: z.string().trim().min(1),
  coreScenario: z.string().trim().min(1),
  intro: z.string().trim().min(1),
  contactName: z.string().trim().min(1),
  contactTitle: z.string().trim().min(1),
  contactPhone: z.string().regex(/^1\d{10}$/),
  contactEmail: z.string().email(),
  attachments: z.string().trim().optional().default(""),
  agreementAccepted: z.literal(true),
});

export const applicationsRouter = Router();

applicationsRouter.post("/", (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid application payload";
    throw new ApiError(400, "INVALID_APPLICATION", message);
  }

  const payload = parsed.data;
  const id = `app_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;
  const submittedAt = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO applications (
      id, company_name, product_name, product_category, core_scenario, intro,
      contact_name, contact_title, contact_phone, contact_email, attachments,
      agreement_accepted, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    payload.companyName,
    payload.productName,
    payload.productCategory,
    payload.coreScenario,
    payload.intro,
    payload.contactName,
    payload.contactTitle,
    payload.contactPhone,
    payload.contactEmail,
    payload.attachments,
    1,
    "SUBMITTED",
    submittedAt,
  );

  res.status(201).json({
    id,
    status: "SUBMITTED",
    submittedAt,
  });
});

applicationsRouter.get("/", (_req, res) => {
  const items = db
    .prepare(
      `
      SELECT id, company_name AS companyName, product_name AS productName,
             product_category AS productCategory, core_scenario AS coreScenario,
             contact_name AS contactName, contact_phone AS contactPhone,
             status, submitted_at AS submittedAt
      FROM applications
      ORDER BY submitted_at DESC
    `,
    )
    .all();

  res.json({ items });
});
