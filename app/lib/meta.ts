export const pageMeta = (
  title: string,
  path: string,
  description = 'pro_shunsukeの職務経歴と、開発に関する記録。',
) => [
  { title: `${title} | pro_shunsuke` },
  { name: 'description', content: description },
  { property: 'og:title', content: title },
  { property: 'og:description', content: description },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: `https://proshunsuke.github.io${path}` },
  {
    tagName: 'link',
    rel: 'canonical',
    href: `https://proshunsuke.github.io${path}`,
  },
];
