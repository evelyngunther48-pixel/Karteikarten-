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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Overview & Global Progress Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl text-stone-900 font-normal">
              Deine Fächer
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Wähle ein Fach, um seine Karteikartenstapel zu öffnen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {dueCardsTotal > 0 && (
              <button
                onClick={onStartDueSession}
                className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Heute {dueCardsTotal} fällig · Lernen</span>
              </button>
            )}

            <button
              onClick={onOpenCreateSubject}
              className="px-3.5 py-1.5 bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:border-stone-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fach anlegen</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="pt-2 border-t border-stone-200/60">
          <ProgressBar stats={globalStats} size="md" showLegend={true} />
        </div>
      </div>

      {/* Boxenansicht (Grid of Subject Boxes) */}
      <div>
        {subjects.length === 0 ? (
          <div className="bg-white border border-stone-200/70 rounded-xl p-12 text-center">
            <Layers className="w-7 h-7 text-stone-400 mx-auto mb-2.5" />
            <h3 className="font-serif-display text-base text-stone-800 mb-1">
              Noch keine Fächer angelegt
            </h3>
            <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
              Erstelle dein erstes Fach, um Karteikartenstapel anzulegen.
            </p>
            <button
              onClick={onOpenCreateSubject}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 cursor-pointer"
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
                  className="bg-white border border-stone-200/80 rounded-xl p-5 hover:border-stone-400 transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            subject.colorTheme === 'amber'
                              ? 'bg-amber-600'
                              : subject.colorTheme === 'terracotta'
                              ? 'bg-rose-600'
                              : subject.colorTheme === 'stone'
                              ? 'bg-stone-600'
                              : subject.colorTheme === 'slate'
                              ? 'bg-slate-600'
                              : 'bg-emerald-600'
                          }`}
                        />
                        <h3 className="font-serif-display text-base text-stone-900 font-normal group-hover:text-stone-700 transition-colors">
                          {subject.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors shrink-0" />
                    </div>

                    {subject.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                        {subject.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-stone-100 mt-2">
                    {/* Segmented Progress Bar */}
                    <ProgressBar stats={stats} size="sm" showLegend={false} />

                    <div className="flex items-center justify-between text-[11px] text-stone-500 tabular-nums">
                      <span>
                        {subjectDecks.length} {subjectDecks.length === 1 ? 'Stapel' : 'Stapel'} · {subjectCards.length} Karten
                      </span>

                      {dueInSubject > 0 ? (
                        <span className="font-medium text-amber-700">
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
