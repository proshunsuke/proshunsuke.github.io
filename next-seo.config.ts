import { NextSeoProps } from 'next-seo';

export const SEO: NextSeoProps = {
  titleTemplate: "%s｜pro_shunsuke's page",
  defaultTitle: "pro_shunsuke's page",
  additionalLinkTags: [
    {
      rel: 'apple-touch-icon',
      href: '/favicons/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'icon',
      href: '/favicons/favicon-32x32.png',
      sizes: '32x32',
    },
    {
      rel: 'icon',
      href: '/favicons/favicon-16x16.png',
      sizes: '16x16',
    },
    {
      rel: 'manifest',
      href: '/favicons/site.webmanifest',
    },
    {
      rel: 'mask-icon',
      href: '/favicons/safari-pinned-tab.svg',
      color: '#5bbad5',
    },
  ],
  additionalMetaTags: [
    {
      name: 'msapplication-TileColor',
      content: '#da532c',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ],
  twitter: {
    cardType: 'summary_large_image',
    site: '@pro_shunsuke',
    handle: '@pro_shunsuke',
  },
  openGraph: {
    type: 'article',
    images: [
      {
        url: 'https://proshunsuke.github.io/images/icon.jpg',
        width: 300,
        height: 300,
        alt: 'サイト画像',
      },
    ],
  },
};
