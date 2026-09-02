import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { SecretGate } from "@/components/SecretGate";

export const metadata: Metadata = {
  title: "隐藏页",
  description: "情侣空间的暗号隐藏页。",
};

export default function LoveSecretPage() {
  return (
    <div className="love-page love-secret-page">
      <div className="love-shell">
        <div className="love-topline"><span>PRIVATE NOTE</span><Link href="/love/">回到情侣空间 <ArrowUpRightIcon /></Link></div>
        <header className="love-secret-page-heading"><p className="love-kicker">A QUIET PLACE FOR TWO</p><h1>只给我们看的<br /><em>一页。</em></h1><p>输入你们之间的暗号，打开这封还没有写完的信。</p></header>
        <SecretGate />
      </div>
    </div>
  );
}
