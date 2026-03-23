import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <article className="card" style={{ padding: "24px", display: "grid", gap: "12px" }}>
          <h1>页面不存在</h1>
          <p>你访问的评测结果未找到，可能尚未发布或链接已失效。</p>
          <Link href="/evaluations" className="btn btnPrimary">
            返回评测列表
          </Link>
        </article>
      </div>
    </section>
  );
}
