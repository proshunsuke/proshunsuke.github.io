import Link from 'next/link';
import {ClassAttributes, HTMLAttributes, ReactNode} from 'react';
import {CodeBlock} from './CodeBlock';

type Props = {
  href: string,
  children: ReactNode
}
const CustomLink = ({href, children}: Props) => {
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

const MDXComponents = {
  a: CustomLink,
  pre: (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLDivElement> & HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  code: CodeBlock,
};

export default MDXComponents;
