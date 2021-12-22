import Head from 'next/head';
import { ReactNode } from 'react';
import { Header } from './header/Header';
import { Hooter } from './hooter/Hooter';
import { Meta } from '../types/Meta';
import { NextSeo } from 'next-seo';

type Props = {
  meta: Meta;
  children: ReactNode;
};

export default function Layout({ meta, children }: Props) {
  return (
    <>
      <NextSeo title={meta.title} description={meta.description} />
      <Head>
        <meta charSet="UTF-8" />
      </Head>
      <main className="dark:bg-gray-800 font-mono bg-white relative overflow-auto h-screen print:h-auto text-gray-900 dark:text-gray-100">
        <Header />
        {children}
        <Hooter />
      </main>
    </>
  );
}
