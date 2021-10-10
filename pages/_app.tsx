import 'tailwindcss/tailwind.css';
import type { AppProps } from 'next/app';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../components/MDXComponents';
import { ThemeProvider } from 'next-themes';
import { GoogleAnalytics, usePageView } from '../lib/gtag';

function MyApp({ Component, pageProps }: AppProps) {
  usePageView();
  return (
    <ThemeProvider attribute="class">
      <MDXProvider components={MDXComponents}>
        <GoogleAnalytics />
        <Component {...pageProps} />
      </MDXProvider>
    </ThemeProvider>
  );
}

export default MyApp;
