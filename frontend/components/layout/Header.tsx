"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/arena", label: "评测竞技场" },
  { href: "/evaluations", label: "评测榜单" },
  { href: "/awards", label: "奖项认证" },
  { href: "/apply", label: "报名参评" },
  { href: "/about", label: "关于我们" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden>
              <svg viewBox="0 0 44 44" className={styles.brandSvg}>
                <rect x="4.5" y="4.5" width="35" height="35" rx="12" />
                <path d="M14 28.5h16" />
                <path d="M16.5 24 22 17.5l5 4 4.5-6" />
                <path d="M16.5 15.5h11" />
              </svg>
            </span>
            <span className={styles.brandBlock}>
              <span className={styles.brandText}>金融AI评测平台</span>
              <span className={styles.brandSub}>Financial AI Evaluation</span>
            </span>
          </Link>

          <nav className={styles.desktopNav} aria-label="主导航">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(pathname, item.href) ? `${styles.link} ${styles.linkActive}` : styles.link}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/apply" className="btn btnPrimary desktopOnly">
            申请参评
          </Link>

          <details className={styles.mobileMenu}>
            <summary aria-label="展开导航菜单">菜单</summary>
            <div className={styles.mobilePanel}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={styles.mobileLink}>
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
