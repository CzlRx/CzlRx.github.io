import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { getBasePath } from "@/lib/paths";
import type { TocItem } from "@/types/content";

type ElementNode = {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: Array<ElementNode | { type: string; value?: string }>;
};

function rehypeLocalPaths() {
  const basePath = getBasePath();
  return (tree: unknown) => {
    visit(tree as never, "element", (node: ElementNode) => {
      for (const property of ["href", "src"] as const) {
        const value = node.properties?.[property];
        if (
          basePath &&
          typeof value === "string" &&
          value.startsWith("/") &&
          value !== basePath &&
          !value.startsWith(`${basePath}/`)
        ) {
          node.properties[property] = `${basePath}${value}`;
        }
      }
    });
  };
}

function rehypeImageFigures() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: ElementNode) => {
      if (node.tagName !== "p" || node.children.length !== 1) return;
      const image = node.children[0];
      if (image.type !== "element") return;
      const imageElement = image as ElementNode;
      if (imageElement.tagName !== "img") return;
      const title = imageElement.properties.title;
      if (typeof title !== "string" || !title) return;
      delete imageElement.properties.title;
      node.tagName = "figure";
      node.children = [
        imageElement,
        {
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: title }],
        },
      ];
    });
  };
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      footnoteLabel: "脚注",
      footnoteBackLabel: "返回正文",
    })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeLocalPaths)
    .use(rehypeImageFigures)
    .use(rehypeExternalLinks, { target: "_blank", rel: ["nofollow", "noopener", "noreferrer"] })
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark" },
      keepBackground: false,
    })
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "复制此标题链接" },
      content: { type: "text", value: "#" },
    })
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

export function extractTableOfContents(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  visit(tree, "heading", (node) => {
    if (node.depth !== 2 && node.depth !== 3) return;
    const text = toString(node);
    items.push({ id: slugger.slug(text), text, level: node.depth });
  });
  return items;
}
