"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import EvaluationStatistics from "@/components/evaluation/EvaluationStatistics";
import {
  getArenaSetByCategory,
  getArenaStoreServerSnapshot,
  subscribeArenaStore,
} from "@/data/arenaStorage";
import { sortEvaluationItems } from "@/data/evaluations";
import type { EvaluationProduct, EvaluationSort, ProductCategory } from "@/types/evaluation";
import styles from "./EvaluationsResultsClient.module.css";

interface EvaluationsResultsClientProps {
  initialItems: EvaluationProduct[];
  category: ProductCategory;
  sort: EvaluationSort;
  boardPeriodLabel: string;
  allowArenaOverride: boolean;
  rankingMonths: readonly { value: string; label: string }[];
  selectedMonth: string;
  currentCategory: ProductCategory;
}

function applyOverrides(
  items: EvaluationProduct[],
  overrides: Array<{
    id: string;
    overallScore: number;
    businessScore: number;
    complianceScore: number;
  }>,
): EvaluationProduct[] {
  const scoreMap = new Map(overrides.map((item) => [item.id, item]));
  return items.map((item) => {
    const matched = scoreMap.get(item.id);
    if (!matched) return item;
    return {
      ...item,
      overallScore: matched.overallScore,
      businessScore: matched.businessScore,
      complianceScore: matched.complianceScore,
      reportUpdatedAt: new Date().toISOString().slice(0, 10),
    };
  });
}

export default function EvaluationsResultsClient({
  initialItems,
  category,
  sort,
  boardPeriodLabel,
  allowArenaOverride,
  rankingMonths,
  selectedMonth,
  currentCategory,
}: EvaluationsResultsClientProps) {
  const arenaStore = useSyncExternalStore(
    subscribeArenaStore,
    () => (allowArenaOverride ? getArenaSetByCategory(category) : null),
    () => {
      const store = getArenaStoreServerSnapshot();
      return allowArenaOverride ? store[category] ?? null : null;
    },
  );

  const finalItems = useMemo(() => {
    if (!arenaStore?.items?.length) return sortEvaluationItems(initialItems, sort);
    const merged = applyOverrides(initialItems, arenaStore.items);
    return sortEvaluationItems(merged, sort);
  }, [arenaStore, initialItems, sort]);

  if (finalItems.length === 0) {
    return (
      <article className={`card ${styles.empty}`}>
        <h2>暂无匹配结果</h2>
        <p>请尝试调整筛选条件，或重置后浏览全部评测条目。</p>
        <Link href="/evaluations" className="btn btnPrimary">
          重置筛选
        </Link>
      </article>
    );
  }

  return (
    <div className={styles.wrap}>
      <EvaluationStatistics
        items={finalItems}
        boardPeriodLabel={boardPeriodLabel}
        rankingMonths={rankingMonths}
        selectedMonth={selectedMonth}
        currentCategory={currentCategory}
      />
    </div>
  );
}
