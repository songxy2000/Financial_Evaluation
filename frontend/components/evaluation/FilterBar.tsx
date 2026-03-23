import { type EvaluationFilterParams, type EvaluationSort } from "@/types/evaluation";
import Link from "next/link";
import SearchInput from "./SearchInput";
import styles from "./FilterBar.module.css";

const sortOptions: { label: string; value: EvaluationSort }[] = [
  { label: "综合得分", value: "overall" },
  { label: "业务能力", value: "business" },
  { label: "合规安全", value: "compliance" },
  { label: "更新时间", value: "updated" },
];

interface FilterBarProps {
  filters: EvaluationFilterParams;
  statuses: readonly string[];
  scenarios: string[];
}

export default function FilterBar({ filters, statuses, scenarios }: FilterBarProps) {
  return (
    <form method="get" className={styles.form} aria-label="评测结果筛选">
      <input type="hidden" name="category" value={filters.category ?? "金融大模型"} />
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>业务场景</span>
          <select name="scenario" defaultValue={filters.scenario ?? "全部"}>
            <option value="全部">全部</option>
            {scenarios.map((scenario) => (
              <option key={scenario} value={scenario}>
                {scenario}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>评测状态</span>
          <select name="status" defaultValue={filters.status ?? "全部"}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>排序方式</span>
          <select name="sort" defaultValue={filters.sort ?? "overall"}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <SearchInput defaultValue={filters.q} />
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btnPrimary">
          应用筛选
        </button>
        <Link href="/evaluations" className="btn btnGhost">
          重置筛选
        </Link>
      </div>
    </form>
  );
}
