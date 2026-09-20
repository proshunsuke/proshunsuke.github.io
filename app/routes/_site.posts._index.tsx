import type { Route } from "./+types/_site.posts._index";
import { Link } from "react-router";
import { listPosts } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { fixedPages } from "~/lib/site";
import type { BreadcrumbHandle } from "~/components/breadcrumbs";
export const handle = {
  breadcrumbs: () => [{ label: "ブログ", to: "/posts/" }],
} satisfies BreadcrumbHandle;
export const loader = () => listPosts();
export const meta = () =>
  pageMeta(fixedPages["/posts/"].title, "/posts/", fixedPages["/posts/"].description);
const Posts = ({ loaderData: posts }: Route.ComponentProps) => {
  return (
    <div className="page-width py-14 sm:py-20">
      <p className="eyebrow">WRITING</p>
      <h1 className="mt-4 text-4xl font-bold">ブログ</h1>
      <div className="mt-12 border-t border-line">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/posts/${post.slug}/`}
            className="group flex items-start justify-between gap-6 border-b border-line py-8 hover:no-underline"
          >
            <div className="max-w-3xl">
              <h2 className="text-xl leading-relaxed font-semibold group-hover:text-accent">
                {post.title}
              </h2>
              {post.publishedAt && (
                <p className="mt-3 text-sm text-muted">
                  公開日：
                  <time dateTime={post.publishedAt}>{post.publishedAt?.replaceAll("-", "/")}</time>
                </p>
              )}
            </div>
            <span aria-hidden="true" className="text-2xl text-accent">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Posts;
