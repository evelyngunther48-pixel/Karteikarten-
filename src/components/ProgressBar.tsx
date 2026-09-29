import React from 'react';
import { DeckStats } from '../types';

interface ProgressBarProps {
  stats: DeckStats;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  stats,
  size = 'md',
  showLegend = true,
  className = '',
}) => {
  const { total, newCount, learningCount, unsureCount, masteredCount } = stats;

  if (total === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-stone-200 w-full" />
        </div>
        {showLegend && (
          <div className="mt-1.5 text-[11px] text-stone-600">
            Noch keine Karten
          </div>
        )}
      </div>
    );
  }

  const masteredPct = (masteredCount / total) * 100;
  const unsurePct = (unsureCount / total) * 100;
  const learningPct = (learningCount / total) * 100;
  const newPct = (newCount / total) * 100;

  const barHeight = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2' : 'h-1.5';

  return (
    <div className={`w-full ${className}`}>
      {/* Slim, calm segmented line */}
      <div
        className={`w-full bg-stone-200/60 rounded-full overflow-hidden flex items-center ${barHeight}`}
        role="progressbar"
        aria-label="Lernfortschritt"
        aria-valuenow={stats.masteryPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {masteredCount > 0 && (
          <div
            style={{ width: `${masteredPct}%` }}
            className="h-full bg-emerald-600/90 transition-all duration-300"
            title={`Kann ich schon: ${masteredCount}`}
          />
        )}
        {unsureCount > 0 && (
          <div
            style={{ width: `${unsurePct}%` }}
            className="h-full bg-amber-500/90 transition-all duration-300"
            title={`Unsicher: ${unsureCount}`}
          />
        )}
        {learningCount > 0 && (
          <div
            style={{ width: `${learningPct}%` }}
            className="h-full bg-rose-500/85 transition-all duration-300"
            title={`Wusste ich nicht: ${learningCount}`}
          />
        )}
        {newCount > 0 && (
          <div
            style={{ width: `${newPct}%` }}
            className="h-full bg-stone-300/80 transition-all duration-300"
            title={`Neu: ${newCount}`}
          />
        )}
      </div>

      {/* Quiet, calm legend */}
      {showLegend && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-y-1 text-[11px] text-stone-600 tabular-nums">
          <div className="flex flex-wrap items-center gap-x-2.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Gewusst:</span>
              <span className="font-medium text-stone-700">{masteredCount}</span>
            </span>
            <span className="text-stone-300">·</span>

            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Unsicher:</span>
              <span className="font-medium text-stone-700">{unsureCount}</span>
            </span>
            <span className="text-stone-300">·</span>

            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Wiederholen:</span>
              <span className="font-medium text-stone-700">{learningCount}</span>
            </span>
            <span className="text-stone-300">·</span>

            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              <span>Neu:</span>
              <span className="font-medium text-stone-700">{newCount}</span>
            </span>
          </div>

          <div className="text-stone-600 font-medium">
            {stats.masteryPercentage}% beherrscht ({total} Karten)
          </div>
        </div>
      )}
    </div>
  );
};
