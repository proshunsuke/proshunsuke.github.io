import {ReactNode} from 'react';
import Link from 'next/link';

type Props = {
  href: string,
  children: ReactNode
}
export const CustomLink = ({href, children}: Props) => {
  const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));

  if (isInternalLink) {
    return (
      <Link href={href}>
        <a className="text-indigo-500">{children}</a>
      </Link>
    );
  }

  return <a className="text-indigo-500" target="_blank" rel="noopener noreferrer" href={href}>{children}</a>;
};
