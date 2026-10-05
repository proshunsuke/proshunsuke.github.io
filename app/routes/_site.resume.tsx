import type { Route } from "./+types/_site.resume";
import { readContent, readUpdatedAt } from "~/lib/content.server";
import { pageMeta } from "~/lib/meta";
import { Article } from "~/components/article";
import { contentBreadcrumbs } from "~/components/breadcrumbs";
export const handle = { breadcrumbs: contentBreadcrumbs };
export const loader = async () => {
  const [content, updatedAt] = await Promise.all([
    readContent("pages", "resume"),
    readUpdatedAt("content/pages/resume.md"),
  ]);
  return { ...content, updatedAt };
};
export const meta = ({ loaderData: data }: Route.MetaArgs) =>
  data ? pageMeta(data.title, "/resume/", data.description) : [];
const Page = ({ loaderData }: Route.ComponentProps) => (
  <Article {...loaderData} category="EXPERIENCE" />
);
export default Page;
