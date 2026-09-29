import React from 'react';
import { Subject, Deck, Flashcard } from '../types';
import { calculateDeckStats, getTodayDateString, addDaysToDate } from '../lib/spacedRepetition';
import { ProgressBar } from './ProgressBar';
import { Download, Upload } from 'lucide-react';

interface StatisticsViewProps {
  subjects: Subject[];
  decks: Deck[];
  cards: Flashcard[];
  onImportBackup: (data: { subjects: Subject[]; decks: Deck[]; cards: Flashcard[] }) => void;
  onResetAllData: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  subjects,
  decks,
  cards,
  onImportBackup,
  onResetAllData,
}) => {
  const globalStats = calculateDeckStats(cards);
  const today = getTodayDateString();

  const scheduleDays = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
    const targetDate = addDaysToDate(today, dayOffset);
    const count = cards.filter((c) => c.nextReviewDate === targetDate).length;
    const label =
      dayOffset === 0
        ? 'Heute'
        : dayOffset === 1
        ? 'Morgen'
        : new Date(targetDate).toLocaleDateString('de-DE', { weekday: 'short' });
    return { label, count, date: targetDate };
  });

  const handleExportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      subjects,
      decks,
      cards,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoria_backup_${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.subjects && parsed.decks && parsed.cards) {
          onImportBackup(parsed);
          alert('Backup erfolgreich geladen!');
        } else {
          alert('Ungültiges Backup.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der Datei.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div>
        <h1 className="font-serif-display text-2xl sm:text-3xl text-[#2A2723] font-normal">
          Lernfortschritt
        </h1>
        <p className="text-xs text-[#756E65] mt-1">
          Gesamtübersicht deiner Spaced-Repetition-Intervalle.
        </p>
      </div>

      {/* Global Mastery Card */}
      <div className="space-y-4">
        <div className="pt-2 border-t border-[#E7E2D8]">
          <ProgressBar stats={globalStats} size="md" showLegend={true} />
        </div>

        {/* Breakdown Metric Tiles in Earth Tones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E6E1D7]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#756E65] mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#526654]" />
              <span>Gewusst</span>
            </div>
            <div className="text-xl font-semibold text-[#344D39] tabular-nums">
              {globalStats.masteredCount}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E6E1D7]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#756E65] mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B08244]" />
              <span>Unsicher</span>
            </div>
            <div className="text-xl font-semibold text-[#78561E] tabular-nums">
              {globalStats.unsureCount}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E6E1D7]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#756E65] mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A05646]" />
              <span>Wiederholen</span>
            </div>
            <div className="text-xl font-semibold text-[#873B2E] tabular-nums">
              {globalStats.learningCount}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E6E1D7]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#756E65] mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0A699]" />
              <span>Neu</span>
            </div>
            <div className="text-xl font-semibold text-[#635C54] tabular-nums">
              {globalStats.newCount}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming 7-day schedule */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#635C54]">
          Wiederholungen der nächsten 7 Tage
        </h2>

        <div className="grid grid-cols-7 gap-2 text-center">
          {scheduleDays.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border ${
                idx === 0
                  ? 'border-[#E8DCBE] bg-[#FAF5EB]'
                  : 'border-[#E6E1D7] bg-[#FFFFFF]'
              }`}
            >
              <div className="text-[10px] text-[#878077]">{item.label}</div>
              <div className="text-base font-semibold text-[#2A2723] tabular-nums mt-0.5">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown per Subject */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#635C54]">
          Fortschritt nach Fächern
        </h2>

        <div className="space-y-3">
          {subjects.map((subject) => {
            const subjectDecks = decks.filter((d) => d.subjectId === subject.id);
            const subjectCards = cards.filter((c) =>
              subjectDecks.some((d) => d.id === c.deckId)
            );
            const stats = calculateDeckStats(subjectCards);

            return (
              <div key={subject.id} className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif-display text-sm font-normal text-[#2A2723]">
                    {subject.title}
                  </h3>
                  <span className="text-[11px] text-[#756E65] tabular-nums">
                    {subjectDecks.length} Stapel · {subjectCards.length} Karten · {stats.masteryPercentage}%
                  </span>
                </div>
                <ProgressBar stats={stats} size="sm" showLegend={true} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="pt-4 border-t border-[#E7E2D8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#756E65]">
        <div>Daten lokal im Browser gespeichert</div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="hover:text-[#2A2723] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <span>·</span>
          <label className="hover:text-[#2A2723] transition-colors flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
          <span>·</span>
          <button
            onClick={() => {
              if (confirm('Auf Standardbeispiele zurücksetzen?')) {
                onResetAllData();
              }
            }}
            className="hover:text-[#A05646] transition-colors cursor-pointer"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
};
