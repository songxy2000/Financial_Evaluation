import styles from "./Tag.module.css";

interface TagProps {
  label: string;
  tone?: "default" | "success" | "warning" | "award" | "neutral";
}

export default function Tag({ label, tone = "default" }: TagProps) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{label}</span>;
}
