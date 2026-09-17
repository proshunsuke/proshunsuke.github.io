type ArticleProps = {
  title: string;
  html: string;
  headings: { id: string; label: string }[];
  category: string;
};

export const Article = ({ title, html, headings, category }: ArticleProps) => (
  <div className="page-width py-10 sm:py-16">
    <header className="max-w-4xl border-b border-line pb-10">
      <p className="eyebrow">{category}</p>
      <h1 className="mt-4 text-3xl leading-snug font-bold tracking-tight sm:text-4xl">{title}</h1>
    </header>
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
      <article
        className="prose prose-slate min-w-0 max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-accent prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {headings.length > 0 && (
        <aside className="order-first lg:order-last lg:sticky lg:top-28">
          <details className="rounded-xl border border-line p-5" open>
            <summary className="cursor-pointer text-sm font-semibold">このページの内容</summary>
            <nav aria-label="目次" className="mt-4 flex flex-col gap-3 text-sm text-muted">
              {headings.map(({ id, label }) => (
                <a key={id} href={`#${id}`} className="leading-relaxed hover:text-accent">
                  {label}
                </a>
              ))}
            </nav>
          </details>
        </aside>
      )}
    </div>
  </div>
);
