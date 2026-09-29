import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { X } from 'lucide-react';

interface DeckModalProps {
  isOpen: boolean;
  subjectTitle: string;
  onClose: () => void;
  onSave: (deckData: { title: string; description: string }) => void;
  initialDeck?: Deck | null;
}

export const DeckModal: React.FC<DeckModalProps> = ({
  isOpen,
  subjectTitle,
  onClose,
  onSave,
  initialDeck,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialDeck) {
      setTitle(initialDeck.title);
      setDescription(initialDeck.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialDeck, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-sm w-full overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-base text-stone-900 font-normal">
              {initialDeck ? 'Stapel bearbeiten' : 'Neuen Stapel anlegen'}
            </h3>
            <p className="text-[11px] text-stone-500">
              Im Fach: <span className="font-medium text-stone-700">{subjectTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Titel des Stapels *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Kranialnerven & Hirnstamm"
              className="w-full text-xs text-stone-900 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-white"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Beschreibung (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Verlauf, Kerne und Austrittspunkte."
              className="w-full text-xs text-stone-800 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            >
              {initialDeck ? 'Speichern' : 'Stapel anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
