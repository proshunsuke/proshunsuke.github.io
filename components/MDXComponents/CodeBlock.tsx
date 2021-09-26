import React from 'react';
import Highlight, {defaultProps, Language} from 'prism-react-renderer';
import theme from "prism-react-renderer/themes/vsDark";

type Props = {
  className: string,
  children: string,
}
export const CodeBlock = ({className, children}: Props) => {
  const language = className.replace(/language-/, '') as Language;

  return (
    <Highlight {...defaultProps} code={children} language={language} theme={theme}>
      {({className, style, tokens, getLineProps, getTokenProps}) =>
        <pre className={className} style={{...style, padding: '20px'}}>
          {tokens.map((line, i) => {
            if (i >= tokens.length - 1 && line[0].content === '\n') return;
            return <div key={i} {...getLineProps({line, key: i})}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({token, key})} />
                ))}
              </div>;
          })}
        </pre>}
    </Highlight>
  )
};
