export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "cta"; text: string; href: string; label: string };

export type BlogPost = {
  slug: string;
  title: string;
  meta: string;
  kicker: string;
  date: string;
  keywords: string[];
  toolHref: string;
  blocks: BlogBlock[];
};
