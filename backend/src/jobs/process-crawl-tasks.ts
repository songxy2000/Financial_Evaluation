import { closeDb, query, withTransaction } from "../db/client";
import { initDb } from "../db/init";

/**
 * Minimal worker:
 * - If a task already has source_url, mark it success and copy to storage_url.
 * - If source_url is empty, keep failed and wait for real crawler integration.
 *
 * Replace this file with a real crawler implementation in production.
 */
async function processQueuedTasks() {
  await initDb();
  const now = new Date().toISOString();

  const tasks = await query<{ id: string; source_url: string | null }>(
    `
    SELECT id, source_url
    FROM media_crawl_tasks
    WHERE status = 'queued'
    ORDER BY created_at ASC
    LIMIT 50
  `,
  );

  await withTransaction(async (client) => {
    for (const task of tasks.rows) {
      if (task.source_url) {
        await client.query(
          `
          UPDATE media_crawl_tasks
          SET status = 'success', storage_url = $1, updated_at = $2
          WHERE id = $3
        `,
          [task.source_url, now, task.id],
        );
      } else {
        await client.query(
          `
          UPDATE media_crawl_tasks
          SET status = 'failed', error_message = $1, updated_at = $2
          WHERE id = $3
        `,
          ["No source_url provided. Waiting for real crawler.", now, task.id],
        );
      }
    }
  });

  console.log(`Processed ${tasks.rows.length} crawl tasks.`);
}

processQueuedTasks()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });

