import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { X } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: { title: string; description: string; colorTheme: string }) => void;
  initialSubject?: Subject | null;
}

const COLOR_THEMES = [
  { id: 'sage', label: 'Salbei', border: 'border-emerald-300', dot: 'bg-emerald-600' },
  { id: 'amber', label: 'Bernstein', border: 'border-amber-300', dot: 'bg-amber-600' },
  { id: 'terracotta', label: 'Terrakotta', border: 'border-rose-300', dot: 'bg-rose-600' },
  { id: 'stone', label: 'Sandstein', border: 'border-stone-400', dot: 'bg-stone-600' },
  { id: 'slate', label: 'Schiefer', border: 'border-slate-400', dot: 'bg-slate-600' },
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState('sage');

  useEffect(() => {
    if (initialSubject) {
      setTitle(initialSubject.title);
      setDescription(initialSubject.description);
      setColorTheme(initialSubject.colorTheme || 'sage');
    } else {
      setTitle('');
      setDescription('');
      setColorTheme('sage');
    }
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      colorTheme,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-serif-display text-lg font-normal text-stone-900">
            {initialSubject ? 'Fach bearbeiten' : 'Neues Fach anlegen'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Name des Fachs *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Anatomie & Physiologie"
              className="w-full text-sm text-stone-900 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-500 bg-white"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Beschreibung oder Notiz
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Vorlesungsinhalte Sommersemester, Skripte und Lehrbuchfragen."
              className="w-full text-xs text-stone-800 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-2">
              Farbakzent
            </label>
            <div className="flex gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    colorTheme === theme.id
                      ? `${theme.border} bg-stone-50 font-medium text-stone-900 shadow-2xs`
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            >
              {initialSubject ? 'Änderungen speichern' : 'Fach anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
