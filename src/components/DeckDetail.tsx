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
          className="inline-flex items-center gap-1.5 text-xs text-[#756E65] hover:text-[#2A2723] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Zurück zu {subject.title}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-[#878077] hover:text-[#2A2723] rounded transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-[#FFFFFF] border border-[#E6E1D7] rounded-lg shadow-sm py-1 z-20 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEditDeck();
                }}
                className="w-full text-left px-3 py-1.5 text-[#3D3730] hover:bg-[#FAF8F5] flex items-center gap-2"
              >
                <Edit className="w-3.5 h-3.5 text-[#878077]" />
                <span>Stapel bearbeiten</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm('Lernfortschritt für diesen Stapel auf Neu zurücksetzen?')) {
                    onResetProgress();
                  }
                }}
                className="w-full text-left px-3 py-1.5 text-[#3D3730] hover:bg-[#FAF8F5] flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#878077]" />
                <span>Fortschritt zurücksetzen</span>
              </button>
              <div className="h-px bg-[#EFEBE4] my-1" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm(`Stapel "${deck.title}" löschen?`)) {
                    onDeleteDeck();
                  }
                }}
                className="w-full text-left px-3 py-1.5 text-[#A05646] hover:bg-[#FAF3F1] flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#A05646]" />
                <span>Stapel löschen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Deck Overview */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#878077] block mb-1">
            {subject.title}
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-[#2A2723] font-normal">
            {deck.title}
          </h1>
          {deck.description && (
            <p className="text-xs text-[#756E65] mt-1.5 max-w-xl leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-[#E7E2D8]">
          <ProgressBar stats={stats} size="md" showLegend={true} />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {cards.length > 0 ? (
              <>
                <button
                  onClick={() => onStartStudy(dueCards.length > 0)}
                  className="px-4 py-2 bg-[#2A2723] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#1C1A18] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current text-[#D4CDC2]" />
                  <span>
                    {dueCards.length > 0
                      ? `Heute lernen (${dueCards.length} fällig)`
                      : 'Alle Karten lernen'}
                  </span>
                </button>

                {dueCards.length > 0 && dueCards.length < cards.length && (
                  <button
                    onClick={() => onStartStudy(false)}
                    className="px-3 py-2 text-[#756E65] hover:text-[#2A2723] text-xs font-medium transition-colors cursor-pointer"
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
              className="px-3 py-1.5 text-xs font-medium text-[#3D3730] bg-[#FFFFFF] border border-[#E4DED3] hover:border-[#CAC0B2] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#756E65]" />
              <span>Karten hinzufügen</span>
            </button>

            <button
              onClick={onOpenManageCards}
              className="px-3 py-1.5 text-xs font-medium text-[#756E65] hover:text-[#2A2723] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Verwalten ({cards.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Preview Grid */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#635C54]">
            Kartenübersicht ({cards.length})
          </h2>
          {cards.length > 0 && (
            <button
              onClick={onOpenManageCards}
              className="text-xs text-[#756E65] hover:text-[#2A2723]"
            >
              Alle bearbeiten
            </button>
          )}
        </div>

        {cards.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-8 text-center">
            <p className="text-xs text-[#756E65] mb-3">
              Dieser Stapel hat noch keine Karten.
            </p>
            <button
              onClick={onOpenAddCards}
              className="px-3.5 py-1.5 bg-[#2A2723] text-[#FAF8F5] rounded-lg text-xs font-medium hover:bg-[#1C1A18]"
            >
              Karte erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.slice(0, 6).map((card) => (
              <div
                key={card.id}
                className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-4 transition-all hover:border-[#C8BFB0]"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span
                    className={
                      card.status === 'mastered'
                        ? 'text-[#526654] font-medium'
                        : card.status === 'unsure'
                        ? 'text-[#B08244] font-medium'
                        : card.status === 'learning'
                        ? 'text-[#A05646] font-medium'
                        : 'text-[#878077]'
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
                    <span className="text-[#878077] tabular-nums">
                      {card.interval}d
                    </span>
                  )}
                </div>
                <h3 className="font-serif-display text-sm font-normal text-[#2A2723] line-clamp-2 mb-1">
                  {card.front}
                </h3>
                <p className="text-xs text-[#756E65] line-clamp-2 leading-relaxed">
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
