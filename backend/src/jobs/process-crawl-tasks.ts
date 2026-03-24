import { db } from "../db/client";
import { initDb } from "../db/init";

/**
 * Minimal worker:
 * - If a task already has source_url, mark it success and copy to storage_url.
 * - If source_url is empty, keep failed and wait for real crawler integration.
 *
 * Replace this file with a real crawler implementation in production.
 */
function processQueuedTasks() {
  initDb();
  const now = new Date().toISOString();

  const tasks = db
    .prepare(
      `
      SELECT id, source_url
      FROM media_crawl_tasks
      WHERE status = 'queued'
      ORDER BY created_at ASC
      LIMIT 50
    `,
    )
    .all() as Array<{ id: string; source_url: string | null }>;

  const markSuccess = db.prepare(
    `
    UPDATE media_crawl_tasks
    SET status = 'success', storage_url = ?, updated_at = ?
    WHERE id = ?
  `,
  );
  const markFailed = db.prepare(
    `
    UPDATE media_crawl_tasks
    SET status = 'failed', error_message = ?, updated_at = ?
    WHERE id = ?
  `,
  );

  for (const task of tasks) {
    if (task.source_url) {
      markSuccess.run(task.source_url, now, task.id);
    } else {
      markFailed.run("No source_url provided. Waiting for real crawler.", now, task.id);
    }
  }

  console.log(`Processed ${tasks.length} crawl tasks.`);
}

processQueuedTasks();

