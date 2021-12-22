import { ReactElement } from 'react';

type ChildrenType = ReactElement[] | ReactElement | string | undefined;

const createContent = (children: ChildrenType, content: string): string => {
  if (!children) return '';

  if (typeof children === 'string') return children;

  if (Array.isArray(children))
    return children.map((e) => createDescription(e, content)).join(' ');

  return content + createDescription(children.props.children, content);
};

export const createDescription = (
  children: ChildrenType,
  content: string = ''
) => createContent(children, content).substr(0, 85);
