import type { Route } from "./+types/_site.business";
import { readContent } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
import { contentBreadcrumbs } from "~/components/breadcrumbs";
export const handle = { breadcrumbs: contentBreadcrumbs };
export const loader = () => readContent("pages", "business");
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  data ? pageMeta(data.title, "/business/", data.description) : [];
const Page = ({ loaderData }: Route.ComponentProps) => (
  <Article {...loaderData} category="BUSINESS" />
);
export default Page;
