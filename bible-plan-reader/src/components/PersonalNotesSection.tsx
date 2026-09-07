import React, { useState, useEffect } from 'react';
import { loadNotesForPlan, saveNoteForItem, clearNoteForItem } from '../utils/notes';
import type { Plan } from '../types';
import { Share2 } from 'lucide-react';

interface PersonalNotesSectionProps {
  plan: Plan;
  currentItem: number;
  isOpen: boolean;
  onToggle: () => void;
  isDimmed?: boolean;
  onShareNote?: (note: string) => void;
}

const PersonalNotesSection: React.FC<PersonalNotesSectionProps> = ({
  plan,
  currentItem,
  isOpen,
  onToggle,
  onShareNote
}) => {
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [noteCount, setNoteCount] = useState<number>(0);

  // Load note when component mounts or plan/item changes
  useEffect(() => {
    const loadedNotes = loadNotesForPlan(plan.id);
    const loadedNote = loadedNotes[currentItem] || '';
    setNote(loadedNote);
    setNoteCount(loadedNote.length);
  }, [plan.id, currentItem]);

  // Auto-save when note changes (with debounce)
  useEffect(() => {
    if (!note) {
      return;
    }

    const timer = setTimeout(() => {
      setIsSaving(true);
      setSaveStatus('saving');
      
      saveNoteForItem(plan.id, currentItem, note);
      
      setSaveStatus('saved');
      setIsSaving(false);
      
      // Reset save status after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [note, plan.id, currentItem]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    setNoteCount(newNote.length);
  };

  const handleClearNote = () => {
    setNote('');
    setNoteCount(0);
    clearNoteForItem(plan.id, currentItem);
  };

  const handleShareNote = () => {
    if (onShareNote && note.trim()) {
      onShareNote(note);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent default behavior for Ctrl+S and Cmd+S to avoid page save modal
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      // Do nothing - auto-save is already handled
    }
  };

  return (
    <div className="collapsible-section" style={{ marginTop: '16px' }}>
      <div 
        className="collapsible-header"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '10px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>📝</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Personal Note
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {note ? 'Tap to edit your note' : 'Add personal reflection or insight'}
          </p>
        </div>
        <span style={{ 
          fontSize: '0.8rem', 
          padding: '4px 8px',
          background: note ? 'var(--accent)' : 'var(--bg-app)',
          borderRadius: '6px',
          color: note ? 'var(--bg-app)' : 'var(--text-muted)'
        }}>
          {noteCount}/2000
        </span>
      </div>

      {isOpen && (
        <div 
          className="collapsible-content"
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-glass)',
            background: 'var(--bg-app)'
          }}
        >
          <textarea
            value={note}
            onChange={handleNoteChange}
            onKeyDown={handleKeyDown}
            placeholder="Add your personal reflections, insights, or prayer points here..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            maxLength={2000}
          />
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '12px',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isSaving ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span className="loader-small" style={{ width: '12px', height: '12px' }}></span>
                  Saving...
                </span>
              ) : saveStatus === 'saved' ? (
                <span style={{ color: 'var(--success)' }}>Saved!</span>
              ) : null}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Share Note button */}
              <button
                onClick={handleShareNote}
                disabled={!note.trim()}
                title="Share your note with the lesson link"
                aria-label="Share note"
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-glass)',
                  background: note.trim() ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: note.trim() ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: note.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: note.trim() ? 600 : 400
                }}
              >
                <Share2 size={13} />
                Share Note
              </button>

              {/* Clear Note button */}
              <button
                onClick={handleClearNote}
                disabled={!note.trim()}
                title="Clear this note"
                aria-label="Clear note"
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-glass)',
                  background: 'var(--bg-card)',
                  color: note.trim() ? 'var(--danger)' : 'var(--text-muted)',
                  cursor: note.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                Clear Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalNotesSection;