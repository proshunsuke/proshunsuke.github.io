import images from "~/generated/og-images.json";
import { site } from "~/lib/site";

type SocialImage = { url: string; alt: string; width: number; height: number };
const socialImages: Record<string, SocialImage> = images;

export const pageMeta = (
  title: string,
  path: string,
  description: string,
  type: "website" | "article" = "website",
) => {
  const image = socialImages[path];
  if (!image) throw new Error(`Missing OGP image for ${path}. Run npm run og.`);
  const shareTitle = path === "/" ? site.name : `${title} | ${site.name}`;
  const imageUrl = new URL(image.url, site.url).href;
  const url = new URL(path, site.url).href;
  return [
    { title: `${title} | ${site.name}` },
    { name: "description", content: description },
    { property: "og:title", content: shareTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: site.locale },
    { property: "og:image", content: imageUrl },
    { property: "og:image:width", content: String(image.width) },
    { property: "og:image:height", content: String(image.height) },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:alt", content: image.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: site.account },
    { name: "twitter:creator", content: site.account },
    { name: "twitter:title", content: shareTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: image.alt },
    { tagName: "link", rel: "canonical", href: url },
  ];
};
