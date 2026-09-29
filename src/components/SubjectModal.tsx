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
  { id: 'sage', label: 'Salbei', border: 'border-[#526654]', dot: 'bg-[#526654]' },
  { id: 'amber', label: 'Goldocker', border: 'border-[#B08244]', dot: 'bg-[#B08244]' },
  { id: 'terracotta', label: 'Terrakotta', border: 'border-[#A05646]', dot: 'bg-[#A05646]' },
  { id: 'stone', label: 'Sandstein', border: 'border-[#786E63]', dot: 'bg-[#786E63]' },
  { id: 'slate', label: 'Schiefer', border: 'border-[#57636B]', dot: 'bg-[#57636B]' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E1D7] shadow-xl max-w-sm w-full overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#EFEBE4] flex items-center justify-between">
          <h3 className="font-serif-display text-base text-[#2A2723] font-normal">
            {initialSubject ? 'Fach bearbeiten' : 'Neues Fach anlegen'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#878077] hover:text-[#2A2723] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#2A2723] mb-1">
              Name des Fachs *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Anatomie & Physiologie"
              className="w-full text-xs text-[#2A2723] border border-[#E2DDD3] rounded-lg px-3 py-2 focus:outline-none focus:border-[#786E63] bg-[#FAF8F5]"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2A2723] mb-1">
              Beschreibung oder Notiz
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Semesterstoff, Skripte und Lehrbuchfragen."
              className="w-full text-xs text-[#2A2723] border border-[#E2DDD3] rounded-lg px-3 py-2 focus:outline-none focus:border-[#786E63] bg-[#FAF8F5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2A2723] mb-1.5">
              Farbakzent
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs cursor-pointer transition-colors ${
                    colorTheme === theme.id
                      ? `${theme.border} bg-[#FAF8F5] font-medium text-[#2A2723]`
                      : 'border-[#E6E1D7] text-[#756E65] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#756E65] hover:text-[#2A2723]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3.5 py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#2A2723] hover:bg-[#1C1A18] rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            >
              {initialSubject ? 'Änderungen speichern' : 'Fach anlegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
