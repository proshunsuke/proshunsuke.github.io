import { TableOfContents } from "~/components/table-of-contents";
import type { Heading } from "~/lib/headings";

type ArticleProps = {
  title: string;
  html: string;
  headings: Heading[];
  category: string;
  publishedAt?: string;
};

export const Article = ({ title, html, headings, category, publishedAt }: ArticleProps) => (
  <div className="page-width py-10 sm:py-16">
    <header className="max-w-4xl border-b border-line pb-10">
      <p className="eyebrow">{category}</p>
      <h1 className="mt-4 text-3xl leading-snug font-bold tracking-tight sm:text-4xl">{title}</h1>
      {publishedAt && (
        <p className="mt-4 text-sm text-muted">
          公開日：<time dateTime={publishedAt}>{publishedAt.replaceAll("-", "/")}</time>
        </p>
      )}
    </header>
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
      <article
        className="prose prose-slate min-w-0 max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-accent prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <TableOfContents headings={headings} />
    </div>
  </div>
);
