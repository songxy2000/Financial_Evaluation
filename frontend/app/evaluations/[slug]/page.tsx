import Link from "next/link";
import { notFound } from "next/navigation";
import ProductLogo from "@/components/product/ProductLogo";
import ScoreBar from "@/components/evaluation/ScoreBar";
import ScoreBadge from "@/components/evaluation/ScoreBadge";
import Tag from "@/components/ui/Tag";
import { getEvaluationBySlug } from "@/data/evaluations";
import styles from "./page.module.css";

interface EvaluationDetailPageProps {
  params: Promise<{ slug: string }>;
}

function toneByAssessment(assessment: string) {
  if (assessment === "适配较好") return "success";
  if (assessment === "需要谨慎") return "warning";
  return "neutral";
}

export default async function EvaluationDetailPage({ params }: EvaluationDetailPageProps) {
  const { slug } = await params;
  const product = await getEvaluationBySlug(slug);

  if (!product) notFound();

  const businessBreakdown = product.scoreBreakdown.filter((item) => item.group === "business");
  const complianceBreakdown = product.scoreBreakdown.filter((item) => item.group === "compliance");

  return (
    <div className={styles.page}>
      <section className={`${styles.head} section`}>
        <div className="container">
          <div className={styles.headGrid}>
            <div className={styles.primary}>
              <p className={styles.category}>{product.category}</p>
              <div className={styles.titleRow}>
                <ProductLogo productId={product.id} organization={product.organization} name={product.name} size="lg" />
                <h1>{product.name}</h1>
              </div>
              <p className={styles.org}>{product.organization}</p>
              <p className={styles.summary}>{product.summary}</p>
              <div className={styles.tags}>
                <Tag label={product.status} tone={product.status === "已评测" ? "success" : "warning"} />
                <Tag label={product.certificationLevel} tone="neutral" />
                {product.awardTags.map((award) => (
                  <Tag key={award} label={award} tone="award" />
                ))}
              </div>
              <div className={styles.actions}>
                <Link href="/apply" className="btn btnPrimary">
                  申请参评
                </Link>
                <Link href="/evaluations" className="btn btnGhost">
                  返回列表
                </Link>
              </div>
            </div>

            <aside className={`card ${styles.scorePanel}`}>
              <div className={styles.scoreDial} style={{ ["--score" as string]: product.overallScore }} aria-hidden />
              <div className={styles.badges}>
                <ScoreBadge score={product.overallScore} label="综合分" />
                <ScoreBadge score={product.businessScore} label="业务能力" />
                <ScoreBadge score={product.complianceScore} label="合规风险" />
              </div>
              <p>报告更新时间：{product.reportUpdatedAt}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className={styles.sectionTitle}>核心结论</h2>
          <article className={`card ${styles.conclusionPanel}`}>
            <div className={styles.conclusionGrid}>
              <section className={styles.conclusionBlock}>
                <div className={styles.conclusionBlockHead}>
                  <span className={styles.conclusionDot} aria-hidden />
                  <h4>核心亮点</h4>
                </div>
                <ul className={styles.conclusionList}>
                  {product.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.conclusionBlock}>
                <div className={styles.conclusionBlockHead}>
                  <span className={`${styles.conclusionDot} ${styles.conclusionDotRisk}`} aria-hidden />
                  <h4>风险提醒</h4>
                </div>
                <ul className={styles.conclusionList}>
                  {product.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className={styles.sectionTitle}>分项得分明细</h2>
          <div className={styles.breakdownGrid}>
            <article className={`card ${styles.block}`}>
              <h3>业务能力评分项</h3>
              <div className={styles.bars}>
                {businessBreakdown.length > 0 ? (
                  businessBreakdown.map((item) => (
                    <div key={item.dimensionCode} className={styles.barItem}>
                      <ScoreBar label={item.dimensionName} score={item.score} weight={item.weight} />
                      <p>{item.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.placeholder}>当前产品评分尚未发布。</p>
                )}
              </div>
            </article>

            <article className={`card ${styles.block}`}>
              <h3>合规与风险评分项</h3>
              <div className={styles.bars}>
                {complianceBreakdown.length > 0 ? (
                  complianceBreakdown.map((item) => (
                    <div key={item.dimensionCode} className={styles.barItem}>
                      <ScoreBar label={item.dimensionName} score={item.score} weight={item.weight} />
                      <p>{item.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.placeholder}>当前产品评分尚未发布。</p>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className={styles.sectionTitle}>用户画像适配结果</h2>
          <div className={styles.personaList}>
            {product.personaFits.length > 0 ? (
              product.personaFits.map((item) => (
                <article key={item.code} className={`card ${styles.personaCard}`}>
                  <div className={styles.personaHead}>
                    <h3>{item.code}</h3>
                    <Tag label={item.assessment} tone={toneByAssessment(item.assessment)} />
                  </div>
                  <p className={styles.personaLabel}>{item.label}</p>
                  <p className={styles.personaNote}>{item.note}</p>
                </article>
              ))
            ) : (
              <article className={`card ${styles.personaCard}`}>
                <p className={styles.placeholder}>画像适配数据将在评测发布后同步展示。</p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.bottomGrid}>
            <article className={`card ${styles.block}`}>
              <h3>适用场景</h3>
              <div className={styles.scenarioList}>
                {product.scenarios.map((scenario) => (
                  <Tag key={scenario} label={scenario} tone="default" />
                ))}
              </div>
            </article>
            <article className={`card ${styles.block}`}>
              <h3>下一步动作</h3>
              <p>如需查看完整报告或商务合作，请通过下方入口联系评测团队。</p>
              <div className={styles.actions}>
                <Link href="/apply" className="btn btnPrimary">
                  咨询与报名
                </Link>
                <Link href="/awards" className="btn btnGhost">
                  查看奖项认证
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
