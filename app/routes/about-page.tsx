import type { MetaArgs } from "react-router";
import { useLoaderData } from "react-router";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
export const loader = () => readContent("pages", "about-page");
export const meta = ({ loaderData: data }: MetaArgs<typeof loader>) =>
  pageMeta(data?.title ?? "ページ", "/about-page/");
const Page = () => <Article {...useLoaderData<typeof loader>()} category="ABOUT" />;
export default Page;
