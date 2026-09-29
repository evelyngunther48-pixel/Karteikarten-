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
        <div className="w-full bg-[#EAE5DC] rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-[#D4CDC2] w-full" />
        </div>
        {showLegend && (
          <div className="mt-1.5 text-[11px] text-[#878077]">
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
      {/* Slim, calm segmented line with elegant earth tones */}
      <div
        className={`w-full bg-[#EAE5DC] rounded-full overflow-hidden flex items-center ${barHeight}`}
        role="progressbar"
        aria-label="Lernfortschritt"
        aria-valuenow={stats.masteryPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* 1. Kann ich schon: Ruhiges Salbei / Moos (#526654) */}
        {masteredCount > 0 && (
          <div
            style={{ width: `${masteredPct}%` }}
            className="h-full bg-[#526654] transition-all duration-300"
            title={`Kann ich schon: ${masteredCount}`}
          />
        )}
        {/* 2. Unsicher: Warmes Ocker / Siena (#B08244) */}
        {unsureCount > 0 && (
          <div
            style={{ width: `${unsurePct}%` }}
            className="h-full bg-[#B08244] transition-all duration-300"
            title={`Unsicher: ${unsureCount}`}
          />
        )}
        {/* 3. Wusste ich nicht: Edles Terrakotta / Gebrannter Ton (#A05646) */}
        {learningCount > 0 && (
          <div
            style={{ width: `${learningPct}%` }}
            className="h-full bg-[#A05646] transition-all duration-300"
            title={`Wusste ich nicht: ${learningCount}`}
          />
        )}
        {/* 4. Neu: Travertin / Haferstein (#D4CDC2) */}
        {newCount > 0 && (
          <div
            style={{ width: `${newPct}%` }}
            className="h-full bg-[#D4CDC2] transition-all duration-300"
            title={`Neu: ${newCount}`}
          />
        )}
      </div>

      {/* Quiet, elegant earthy legend */}
      {showLegend && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-y-1 text-[11px] text-[#756E65] tabular-nums">
          <div className="flex flex-wrap items-center gap-x-2.5">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#526654]" />
              <span>Gewusst:</span>
              <span className="font-medium text-[#2A2723]">{masteredCount}</span>
            </span>
            <span className="text-[#D4CDC2]">·</span>

            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B08244]" />
              <span>Unsicher:</span>
              <span className="font-medium text-[#2A2723]">{unsureCount}</span>
            </span>
            <span className="text-[#D4CDC2]">·</span>

            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A05646]" />
              <span>Wiederholen:</span>
              <span className="font-medium text-[#2A2723]">{learningCount}</span>
            </span>
            <span className="text-[#D4CDC2]">·</span>

            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0A699]" />
              <span>Neu:</span>
              <span className="font-medium text-[#2A2723]">{newCount}</span>
            </span>
          </div>

          <div className="text-[#635C54] font-medium">
            {stats.masteryPercentage}% beherrscht ({total} Karten)
          </div>
        </div>
      )}
    </div>
  );
};
