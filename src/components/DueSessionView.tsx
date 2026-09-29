import React from 'react';
import { Subject, Deck, Flashcard } from '../types';
import { isCardDue } from '../lib/spacedRepetition';
import { Play, Check } from 'lucide-react';

interface DueSessionViewProps {
  subjects: Subject[];
  decks: Deck[];
  cards: Flashcard[];
  onStartDueStudy: (deckId?: string) => void;
  onSelectDeck: (deckId: string) => void;
}

export const DueSessionView: React.FC<DueSessionViewProps> = ({
  subjects,
  decks,
  cards,
  onStartDueStudy,
  onSelectDeck,
}) => {
  const dueCards = cards.filter(isCardDue);

  const decksWithDue = decks
    .map((deck) => {
      const deckCards = cards.filter((c) => c.deckId === deck.id);
      const dueInDeck = deckCards.filter(isCardDue);
      const subject = subjects.find((s) => s.id === deck.subjectId);
      return {
        deck,
        subject,
        totalCards: deckCards.length,
        dueCards: dueInDeck,
      };
    })
    .filter((item) => item.dueCards.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-[#2A2723] font-normal">
            Heute fällige Wiederholungen
          </h1>
          <p className="text-xs text-[#756E65] mt-1">
            Optimale Wiederholungen nach Spaced Repetition.
          </p>
        </div>

        {dueCards.length > 0 && (
          <button
            onClick={() => onStartDueStudy()}
            className="px-4 py-2 bg-[#2A2723] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#1C1A18] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Play className="w-3 h-3 fill-current text-[#D4CDC2]" />
            <span>Alle {dueCards.length} fälligen Karten lernen</span>
          </button>
        )}
      </div>

      {dueCards.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-10 text-center">
          <div className="w-8 h-8 bg-[#F1F5F2] text-[#344D39] rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-4 h-4" />
          </div>
          <h3 className="font-serif-display text-lg text-[#2A2723] font-normal mb-1">
            Alles erledigt für heute
          </h3>
          <p className="text-xs text-[#756E65] max-w-sm mx-auto leading-relaxed">
            Keine Karten sind derzeit fällig. Du kannst jederzeit in die Fächeransicht wechseln und beliebige Stapel üben.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {decksWithDue.map(({ deck, subject, totalCards, dueCards }) => (
              <div
                key={deck.id}
                className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-4 flex flex-col justify-between hover:border-[#C8BFB0] transition-colors"
              >
                <div>
                  <div className="text-[11px] text-[#756E65] font-medium">
                    {subject?.title}
                  </div>
                  <h3 className="font-serif-display text-base text-[#2A2723] font-normal mt-0.5 mb-1">
                    {deck.title}
                  </h3>
                  <div className="text-xs text-[#756E65] mb-3">
                    <span className="font-medium text-[#A05646] tabular-nums">
                      {dueCards.length} fällig
                    </span>{' '}
                    von {totalCards} Karten
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#EFEBE4]">
                  <button
                    onClick={() => onStartDueStudy(deck.id)}
                    className="flex-1 py-1.5 bg-[#2A2723] text-[#FAF8F5] rounded-md text-xs font-medium hover:bg-[#1C1A18] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current text-[#D4CDC2]" />
                    <span>Lernen ({dueCards.length})</span>
                  </button>

                  <button
                    onClick={() => onSelectDeck(deck.id)}
                    className="px-2.5 py-1.5 text-[#463F37] hover:text-[#2A2723] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Öffnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
