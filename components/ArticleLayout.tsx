import Layout from './Layout';
import { Meta } from '../types/Meta';
import { ReactNode } from 'react';

type Props = {
  meta: Meta;
  children: ReactNode;
};
export const ArticleLayout = ({ meta, children }: Props) => (
  <Layout {...{ meta }}>
    <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto py-8 lg:py-16 dark:prose-dark">
      {children}
    </article>
  </Layout>
);
