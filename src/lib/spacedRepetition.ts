import { Flashcard, Rating, DeckStats, CardStatus } from '../types';

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Adds days to a date string (YYYY-MM-DD)
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Checks whether a card is due for review today or overdue
 */
export function isCardDue(card: Flashcard): boolean {
  if (card.status === 'new') return true;
  const today = getTodayDateString();
  return card.nextReviewDate <= today;
}

/**
 * Computes Spaced Repetition update according to SM-2 variant
 * tailored for the user's 3 states:
 * - 'again' ("Wusste ich nicht")
 * - 'hard' ("Unsicher")
 * - 'good' ("Kann ich schon")
 */
export function calculateNextReview(card: Flashcard, rating: Rating): Partial<Flashcard> {
  const today = getTodayDateString();
  let repetition = card.repetition || 0;
  let interval = card.interval || 0;
  let easeFactor = card.easeFactor || 2.5;
  let status: CardStatus = card.status;

  if (rating === 'again') {
    // "Wusste ich nicht" -> Restart learning cycle
    repetition = 0;
    interval = 1; // Repeat tomorrow (or today in review session)
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    status = 'learning';
  } else if (rating === 'hard') {
    // "Unsicher" -> Moderate progress, shorter interval
    if (repetition === 0) {
      interval = 1;
      repetition = 1;
    } else {
      interval = Math.max(1, Math.round(interval * 1.2));
    }
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    status = 'unsure';
  } else if (rating === 'good') {
    // "Kann ich schon" -> Mastered / progressive intervals
    if (repetition === 0) {
      interval = 1;
      repetition = 1;
    } else if (repetition === 1) {
      interval = 3;
      repetition = 2;
    } else {
      interval = Math.max(4, Math.round(interval * easeFactor));
      repetition += 1;
    }
    easeFactor = Math.min(3.0, easeFactor + 0.1);
    status = 'mastered';
  }

  const nextReviewDate = addDaysToDate(today, interval);

  return {
    status,
    repetition,
    interval,
    easeFactor,
    nextReviewDate,
    lastReviewed: today,
    updatedAt: Date.now(),
  };
}

/**
 * Calculates detailed statistics for any list of flashcards
 */
export function calculateDeckStats(cards: Flashcard[]): DeckStats {
  const total = cards.length;
  if (total === 0) {
    return {
      total: 0,
      newCount: 0,
      learningCount: 0,
      unsureCount: 0,
      masteredCount: 0,
      dueCount: 0,
      masteryPercentage: 0,
    };
  }

  let newCount = 0;
  let learningCount = 0;
  let unsureCount = 0;
  let masteredCount = 0;
  let dueCount = 0;

  for (const card of cards) {
    if (card.status === 'new') {
      newCount++;
    } else if (card.status === 'learning') {
      learningCount++;
    } else if (card.status === 'unsure') {
      unsureCount++;
    } else if (card.status === 'mastered') {
      masteredCount++;
    }

    if (isCardDue(card)) {
      dueCount++;
    }
  }

  const masteryPercentage = Math.round((masteredCount / total) * 100);

  return {
    total,
    newCount,
    learningCount,
    unsureCount,
    masteredCount,
    dueCount,
    masteryPercentage,
  };
}
