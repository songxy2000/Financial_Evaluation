import styles from "./AwardBadge.module.css";

interface AwardBadgeProps {
  label: string;
}

export default function AwardBadge({ label }: AwardBadgeProps) {
  return <span className={styles.badge}>{label}</span>;
}
