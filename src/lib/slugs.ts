export function tagToSlug(tag: string): string {
  return tag
    .trim()
    .toLocaleLowerCase("zh-CN")
    .replaceAll("+", "-plus-")
    .replace(/[\s._/\\%?#]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
