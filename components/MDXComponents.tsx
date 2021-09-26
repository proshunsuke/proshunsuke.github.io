import {CodeBlock} from './MDXComponents/CodeBlock';
import {InlineCode} from './MDXComponents/InlineCode';
import {CustomLink} from './MDXComponents/CustomLink';
import {Pre} from './MDXComponents/Pre';

const MDXComponents = {
  a: CustomLink,
  pre: Pre,
  code: CodeBlock,
  inlineCode: InlineCode,
};

export default MDXComponents;
