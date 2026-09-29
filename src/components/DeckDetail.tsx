import React, { useState } from 'react';
import { Deck, Subject, Flashcard } from '../types';
import { calculateDeckStats, isCardDue } from '../lib/spacedRepetition';
import { ProgressBar } from './ProgressBar';
import { Play, Plus, SlidersHorizontal, ArrowLeft, MoreHorizontal, RotateCcw, Edit, Trash2 } from 'lucide-react';

interface DeckDetailProps {
  deck: Deck;
  subject: Subject;
  cards: Flashcard[];
  onBack: () => void;
  onStartStudy: (dueOnly: boolean) => void;
  onOpenAddCards: () => void;
  onOpenManageCards: () => void;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
  onResetProgress: () => void;
}

export const DeckDetail: React.FC<DeckDetailProps> = ({
  deck,
  subject,
  cards,
  onBack,
  onStartStudy,
  onOpenAddCards,
  onOpenManageCards,
  onEditDeck,
  onDeleteDeck,
  onResetProgress,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const stats = calculateDeckStats(cards);
  const dueCards = cards.filter(isCardDue);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Breadcrumb Navigation & Options */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Zurück zu {subject.title}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-stone-400 hover:text-stone-800 rounded transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-stone-200 rounded-lg shadow-sm py-1 z-20 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEditDeck();
                }}
                className="w-full text-left px-3 py-1.5 text-stone-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <Edit className="w-3.5 h-3.5 text-stone-400" />
                <span>Stapel bearbeiten</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm('Lernfortschritt für diesen Stapel auf Neu zurücksetzen?')) {
                    onResetProgress();
                  }
                }}
                className="w-full text-left px-3 py-1.5 text-stone-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>Fortschritt zurücksetzen</span>
              </button>
              <div className="h-px bg-stone-100 my-1" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm(`Stapel "${deck.title}" löschen?`)) {
                    onDeleteDeck();
                  }
                }}
                className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Stapel löschen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Deck Overview */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-600 block mb-1">
            {subject.title}
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-stone-900 font-normal">
            {deck.title}
          </h1>
          {deck.description && (
            <p className="text-xs text-stone-500 mt-1.5 max-w-xl leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-stone-200/60">
          <ProgressBar stats={stats} size="md" showLegend={true} />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {cards.length > 0 ? (
              <>
                <button
                  onClick={() => onStartStudy(dueCards.length > 0)}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {dueCards.length > 0
                      ? `Heute lernen (${dueCards.length} fällig)`
                      : 'Alle Karten lernen'}
                  </span>
                </button>

                {dueCards.length > 0 && dueCards.length < cards.length && (
                  <button
                    onClick={() => onStartStudy(false)}
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Alle {cards.length} üben
                  </button>
                )}
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddCards}
              className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-200 hover:border-stone-400 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-stone-500" />
              <span>Karten hinzufügen</span>
            </button>

            <button
              onClick={onOpenManageCards}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Verwalten ({cards.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Preview */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Kartenübersicht ({cards.length})
          </h2>
          {cards.length > 0 && (
            <button
              onClick={onOpenManageCards}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Alle bearbeiten
            </button>
          )}
        </div>

        {cards.length === 0 ? (
          <div className="bg-white border border-stone-200/70 rounded-xl p-8 text-center">
            <p className="text-xs text-stone-500 mb-3">
              Dieser Stapel hat noch keine Karten.
            </p>
            <button
              onClick={onOpenAddCards}
              className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800"
            >
              Karte erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.slice(0, 6).map((card) => (
              <div
                key={card.id}
                className="bg-white border border-stone-200/70 rounded-xl p-4 transition-all hover:border-stone-300"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span
                    className={
                      card.status === 'mastered'
                        ? 'text-emerald-700 font-medium'
                        : card.status === 'unsure'
                        ? 'text-amber-700 font-medium'
                        : card.status === 'learning'
                        ? 'text-rose-700 font-medium'
                        : 'text-stone-600'
                    }
                  >
                    {card.status === 'mastered'
                      ? '● Gekonnt'
                      : card.status === 'unsure'
                      ? '● Unsicher'
                      : card.status === 'learning'
                      ? '● Wiederholen'
                      : '● Neu'}
                  </span>
                  {card.interval > 0 && (
                    <span className="text-stone-600 tabular-nums">
                      {card.interval}d
                    </span>
                  )}
                </div>
                <h3 className="font-serif-display text-sm font-normal text-stone-900 line-clamp-2 mb-1">
                  {card.front}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {card.back}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
