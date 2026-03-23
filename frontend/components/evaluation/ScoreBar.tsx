import styles from "./ScoreBar.module.css";

interface ScoreBarProps {
  label: string;
  score: number;
  weight?: number;
}

export default function ScoreBar({ label, score, weight }: ScoreBarProps) {
  const value = Math.max(0, Math.min(score, 100));

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <span>{label}</span>
        <span className={styles.meta}>
          {value}分{typeof weight === "number" ? ` · 权重${Math.round(weight * 100)}%` : ""}
        </span>
      </div>
      <div className={styles.track} aria-hidden>
        <span className={styles.fill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
