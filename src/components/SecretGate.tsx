"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { loveConfig } from "@/config/love";

export function SecretGate() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim() === loveConfig.secret.code) {
      setUnlocked(true);
      setError("");
      return;
    }

    setUnlocked(false);
    setError("暗号不对，再想想你们之间的那一天。 ");
  }

  return (
    <div className={`love-secret-gate${unlocked ? " is-unlocked" : ""}`}>
      <div className="love-secret-icon" aria-hidden="true">✦</div>
      <div className="love-secret-copy">
        <p className="love-section-label">A SECRET BETWEEN US</p>
        <h2>暗号彩蛋</h2>
        {!unlocked ? <p>输入只属于你们的暗号，打开一封还没有公开的信。</p> : <p>暗号正确，这一页只留给知道它的人。</p>}
      </div>
      {!unlocked ? (
        <form className="love-secret-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="secret-code">情侣空间暗号</label>
          <input id="secret-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="输入暗号" autoComplete="off" />
          <button type="submit">解密</button>
          {error && <p className="love-form-error" role="alert">{error}</p>}
        </form>
      ) : (
        <div className="love-secret-result">
          <span className="love-unlocked-label">已解锁</span>
          <h3>{loveConfig.secret.title}</h3>
          {loveConfig.secret.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link className="text-link" href="/love/secret/">打开完整隐藏页 <ArrowUpRightIcon /></Link>
        </div>
      )}
    </div>
  );
}
