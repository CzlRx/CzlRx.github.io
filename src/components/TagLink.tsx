import Link from "next/link";
import { tagToSlug } from "@/lib/slugs";

export function TagLink({ tag }: { tag: string }) {
  return <Link className="tag" href={`/tags/${tagToSlug(tag)}/`}>#{tag}</Link>;
}
