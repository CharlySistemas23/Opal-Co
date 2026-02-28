export interface CMSBlock {
  _type: string;
  _key: string;
  [key: string]: unknown;
}

export interface ManifestoBlock extends CMSBlock {
  _type: "manifestoBlock";
  headline?: string;
  body?: string;
}

export interface SiteSettings {
  title: string;
  description: string;
  ogImage?: { url: string };
}
