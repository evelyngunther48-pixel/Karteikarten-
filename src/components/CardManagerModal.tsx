import React, { useState } from 'react';
import { Deck, Flashcard, CardStatus } from '../types';
import { X, Trash2, Edit2, RotateCcw, Search, Plus, Check } from 'lucide-react';

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
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Kann ich schon
          </span>
        );
      case 'unsure':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Unsicher
          </span>
        );
      case 'learning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-rose-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Wiederholen
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            Neu
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-xl font-normal text-stone-900">
              Karten verwalten
            </h3>
            <p className="text-xs text-stone-500">
              Stapel: <span className="font-medium text-stone-800">{deck.title}</span> ({cards.length} Karten)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateCard}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Neue Karte</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Karten durchsuchen..."
              className="w-full text-xs bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Interactive filter segmented control */}
          <div className="flex items-center gap-1 bg-stone-200/50 p-1 rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white font-medium text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Alle ({cards.length})
            </button>
            <button
              onClick={() => setStatusFilter('mastered')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'mastered'
                  ? 'bg-white font-medium text-emerald-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Gekonnt
            </button>
            <button
              onClick={() => setStatusFilter('unsure')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'unsure'
                  ? 'bg-white font-medium text-amber-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Unsicher
            </button>
            <button
              onClick={() => setStatusFilter('learning')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'learning'
                  ? 'bg-white font-medium text-rose-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Wiederholen
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'new'
                  ? 'bg-white font-medium text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Neu
            </button>
          </div>
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              Keine Karteikarten gefunden.
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white border border-stone-200 rounded-xl p-4 transition-all hover:border-stone-300"
              >
                {editingCardId === card.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 uppercase">
                        Vorderseite
                      </label>
                      <input
                        type="text"
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        className="w-full text-sm font-medium text-stone-900 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 uppercase">
                        Rückseite
                      </label>
                      <textarea
                        rows={3}
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        className="w-full text-xs text-stone-800 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 uppercase">
                        Hinweis
                      </label>
                      <input
                        type="text"
                        value={editHint}
                        onChange={(e) => setEditHint(e.target.value)}
                        className="w-full text-xs text-stone-600 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingCardId(null)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => saveEdit(card)}
                        className="px-3.5 py-1.5 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800"
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
                          <span className="text-[11px] text-stone-600 tabular-nums">
                            · Intervall: {card.interval} Tage
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onResetCardProgress(card.id)}
                          title="Lernstatus auf Neu zurücksetzen"
                          className="p-1 text-stone-400 hover:text-amber-800 rounded transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => startEdit(card)}
                          title="Karte bearbeiten"
                          className="p-1 text-stone-400 hover:text-stone-800 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCard(card.id)}
                          title="Karte löschen"
                          className="p-1 text-stone-400 hover:text-rose-700 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-serif-display text-base font-normal text-stone-900 mb-1.5">
                      {card.front}
                    </h4>
                    <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">
                      {card.back}
                    </p>
                    {card.hint && (
                      <div className="mt-2 text-[11px] text-amber-900/80 bg-amber-50/50 px-2 py-0.5 rounded inline-block">
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
