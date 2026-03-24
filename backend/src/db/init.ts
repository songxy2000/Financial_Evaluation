import { closeDb, query } from "./client";

export async function initDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS ingest_batches (
      id TEXT PRIMARY KEY,
      batch_type TEXT NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      total_count INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evaluation_records (
      id TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      product_logo_url TEXT,
      organization_logo_url TEXT,
      category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL,
      year INTEGER NOT NULL,
      month TEXT NOT NULL,
      overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
      business_score INTEGER NOT NULL CHECK (business_score >= 0 AND business_score <= 100),
      compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
      award_tags_json JSONB NOT NULL,
      certification_level TEXT NOT NULL,
      scenarios_json JSONB NOT NULL,
      highlights_json JSONB NOT NULL,
      risks_json JSONB NOT NULL,
      report_updated_at TEXT NOT NULL,
      score_breakdown_json JSONB NOT NULL,
      persona_fits_json JSONB NOT NULL,
      data_source TEXT NOT NULL,
      import_batch_id TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      UNIQUE(slug, month, data_source, revision)
    );

    CREATE INDEX IF NOT EXISTS idx_evaluation_month_category
      ON evaluation_records(month, category);
    CREATE INDEX IF NOT EXISTS idx_evaluation_slug_month
      ON evaluation_records(slug, month);

    CREATE TABLE IF NOT EXISTS awards (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      award_name TEXT NOT NULL,
      winner TEXT NOT NULL,
      organization TEXT NOT NULL,
      category TEXT NOT NULL,
      data_source TEXT NOT NULL,
      import_batch_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_category TEXT NOT NULL,
      core_scenario TEXT NOT NULL,
      intro TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_title TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      attachments TEXT NOT NULL,
      agreement_accepted BOOLEAN NOT NULL,
      status TEXT NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS arena_result_sets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      generated_at TIMESTAMPTZ NOT NULL,
      benchmark TEXT NOT NULL,
      prompt TEXT NOT NULL,
      questions_json JSONB NOT NULL,
      suitability_json JSONB NOT NULL,
      items_json JSONB NOT NULL,
      data_source TEXT NOT NULL,
      import_batch_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_arena_category_created
      ON arena_result_sets(category, created_at DESC);

    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      source_url TEXT,
      storage_url TEXT,
      status TEXT NOT NULL,
      copyright_note TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_crawl_tasks (
      id TEXT PRIMARY KEY,
      keyword TEXT NOT NULL,
      target_type TEXT NOT NULL,
      status TEXT NOT NULL,
      source_url TEXT,
      storage_url TEXT,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_media_task_status ON media_crawl_tasks(status);
  `);
}

async function main() {
  await initDb();
  console.log("Database schema initialized.");
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await closeDb();
    });
}

