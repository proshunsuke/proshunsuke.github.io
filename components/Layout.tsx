import Head from 'next/head';
import { ReactNode } from 'react';
import { Header } from './header/Header';
import { Hooter } from './hooter/Hooter';
import { Meta } from '../types/Meta';

type Props = {
  meta: Meta;
  children: ReactNode;
};

export default function Layout({ meta, children }: Props) {
  return (
    <>
      <Head>
        <title>
          {meta.title} | {"pro_shunsuke's page"}
        </title>
        <meta name="description" content="Generated by create next app" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <main className="dark:bg-gray-800 font-mono bg-white relative overflow-auto h-screen text-gray-900 dark:text-gray-100">
        <Header />
        {children}
        <Hooter />
      </main>
    </>
  );
}
