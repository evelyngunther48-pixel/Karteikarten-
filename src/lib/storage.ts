import { Subject, Deck, Flashcard } from '../types';
import { DEFAULT_SUBJECTS, DEFAULT_DECKS, DEFAULT_CARDS } from './defaultData';

const SUBJECTS_KEY = 'memoria_subjects_v1';
const DECKS_KEY = 'memoria_decks_v1';
const CARDS_KEY = 'memoria_cards_v1';

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (!raw) {
      saveSubjects(DEFAULT_SUBJECTS);
      return DEFAULT_SUBJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load subjects', e);
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    if (!raw) {
      saveDecks(DEFAULT_DECKS);
      return DEFAULT_DECKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load decks', e);
    return DEFAULT_DECKS;
  }
}

export function saveDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save decks', e);
  }
}

export function loadCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (!raw) {
      saveCards(DEFAULT_CARDS);
      return DEFAULT_CARDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load cards', e);
    return DEFAULT_CARDS;
  }
}

export function saveCards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards', e);
  }
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(SUBJECTS_KEY);
  localStorage.removeItem(DECKS_KEY);
  localStorage.removeItem(CARDS_KEY);
}
