import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowUpRightIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M7 17 17 7M7 7h10v10" /></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function SunIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></svg>;
}

export function MoonIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M20.2 15.4A8 8 0 1 1 8.6 3.8a6.5 6.5 0 0 0 11.6 11.6Z" /></svg>;
}

export function MonitorIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
}

export function CopyIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m5 12 4 4L19 6" /></svg>;
}

export function GithubIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.5 5.5 0 0 0 19.3 4 5.1 5.1 0 0 0 19.1.5S17.9.1 15 2a13.4 13.4 0 0 0-7 0C5.1.1 3.9.5 3.9.5A5.1 5.1 0 0 0 3.7 4a5.5 5.5 0 0 0-1.5 3.8c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4" /><path d="M8 19c-3 .9-3-1.5-4.2-2" /></svg>;
}

export function MailIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}

export function RssIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="5" cy="19" r="1" fill="currentColor" /><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /></svg>;
}

export function ChevronUpIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m18 15-6-6-6 6" /></svg>;
}
