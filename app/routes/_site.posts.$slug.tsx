import type { Route } from "./+types/_site.posts.$slug";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
import { contentBreadcrumbs } from "~/components/breadcrumbs";
import type { BreadcrumbHandle } from "~/components/breadcrumbs";
export const handle = {
  breadcrumbs: (match) => [{ label: "ブログ", to: "/posts/" }, ...contentBreadcrumbs(match)],
} satisfies BreadcrumbHandle;
export const loader = ({ params }: Route.LoaderArgs) => readContent("posts", params.slug);
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  pageMeta(data?.title ?? "記事が見つかりません", `/posts/${data?.slug ?? ""}/`);
const Post = ({ loaderData }: Route.ComponentProps) => <Article {...loaderData} category="BLOG" />;
export default Post;
