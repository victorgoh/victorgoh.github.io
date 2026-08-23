import React from 'react';
import { Check } from 'lucide-react';

type ItemEntry = {
  item: number;
  title: string;
};

interface SessionSelectorListProps {
  items: ItemEntry[];
  currentItem: number;
  completedItems: number[];
  onSelect: (item: number) => void;
  planType?: string;
}

// Forward ref to allow parent to scroll into view
const SessionSelectorList = React.forwardRef<HTMLDivElement, SessionSelectorListProps>(
  ({ items, currentItem, completedItems, onSelect }, ref) => {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="session-selector-list"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '4px',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
        }}
      >
        {items.map((entry) => {
          const isCompleted = completedItems.includes(entry.item);
          const isCurrent = entry.item === currentItem;
          return (
            <button
              key={entry.item}
              id={`session-selector-item-${entry.item}`}
              onClick={() => onSelect(entry.item)}
              className={`session-selector-row ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: isCurrent ? '1px solid var(--primary)' : '1px solid transparent',
                background: isCurrent ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                color: 'inherit',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              {/* Left Number / Checkmark Badge */}
              <div
                className={`circle-indicator ${isCompleted ? 'completed' : ''}`}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isCompleted ? 'none' : isCurrent ? '2px solid var(--primary)' : '2px solid var(--border-glass)',
                  background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  color: isCompleted || isCurrent ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                }}
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : entry.item}
              </div>

              {/* Title Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: isCurrent ? 600 : 500,
                    color: isCurrent ? 'var(--primary)' : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {entry.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

SessionSelectorList.displayName = 'SessionSelectorList';
export default SessionSelectorList;
