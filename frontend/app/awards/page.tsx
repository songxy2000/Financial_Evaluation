import Link from "next/link";
import { getAwardsByYear, getAwardYears } from "@/data/awards";
import { getRawEvaluations } from "@/data/evaluations";
import ProductLogo from "@/components/product/ProductLogo";
import styles from "./page.module.css";

function RankLogo({ rank }: { rank: 1 | 2 | 3 }) {
  if (rank === 1) {
    return (
      <svg viewBox="0 0 88 88" className={styles.rankLogo} aria-hidden>
        <circle cx="44" cy="44" r="40" fill="#f5c86a" stroke="#9d7024" strokeWidth="2.4" />
        <path d="M19 47 29 31 44 42 59 31 69 47 69 60 19 60z" fill="#8d611d" />
        <circle cx="44" cy="45" r="11" fill="#fff4d8" />
        <text x="44" y="50" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7a5218">
          1
        </text>
      </svg>
    );
  }

  if (rank === 2) {
    return (
      <svg viewBox="0 0 88 88" className={styles.rankLogo} aria-hidden>
        <circle cx="44" cy="44" r="40" fill="#d8e2ef" stroke="#617289" strokeWidth="2.4" />
        <path d="M44 22 63 31 58 58 44 66 30 58 25 31z" fill="#647991" />
        <path d="M44 29 56 35 53 54 44 60 35 54 32 35z" fill="#edf3fb" />
        <text x="44" y="51" textAnchor="middle" fontSize="13" fontWeight="800" fill="#4e6177">
          2
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 88 88" className={styles.rankLogo} aria-hidden>
      <circle cx="44" cy="44" r="40" fill="#d5a27c" stroke="#855939" strokeWidth="2.4" />
      <path d="M44 22 63 44 44 66 25 44z" fill="#7d4f31" />
      <path d="M44 30 56 44 44 58 32 44z" fill="#f2ddca" />
      <text x="44" y="49" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7a4c2f">
        3
      </text>
    </svg>
  );
}

export default function AwardsPage() {
  const years = getAwardYears();
  const currentYear = years[0];
  const currentAwards = getAwardsByYear(currentYear);
  const productIdByWinner = new Map(getRawEvaluations().map((item) => [item.name, item.id]));
  const topThreeAwards = currentAwards.slice(0, 3);
  const featuredAwards = currentAwards.slice(3);

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container">
          <h1>奖项与认证</h1>
          <p>通过年度奖项与认证体系，为优秀金融 AI 产品提供行业背书与传播价值。</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className={`card ${styles.honorBoard}`}>
            <header className={styles.boardHeader}>
              <h2>2025 年度获奖名单</h2>
              <p className={styles.boardLead}>基于业务价值、合规安全和适当性表现综合评定的年度荣誉榜单。</p>
            </header>

            {topThreeAwards.length > 0 ? (
              <section className={styles.podium}>
                {topThreeAwards.map((award, index) => {
                  const rank = (index + 1) as 1 | 2 | 3;
                  const rankClass =
                    rank === 1 ? styles.podiumFirst : rank === 2 ? styles.podiumSecond : styles.podiumThird;
                  const rankTitle = rank === 1 ? "年度冠军" : rank === 2 ? "年度亚军" : "年度季军";
                  return (
                    <article
                      key={`${award.year}-${award.awardName}-${award.winner}`}
                      className={`${styles.podiumCard} ${rankClass}`}
                    >
                      <div className={styles.podiumLogoWrap}>
                        <RankLogo rank={rank} />
                        <span>{rankTitle}</span>
                      </div>
                      <div className={styles.podiumInfo}>
                        <p className={styles.podiumAward}>{award.awardName}</p>
                        <div className={styles.podiumWinnerRow}>
                          <ProductLogo
                            productId={productIdByWinner.get(award.winner) ?? ""}
                            organization={award.organization}
                            name={award.winner}
                            size="sm"
                          />
                          <p className={styles.podiumWinner}>{award.winner}</p>
                        </div>
                        <p className={styles.podiumMeta}>
                          {award.organization} · {award.category}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : null}

            {featuredAwards.length > 0 ? (
              <section className={styles.featureSection}>
                <h3>年度专项荣誉</h3>
                <ul className={styles.awardGrid}>
                  {featuredAwards.map((award) => (
                    <li key={`${award.year}-${award.awardName}-${award.winner}`}>
                      <div className={styles.awardTop}>
                        <strong>{award.awardName}</strong>
                      </div>
                      <div className={styles.awardWinnerRow}>
                        <ProductLogo
                          productId={productIdByWinner.get(award.winner) ?? ""}
                          organization={award.organization}
                          name={award.winner}
                          size="sm"
                        />
                        <p className={styles.awardWinner}>{award.winner}</p>
                      </div>
                      <p className={styles.awardMeta}>
                        {award.organization} · {award.category}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className={`card ${styles.cta}`}>
            <div>
              <h2>参与评测，获得行业认证与奖项机会</h2>
              <p>支持金融 AI 产品通过评测结果与认证体系建立市场信任，助力商务转化与品牌传播。</p>
            </div>
            <Link href="/apply" className="btn btnPrimary">
              申请参评
            </Link>
          </article>

          <article className={styles.statusNote}>
            <h3>认证状态说明</h3>
            <ul>
              <li>
                <strong>已通过评测</strong>
                <span>完成评测并发布公开结论。</span>
              </li>
              <li>
                <strong>推荐认证</strong>
                <span>在业务价值与风险控制上达到高水平。</span>
              </li>
              <li>
                <strong>年度奖项</strong>
                <span>在细分能力上具备代表性表现。</span>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
