import 'tailwindcss/tailwind.css';
import type { AppProps } from 'next/app';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../components/MDXComponents';
import { ThemeProvider } from 'next-themes';
import { GoogleAnalytics, usePageView } from '../lib/gtag';
import { DefaultSeo } from 'next-seo';
import { SEO } from '../next-seo.config';

function MyApp({ Component, pageProps }: AppProps) {
  usePageView();
  return (
    <ThemeProvider attribute="class">
      <MDXProvider components={MDXComponents}>
        <GoogleAnalytics />
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </MDXProvider>
    </ThemeProvider>
  );
}

export default MyApp;
