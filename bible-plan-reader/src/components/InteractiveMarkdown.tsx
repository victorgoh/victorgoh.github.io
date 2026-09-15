import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { linkifyBibleReferences } from '../utils/bibleReferenceParser';

export interface InteractiveMarkdownProps {
  content: string;
  onReferenceClick?: (reference: string) => void;
  className?: string;
}

export const InteractiveMarkdown: React.FC<InteractiveMarkdownProps> = ({
  content,
  onReferenceClick,
  className = ''
}) => {
  const processedContent = useMemo(() => {
    return linkifyBibleReferences(content);
  }, [content]);

  return (
    <div className={`interactive-markdown-wrapper ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ href, children, ...rest }) => {
            if (href && href.startsWith('#bible-ref:')) {
              const ref = decodeURIComponent(href.slice('#bible-ref:'.length));
              return (
                <button
                  type="button"
                  className="bible-ref-chip"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onReferenceClick) {
                      onReferenceClick(ref);
                    }
                  }}
                  title={`Tap to read ${ref}`}
                  aria-label={`Read Bible passage ${ref}`}
                >
                  <span className="bible-ref-chip-icon" aria-hidden="true">📖</span>
                  <span className="bible-ref-chip-text">{children}</span>
                </button>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default InteractiveMarkdown;
