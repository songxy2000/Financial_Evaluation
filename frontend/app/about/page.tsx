import styles from "./page.module.css";

const principles = [
  "聚焦金融行业，不做泛 AI 排行。",
  "坚持可复核的评分机制与证据链。",
  "以客观、审慎、中立的方式输出评测结论。",
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container">
          <h1>关于我们</h1>
          <p>金融AI评测平台致力于成为金融行业 AI 产品评价与认证的基础设施。</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            <article className={`card ${styles.card}`}>
              <h2>平台使命</h2>
              <p>建立统一、透明、可解释的金融 AI 评测标准，帮助行业构建共同语言与可信参考。</p>
            </article>
            <article className={`card ${styles.card}`}>
              <h2>发起背景</h2>
              <p>随着金融 AI 产品快速增长，市场缺少既懂金融业务又重视合规风险的评价框架。</p>
            </article>
            <article className={`card ${styles.card}`}>
              <h2>专家机制</h2>
              <p>采用“自动化评测 + 专家复核”机制，覆盖业务、合规、风控与可解释性等关键维度。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className={`card ${styles.card}`}>
            <h2>工作原则</h2>
            <ul>
              {principles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className={`card ${styles.card}`}>
            <h2>合作与联系</h2>
            <p>商务合作：bd@fin-ai-eval.cn</p>
            <p>媒体联系：media@fin-ai-eval.cn</p>
            <p>工作时间：周一至周五 09:30 - 18:30</p>
          </article>
        </div>
      </section>
    </div>
  );
}
