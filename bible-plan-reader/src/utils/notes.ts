// Utility functions for handling user notes in localStorage
import type { UserNotes } from '../types';

export const loadNotesForPlan = (planId: string): Record<number, string> => {
  try {
    const item = localStorage.getItem(`user_notes_${planId}`);
    return item ? JSON.parse(item) : {};
  } catch (e) {
    return {};
  }
};

export const saveNoteForItem = (planId: string, itemNumber: number, note: string) => {
  try {
    const allNotes = loadNotesForPlan(planId);
    const updatedNotes = { ...allNotes, [itemNumber]: note };
    localStorage.setItem(`user_notes_${planId}`, JSON.stringify(updatedNotes));
  } catch (e) {
    // Silently fail to avoid breaking the app
    console.warn('Failed to save note to localStorage', e);
  }
};

export const clearNoteForItem = (planId: string, itemNumber: number) => {
  try {
    const allNotes = loadNotesForPlan(planId);
    delete allNotes[itemNumber];
    localStorage.setItem(`user_notes_${planId}`, JSON.stringify(allNotes));
  } catch (e) {
    // Silently fail to avoid breaking the app
    console.warn('Failed to clear note from localStorage', e);
  }
};