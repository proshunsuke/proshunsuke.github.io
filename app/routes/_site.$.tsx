import { Link } from "react-router";
import type { BreadcrumbHandle } from "~/components/breadcrumbs";
export const handle = {
  breadcrumbs: ({ pathname }) => [{ label: "ページが見つかりません", to: pathname }],
} satisfies BreadcrumbHandle;
export const meta = () => [
  { title: "ページが見つかりません | pro_shunsuke" },
  { name: "robots", content: "noindex" },
];
const NotFound = () => (
  <div className="page-width py-24">
    <p className="eyebrow">404</p>
    <h1 className="mt-4 text-3xl font-bold">ページが見つかりません</h1>
    <p className="mt-6 text-muted">URLをご確認いただくか、ホームからページをお探しください。</p>
    <Link className="mt-8 inline-block text-accent underline" to="/">
      ホームへ戻る
    </Link>
  </div>
);
export default NotFound;
