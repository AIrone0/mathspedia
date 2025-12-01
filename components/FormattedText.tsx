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
 * - ![alt](url) → images
 * - | col | col | tables → markdown tables
 */
const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  // Split by block LaTeX first ($$...$$)
  const parts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  const renderInlineFormatting = (content: string, key: number): React.ReactNode[] => {
    // Process inline formatting: **bold**, *italic*, $latex$, images
    const tokens: React.ReactNode[] = [];
    let remaining = content;
    let tokenKey = 0;

    while (remaining.length > 0) {
      // Check for image ![alt](url)
      const imageMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        const [fullMatch, alt, url] = imageMatch;
        tokens.push(
          <span key={`${key}-${tokenKey++}`} className="inline-block my-2">
            <img 
              src={url} 
              alt={alt} 
              className="max-w-full h-auto rounded border border-gray-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<span class="text-red-400 text-sm">[Image: ${alt || url}]</span>`;
              }}
            />
            {alt && <span className="block text-sm text-gray-500 mt-1 italic">{alt}</span>}
          </span>
        );
        remaining = remaining.slice(fullMatch.length);
        continue;
      }

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
      const nextSpecial = remaining.search(/[\*\$_!]/);
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

  // Check if a line is a separator row (|---|---|)
  const isSeparatorRow = (line: string): boolean => {
    // Remove pipes and check if remaining content is only dashes, colons, and whitespace
    const content = line.replace(/\|/g, '').trim();
    return /^[\s\-:]+$/.test(content) && content.includes('-');
  };

  // Parse markdown table into structured data
  const parseTable = (tableLines: string[]): { headers: string[]; rows: string[][] } | null => {
    if (tableLines.length < 2) return null;

    const parseRow = (line: string): string[] => {
      return line
        .split('|')
        .slice(1, -1) // Remove empty first/last from | at edges
        .map(cell => cell.trim());
    };

    const headers = parseRow(tableLines[0]);
    
    // Filter out separator lines and get data rows
    const rows = tableLines
      .slice(1) // Skip header row
      .filter(line => line.trim().startsWith('|') && !isSeparatorRow(line))
      .map(parseRow);

    return { headers, rows };
  };

  // Render a markdown table
  const renderTable = (tableLines: string[], key: number): React.ReactNode => {
    const table = parseTable(tableLines);
    if (!table) return null;

    return (
      <div key={key} className="my-6 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="bg-gray-800/80 border-b-2 border-amber-500/50">
              {table.headers.map((header, i) => (
                <th 
                  key={i} 
                  className="px-4 py-3 text-left text-amber-400 font-bold uppercase tracking-wider text-xs"
                >
                  {renderInlineFormatting(header, key * 1000 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={`
                  border-b border-gray-700/50 
                  ${rowIdx % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-800/20'}
                  hover:bg-amber-500/10 transition-colors
                `}
              >
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className="px-4 py-3 text-gray-300"
                  >
                    {renderInlineFormatting(cell, key * 10000 + rowIdx * 100 + cellIdx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render a standalone image block
  const renderImageBlock = (alt: string, url: string, key: number): React.ReactNode => {
    return (
      <figure key={key} className="my-6 flex flex-col items-center">
        <img 
          src={url} 
          alt={alt} 
          className="max-w-full max-h-96 h-auto rounded-lg border border-gray-700 shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {alt && (
          <figcaption className="mt-2 text-sm text-gray-500 italic text-center">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  };

  const renderParagraph = (para: string, paraKey: number): React.ReactNode => {
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

  // Process a text block that may contain tables, images, and paragraphs
  const renderTextBlock = (text: string, baseKey: number): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const lines = text.split('\n');
    let currentParagraph: string[] = [];
    let currentTable: string[] = [];
    let elementKey = 0;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paraText = currentParagraph.join(' ').trim();
        if (paraText) {
          // Check if it's a standalone image on its own line
          const standaloneImageMatch = paraText.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (standaloneImageMatch) {
            result.push(renderImageBlock(standaloneImageMatch[1], standaloneImageMatch[2], baseKey * 1000 + elementKey++));
          } else {
            result.push(renderParagraph(paraText, baseKey * 1000 + elementKey++));
          }
        }
        currentParagraph = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        result.push(renderTable(currentTable, baseKey * 1000 + elementKey++));
        currentTable = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check if this line is part of a table (starts and ends with |)
      const isTableLine = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');

      if (isTableLine) {
        // Starting or continuing a table
        flushParagraph();
        currentTable.push(trimmedLine);
      } else if (currentTable.length > 0) {
        // End of table
        flushTable();
        if (trimmedLine) {
          currentParagraph.push(trimmedLine);
        } else {
          flushParagraph();
        }
      } else if (trimmedLine === '') {
        // Empty line = paragraph break
        flushParagraph();
      } else {
        // Regular text line
        currentParagraph.push(line);
      }
    }

    // Flush any remaining content
    flushTable();
    flushParagraph();

    return result;
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

        // Regular text - may contain tables, images, and paragraphs
        return <React.Fragment key={idx}>{renderTextBlock(part, idx)}</React.Fragment>;
      })}
    </div>
  );
};

export default FormattedText;
