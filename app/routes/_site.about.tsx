import type { Route } from "./+types/_site.about";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
import { contentBreadcrumbs } from "~/components/breadcrumbs";
export const handle = { breadcrumbs: contentBreadcrumbs };
export const loader = () => readContent("pages", "about");
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  data ? pageMeta(data.title, "/about/", data.description) : [];
const Page = ({ loaderData }: Route.ComponentProps) => <Article {...loaderData} category="ABOUT" />;
export default Page;
