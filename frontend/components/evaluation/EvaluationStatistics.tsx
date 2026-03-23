import Link from "next/link";
import ProductLogo from "@/components/product/ProductLogo";
import type { EvaluationProduct, ProductCategory } from "@/types/evaluation";
import styles from "./EvaluationStatistics.module.css";

interface EvaluationStatisticsProps {
  items: EvaluationProduct[];
  boardPeriodLabel?: string;
  rankingMonths: readonly { value: string; label: string }[];
  selectedMonth: string;
  currentCategory: ProductCategory;
}

const categoryOptions: Array<{ value: ProductCategory; label: string }> = [
  { value: "金融大模型", label: "金融大模型" },
  { value: "金融智能体", label: "金融智能体" },
  { value: "MCP", label: "mcp" },
  { value: "Skill", label: "skill" },
  { value: "其他", label: "其他" },
];

function formatScore(score: number) {
  return score > 0 ? score.toString() : "--";
}

function getStatusToneClass(status: EvaluationProduct["status"]) {
  if (status === "已评测") return styles.statusDone;
  if (status === "评测中") return styles.statusRunning;
  if (status === "即将发布") return styles.statusPending;
  return styles.statusNeutral;
}

export default function EvaluationStatistics({
  items,
  boardPeriodLabel,
  rankingMonths,
  selectedMonth,
  currentCategory,
}: EvaluationStatisticsProps) {
  const displayItems = items.length > 0 ? items : [];
  const boardPeriod = boardPeriodLabel ?? "2026年3月";
  const maxOverall = Math.max(...displayItems.map((item) => item.overallScore), 100);

  return (
    <div className={styles.wrap}>
      <article className={`card ${styles.leaderboardCard}`}>
        <header className={styles.leaderboardHead}>
          <div className={styles.headTop}>
            <h2>本期排行</h2>
            <div className={styles.headControls}>
              <details className={styles.categoryPicker}>
                <summary className={styles.categoryBadge} aria-label="切换产品类别">
                  <span>{currentCategory}</span>
                  <span className={styles.periodCaret} aria-hidden>
                    ▾
                  </span>
                </summary>
                <div className={styles.categoryMenu} role="listbox" aria-label="产品类别">
                  {categoryOptions.map((category) => (
                    <a
                      key={category.value}
                      href={`/evaluations?category=${encodeURIComponent(category.value)}&month=${encodeURIComponent(selectedMonth)}`}
                      className={`${styles.categoryOption} ${category.value === currentCategory ? styles.categoryOptionActive : ""}`}
                      role="option"
                      aria-selected={category.value === currentCategory}
                    >
                      {category.label}
                    </a>
                  ))}
                </div>
              </details>

              <details className={styles.periodPicker}>
                <summary className={styles.periodBadge} aria-label="切换历史榜单月份">
                  <span>{boardPeriod}</span>
                  <span className={styles.periodCaret} aria-hidden>
                    ▾
                  </span>
                </summary>
                <div className={styles.periodMenu} role="listbox" aria-label="历史榜单月份">
                  {rankingMonths.map((month) => (
                    <a
                      key={month.value}
                      href={`/evaluations?category=${encodeURIComponent(currentCategory)}&month=${encodeURIComponent(month.value)}`}
                      className={`${styles.periodOption} ${month.value === selectedMonth ? styles.periodOptionActive : ""}`}
                      role="option"
                      aria-selected={month.value === selectedMonth}
                    >
                      {month.label}
                    </a>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </header>

        <div className={styles.boardStage}>
          <div className={styles.boardLegend} aria-hidden>
            <span>排名</span>
            <span>产品</span>
            <span>关键能力</span>
            <span>综合得分</span>
          </div>

          <div className={styles.boardList}>
            {displayItems.map((item, index) => {
              const fillWidth =
                item.overallScore > 0 ? `${Math.max((item.overallScore / maxOverall) * 100, 8)}%` : "8%";
              const rankToneClass =
                index === 0 ? styles.rankOne : index === 1 ? styles.rankTwo : index === 2 ? styles.rankThree : "";

              return (
                <Link
                  key={item.id}
                  href={`/evaluations/${item.slug}`}
                  className={`${styles.boardRow} ${rankToneClass}`}
                  aria-label={`${item.name}，当前排名 No.${index + 1}，综合得分 ${formatScore(item.overallScore)}`}
                >
                  <div className={styles.rankRail}>
                    <span className={styles.rankChip}>No.{index + 1}</span>
                  </div>

                  <div className={styles.productBlock}>
                    <ProductLogo productId={item.id} organization={item.organization} name={item.name} size="sm" />
                    <div className={styles.productText}>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={styles.productOrg}>{item.organization}</span>
                    </div>
                  </div>

                  <div className={styles.metricsBlock}>
                    <span className={styles.metricPill}>业务能力 {formatScore(item.businessScore)}</span>
                    <span className={styles.metricPill}>合规安全 {formatScore(item.complianceScore)}</span>
                    <span className={`${styles.statusPill} ${getStatusToneClass(item.status)}`}>{item.status}</span>
                  </div>

                  <div className={styles.scoreStage}>
                    <div className={styles.scoreMeta}>
                      <span className={styles.scoreValue}>{formatScore(item.overallScore)}</span>
                    </div>
                    <div className={styles.scoreTrack} aria-hidden>
                      <div className={styles.scoreGrid} />
                      <div className={styles.scoreFill} style={{ width: fillWidth }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </article>
    </div>
  );
}
