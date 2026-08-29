export interface BaseContent {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
  body: string;
}

export interface Article extends BaseContent {
  type: "article";
  description: string;
  updated?: string;
  cover?: string;
  featured: boolean;
  readingMinutes: number;
}

export interface Note extends BaseContent {
  type: "note";
  excerpt: string;
}

export interface Project extends BaseContent {
  type: "project";
  description: string;
  status: string;
  cover?: string;
  demo?: string;
  repository?: string;
  featured: boolean;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}
