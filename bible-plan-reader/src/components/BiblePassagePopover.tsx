import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, Loader2, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchHelloAoPassage, HELLOAO_TRANSLATION_MAP } from '../utils/helloAoBible';
import { buildBibleComUrl, type SupportedBibleTranslation } from '../utils/bibleUrl';
import ScriptureViewer from './ScriptureViewer';

export interface BiblePassagePopoverProps {
  reference: string | null;
  translation?: string;
  onClose: () => void;
  onOpenExternal?: (ref: string, url: string) => void;
}

export const BiblePassagePopover: React.FC<BiblePassagePopoverProps> = ({
  reference,
  translation = 'BSB',
  onClose,
  onOpenExternal
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [passageText, setPassageText] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Translation display name
  const transConfig = HELLOAO_TRANSLATION_MAP[translation] || HELLOAO_TRANSLATION_MAP.BSB;
  const displayTrans = transConfig.id;

  const bibleUrl = reference 
    ? buildBibleComUrl(reference, (translation as SupportedBibleTranslation) || 'BSB')
    : '';

  const loadPassage = async (ref: string) => {
    setLoading(true);
    setError(null);
    try {
      const text = await fetchHelloAoPassage(ref, translation);
      setPassageText(text);
    } catch (err: any) {
      console.error('Failed to fetch passage for popover:', err);
      setError(err?.message || 'Unable to retrieve Scripture passage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reference) {
      loadPassage(reference);
    } else {
      setPassageText(null);
      setError(null);
      setLoading(false);
    }
  }, [reference, translation]);

  // Handle escape key to close popover
  useEffect(() => {
    if (!reference) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reference, onClose]);

  // Handle backdrop tap (light dismiss)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!reference) return null;

  return (
    <div 
      className="bible-popover-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bible-popover-title"
    >
      <div 
        className="bible-popover-panel"
        ref={panelRef}
      >
        {/* Mobile Swipe / Drag Handle */}
        <div className="bible-popover-drag-bar" aria-hidden="true" />

        {/* Popover Header */}
        <div className="bible-popover-header">
          <div className="bible-popover-title-group">
            <BookOpen size={17} className="bible-popover-icon" />
            <span id="bible-popover-title" className="bible-popover-ref">
              {reference}
            </span>
            <span className="bible-popover-trans-badge">
              {displayTrans}
            </span>
          </div>

          <div className="bible-popover-actions">
            {bibleUrl && (
              <a
                href={bibleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary bible-popover-external-btn"
                title={`Open ${reference} on Bible.com (${displayTrans})`}
                aria-label={`Open ${reference} on Bible.com`}
                onClick={() => {
                  if (onOpenExternal) {
                    onOpenExternal(reference, bibleUrl);
                  }
                }}
              >
                <ExternalLink size={13} />
                <span>Bible.com</span>
              </a>
            )}
            <button
              type="button"
              className="bible-popover-close-btn"
              onClick={onClose}
              title="Close passage preview"
              aria-label="Close passage preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Popover Body Content */}
        <div className="bible-popover-body">
          {loading ? (
            <div className="bible-popover-loading">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span>Loading Scripture ({displayTrans})...</span>
            </div>
          ) : error ? (
            <div className="bible-popover-error">
              <AlertCircle size={24} className="text-warning" />
              <p>{error}</p>
              <div className="bible-popover-error-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => loadPassage(reference)}
                >
                  <RefreshCw size={14} /> Retry
                </button>
                {bibleUrl && (
                  <a
                    href={bibleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Open on Bible.com <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          ) : passageText ? (
            <ScriptureViewer
              text={passageText}
              reference={reference}
              translation={displayTrans}
              viewMode="verse"
              className="bible-popover-scripture"
            />
          ) : (
            <div className="bible-popover-empty">
              No passage text available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiblePassagePopover;
