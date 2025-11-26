import React from 'react';
import LatexRenderer from './LatexRenderer';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with formatting support:
 * - **bold** → bold text
 * - *italic* or _italic_ → italic text
 * - $latex$ → inline LaTeX (e.g., $\mathbb{N}$ for ℕ)
 * - $$latex$$ → centered block LaTeX
 * - Lines starting with \t or 4 spaces → indented
 * - Empty lines → paragraph breaks
 */
const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  // Split by block LaTeX first ($$...$$)
  const parts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  const renderInlineFormatting = (content: string, key: number) => {
    // Process inline formatting: **bold**, *italic*, $latex$
    const tokens: React.ReactNode[] = [];
    let remaining = content;
    let tokenKey = 0;

    while (remaining.length > 0) {
      // Check for inline LaTeX $...$
      const latexMatch = remaining.match(/^\$([^$]+)\$/);
      if (latexMatch) {
        tokens.push(
          <LatexRenderer key={`${key}-${tokenKey++}`} expression={latexMatch[1]} />
        );
        remaining = remaining.slice(latexMatch[0].length);
        continue;
      }

      // Check for bold **...**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        tokens.push(
          <strong key={`${key}-${tokenKey++}`} className="font-bold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check for italic *...* or _..._
      const italicMatch = remaining.match(/^(\*([^*]+)\*|_([^_]+)_)/);
      if (italicMatch) {
        tokens.push(
          <em key={`${key}-${tokenKey++}`} className="italic">
            {italicMatch[2] || italicMatch[3]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Find next special character or end
      const nextSpecial = remaining.search(/[\*\$_]/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Single special char, not part of formatting
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        tokens.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return tokens;
  };

  const renderParagraph = (para: string, paraKey: number) => {
    // Check for indentation (tab or 4 spaces at start)
    const isIndented = para.startsWith('\t') || para.startsWith('    ');
    const content = isIndented ? para.replace(/^(\t|    )/, '') : para;
    
    return (
      <p 
        key={paraKey} 
        className={`mb-3 ${isIndented ? 'ml-6' : ''}`}
      >
        {renderInlineFormatting(content, paraKey)}
      </p>
    );
  };

  return (
    <div className={`text-lg leading-relaxed text-gray-300 font-mono ${className}`}>
      {parts.map((part, idx) => {
        // Block LaTeX (centered)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.slice(2, -2).trim();
          return (
            <div key={idx} className="my-4 text-center">
              <LatexRenderer expression={latex} block />
            </div>
          );
        }

        // Regular text - split into paragraphs
        const paragraphs = part.split(/\n\n+/);
        return paragraphs.map((para, pIdx) => {
          if (!para.trim()) return null;
          return renderParagraph(para.trim(), idx * 1000 + pIdx);
        });
      })}
    </div>
  );
};

export default FormattedText;

