import styles from "./ScoreBadge.module.css";

interface ScoreBadgeProps {
  score: number;
  label?: string;
}

function scoreTone(score: number) {
  if (score >= 90) return styles.excellent;
  if (score >= 80) return styles.good;
  if (score > 0) return styles.normal;
  return styles.pending;
}

export default function ScoreBadge({ score, label }: ScoreBadgeProps) {
  return (
    <div className={styles.wrap}>
      <span className={`${styles.value} ${scoreTone(score)}`}>{score > 0 ? score : "--"}</span>
      {label ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
}
