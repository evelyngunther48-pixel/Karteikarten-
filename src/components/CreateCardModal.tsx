import React, { useState } from 'react';
import { Deck, GeneratedCardDraft } from '../types';
import { parseTableText } from '../lib/tableParser';
import { X, FileText, Check, AlertCircle, RefreshCw, Sparkles, Edit3 } from 'lucide-react';

interface CreateCardModalProps {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
  onAddCards: (cards: { front: string; back: string; hint?: string }[]) => void;
}

type TabType = 'table' | 'text' | 'manual';

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
  deck,
  isOpen,
  onClose,
  onAddCards,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('table');

  // Manual form state
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [manualHint, setManualHint] = useState('');
  const [manualSuccessMsg, setManualSuccessMsg] = useState(false);

  // Table import state
  const [tableInputText, setTableInputText] = useState('');
  const [tableError, setTableError] = useState<string | null>(null);

  // Text AI state
  const [promptText, setPromptText] = useState('');
  const [isGeneratingFromText, setIsGeneratingFromText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  // Draft review state
  const [draftCards, setDraftCards] = useState<GeneratedCardDraft[]>([]);

  if (!isOpen) return null;

  // Handle Manual Save
  const handleSaveManual = (createAnother: boolean = false) => {
    if (!manualFront.trim() || !manualBack.trim()) return;

    onAddCards([
      {
        front: manualFront.trim(),
        back: manualBack.trim(),
        hint: manualHint.trim() || undefined,
      },
    ]);

    setManualFront('');
    setManualBack('');
    setManualHint('');

    if (createAnother) {
      setManualSuccessMsg(true);
      setTimeout(() => setManualSuccessMsg(false), 2000);
    } else {
      onClose();
    }
  };

  // Handle Table Parse
  const handleParseTable = () => {
    setTableError(null);
    const result = parseTableText(tableInputText);
    if (result.error) {
      setTableError(result.error);
    } else {
      setDraftCards(result.cards);
    }
  };

  // Insert Example ChatGPT Table
  const handleInsertExampleTable = () => {
    const example = `| Frage | Antwort | Hinweis |
| Was versteht man unter dem Begriff Synapse? | Die Kontaktstelle zwischen Nervenzellen zur Reizübertragung. | Chemisch oder elektrisch |
| Welche Rolle spielen Neurotransmitter? | Chemische Botenstoffe, die das Signal über den synaptischen Spalt weiterleiten. | Z.B. Dopamin, Acetylcholin |
| Was geschieht bei der Depolarisation? | Das Membranpotenzial wird positiver, Natriumkanäle öffnen sich. | Aktionspotenzial |
| Was ist die Refraktärzeit? | Zeitraum nach einem Aktionspotenzial, in dem kein neues Signal ausgelöst werden kann. | Absolut vs. Relativ |`;
    setTableInputText(example);
    setTableError(null);
  };

  // Handle Text / Notes AI generation
  const handleGenerateFromText = async () => {
    if (!promptText.trim()) return;

    setIsGeneratingFromText(true);
    setTextError(null);

    try {
      const response = await fetch('/api/generate-cards-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: promptText.trim(),
          deckTopic: deck.title,
          count: 8,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Generierung fehlgeschlagen');
      }

      if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
        setDraftCards(
          data.cards.map((c: any) => ({
            front: c.front || '',
            back: c.back || '',
            hint: c.hint || undefined,
            selected: true,
          }))
        );
      } else {
        throw new Error('Keine Karten generiert.');
      }
    } catch (err: any) {
      console.error(err);
      setTextError(err.message || 'Generierung fehlgeschlagen');
    } finally {
      setIsGeneratingFromText(false);
    }
  };

  // Toggle selection in draft cards list
  const toggleDraftSelection = (index: number) => {
    setDraftCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  // Update draft card content inline
  const updateDraftCard = (index: number, field: 'front' | 'back' | 'hint', value: string) => {
    setDraftCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  // Import selected drafts
  const handleImportDrafts = () => {
    const selected = draftCards.filter((c) => c.selected && c.front && c.back);
    if (selected.length === 0) return;

    onAddCards(
      selected.map((c) => ({
        front: c.front,
        back: c.back,
        hint: c.hint,
      }))
    );

    setDraftCards([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif-display text-lg text-stone-900 font-normal">
              Karteikarten hinzufügen
            </h3>
            <p className="text-[11px] text-stone-500">
              Zu: <span className="font-medium text-stone-800">{deck.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Drafts are ready to review (from AI or Table) */}
        {draftCards.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-xs text-stone-800">
                  {draftCards.length} Karten erkannt
                </h4>
                <p className="text-[11px] text-stone-500">
                  Wähle die gewünschten Karten aus oder passe den Text an.
                </p>
              </div>
              <button
                onClick={() => setDraftCards([])}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline"
              >
                Zurück
              </button>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {draftCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-colors ${
                    card.selected
                      ? 'border-stone-300 bg-stone-50/60'
                      : 'border-stone-200 bg-white opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={card.selected}
                      onChange={() => toggleDraftSelection(idx)}
                      className="mt-1 rounded text-stone-900 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div>
                        <label className="block text-[10px] text-stone-500 uppercase font-medium">
                          Vorderseite (Frage)
                        </label>
                        <input
                          type="text"
                          value={card.front}
                          onChange={(e) => updateDraftCard(idx, 'front', e.target.value)}
                          className="w-full text-xs font-medium text-stone-900 bg-white border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-stone-500 uppercase font-medium">
                          Rückseite (Antwort)
                        </label>
                        <textarea
                          rows={2}
                          value={card.back}
                          onChange={(e) => updateDraftCard(idx, 'back', e.target.value)}
                          className="w-full text-xs text-stone-700 bg-white border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-stone-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                {draftCards.filter((c) => c.selected).length} von {draftCards.length} ausgewählt
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDraftCards([])}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleImportDrafts}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  {draftCards.filter((c) => c.selected).length} Karten übernehmen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Selection: Only Table, Text AI, and Manual */}
            <div className="flex border-b border-stone-200 px-5 text-xs">
              <button
                onClick={() => setActiveTab('table')}
                className={`py-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'table'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tabelle (ChatGPT / CSV)</span>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`py-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'text'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Text / Thema (KI)</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-2.5 px-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'manual'
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Händisch</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5 flex-1 overflow-y-auto">
              {/* TAB 1: Table Import (ChatGPT) */}
              {activeTab === 'table' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-500">
                      Kopiere deine Tabelle aus ChatGPT, Excel oder Markdown hier hinein:
                    </p>
                    <button
                      onClick={handleInsertExampleTable}
                      className="text-[11px] text-amber-800 hover:underline cursor-pointer"
                    >
                      Beispieltabelle
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    value={tableInputText}
                    onChange={(e) => setTableInputText(e.target.value)}
                    placeholder={`| Frage | Antwort | Hinweis |\n| Was ist X? | Erklärung von X | Tipp |`}
                    className="w-full font-mono text-xs text-stone-800 border border-stone-200 rounded-lg p-2.5 bg-stone-50/40 focus:bg-white focus:outline-none focus:border-stone-400"
                  />

                  {tableError && (
                    <div className="p-2 bg-rose-50 text-rose-800 text-xs rounded border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{tableError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleParseTable}
                      disabled={!tableInputText.trim()}
                      className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Tabelle analysieren
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Text AI */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">
                    Füge Mitschriften, Notizen oder ein Thema ein – die KI formuliert strukturierte Karteikarten:
                  </p>

                  <textarea
                    rows={6}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="z.B. Notizen zu: Vegetatives Nervensystem, Sympathikus und Parasympathikus im Vergleich..."
                    className="w-full text-xs text-stone-800 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 bg-white"
                  />

                  {textError && (
                    <div className="p-2 bg-rose-50 text-rose-800 text-xs rounded border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{textError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerateFromText}
                      disabled={!promptText.trim() || isGeneratingFromText}
                      className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                      {isGeneratingFromText ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Wird erstellt...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Karten mit KI erstellen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Manual */}
              {activeTab === 'manual' && (
                <div className="space-y-3">
                  {manualSuccessMsg && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Gespeichert! Nächste Karte erstellen:
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Vorderseite (Frage / Begriff) *
                    </label>
                    <textarea
                      rows={2}
                      value={manualFront}
                      onChange={(e) => setManualFront(e.target.value)}
                      placeholder="z.B. Was ist das Prinzip von Spaced Repetition?"
                      className="w-full text-xs text-stone-900 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 bg-white"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Rückseite (Antwort / Erklärung) *
                    </label>
                    <textarea
                      rows={3}
                      value={manualBack}
                      onChange={(e) => setManualBack(e.target.value)}
                      placeholder="z.B. Zeitlich gestaffelte Wiederholungen zur optimalen Verankerung im Langzeitgedächtnis."
                      className="w-full text-xs text-stone-900 border border-stone-200 rounded-lg p-2.5 focus:outline-none focus:border-stone-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Hinweis (optional)
                    </label>
                    <input
                      type="text"
                      value={manualHint}
                      onChange={(e) => setManualHint(e.target.value)}
                      placeholder="z.B. Hermann Ebbinghaus"
                      className="w-full text-xs text-stone-800 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400 bg-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleSaveManual(true)}
                      disabled={!manualFront.trim() || !manualBack.trim()}
                      className="px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      Speichern & Nächste
                    </button>
                    <button
                      onClick={() => handleSaveManual(false)}
                      disabled={!manualFront.trim() || !manualBack.trim()}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      Fertig
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
