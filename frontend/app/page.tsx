import Link from "next/link";
import ProductLogo from "@/components/product/ProductLogo";
import { getCategoriesFromApi, getEvaluationsResponse } from "@/data/evaluations";
import styles from "./page.module.css";

const processSteps = [
  "报名与资料提交",
  "自动化评测脚本执行",
  "专家复核与交叉评分",
  "综合评级与认证判定",
  "榜单发布与年度奖项评选",
];

export default async function HomePage() {
  const currentBoardResponse = await getEvaluationsResponse({
    category: "金融大模型",
    status: "已评测",
    sort: "overall",
    page: 1,
    pageSize: 3,
  });
  const currentBoard = currentBoardResponse.items;
  const heroTop = currentBoard.slice(0, 3);
  const maxHeroScore = Math.max(...heroTop.map((item) => item.overallScore), 100);
  const groups = await getCategoriesFromApi();

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <div className={styles.heroLead}>
                <p className={styles.heroEyebrow}>FINANCIAL AI EVALUATION STANDARD</p>
                <h1 className={styles.heroTitle}>金融AI评测与认证中心</h1>
                <p className={styles.heroDesc}>
                  围绕业务能力、合规风险与用户适当性，构建可对比、可复核、可传播的评测体系，帮助行业建立统一认知。
                </p>
                <div className={styles.heroActions}>
                  <Link href="/evaluations" className="btn btnPrimary">
                    查看评测榜单
                  </Link>
                  <Link href="/apply" className="btn btnGhost">
                    申请参评
                  </Link>
                </div>
              </div>

              <div className={styles.heroStats}>
                <span>
                  <strong>{currentBoard.length}</strong>
                  <em>最新发布结果</em>
                </span>
                <span>
                  <strong>27</strong>
                  <em>用户画像体系</em>
                </span>
                <span>
                  <strong>自动化+专家复核</strong>
                  <em>评测执行机制</em>
                </span>
              </div>

              <div className={styles.heroPanel}>
                <div className={styles.heroPanelHead}>
                  <p>评测判断框架</p>
                </div>

                <div className={styles.heroAxisGrid}>
                  <article>
                    <strong>业务能力</strong>
                    <p>评估任务完成度与金融场景理解的稳定性。</p>
                  </article>
                  <article>
                    <strong>合规安全</strong>
                    <p>检验风险提示、边界控制与错误引导抑制。</p>
                  </article>
                  <article>
                    <strong>适当性匹配</strong>
                    <p>验证不同风险画像下建议是否匹配可承受范围。</p>
                  </article>
                </div>

                <div className={styles.heroCategoryLine}>
                  <span>评测对象</span>
                  <div className={styles.heroCategoryChips}>
                    {groups.slice(0, 5).map((group) => (
                      <span key={group}>{group}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className={styles.heroAside}>
              <header className={styles.heroAsideHead}>
                <h2>本期焦点榜单</h2>
                <span className={styles.heroAsidePeriod}>{currentBoardResponse.meta.monthLabel || "最新月"}</span>
              </header>
              <ul className={styles.heroRanking}>
                {heroTop.map((item, index) => (
                  <li key={item.id}>
                    <div className={styles.heroRowTop}>
                      <span className={styles.heroRankNum}>No.{index + 1}</span>
                      <div className={styles.heroScoreBlock}>
                        <b>{item.overallScore}</b>
                        <em>/100</em>
                      </div>
                    </div>
                    <div className={styles.heroProduct}>
                      <ProductLogo productId={item.id} organization={item.organization} name={item.name} size="sm" />
                      <div className={styles.heroProductText}>
                        <strong>{item.name}</strong>
                        <em>{item.organization}</em>
                      </div>
                    </div>
                    <div className={styles.heroScoreTrack} aria-hidden>
                      <span
                        style={{
                          width: `${Math.max((item.overallScore / maxHeroScore) * 100, 8)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <Link href="/evaluations" className="btn btnMuted">
                查看完整榜单
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className={styles.sectionTitle}>评测流程概览</h2>
          <ol className={styles.timeline}>
            {processSteps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className={`card ${styles.cta}`}>
            <div>
              <h2>2026 年度评测报名进行中</h2>
              <p>支持金融大模型、金融智能体、MCP 与 Skill 产品参评，支持基础评测与高级认证服务。</p>
            </div>
            <Link href="/apply" className="btn btnPrimary">
              立即报名
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
