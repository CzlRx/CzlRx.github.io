"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { loveConfig, LovePlace } from "@/config/love";
import { formatDateLabel, getDaysUntil, getNextAnniversary, getRelationshipParts, getTogetherDays } from "@/lib/love";
import { withBasePath } from "@/lib/paths";
import { SecretGate } from "@/components/SecretGate";

function PlaceCard({ place, personName, accent }: { place: LovePlace; personName: string; accent: "rose" | "lilac" }) {
  return (
    <article className={`love-place-card place-${accent}`}>
      <div className="love-place-heading"><span className="love-weather-dot" aria-hidden="true">☁</span><div><p>{personName}的城市</p><h3>{place.city}</h3></div></div>
      <div className="love-weather-value"><strong>{place.temperature}</strong><span>{place.weather}</span></div>
      <div className="love-place-distance"><span>相隔</span><strong>{place.distance}</strong></div>
    </article>
  );
}

export function LoveSpace() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const posts = loveConfig.posts;
  const photos = loveConfig.photos;
  const places = loveConfig.places;
  const relationshipParts = getRelationshipParts(loveConfig.startDate, now);
  const togetherDays = getTogetherDays(loveConfig.startDate, now);
  const anniversaryDate = getNextAnniversary(loveConfig.startDate, now);
  const anniversaryDays = getDaysUntil(anniversaryDate, now);

  return (
    <div className="love-page">
      <div className="love-shell">
        <div className="love-topline"><span>OUR LITTLE UNIVERSE</span><Link href="/">返回博客 <ArrowUpRightIcon /></Link></div>

        <section className="love-hero" aria-labelledby="love-title">
          <div className="love-hero-copy">
            <p className="love-kicker">SINCE {loveConfig.startDateLabel}</p>
            <h1 id="love-title">{loveConfig.hero.heading}<br /><em>{loveConfig.hero.highlight}</em></h1>
            <p className="love-hero-lead">{loveConfig.hero.description}</p>
            <div className="love-hero-meta">{loveConfig.hero.meta.map((item, index) => <span key={item}>{index > 0 && <i>·</i>}{item}</span>)}</div>
          </div>
          <div className="love-hero-art" aria-hidden="true">
            <div className="love-sun" />
            <div className="love-hero-flower flower-one">✽</div>
            <div className="love-hero-flower flower-two">✦</div>
            <div className="love-hero-avatars">
              <div className="love-large-avatar"><Image src={withBasePath(loveConfig.people.me.avatar)} alt="" width={180} height={180} /></div>
              <div className="love-plus">+</div>
              <div className="love-large-avatar"><Image src={withBasePath(loveConfig.people.partner.avatar)} alt="" width={180} height={180} /></div>
            </div>
            <p className="love-hero-caption">same sky, different places</p>
          </div>
        </section>

        <section className="love-timer-section" aria-labelledby="timer-title">
          <div className="love-timer-heading"><p className="love-section-label">THE TIME WE SHARE</p><h2 id="timer-title">和宝宝在一起已经</h2></div>
          <div className="love-timer-main"><strong>{togetherDays}</strong><span>天</span></div>
          <div className="love-clock" aria-label={`已经在一起 ${relationshipParts.days} 天 ${relationshipParts.hours} 小时 ${relationshipParts.minutes} 分钟`}>
            <div><strong>{String(relationshipParts.days).padStart(2, "0")}</strong><span>days</span></div><b>:</b><div><strong>{String(relationshipParts.hours).padStart(2, "0")}</strong><span>hours</span></div><b>:</b><div><strong>{String(relationshipParts.minutes).padStart(2, "0")}</strong><span>minutes</span></div><b>:</b><div><strong>{String(relationshipParts.seconds).padStart(2, "0")}</strong><span>seconds</span></div>
          </div>
          <p className="love-timer-date">从 {formatDateLabel(loveConfig.startDate)} 起，每一秒都在继续。</p>
        </section>

        <section className="love-content-grid">
          <div className="love-column">
            <section className="love-card love-posts-card" aria-labelledby="posts-title">
              <div className="love-card-heading"><div><p className="love-section-label">LITTLE DAILY NOTES</p><h2 id="posts-title">日常动态</h2></div><span className="love-card-count">{posts.length} 条</span></div>
              <div className="love-post-list">
                {posts.length === 0 ? <div className="love-empty-state"><span>♡</span><p>还没有第一条动态</p><small>在 src/config/love.ts 的 posts 中添加一条记录。</small></div> : posts.map((post) => <article className="love-post" key={post.id}><div className="love-post-meta"><time>{post.date}</time><span>{post.mood}</span></div><h3>{post.title}</h3><p>{post.content}</p></article>)}
              </div>
            </section>

            <section className="love-card love-timeline-card" aria-labelledby="timeline-title">
              <div className="love-card-heading"><div><p className="love-section-label">OUR STORY</p><h2 id="timeline-title">恋爱大事件</h2></div><span className="love-handwriting">to be continued</span></div>
              <div className="love-timeline">{loveConfig.timeline.map((event) => <article className="love-timeline-item" key={event.date}><div className="love-timeline-date">{event.date.replaceAll("-", ".")}</div><div className="love-timeline-dot" aria-hidden="true" /><div className="love-timeline-content"><h3>{event.title}</h3><p>{event.description}</p></div></article>)}</div>
            </section>
          </div>

          <div className="love-column">
            <section className="love-card love-anniversary-card" aria-labelledby="anniversary-title">
              <p className="love-section-label">NEXT ANNIVERSARY</p><h2 id="anniversary-title">下一次纪念日</h2>
              <div className="love-anniversary-date"><strong>{anniversaryDate.replaceAll("-", ".")}</strong><span>恋爱纪念日</span></div>
              <div className="love-countdown"><strong>{anniversaryDays}</strong><span>天后</span></div>
            </section>

            <section className="love-card love-weather-card" aria-labelledby="weather-title">
              <div className="love-card-heading"><div><p className="love-section-label">SAME SKY, DIFFERENT PLACES</p><h2 id="weather-title">异地天气与距离</h2></div><span className="love-weather-mark">☁</span></div>
              <div className="love-places"><PlaceCard place={places.me} personName={loveConfig.people.me.name} accent="rose" /><div className="love-distance-line" aria-hidden="true"><span>···</span><b>♡</b><span>···</span></div><PlaceCard place={places.partner} personName={loveConfig.people.partner.name} accent="lilac" /></div>
            </section>

            <section className="love-card love-gallery-card" aria-labelledby="gallery-title">
              <div className="love-card-heading"><div><p className="love-section-label">MOMENTS IN FRAMES</p><h2 id="gallery-title">拍立得相册</h2></div><span className="love-card-count">{photos.length} 张</span></div>
              <div className="love-gallery">{photos.length === 0 ? <div className="love-gallery-empty"><span>✦</span><p>相册还在等第一张照片</p><small>在 src/config/love.ts 的 photos 中添加图片路径和拍摄信息。</small></div> : photos.map((photo, index) => <figure className={`love-polaroid polaroid-${index % 3}`} key={photo.id}><Image src={withBasePath(photo.src)} alt={photo.alt} width={480} height={600} unoptimized /><figcaption><strong>{photo.title}</strong><span>{photo.location} · {photo.date}</span></figcaption></figure>)}</div>
            </section>
          </div>
        </section>

        <section className="love-secret-section"><SecretGate /></section>
        <footer className="love-footer"><span>made with love</span><span>从 {loveConfig.startDateLabel} 开始</span><Link href="/">回到博客首页 <ArrowUpRightIcon /></Link></footer>
      </div>
    </div>
  );
}
