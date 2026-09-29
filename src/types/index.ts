export type CardStatus = 'new' | 'learning' | 'unsure' | 'mastered';

export type Rating = 'again' | 'hard' | 'good';

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  status: CardStatus;
  repetition: number;
  interval: number; // in days
  easeFactor: number; // default 2.5
  nextReviewDate: string; // ISO string YYYY-MM-DD
  lastReviewed?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Deck {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  colorTheme: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeckStats {
  total: number;
  newCount: number;
  learningCount: number;
  unsureCount: number;
  masteredCount: number;
  dueCount: number;
  masteryPercentage: number;
}

export interface GeneratedCardDraft {
  front: string;
  back: string;
  hint?: string;
  selected?: boolean;
}
