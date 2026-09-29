import React, { useState } from 'react';
import { Deck, Flashcard, CardStatus } from '../types';
import { X, Trash2, Edit2, RotateCcw, Search, Plus } from 'lucide-react';

interface CardManagerModalProps {
  deck: Deck;
  cards: Flashcard[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (cardId: string) => void;
  onResetCardProgress: (cardId: string) => void;
  onOpenCreateCard: () => void;
}

export const CardManagerModal: React.FC<CardManagerModalProps> = ({
  deck,
  cards,
  isOpen,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onResetCardProgress,
  onOpenCreateCard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CardStatus>('all');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editHint, setEditHint] = useState('');

  if (!isOpen) return null;

  const startEdit = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditHint(card.hint || '');
  };

  const saveEdit = (card: Flashcard) => {
    onUpdateCard({
      ...card,
      front: editFront.trim(),
      back: editBack.trim(),
      hint: editHint.trim() || undefined,
      updatedAt: Date.now(),
    });
    setEditingCardId(null);
  };

  const filteredCards = cards.filter((card) => {
    const matchesQuery =
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const getStatusBadge = (status: CardStatus) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#344D39] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#526654]" />
            Kann ich schon
          </span>
        );
      case 'unsure':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#78561E] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B08244]" />
            Unsicher
          </span>
        );
      case 'learning':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#873B2E] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A05646]" />
            Wiederholen
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#635C54] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A0998E]" />
            Neu
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E6E1D7] shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFEBE4] flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-xl font-normal text-[#2A2723]">
              Karten verwalten
            </h3>
            <p className="text-xs text-[#756E65]">
              Stapel: <span className="font-medium text-[#2A2723]">{deck.title}</span> ({cards.length} Karten)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateCard}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2A2723] text-[#FAF8F5] rounded-lg text-xs font-medium hover:bg-[#1C1A18] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Neue Karte</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#878077] hover:text-[#2A2723] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-[#EFEBE4] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#878077] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Karten durchsuchen..."
              className="w-full text-xs bg-[#FFFFFF] border border-[#E2DDD3] rounded-lg pl-9 pr-3 py-2 text-[#2A2723] focus:outline-none focus:border-[#786E63]"
            />
          </div>

          {/* Interactive filter segmented control */}
          <div className="flex items-center gap-1 bg-[#EAE5DC]/70 p-1 rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#FFFFFF] font-medium text-[#2A2723] shadow-2xs'
                  : 'text-[#756E65] hover:text-[#2A2723]'
              }`}
            >
              Alle ({cards.length})
            </button>
            <button
              onClick={() => setStatusFilter('mastered')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'mastered'
                  ? 'bg-[#FFFFFF] font-medium text-[#344D39] shadow-2xs'
                  : 'text-[#756E65] hover:text-[#2A2723]'
              }`}
            >
              Gekonnt
            </button>
            <button
              onClick={() => setStatusFilter('unsure')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'unsure'
                  ? 'bg-[#FFFFFF] font-medium text-[#78561E] shadow-2xs'
                  : 'text-[#756E65] hover:text-[#2A2723]'
              }`}
            >
              Unsicher
            </button>
            <button
              onClick={() => setStatusFilter('learning')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'learning'
                  ? 'bg-[#FFFFFF] font-medium text-[#873B2E] shadow-2xs'
                  : 'text-[#756E65] hover:text-[#2A2723]'
              }`}
            >
              Wiederholen
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'new'
                  ? 'bg-[#FFFFFF] font-medium text-[#2A2723] shadow-2xs'
                  : 'text-[#756E65] hover:text-[#2A2723]'
              }`}
            >
              Neu
            </button>
          </div>
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-[#756E65] text-xs">
              Keine Karteikarten gefunden.
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-xl p-4 transition-all hover:border-[#C8BFB0]"
              >
                {editingCardId === card.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#756E65] uppercase">
                        Vorderseite
                      </label>
                      <input
                        type="text"
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        className="w-full text-sm font-medium text-[#2A2723] border border-[#E2DDD3] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#786E63] bg-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#756E65] uppercase">
                        Rückseite
                      </label>
                      <textarea
                        rows={3}
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        className="w-full text-xs text-[#2A2723] border border-[#E2DDD3] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#786E63] bg-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#756E65] uppercase">
                        Hinweis
                      </label>
                      <input
                        type="text"
                        value={editHint}
                        onChange={(e) => setEditHint(e.target.value)}
                        className="w-full text-xs text-[#756E65] border border-[#E2DDD3] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#786E63] bg-[#FAF8F5]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingCardId(null)}
                        className="px-3 py-1.5 text-xs text-[#756E65] hover:text-[#2A2723]"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => saveEdit(card)}
                        className="px-3.5 py-1.5 bg-[#2A2723] text-[#FAF8F5] rounded text-xs font-medium hover:bg-[#1C1A18]"
                      >
                        Änderungen speichern
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(card.status)}
                        {card.interval > 0 && (
                          <span className="text-[11px] text-[#756E65] tabular-nums">
                            · Intervall: {card.interval} Tage
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onResetCardProgress(card.id)}
                          title="Lernstatus auf Neu zurücksetzen"
                          className="p-1 text-[#878077] hover:text-[#B08244] rounded transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(card)}
                          title="Karte bearbeiten"
                          className="p-1 text-[#878077] hover:text-[#2A2723] rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCard(card.id)}
                          title="Karte löschen"
                          className="p-1 text-[#878077] hover:text-[#A05646] rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-serif-display text-base font-normal text-[#2A2723] mb-1.5">
                      {card.front}
                    </h4>
                    <p className="text-xs text-[#756E65] whitespace-pre-line leading-relaxed">
                      {card.back}
                    </p>
                    {card.hint && (
                      <div className="mt-2 text-[11px] text-[#78561E] bg-[#FAF5EB] border border-[#E8DCBE] px-2 py-0.5 rounded inline-block">
                        Hinweis: {card.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
