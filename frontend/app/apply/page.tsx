import ApplicationForm from "@/components/forms/ApplicationForm";
import FAQAccordion, { type FAQItem } from "@/components/ui/FAQAccordion";
import styles from "./page.module.css";

const faqs: FAQItem[] = [
  {
    question: "哪些产品可以报名？",
    answer: "支持金融大模型、金融智能体、MCP 与 Skill 类产品报名，需提供可验证的业务场景资料。",
  },
  {
    question: "评测周期一般多长？",
    answer: "基础评测通常为 3 到 4 周，高级认证项目通常为 4 到 6 周。",
  },
  {
    question: "是否会提供详细报告？",
    answer: "会。评测结束后提供结论摘要与分项建议，并可按服务方案提供深度报告。",
  },
];

export default function ApplyPage() {
  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container">
          <h1>报名参评</h1>
          <p className={styles.heroLead}>提交你的产品资料，启动金融 AI 评测与认证流程，获取行业可传播的结果背书。</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.serviceGrid}>
            <article className={`card ${styles.serviceCard}`}>
              <h2>基础评测服务</h2>
              <p>覆盖通用评测维度，提供标准结论与改进建议。</p>
              <ul>
                <li>适用于首次参评产品</li>
                <li>标准评测流程与结果摘要</li>
                <li>支持官网榜单展示</li>
              </ul>
            </article>
            <article className={`card ${styles.serviceCard}`}>
              <h2>高级认证服务</h2>
              <p>在标准评测基础上提供更深入复核与传播支持。</p>
              <ul>
                <li>专家复核深度报告</li>
                <li>认证等级与奖项评选机会</li>
                <li>可选联合传播支持</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.formWrap}>
            <h2>报名信息提交</h2>
            <ApplicationForm />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className={styles.faqWrap}>
            <h2>常见问题</h2>
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
