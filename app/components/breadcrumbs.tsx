import { Link, useMatches } from "react-router";
import type { UIMatch } from "react-router";

type Breadcrumb = { label: string; to: string };
export type BreadcrumbHandle = { breadcrumbs: (match: UIMatch) => Breadcrumb[] };

export const contentBreadcrumbs = ({ loaderData: data, pathname }: UIMatch) => {
  if (!data || typeof data !== "object" || !("title" in data) || typeof data.title !== "string")
    return [];
  return [{ label: data.title, to: pathname }];
};

export const Breadcrumbs = () => {
  const matches = useMatches();
  const items = matches
    .filter(
      (match): match is UIMatch<unknown, BreadcrumbHandle> =>
        !!match.handle &&
        typeof match.handle === "object" &&
        "breadcrumbs" in match.handle &&
        typeof match.handle.breadcrumbs === "function",
    )
    .flatMap((match) => match.handle.breadcrumbs(match));
  return (
    <nav aria-label="パンくず" className="page-width pt-6 text-sm text-muted">
      <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.to} className="flex min-w-0 max-w-full items-baseline gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="shrink-0">
                /
              </span>
            )}
            {index === items.length - 1 ? (
              <span aria-current="page" className="min-w-0 [overflow-wrap:anywhere]">
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className="min-w-0 [overflow-wrap:anywhere]">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
