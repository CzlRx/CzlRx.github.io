"use client";

import { useEffect, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";

type ThemeMode = "system" | "light" | "dark";

const modes: Array<{ value: ThemeMode; label: string; icon: typeof SunIcon }> = [
  { value: "system", label: "跟随系统", icon: MonitorIcon },
  { value: "light", label: "浅色模式", icon: SunIcon },
  { value: "dark", label: "深色模式", icon: MoonIcon },
];

function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initial = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    applyTheme(initial);
    const frame = window.requestAnimationFrame(() => setMode(initial));
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => localStorage.getItem("theme") === "system" && applyTheme("system");
    media.addEventListener("change", syncSystem);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", syncSystem);
    };
  }, []);

  const current = modes.find((item) => item.value === mode) ?? modes[0];
  const Icon = current.icon;

  function cycleTheme() {
    const next = modes[(modes.findIndex((item) => item.value === mode) + 1) % modes.length].value;
    setMode(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <button className="icon-button" type="button" onClick={cycleTheme} aria-label={`${current.label}，点击切换主题`} title={current.label}>
      <Icon />
    </button>
  );
}
