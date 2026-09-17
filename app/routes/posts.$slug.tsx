import type { MetaArgs } from "react-router";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
export const loader = ({ params }: LoaderFunctionArgs) => readContent("posts", params.slug ?? "");
export const meta = ({ loaderData: data }: MetaArgs<typeof loader>) =>
  pageMeta(data?.title ?? "記事が見つかりません", `/posts/${data?.slug ?? ""}/`);
const Post = () => <Article {...useLoaderData<typeof loader>()} category="BLOG" />;
export default Post;
