import Link from "next/link";

export default function NotFound() {
  return (
    <div className="narrow section" style={{ minHeight: "55vh", display: "grid", alignContent: "center", textAlign: "center" }}>
      <p className="eyebrow">404 · NOT FOUND</p>
      <h1 style={{ margin: "0 0 1rem", fontFamily: "var(--serif)", fontSize: "clamp(2.5rem,8vw,5rem)" }}>这一页还没有被写下。</h1>
      <p className="page-description" style={{ marginInline: "auto" }}>地址可能发生了变化，也可能只是一次小小的迷路。</p>
      <p><Link className="button-link button-link-primary" href="/">回到首页</Link></p>
    </div>
  );
}
