import Link from "next/link";
import type { EvaluationProduct } from "@/types/evaluation";
import ProductLogo from "@/components/product/ProductLogo";
import AwardBadge from "./AwardBadge";
import ScoreBadge from "./ScoreBadge";
import styles from "./EvaluationCard.module.css";
import Tag from "@/components/ui/Tag";

interface EvaluationCardProps {
  product: EvaluationProduct;
  rank?: number;
}

function toneByStatus(status: EvaluationProduct["status"]) {
  if (status === "已评测") return "success";
  if (status === "评测中") return "warning";
  return "neutral";
}

export default function EvaluationCard({ product, rank }: EvaluationCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={styles.titleWrap}>
          {typeof rank === "number" ? <span className={styles.rank}>#{rank + 1}</span> : null}
          <ProductLogo productId={product.id} organization={product.organization} name={product.name} />
          <div className={styles.titleBlock}>
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.org}>{product.organization}</p>
          </div>
        </div>
        <Tag label={product.status} tone={toneByStatus(product.status)} />
      </div>

      <p className={styles.summary}>{product.summary}</p>

      <div className={styles.tags}>
        <Tag label={product.category} />
        <Tag label={product.subCategory} tone="neutral" />
        <Tag label={product.certificationLevel} tone="neutral" />
      </div>

      {product.awardTags.length > 0 ? (
        <div className={styles.awards}>
          {product.awardTags.map((award) => (
            <AwardBadge key={award} label={award} />
          ))}
        </div>
      ) : null}

      <div className={styles.scores}>
        <ScoreBadge score={product.overallScore} label="综合分" />
        <ScoreBadge score={product.businessScore} label="业务分" />
        <ScoreBadge score={product.complianceScore} label="合规分" />
      </div>

      <div className={styles.footer}>
        <span>更新于 {product.reportUpdatedAt}</span>
        <Link href={`/evaluations/${product.slug}`} className="btn btnGhost">
          查看详情
        </Link>
      </div>
    </article>
  );
}
