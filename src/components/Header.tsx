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
    <header className="border-b border-[#E7E2D8] bg-[#F7F5F0]/95 backdrop-blur-xs sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('subjects')}
          className="text-left font-serif-display text-xl tracking-tight text-[#2A2723] hover:text-[#4A433C] transition-colors cursor-pointer"
        >
          Memoria
        </button>

        {/* Clean, quiet navigation */}
        <nav className="flex items-center gap-6 sm:gap-8 text-xs font-medium text-[#756E65]">
          <button
            onClick={() => onSelectTab('subjects')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'subjects'
                ? 'text-[#2A2723] font-semibold'
                : 'hover:text-[#2A2723]'
            }`}
          >
            Fächer
          </button>

          <button
            onClick={() => onSelectTab('due')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'due'
                ? 'text-[#2A2723] font-semibold'
                : 'hover:text-[#2A2723]'
            }`}
          >
            <span>Heute fällig</span>
            {dueCount > 0 && (
              <span className="text-[11px] font-semibold text-[#A05646] tabular-nums">
                ({dueCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'text-[#2A2723] font-semibold'
                : 'hover:text-[#2A2723]'
            }`}
          >
            Fortschritt
          </button>
        </nav>

        {/* Primary Action */}
        <div>
          <button
            onClick={onOpenCreateSubject}
            className="text-xs font-medium text-[#3D3730] hover:text-[#1C1A18] px-2.5 py-1 rounded-md bg-[#EAE5DC] hover:bg-[#DFD9CE] transition-colors cursor-pointer"
          >
            + Neues Fach
          </button>
        </div>
      </div>
    </header>
  );
};
