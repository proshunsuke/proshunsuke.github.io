import type { Heading } from "~/lib/headings";

type TableOfContentsProps = {
  headings: Heading[];
};

export const TableOfContents = ({ headings }: TableOfContentsProps) => {
  const sections: { heading: Heading; children: Heading[] }[] = [];
  for (const heading of headings) {
    const parent = sections.at(-1);
    if (heading.level === 3 && parent?.heading.level === 2) parent.children.push(heading);
    else sections.push({ heading, children: [] });
  }
  if (sections.length === 0) return null;
  return (
    <aside className="order-first lg:order-last lg:sticky lg:top-28">
      <details className="rounded-xl border border-line p-5" open>
        <summary className="cursor-pointer text-sm font-semibold">このページの内容</summary>
        <nav aria-label="目次" className="mt-4 text-sm text-muted">
          <ul className="space-y-3">
            {sections.map(({ heading, children }) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="leading-relaxed hover:text-accent">
                  {heading.label}
                </a>
                {children.length > 0 && (
                  <ul className="mt-3 space-y-3 border-l border-line pl-4">
                    {children.map((child) => (
                      <li key={child.id}>
                        <a href={`#${child.id}`} className="leading-relaxed hover:text-accent">
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </aside>
  );
};
