import React from 'react';
import { Subject, Deck, Flashcard } from '../types';
import { calculateDeckStats, isCardDue } from '../lib/spacedRepetition';
import { ProgressBar } from './ProgressBar';
import { Plus, ArrowLeft, Play, Edit2, Trash2, SlidersHorizontal } from 'lucide-react';

interface SubjectViewProps {
  subject: Subject;
  decks: Deck[];
  cards: Flashcard[];
  onBack: () => void;
  onSelectDeck: (deckId: string) => void;
  onOpenCreateDeck: () => void;
  onStartStudyDeck: (deckId: string) => void;
  onOpenAddCards: (deckId: string) => void;
  onEditSubject: () => void;
  onDeleteSubject: () => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subject,
  decks,
  cards,
  onBack,
  onSelectDeck,
  onOpenCreateDeck,
  onStartStudyDeck,
  onOpenAddCards,
  onEditSubject,
  onDeleteSubject,
  onEditDeck,
  onDeleteDeck,
}) => {
  const subjectCards = cards.filter((c) => decks.some((d) => d.id === c.deckId));
  const overallStats = calculateDeckStats(subjectCards);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb & Subject Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Alle Fächer</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onEditSubject}
            className="text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            Fach bearbeiten
          </button>
          <span className="text-stone-300">·</span>
          <button
            onClick={() => {
              if (
                confirm(
                  `Möchtest du das Fach "${subject.title}" und alle darin enthaltenen Stapel und Karten wirklich löschen?`
                )
              ) {
                onDeleteSubject();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
          >
            Löschen
          </button>
        </div>
      </div>

      {/* Subject Header & Progress Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl text-stone-900 font-normal">
              {subject.title}
            </h1>
            {subject.description && (
              <p className="text-stone-500 text-xs mt-1 max-w-xl leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>

          <button
            onClick={onOpenCreateDeck}
            className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Neuer Stapel</span>
          </button>
        </div>

        {/* Aggregate Progress Bar for this Subject */}
        <div className="pt-2 border-t border-stone-200/60">
          <ProgressBar stats={overallStats} size="md" showLegend={true} />
        </div>
      </div>

      {/* Boxenansicht (Grid of Deck Boxes) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Karteikartenstapel ({decks.length})
          </h2>
        </div>

        {decks.length === 0 ? (
          <div className="bg-white border border-stone-200/70 rounded-xl p-10 text-center">
            <p className="text-xs text-stone-500 mb-3">
              Noch keine Stapel in diesem Fach angelegt.
            </p>
            <button
              onClick={onOpenCreateDeck}
              className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 cursor-pointer"
            >
              Ersten Stapel anlegen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => {
              const deckCards = cards.filter((c) => c.deckId === deck.id);
              const stats = calculateDeckStats(deckCards);
              const dueCards = deckCards.filter(isCardDue);

              return (
                <div
                  key={deck.id}
                  className="bg-white border border-stone-200/80 rounded-xl p-5 hover:border-stone-400/90 transition-all hover:shadow-xs flex flex-col justify-between group"
                >
                  {/* Top content of Box */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <button
                        onClick={() => onSelectDeck(deck.id)}
                        className="text-left font-serif-display text-base text-stone-900 font-normal hover:text-stone-700 transition-colors cursor-pointer"
                      >
                        {deck.title}
                      </button>

                      {dueCards.length > 0 && (
                        <span className="text-[11px] font-semibold text-amber-700 tabular-nums shrink-0">
                          {dueCards.length} fällig
                        </span>
                      )}
                    </div>

                    {deck.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                        {deck.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom section of Box: Progress & Actions */}
                  <div className="space-y-3 pt-3 border-t border-stone-100 mt-2">
                    <ProgressBar stats={stats} size="sm" showLegend={false} />

                    <div className="flex items-center justify-between text-[11px] text-stone-500 tabular-nums">
                      <span>{deckCards.length} Karten · {stats.masteryPercentage}% beherrscht</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {deckCards.length > 0 && (
                          <button
                            onClick={() => onStartStudyDeck(deck.id)}
                            className="px-2.5 py-1 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Lernen</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenAddCards(deck.id)}
                          className="px-2 py-1 text-xs text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="Karte hinzufügen"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Karte</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-stone-400">
                        <button
                          onClick={() => onSelectDeck(deck.id)}
                          className="p-1 hover:text-stone-800 rounded transition-colors cursor-pointer"
                          title="Karten verwalten"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditDeck(deck)}
                          className="p-1 hover:text-stone-800 rounded transition-colors cursor-pointer"
                          title="Stapel bearbeiten"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Stapel "${deck.title}" löschen?`)) {
                              onDeleteDeck(deck.id);
                            }
                          }}
                          className="p-1 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Stapel löschen"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
