import type { Route } from "./+types/about-page";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
export const loader = () => readContent("pages", "about-page");
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  pageMeta(data?.title ?? "ページ", "/about-page/");
const Page = ({ loaderData }: Route.ComponentProps) => <Article {...loaderData} category="ABOUT" />;
export default Page;
