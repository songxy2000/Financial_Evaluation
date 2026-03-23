import Link from "next/link";
import styles from "./Footer.module.css";

const links = [
  { href: "/about", label: "关于我们" },
  { href: "/awards", label: "评测声明" },
  { href: "/apply", label: "商务合作" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div>
            <h3 className={styles.title}>金融AI评测平台</h3>
            <p className={styles.desc}>
              聚焦金融行业 AI 产品评测与认证，构建可对比、可复核、可传播的行业评价体系。
            </p>
          </div>

          <div className={styles.links}>
            {links.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <span>联系邮箱：contact@fin-ai-eval.cn</span>
          <span>© 2026 金融AI评测平台</span>
        </div>
      </div>
    </footer>
  );
}
