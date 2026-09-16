import { Link } from 'react-router';
import { pageMeta } from '~/lib/meta';
export const meta = () => pageMeta('ホーム', '/');
const Home = () => (
  <div className="page-width">
    <section className="grid items-center gap-10 border-b border-line py-16 sm:py-24 md:grid-cols-[1fr_auto]">
      <div>
        <p className="eyebrow">PRO_SHUNSUKE’S PAGE</p>
        <h1 className="mt-6 text-[clamp(2.1rem,8vw,4.5rem)] font-bold tracking-tight">
          pro_shunsuke<span className="text-accent">.</span>
        </h1>
        <p className="mt-6 text-xl text-muted">
          鈴木駿介 <span className="ml-2 text-base">Shunsuke Suzuki</span>
        </p>
        <div className="mt-8 flex gap-6 text-sm font-semibold">
          <a href="https://github.com/proshunsuke">GitHub ↗</a>
          <a href="https://twitter.com/pro_shunsuke">Twitter ↗</a>
        </div>
      </div>
      <img
        src="/images/icon.jpg"
        alt="pro_shunsukeのプロフィール画像"
        width="176"
        height="176"
        className="row-start-1 w-28 rounded-2xl md:col-start-2 md:w-44"
      />
    </section>
    <section aria-label="サイトのコンテンツ" className="py-12 sm:py-16">
      <p className="eyebrow mb-6">EXPLORE</p>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            path: '/resume/',
            number: '01',
            title: '職務経歴書',
            english: 'EXPERIENCE',
            description: 'これまでの仕事と、開発に使ってきた技術。',
          },
          {
            path: '/posts/',
            number: '02',
            title: 'ブログ',
            english: 'WRITING',
            description: '開発の記録と、作ったものについて。',
          },
          {
            path: '/about-page/',
            number: '03',
            title: 'このページについて',
            english: 'ABOUT',
            description: 'このサイトを作った理由と、その仕組み。',
          },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group flex min-h-64 flex-col rounded-2xl border border-line bg-wash p-7 hover:border-accent hover:no-underline"
          >
            <div className="flex justify-between text-xs font-semibold text-muted">
              <span>{item.english}</span>
              <span>{item.number}</span>
            </div>
            <h2 className="mt-8 text-xl font-bold">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {item.description}
            </p>
            <span
              aria-hidden="true"
              className="mt-auto pt-5 text-2xl text-accent"
            >
              ↗
            </span>
          </Link>
        ))}
      </div>
    </section>
  </div>
);
export default Home;
