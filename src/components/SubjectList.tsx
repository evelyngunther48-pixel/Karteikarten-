import React from 'react';
import { Subject, Deck, Flashcard } from '../types';
import { calculateDeckStats, isCardDue } from '../lib/spacedRepetition';
import { ProgressBar } from './ProgressBar';
import { Plus, Play, ChevronRight, Layers } from 'lucide-react';

interface SubjectListProps {
  subjects: Subject[];
  decks: Deck[];
  cards: Flashcard[];
  onSelectSubject: (subjectId: string) => void;
  onOpenCreateSubject: () => void;
  onStartDueSession: () => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  decks,
  cards,
  onSelectSubject,
  onOpenCreateSubject,
  onStartDueSession,
}) => {
  const globalStats = calculateDeckStats(cards);
  const dueCardsTotal = cards.filter(isCardDue).length;

  const getThemeDotColor = (theme: string) => {
    switch (theme) {
      case 'amber':
        return 'bg-[#B08244]';
      case 'terracotta':
        return 'bg-[#A05646]';
      case 'stone':
        return 'bg-[#786E63]';
      case 'slate':
        return 'bg-[#57636B]';
      default:
        return 'bg-[#526654]';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Overview & Global Progress Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl text-[#2A2723] font-normal">
              Deine Fächer
            </h1>
            <p className="text-xs text-[#756E65] mt-0.5">
              Wähle ein Fach, um seine Karteikartenstapel zu öffnen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {dueCardsTotal > 0 && (
              <button
                onClick={onStartDueSession}
                className="px-3.5 py-1.5 bg-[#2A2723] text-[#FAF8F5] rounded-lg text-xs font-medium hover:bg-[#1C1A18] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3 h-3 fill-current text-[#D4CDC2]" />
                <span>Heute {dueCardsTotal} fällig · Lernen</span>
              </button>
            )}

            <button
              onClick={onOpenCreateSubject}
              className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E4DED3] text-[#463F37] hover:text-[#1C1A18] hover:border-[#CAC0B2] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#756E65]" />
              <span>Fach anlegen</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-2 border-t border-[#E7E2D8]">
          <ProgressBar stats={globalStats} size="md" showLegend={true} />
        </div>
      </div>

      {/* Boxenansicht (Grid of Subject Boxes) */}
      <div>
        {subjects.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl p-12 text-center">
            <Layers className="w-7 h-7 text-[#A0998E] mx-auto mb-2.5" />
            <h3 className="font-serif-display text-base text-[#2A2723] mb-1">
              Noch keine Fächer angelegt
            </h3>
            <p className="text-xs text-[#756E65] mb-4 max-w-sm mx-auto">
              Erstelle dein erstes Fach, um Karteikartenstapel anzulegen.
            </p>
            <button
              onClick={onOpenCreateSubject}
              className="px-4 py-2 bg-[#2A2723] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#1C1A18] cursor-pointer"
            >
              Erstes Fach anlegen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const subjectDecks = decks.filter((d) => d.subjectId === subject.id);
              const subjectCards = cards.filter((c) =>
                subjectDecks.some((d) => d.id === c.deckId)
              );
              const stats = calculateDeckStats(subjectCards);
              const dueInSubject = subjectCards.filter(isCardDue).length;

              return (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject.id)}
                  className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-5 hover:border-[#C8BFB0] hover:bg-[#FDFBF8] transition-all hover:shadow-2xs cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${getThemeDotColor(
                            subject.colorTheme
                          )}`}
                        />
                        <h3 className="font-serif-display text-base text-[#2A2723] font-normal group-hover:text-[#4A433C] transition-colors">
                          {subject.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#BFB7AA] group-hover:text-[#5E564E] transition-colors shrink-0" />
                    </div>

                    {subject.description && (
                      <p className="text-xs text-[#756E65] line-clamp-2 leading-relaxed mb-4">
                        {subject.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#EFEBE4] mt-2">
                    {/* Segmented Progress Bar */}
                    <ProgressBar stats={stats} size="sm" showLegend={false} />

                    <div className="flex items-center justify-between text-[11px] text-[#756E65] tabular-nums">
                      <span>
                        {subjectDecks.length} {subjectDecks.length === 1 ? 'Stapel' : 'Stapel'} · {subjectCards.length} Karten
                      </span>

                      {dueInSubject > 0 ? (
                        <span className="font-medium text-[#A05646]">
                          {dueInSubject} heute fällig
                        </span>
                      ) : (
                        <span>{stats.masteryPercentage}% beherrscht</span>
                      )}
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
