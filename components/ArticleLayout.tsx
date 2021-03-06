import Layout from './Layout';
import { Meta } from '../types/Meta';
import { ReactElement } from 'react';
import {
  HatenaIcon,
  HatenaShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';
import { LatestUpdated } from './utils/LatestUpdated';
import { useRouter } from 'next/router';
import { createDescription } from '../lib/description';

type Props = {
  meta: Meta;
  latestUpdated: string;
  children: ReactElement[] | ReactElement;
};
export const ArticleLayout = ({ meta, latestUpdated, children }: Props) => {
  const router = useRouter();
  meta.description = createDescription(children);
  const url = new URL(
    router.pathname,
    process.env.NEXT_PUBLIC_SITE_URL
  ).toString();
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
            <div className="flex pt-4">
              <TwitterShareButton url={url} title={meta.title} className="pr-2">
                <TwitterIcon size={32} round={true} />
              </TwitterShareButton>
              <HatenaShareButton url={url} title={meta.title} className="px-2">
                <HatenaIcon size={32} round={true} />
              </HatenaShareButton>
            </div>
          </div>
        </header>
        <section className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto py-8 lg:py-16 px-3 lg:px-5 max-w-none max-w-3xl lg:text-base dark:prose-dark">
          {children}
        </section>
      </article>
    </Layout>
  );
};
