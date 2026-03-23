import EvaluationsResultsClient from "@/components/evaluation/EvaluationsResultsClient";
import {
  getAllCategories,
  getEvaluations,
  getRankingMonthLabel,
  getRankingMonthOptions,
  normalizeRankingMonth,
} from "@/data/evaluations";
import type { EvaluationFilterParams, ProductCategory } from "@/types/evaluation";
import styles from "./page.module.css";

interface EvaluationsPageProps {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EvaluationsPage({ searchParams }: EvaluationsPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const categories = getAllCategories();
  const rankingMonths = getRankingMonthOptions();
  const defaultCategory: ProductCategory = "金融大模型";
  const rawCategory = firstValue(resolvedSearchParams.category);
  const normalizedCategory = categories.includes(rawCategory as ProductCategory)
    ? (rawCategory as ProductCategory)
    : defaultCategory;
  const selectedMonth = normalizeRankingMonth(firstValue(resolvedSearchParams.month));

  const filters: EvaluationFilterParams = {
    category: normalizedCategory,
    month: selectedMonth,
    scenario: firstValue(resolvedSearchParams.scenario),
    status: firstValue(resolvedSearchParams.status) as EvaluationFilterParams["status"],
    award: firstValue(resolvedSearchParams.award) as EvaluationFilterParams["award"],
    sort: firstValue(resolvedSearchParams.sort) as EvaluationFilterParams["sort"],
    q: firstValue(resolvedSearchParams.q),
  };

  const list = getEvaluations(filters);
  const dateParts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const partMap = new Map(dateParts.map((part) => [part.type, part.value]));
  const updatedAt = `${partMap.get("year")}年${partMap.get("month")}月${partMap.get("day")}日 ${partMap.get("hour")}:${partMap.get("minute")}:${partMap.get("second")}`;

  return (
    <div className={styles.page}>
      <section className={`${styles.head} section`}>
        <div className="container">
          <h1>评测榜单</h1>
          <p>聚焦金融大模型、金融智能体、MCP 与 Skill 能力的年度评测结果与认证信息。</p>
          <div className={styles.stats}>更新时间：{updatedAt}</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <EvaluationsResultsClient
            initialItems={list}
            category={normalizedCategory}
            sort={filters.sort ?? "overall"}
            boardPeriodLabel={getRankingMonthLabel(selectedMonth)}
            allowArenaOverride={selectedMonth === rankingMonths[0].value}
            rankingMonths={rankingMonths}
            selectedMonth={selectedMonth}
            currentCategory={normalizedCategory}
          />
        </div>
      </section>
    </div>
  );
}
