import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  expression: string;
  block?: boolean;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ expression, block = false }) => {
  const html = useMemo(() => {
    try {
      // renderToString does not enforce quirks mode check, unlike render
      return katex.renderToString(expression, {
        throwOnError: false,
        displayMode: block,
        output: 'html', 
      });
    } catch (error) {
      console.error("KaTeX error:", error);
      return expression;
    }
  }, [expression, block]);

  return (
    <span 
      className={block ? "block my-2 text-term-accent" : "text-term-accent"}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default LatexRenderer;