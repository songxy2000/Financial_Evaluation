import { closeDb } from "./client";
import { seedDb } from "./seed";

async function main() {
  await seedDb();
  console.log("Database reset with mock seed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
