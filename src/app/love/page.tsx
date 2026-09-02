import type { Metadata } from "next";
import { LoveSpace } from "@/components/LoveSpace";
import { loveConfig } from "@/config/love";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = {
  title: "情侣空间",
  description: `从 ${loveConfig.startDateLabel} 开始，记录两个人的日常、纪念日和想念。`,
  alternates: { canonical: absoluteUrl("/love/") },
};

export default function LovePage() {
  return <LoveSpace />;
}
