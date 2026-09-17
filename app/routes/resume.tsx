import type { Route } from "./+types/resume";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
export const loader = () => readContent("pages", "resume");
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  pageMeta(data?.title ?? "ページ", "/resume/");
const Page = ({ loaderData }: Route.ComponentProps) => (
  <Article {...loaderData} category="EXPERIENCE" />
);
export default Page;
