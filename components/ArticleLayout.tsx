import Layout from './Layout';
import { Meta } from '../types/Meta';
import { ReactNode } from 'react';
import { LatestUpdated } from './utils/LatestUpdated';

type Props = {
  meta: Meta;
  latestUpdated: string;
  children: ReactNode;
};
export const ArticleLayout = ({ meta, latestUpdated, children }: Props) => {
  return (
    <Layout {...{ meta }}>
      <article>
        <header>
          <div className="text-center px-3 max-w-prose mx-auto">
            <div className="text-3xl sm:text-4xl mt-10 sm:mt-12 lg:mt-14 xl:mt-16">
              <h1>{meta.title}</h1>
            </div>
            <div className="flex justify-center text-gray-400 text-sm sm:text-base mt-2 lg:mt-4 lg:mt-6 xl:mt-8">
              <LatestUpdated {...{ latestUpdated }} />
            </div>
          </div>
        </header>
        <section className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto py-8 lg:py-16 px-3 lg:px-5 dark:prose-dark">
          {children}
        </section>
      </article>
    </Layout>
  );
};
