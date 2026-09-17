import type { Route } from "./+types/posts.$slug";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
export const loader = ({ params }: Route.LoaderArgs) => readContent("posts", params.slug);
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  pageMeta(data?.title ?? "記事が見つかりません", `/posts/${data?.slug ?? ""}/`);
const Post = ({ loaderData }: Route.ComponentProps) => <Article {...loaderData} category="BLOG" />;
export default Post;
