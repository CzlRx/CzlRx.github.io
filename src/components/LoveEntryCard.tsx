"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { loveConfig } from "@/config/love";
import { getTogetherDays } from "@/lib/love";
import { withBasePath } from "@/lib/paths";

export function LoveEntryCard() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const refresh = () => setDays(getTogetherDays(loveConfig.startDate));
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="love-entry-section" aria-labelledby="love-entry-title">
      <div className="love-entry-card">
        <div className="love-entry-copy">
          <p className="eyebrow">A LITTLE PLACE FOR US</p>
          <h2 id="love-entry-title">我们的小小角落</h2>
          <p>从 {loveConfig.startDateLabel} 开始，把想念、日常和每一个值得纪念的瞬间，好好放在这里。</p>
          <Link className="love-entry-link" href="/love/">
            进入情侣空间 <ArrowUpRightIcon />
          </Link>
        </div>
        <div className="love-entry-visual" aria-hidden="true">
          <div className="love-entry-orbit orbit-one" />
          <div className="love-entry-orbit orbit-two" />
          <div className="love-entry-avatar avatar-me">
            <Image src={withBasePath(loveConfig.people.me.avatar)} alt="" width={112} height={112} />
          </div>
          <div className="love-entry-heart">♡</div>
          <div className="love-entry-avatar avatar-partner">
            <Image src={withBasePath(loveConfig.people.partner.avatar)} alt="" width={112} height={112} />
          </div>
          <div className="love-entry-days">
            <span>一起走过</span>
            <strong>{days ?? "—"}<small> 天</small></strong>
          </div>
        </div>
      </div>
    </section>
  );
}
