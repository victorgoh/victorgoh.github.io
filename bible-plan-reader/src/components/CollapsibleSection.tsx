import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleSectionProps {
  id: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  accentColor?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  badge,
  isOpen,
  onToggle,
  children,
  className = '',
  style,
  headerStyle,
  accentColor
}) => {
  return (
    <div
      id={`section-${id}`}
      className={`collapsible-section-card ${isOpen ? 'is-open' : 'is-collapsed'} ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: '14px',
        marginBottom: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
        ...style
      }}
    >
      {/* Header Bar */}
      <button
        type="button"
        id={`header-${id}`}
        aria-expanded={isOpen}
        aria-controls={`content-${id}`}
        onClick={onToggle}
        className="collapsible-header-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: isOpen ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--border-glass)' : '1px solid transparent',
          cursor: 'pointer',
          color: 'var(--text-main)',
          fontFamily: 'inherit',
          textAlign: 'left',
          gap: '12px',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          ...headerStyle
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          {icon && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor || 'var(--primary)',
                flexShrink: 0
              }}
            >
              {icon}
            </div>
          )}
          <span
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {title}
          </span>
          {badge && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isOpen ? 'var(--primary-light)' : 'rgba(128, 128, 128, 0.08)',
            color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
            flexShrink: 0
          }}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      {/* Accordion Body with smooth animation */}
      <div
        id={`content-${id}`}
        role="region"
        aria-labelledby={`header-${id}`}
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            minHeight: 0
          }}
        >
          <div style={{ padding: '16px 18px 20px 18px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CollapsibleSection;
