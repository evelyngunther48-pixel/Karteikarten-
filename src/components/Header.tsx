import React from 'react';

interface HeaderProps {
  activeTab: 'subjects' | 'due' | 'stats';
  onSelectTab: (tab: 'subjects' | 'due' | 'stats') => void;
  onOpenCreateSubject: () => void;
  dueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateSubject,
  dueCount,
}) => {
  return (
    <header className="border-b border-stone-200/60 bg-[#FAF9F6]/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('subjects')}
          className="text-left font-serif-display text-xl tracking-tight text-stone-900 hover:text-stone-700 transition-colors cursor-pointer"
        >
          Memoria
        </button>

        {/* Clean, quiet navigation */}
        <nav className="flex items-center gap-6 sm:gap-8 text-xs font-medium text-stone-500">
          <button
            onClick={() => onSelectTab('subjects')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'subjects'
                ? 'text-stone-900 font-semibold'
                : 'hover:text-stone-800'
            }`}
          >
            Fächer
          </button>

          <button
            onClick={() => onSelectTab('due')}
            className={`transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'due'
                ? 'text-stone-900 font-semibold'
                : 'hover:text-stone-800'
            }`}
          >
            <span>Heute fällig</span>
            {dueCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 tabular-nums">
                ({dueCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'text-stone-900 font-semibold'
                : 'hover:text-stone-800'
            }`}
          >
            Fortschritt
          </button>
        </nav>

        {/* Primary Action */}
        <div>
          <button
            onClick={onOpenCreateSubject}
            className="text-xs font-medium text-stone-700 hover:text-stone-950 px-2.5 py-1 rounded-md hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            + Neues Fach
          </button>
        </div>
      </div>
    </header>
  );
};
