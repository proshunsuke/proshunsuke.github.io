import { glob } from 'glob';
import path from 'path';
import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { LatestUpdated } from '../../components/utils/LatestUpdated';
import { getCommitDates } from '../../utils/githubCommits';
import dayjs from 'dayjs';

export const getStaticProps = async () => {
  const postFiles = glob.sync('*.mdx', {
    cwd: path.resolve(process.cwd(), 'pages/posts/'),
  });
  const posts = (
    await Promise.all(
      postFiles.map(async (f) => {
        const commitDates = await getCommitDates({ path: `pages/posts/${f}` });
        return {
          path: `/posts/${f.replace('.mdx', '')}`,
          meta: (await import(`./${f}`)).meta,
          latestUpdated: commitDates.latestUpdated,
          created: commitDates.created,
        };
      })
    )
  ).sort((a, b) => {
    if (dayjs(a.created).isAfter(dayjs(b.created))) return -1;
    if (dayjs(a.created).isBefore(dayjs(b.created))) return 1;
    return 0;
  });
  return { props: { posts } };
};
const Posts = ({ posts }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout meta={{ title: 'ブログ' }}>
      <div className="container mx-auto px-6 justify-between items-center relative py-4">
        <div className="flex flex-row text-left py-2">
          <h2 className="text-3xl">ブログ</h2>
        </div>

        <div className="flex flex-wrap justify-between items-start">
          {posts.map((post) => (
            <div className="w-full md:w-47" key={post.path}>
              <article className="flex flex-col justify-between py-3">
                <h3>
                  <Link href={post.path}>
                    <a className="visited:text-gray-500">{post.meta.title}</a>
                  </Link>
                </h3>
                <div className="text-gray-400 text-xs">
                  <LatestUpdated latestUpdated={post.latestUpdated} />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Posts;
