import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Plan } from '../types';
import { 
  X, 
  Search, 
  Check, 
  BookOpen, 
  ChevronRight, 
  ListOrdered, 
  Sparkles, 
  Scroll, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { calculateReadingTime } from '../utils/readingTime';

interface TableOfContentsProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
  currentItem: number;
  completedItems: number[];
  onSelectItem: (itemNumber: number) => void;
  onToggleComplete?: (itemNumber: number, e: React.MouseEvent) => void;
}

type FilterTab = 'all' | 'remaining' | 'completed';

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  isOpen,
  onClose,
  plan,
  currentItem,
  completedItems,
  onSelectItem,
  onToggleComplete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-scroll to active item after a short delay for transition
      const timer = setTimeout(() => {
        if (activeItemRef.current) {
          activeItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 150);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const totalCount = plan.items.length;
  const completedCount = completedItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = useMemo(() => {
    return plan.items.filter((item) => {
      const isCompleted = completedItems.includes(item.item);
      if (filterTab === 'completed' && !isCompleted) return false;
      if (filterTab === 'remaining' && isCompleted) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNumber = String(item.item) === q || `day ${item.item}`.includes(q) || `session ${item.item}`.includes(q);
      const matchPassages = item.passages?.some((p) => p.reference.toLowerCase().includes(q));
      const matchDevotional = item.devotional?.content?.toLowerCase().includes(q) || item.devotional?.author?.toLowerCase().includes(q);
      const matchPrayers = item.prayers?.some((pr) => pr.topic?.toLowerCase().includes(q) || pr.description?.toLowerCase().includes(q));
      const matchReflect = item.reflect?.some((r) => r.toLowerCase().includes(q));

      return matchTitle || matchNumber || matchPassages || matchDevotional || matchPrayers || matchReflect;
    });
  }, [plan.items, completedItems, filterTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="toc-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      {/* Slide-over Panel */}
      <div
        className="toc-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--bg-app)',
          borderLeft: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid var(--border-glass)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ListOrdered size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                  Table of Contents
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {plan.title}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="toc-close-btn"
              aria-label="Close Table of Contents"
              style={{
                width: '42px',
                height: '42px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(128, 128, 128, 0.12)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <X size={28} strokeWidth={2.6} />
            </button>
          </div>

          {/* Progress Bar & Stats */}
          <div
            style={{
              background: 'rgba(128, 128, 128, 0.05)',
              borderRadius: '12px',
              padding: '10px 14px',
              border: '1px solid var(--border-glass)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.84rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {completedCount} of {totalCount} Completed
              </span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {progressPercent}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(128, 128, 128, 0.15)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'var(--primary)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions, scriptures, topics..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterTab === 'all' ? 'var(--primary)' : 'var(--border-glass)',
                background: filterTab === 'all' ? 'var(--primary-light)' : 'transparent',
                color: filterTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('remaining')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterTab === 'remaining' ? 'var(--primary)' : 'var(--border-glass)',
                background: filterTab === 'remaining' ? 'var(--primary-light)' : 'transparent',
                color: filterTab === 'remaining' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Remaining ({totalCount - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('completed')}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: filterTab === 'completed' ? 'var(--primary)' : 'var(--border-glass)',
                background: filterTab === 'completed' ? 'var(--primary-light)' : 'transparent',
                color: filterTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div
          ref={listContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            scrollbarWidth: 'thin'
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.92rem'
              }}
            >
              No sessions found matching your criteria.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isCompleted = completedItems.includes(item.item);
              const isCurrent = item.item === currentItem;

              return (
                <button
                  key={item.item}
                  ref={isCurrent ? activeItemRef : null}
                  type="button"
                  onClick={() => {
                    onSelectItem(item.item);
                    onClose();
                  }}
                  className={`toc-session-card ${isCurrent ? 'is-current' : ''} ${isCompleted ? 'is-completed' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border-glass)',
                    background: isCurrent ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    position: 'relative'
                  }}
                >
                  {/* Status Indicator / Checkbox */}
                  <div
                    onClick={(e) => {
                      if (onToggleComplete) {
                        e.stopPropagation();
                        onToggleComplete(item.item, e);
                      }
                    }}
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: isCompleted
                        ? 'none'
                        : isCurrent
                        ? '2px solid var(--primary)'
                        : '2px solid var(--border-glass)',
                      background: isCompleted
                        ? 'var(--success)'
                        : isCurrent
                        ? 'var(--primary)'
                        : 'rgba(128, 128, 128, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.8rem',
                      color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 700,
                      marginTop: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : item.item}
                  </div>

                  {/* Content Column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {plan.type === 'prayer' || plan.type === 'prayer_guide' ? 'Session' : 'Day'} {item.item}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            fontWeight: 700,
                            letterSpacing: '0.04em'
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                      {isCompleted && !isCurrent && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: 'var(--success)',
                            fontWeight: 600
                          }}
                        >
                          Completed
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.98rem',
                        fontWeight: isCurrent ? 700 : 600,
                        color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                        lineHeight: 1.35,
                        marginBottom: '6px'
                      }}
                    >
                      {item.title}
                    </div>

                    {/* Meta tags: Scripture references, devotional author, etc. */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      {item.passages && item.passages.length > 0 && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(128, 128, 128, 0.08)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <Scroll size={12} />
                          {item.passages.map((p) => p.reference).join(', ')}
                        </span>
                      )}

                      {item.devotional?.author && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(128, 128, 128, 0.08)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          <BookOpen size={12} />
                          {item.devotional.author}
                        </span>
                      )}

                      {item.reflect && item.reflect.length > 0 && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background: 'rgba(128, 128, 128, 0.08)',
                            color: 'var(--text-muted)'
                          }}
                          title={`${item.reflect.length} Reflection questions`}
                        >
                          <MessageSquare size={12} />
                          {item.reflect.length}Q
                        </span>
                      )}

                      {/* Estimated Reading Time */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.76rem',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: 'rgba(128, 128, 128, 0.08)',
                          color: 'var(--text-muted)'
                        }}
                        title={`Estimated reading time: ~${calculateReadingTime(item)} min`}
                      >
                        <Clock size={11} />
                        {calculateReadingTime(item)} min
                      </span>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <ChevronRight
                    size={18}
                    style={{
                      color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                      flexShrink: 0,
                      alignSelf: 'center',
                      opacity: isCurrent ? 1 : 0.6
                    }}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Jump to Current */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-glass)',
            background: 'var(--bg-card)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              onSelectItem(currentItem);
              onClose();
            }}
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} /> Jump to Current (Day {currentItem})
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
export default TableOfContents;
