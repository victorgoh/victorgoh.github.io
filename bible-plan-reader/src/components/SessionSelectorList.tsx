import React from 'react';
import { Check, Flame, FileText } from 'lucide-react';


type SessionItem = {
  item: number;
  title: string;
};

interface SessionSelectorListProps {
  items: SessionItem[];
  currentItem: number;
  completedItems: number[];
  onSelect: (item: number) => void;
  planType: 'reading' | 'prayer' | 'reading_plan' | 'prayer_guide';
}

// Forward ref to allow parent to scroll into view if needed
const SessionSelectorList = React.forwardRef<HTMLDivElement, SessionSelectorListProps>(
  ({ items, currentItem, completedItems, onSelect, planType }, ref) => {
    const isPrayer = planType === 'prayer' || planType === 'prayer_guide';
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
        {items.map((day) => {
          const isCompleted = completedItems.includes(day.item);
          const isCurrent = day.item === currentItem;
          return (
            <button
              key={day.item}
              id={`session-selector-item-${day.item}`}
              onClick={() => onSelect(day.item)}
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
              {/* Left Circle Indicator */}
              <div
                className={`circle-indicator ${isCompleted ? 'completed' : ''}`}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: isCompleted ? 'none' : '2px solid var(--text-muted)',
                  background: isCompleted ? 'var(--success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.65rem',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  transition: 'all 0.15s ease',
                }}
              >
                {isCompleted && <Check size={12} strokeWidth={3} />}
              </div>

              {/* Text Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isPrayer ? <Flame size={12} /> : <FileText size={12} />}<span>{`Session ${day.item}`}</span>
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 600 : 500,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {day.title}
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
