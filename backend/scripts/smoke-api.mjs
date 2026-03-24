#!/usr/bin/env node

const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:4100").replace(/\/$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);
const smokeCategory = process.env.SMOKE_CATEGORY || "金融大模型";

function logStep(message) {
  process.stdout.write(`\n[SMOKE] ${message}\n`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function withQuery(path, params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `${path}?${q}` : path;
}

async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
    } catch (networkError) {
      const detail =
        networkError instanceof Error
          ? `${networkError.message}${networkError.cause ? `; cause: ${networkError.cause}` : ""}`
          : String(networkError);
      throw new Error(`Cannot connect to ${baseUrl}. ${detail}`);
    }

    const text = await response.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    if (!response.ok) {
      const message = json?.message || text || `HTTP ${response.status}`;
      throw new Error(`${options.method || "GET"} ${path} failed: ${message}`);
    }

    return { status: response.status, json };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  logStep(`Base URL: ${baseUrl}`);

  logStep("1) Health check");
  const health = await requestJson("/health");
  assert(health.json?.status === "ok", "Health check response missing status=ok");
  process.stdout.write(`[OK] /health -> ${health.json.status}\n`);

  logStep("2) Evaluations list");
  const evalListPath = withQuery("/api/v1/evaluations", {
    category: smokeCategory,
    status: "已评测",
    sort: "overall",
    pageSize: 3,
  });
  const evalList = await requestJson(evalListPath);
  assert(Array.isArray(evalList.json?.items), "Evaluations response missing items array");
  assert(evalList.json.items.length > 0, "Evaluations list is empty");
  const first = evalList.json.items[0];
  assert(typeof first.slug === "string" && first.slug.length > 0, "First evaluation missing slug");
  process.stdout.write(`[OK] /evaluations -> ${evalList.json.items.length} items\n`);

  logStep("3) Evaluation detail");
  const detail = await requestJson(`/api/v1/evaluations/${encodeURIComponent(first.slug)}`);
  assert(detail.json?.slug === first.slug, "Evaluation detail slug mismatch");
  process.stdout.write(`[OK] /evaluations/${first.slug}\n`);

  logStep("4) Awards");
  const years = await requestJson("/api/v1/awards/years");
  assert(Array.isArray(years.json?.years), "Awards years response missing years array");
  assert(years.json.years.length > 0, "Awards years is empty");
  const year = years.json.years[0];
  const awards = await requestJson(`/api/v1/awards?year=${year}`);
  assert(Array.isArray(awards.json?.items), "Awards response missing items array");
  process.stdout.write(`[OK] /awards?year=${year} -> ${awards.json.items.length} items\n`);

  logStep("5) Arena result");
  const arena = await requestJson(withQuery("/api/v1/arena/results", { category: smokeCategory }));
  assert(Array.isArray(arena.json?.items), "Arena response missing items array");
  process.stdout.write(`[OK] /arena/results -> ${arena.json.items.length} items\n`);

  logStep("6) Application submit and verify");
  const marker = `SMOKE_${Date.now()}`;
  const submitPayload = {
    companyName: marker,
    productName: "Smoke Test Product",
    productCategory: "金融大模型",
    coreScenario: "联调冒烟测试",
    intro: "自动化冒烟测试提交。",
    contactName: "Smoke Tester",
    contactTitle: "QA",
    contactPhone: "13800138000",
    contactEmail: "smoke@example.com",
    attachments: "",
    agreementAccepted: true,
  };

  const submit = await requestJson("/api/v1/applications", {
    method: "POST",
    body: JSON.stringify(submitPayload),
  });
  assert(typeof submit.json?.id === "string", "Submit response missing id");
  assert(submit.json?.status === "SUBMITTED", "Submit response missing status=SUBMITTED");
  const submittedId = submit.json.id;

  const applications = await requestJson("/api/v1/applications");
  assert(Array.isArray(applications.json?.items), "Applications response missing items array");
  const found = applications.json.items.some((item) => item.id === submittedId);
  assert(found, `Submitted application id not found in list: ${submittedId}`);
  process.stdout.write(`[OK] application persisted -> ${submittedId}\n`);

  logStep("All smoke checks passed.");
  process.stdout.write("[SMOKE] PASS\n");
}

run().catch((error) => {
  process.stderr.write(`\n[SMOKE] FAIL: ${error.message}\n`);
  process.exit(1);
});
