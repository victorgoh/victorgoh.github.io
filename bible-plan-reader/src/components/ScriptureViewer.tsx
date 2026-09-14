import React, { useState, useMemo } from 'react';
import { AlignLeft, List, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface ScriptureVerse {
  verseNumber: string;
  text: string;
}

export interface ScriptureViewerProps {
  text: string;
  reference?: string;
  translation?: string;
  viewMode?: 'paragraph' | 'verse';
  showToolbar?: boolean;
  className?: string;
}

const STORAGE_KEY = 'bible_plan_scripture_view_mode';

/**
 * Parses raw scripture text strings into structured verses.
 * Handles BSB (3:1, 3:2), NLT (1, 2, 3), HelloAO (**1**), and bracketed formats.
 */
export function parseScriptureVerses(rawText: string, reference?: string): ScriptureVerse[] {
  if (!rawText || typeof rawText !== 'string') return [];

  let cleaned = rawText.trim();

  // Strip redundant leading bold titles e.g. "**Exodus 3:1–12 (BSB)**" or "**1 Timothy 2:1–2 (NLT)**"
  cleaned = cleaned.replace(/^\*\*.*?\([A-Za-z0-9]+\)\*\*\s*/i, '');

  // 1. Bracketed format: [Exodus 3:1 (BSB)] text
  if (/\[.*?\]/.test(cleaned)) {
    const parts = cleaned.split(/(?=\[.*?\])/);
    const verses: ScriptureVerse[] = [];
    for (const part of parts) {
      const m = part.match(/^\[(.*?)(?:\s+\([A-Za-z0-9]+\))?\]\s*([\s\S]*)$/);
      if (m) {
        const vNum = m[1].replace(/^[A-Za-z0-9\s]+(?=\d+:\d+|\d+)/, '').trim() || m[1];
        verses.push({ verseNumber: vNum, text: m[2].trim() });
      } else if (part.trim()) {
        verses.push({ verseNumber: '', text: part.trim() });
      }
    }
    if (verses.length > 0) return verses;
  }

  // 2. HelloAO / markdown bold numbers: **1** text or **3:1** text
  if (/\*\*\d+(?::\d+)?\*\*/.test(cleaned)) {
    const parts = cleaned.split(/(?=\*\*\d+(?::\d+)?\*\*)/);
    const verses: ScriptureVerse[] = [];
    for (const part of parts) {
      const m = part.match(/^\*\*(\d+(?::\d+)?)\*\*\s*([\s\S]*)$/);
      if (m) {
        verses.push({ verseNumber: m[1], text: m[2].trim() });
      } else if (part.trim()) {
        verses.push({ verseNumber: '', text: part.trim() });
      }
    }
    if (verses.length > 0) return verses;
  }

  // 3. BSB chapter:verse format: "3:1 text... 3:2 text..."
  if (/(?:^|\s)\d+:\d+\s+/.test(cleaned)) {
    const parts = cleaned.split(/(?=(?:^|\s)\d+:\d+\s+)/);
    const verses: ScriptureVerse[] = [];
    for (const part of parts) {
      const m = part.trim().match(/^(\d+:\d+)\s+([\s\S]*)$/);
      if (m) {
        verses.push({ verseNumber: m[1], text: m[2].trim() });
      } else if (part.trim()) {
        verses.push({ verseNumber: '', text: part.trim() });
      }
    }
    if (verses.length > 0) return verses;
  }

  // 4. Standalone verse numbers (e.g. NLT: "1 I urge you... 2 Pray this way...")
  // Extract expected verses if reference is provided
  const expectedVerses: number[] = [];
  if (reference) {
    const rangeMatches = reference.matchAll(/(\d+)(?::(\d+))?(?:[-–—](\d+))?/g);
    for (const rm of rangeMatches) {
      if (rm[2]) {
        const start = parseInt(rm[2], 10);
        const end = rm[3] ? parseInt(rm[3], 10) : start;
        for (let i = start; i <= end; i++) expectedVerses.push(i);
      }
    }
  }

  if (expectedVerses.length > 1) {
    const regexStr = '(?=(?:^|\\s)(?:' + expectedVerses.join('|') + ')\\s+)';
    const parts = cleaned.split(new RegExp(regexStr));
    const verses: ScriptureVerse[] = [];
    for (const part of parts) {
      const m = part.trim().match(/^(\d+)\s+([\s\S]*)$/);
      if (m && expectedVerses.includes(parseInt(m[1], 10))) {
        verses.push({ verseNumber: m[1], text: m[2].trim() });
      } else if (part.trim()) {
        verses.push({ verseNumber: '', text: part.trim() });
      }
    }
    if (verses.filter(v => v.verseNumber).length > 1) return verses;
  }

  // Generic standalone number matching: numbers following start or punctuation
  const genericSplit = cleaned.split(/(?=(?:^|[\.\?!;:,]\s*|\.\.\.\s*)\b\d+\b\s+)/);
  if (genericSplit.length > 1) {
    const verses: ScriptureVerse[] = [];
    for (const part of genericSplit) {
      const m = part.trim().match(/^(?:[\.\?!;:,]\s*|\.\.\.\s*)?(\d+)\s+([\s\S]*)$/);
      if (m && parseInt(m[1], 10) < 200) {
        verses.push({ verseNumber: m[1], text: m[2].trim() });
      } else if (part.trim()) {
        verses.push({ verseNumber: '', text: part.trim() });
      }
    }
    if (verses.filter(v => v.verseNumber).length > 1) return verses;
  }

  return [{ verseNumber: '', text: cleaned }];
}

/**
 * Returns a display-friendly verse number badge for paragraph flow.
 * If consecutive verses share a chapter (e.g. 3:1 then 3:2), subsequent verses display just the verse number (e.g. 2).
 */
function getDisplayVerseBadge(vNum: string, index: number, allVerses: ScriptureVerse[]): string {
  if (!vNum) return '';
  if (!vNum.includes(':')) return vNum;

  const [chapter, verse] = vNum.split(':');
  if (index === 0) return vNum;

  const prev = allVerses[index - 1]?.verseNumber;
  if (prev && prev.includes(':')) {
    const [prevChapter] = prev.split(':');
    if (prevChapter === chapter) {
      return verse;
    }
  }
  return vNum;
}

export const ScriptureViewer: React.FC<ScriptureViewerProps> = ({
  text,
  reference,
  translation,
  viewMode: externalViewMode,
  showToolbar = false,
  className = ''
}) => {
  const [internalViewMode, setInternalViewMode] = useState<'paragraph' | 'verse'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'verse' || saved === 'paragraph') return saved;
    } catch {
      // Fallback
    }
    return 'paragraph';
  });

  const activeViewMode = externalViewMode || internalViewMode;

  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);

  const handleToggleMode = (mode: 'paragraph' | 'verse') => {
    setInternalViewMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore
    }
  };

  const handleCopyVerse = (verseNum: string, verseText: string) => {
    const citation = reference 
      ? `${reference}${verseNum ? `:${verseNum}` : ''} (${translation || 'Scripture'})` 
      : `(${translation || 'Scripture'})`;
    const copyString = `"${verseText}" — ${citation}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyString);
      setCopiedVerse(verseNum || 'copied');
      setTimeout(() => setCopiedVerse(null), 1800);
    }
  };

  const verses = useMemo(() => parseScriptureVerses(text, reference), [text, reference]);

  // Fallback: If no structured verses parsed, render plain ReactMarkdown
  const hasStructuredVerses = verses.length > 1 || (verses.length === 1 && verses[0].verseNumber);

  if (!hasStructuredVerses) {
    return (
      <div className={`scripture-viewer-raw ${className}`}>
        <ReactMarkdown>{text || 'Passage text not available.'}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={`scripture-viewer-container ${className}`}>
      {/* Optional Top Controls Bar (hidden by default to avoid repeating reference) */}
      {showToolbar && (
        <div className="scripture-toolbar">
          <div className="scripture-toolbar-info">
            {reference && <span className="scripture-toolbar-ref">{reference}</span>}
            {translation && <span className="scripture-toolbar-trans">{translation}</span>}
          </div>
          
          <div className="scripture-view-toggle-group" role="group" aria-label="Scripture display mode">
            <button
              type="button"
              className={`scripture-toggle-btn ${activeViewMode === 'paragraph' ? 'active' : ''}`}
              onClick={() => handleToggleMode('paragraph')}
              title="Continuous paragraph reading"
              aria-pressed={activeViewMode === 'paragraph'}
            >
              <AlignLeft size={14} />
              <span>Paragraph</span>
            </button>
            <button
              type="button"
              className={`scripture-toggle-btn ${activeViewMode === 'verse' ? 'active' : ''}`}
              onClick={() => handleToggleMode('verse')}
              title="Line-by-line verse study"
              aria-pressed={activeViewMode === 'verse'}
            >
              <List size={14} />
              <span>Verse by Verse</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      {activeViewMode === 'paragraph' ? (
        <div className="scripture-paragraph-view">
          {verses.map((v, idx) => {
            const displayBadge = getDisplayVerseBadge(v.verseNumber, idx, verses);
            return (
              <span key={idx} className="scripture-verse-span">
                {displayBadge && (
                  <sup
                    className="scripture-verse-sup"
                    title={`Verse ${v.verseNumber}`}
                  >
                    {displayBadge}
                  </sup>
                )}
                <span className="scripture-verse-text">{v.text}</span>
                {' '}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="scripture-list-view">
          {verses.map((v, idx) => (
            <div key={idx} className="scripture-list-row">
              <div className="scripture-list-gutter">
                <span className="scripture-list-badge">
                  {v.verseNumber || idx + 1}
                </span>
              </div>
              <div className="scripture-list-body">
                <div className="scripture-list-text">{v.text}</div>
              </div>
              <button
                type="button"
                className="scripture-verse-copy-btn"
                onClick={() => handleCopyVerse(v.verseNumber, v.text)}
                title="Copy verse"
                aria-label={`Copy verse ${v.verseNumber}`}
              >
                {copiedVerse === v.verseNumber ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScriptureViewer;
