import type { ItemConfig } from '../types';

/**
 * Calculates estimated reading time based on standard average reading speed (200 words/min).
 * Counts devotional text, prayer topics/descriptions, reflection questions, practice steps,
 * and accounts for Scripture passages.
 */
export function calculateReadingTime(item: ItemConfig): number {
  if (!item) return 1;

  let text = `${item.title || ''} ${item.devotional?.content || ''} ${item.devotional?.author || ''}`;

  if (item.prayers && item.prayers.length > 0) {
    text += ' ' + item.prayers.map((p) => `${p.topic || ''} ${p.description || ''}`).join(' ');
  }

  if (item.reflect && item.reflect.length > 0) {
    text += ' ' + item.reflect.join(' ');
  }

  if (item.practice && item.practice.length > 0) {
    text += ' ' + item.practice.join(' ');
  }

  let wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Account for Scripture readings
  if (item.passages && item.passages.length > 0) {
    for (const p of item.passages) {
      if (p.text) {
        wordCount += p.text.trim().split(/\s+/).filter(Boolean).length;
      } else {
        // Average length of a biblical reading passage (~15-25 verses ≈ 350-450 words)
        wordCount += 350;
      }
    }
  }

  // 200 words per minute is standard reflective reading speed
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return minutes;
}
