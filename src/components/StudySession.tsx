import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, Rating, Deck, DeckStats } from '../types';
import { calculateNextReview, calculateDeckStats } from '../lib/spacedRepetition';
import { ProgressBar } from './ProgressBar';
import { Volume2, RotateCcw, ArrowLeft, Lightbulb, Check } from 'lucide-react';

interface StudySessionProps {
  deck: Deck;
  cards: Flashcard[];
  allDeckCards: Flashcard[];
  onUpdateCard: (updatedCard: Flashcard) => void;
  onFinishSession: () => void;
  onBackToDeck: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  cards,
  allDeckCards,
  onUpdateCard,
  onFinishSession,
  onBackToDeck,
}) => {
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    againCount: number;
    hardCount: number;
    goodCount: number;
    repeatQueue: Flashcard[];
  }>({
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    repeatQueue: [],
  });
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = sessionQueue[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (deck.title.toLowerCase().includes('span') || currentCard?.front.toLowerCase().includes('¿')) {
        utterance.lang = 'es-ES';
      } else {
        utterance.lang = 'de-DE';
      }
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!currentCard) return;

      const updates = calculateNextReview(currentCard, rating);
      const updatedCard: Flashcard = {
        ...currentCard,
        ...updates,
      };

      onUpdateCard(updatedCard);

      setSessionResults((prev) => {
        const nextRepeatQueue =
          rating === 'again' || rating === 'hard'
            ? [...prev.repeatQueue, updatedCard]
            : prev.repeatQueue;

        return {
          againCount: rating === 'again' ? prev.againCount + 1 : prev.againCount,
          hardCount: rating === 'hard' ? prev.hardCount + 1 : prev.hardCount,
          goodCount: rating === 'good' ? prev.goodCount + 1 : prev.goodCount,
          repeatQueue: nextRepeatQueue,
        };
      });

      if (currentIndex + 1 < sessionQueue.length) {
        setIsFlipped(false);
        setShowHint(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    },
    [currentCard, currentIndex, sessionQueue.length, onUpdateCard]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') {
          handleRate('again');
        } else if (e.key === '2') {
          handleRate('hard');
        } else if (e.key === '3') {
          handleRate('good');
        }
      } else if (e.key === 'Escape') {
        onBackToDeck();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped, onBackToDeck]);

  const startFocusRound = () => {
    if (sessionResults.repeatQueue.length === 0) return;
    setSessionQueue(sessionResults.repeatQueue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setSessionResults({
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      repeatQueue: [],
    });
    setIsFinished(false);
  };

  const liveStats: DeckStats = calculateDeckStats(allDeckCards);

  if (isFinished) {
    const totalReviewed =
      sessionResults.againCount + sessionResults.hardCount + sessionResults.goodCount;

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-[#FFFFFF] border border-[#E6E1D7] rounded-2xl p-8 shadow-xs">
          <div className="w-10 h-10 bg-[#F1F5F2] text-[#344D39] rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-5 h-5 stroke-[2]" />
          </div>

          <h2 className="font-serif-display text-2xl text-[#2A2723] font-normal mb-1">
            Lernsitzung beendet
          </h2>
          <p className="text-[#756E65] text-xs mb-6">
            {totalReviewed} Karten gelernt aus {deck.title}.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6 bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE4D9] text-center">
            <div>
              <div className="text-[11px] text-[#526654] font-medium mb-0.5">Gewusst</div>
              <div className="text-xl font-semibold text-[#344D39] tabular-nums">
                {sessionResults.goodCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#B08244] font-medium mb-0.5">Unsicher</div>
              <div className="text-xl font-semibold text-[#78561E] tabular-nums">
                {sessionResults.hardCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#A05646] font-medium mb-0.5">Wiederholen</div>
              <div className="text-xl font-semibold text-[#873B2E] tabular-nums">
                {sessionResults.againCount}
              </div>
            </div>
          </div>

          <div className="mb-6 text-left">
            <div className="text-[11px] text-[#756E65] mb-1.5">
              Stapel-Fortschritt
            </div>
            <ProgressBar stats={liveStats} size="sm" showLegend={true} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            {sessionResults.repeatQueue.length > 0 && (
              <button
                onClick={startFocusRound}
                className="w-full sm:w-auto px-4 py-2 bg-[#2A2723] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#1C1A18] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D4CDC2]" />
                <span>
                  Wiederholen ({sessionResults.repeatQueue.length})
                </span>
              </button>
            )}

            <button
              onClick={onFinishSession}
              className="w-full sm:w-auto px-4 py-2 text-[#635C54] hover:text-[#2A2723] text-xs font-medium transition-colors cursor-pointer"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-[#756E65] text-xs mb-3">Keine Karten vorhanden.</p>
        <button
          onClick={onBackToDeck}
          className="px-3.5 py-1.5 bg-[#2A2723] text-[#FAF8F5] text-xs rounded-lg cursor-pointer"
        >
          Zurück
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-screen justify-between">
      {/* Top Header in Study Mode */}
      <div className="flex items-center justify-between py-2 border-b border-[#E7E2D8]">
        <button
          onClick={onBackToDeck}
          className="inline-flex items-center gap-1 text-xs text-[#756E65] hover:text-[#2A2723] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beenden</span>
        </button>

        <div className="text-xs text-[#756E65] tabular-nums">
          <span className="font-medium text-[#2A2723]">{currentIndex + 1}</span> / {sessionQueue.length}
        </div>
      </div>

      {/* Slim progress bar right under top nav */}
      <div className="pt-2 pb-4">
        <div className="w-full bg-[#EAE5DC] rounded-full h-1 overflow-hidden">
          <div
            className="bg-[#2A2723] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / sessionQueue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* The Flashcard Container (3D Flip) */}
      <div className="perspective-1000 my-auto py-4">
        <div
          onClick={handleFlip}
          className={`relative w-full min-h-[340px] sm:min-h-[380px] cursor-pointer transition-transform duration-500 transform-style-preserve-3d rounded-2xl bg-[#FFFFFF] border border-[#E5DFD4] shadow-xs hover:border-[#CAC0B2] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between backface-hidden rounded-2xl bg-[#FFFFFF]">
            <div className="flex items-center justify-between text-xs text-[#A0998E]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#A0998E]">
                Frage
              </span>
              <button
                onClick={(e) => handleSpeak(currentCard.front, e)}
                title="Vorlesen"
                className="p-1 text-[#BFB7AA] hover:text-[#4A433C] rounded transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center px-4">
              <p className="font-serif-display text-2xl sm:text-3xl text-[#24201C] leading-snug font-normal">
                {currentCard.front}
              </p>

              {currentCard.hint && (
                <div className="mt-6">
                  {showHint ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs text-[#78561E] bg-[#FAF5EB] border border-[#E8DCBE] px-3 py-1 rounded-md"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#B08244] shrink-0" />
                      <span>{currentCard.hint}</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="text-xs text-[#A0998E] hover:text-[#4A433C] transition-colors cursor-pointer"
                    >
                      Hinweis anzeigen
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-[#A0998E]">
              Klicken oder <kbd className="px-1 py-0.5 bg-[#FAF8F5] border border-[#E6E1D7] rounded text-[#756E65] text-[10px]">Leertaste</kbd> zum Umdrehen
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between backface-hidden rotate-y-180 rounded-2xl bg-[#FDFBF8] border border-[#E3DDD2]">
            <div className="flex items-center justify-between text-xs text-[#A0998E]">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#857C70]">
                Antwort
              </span>
              <button
                onClick={(e) => handleSpeak(currentCard.back, e)}
                title="Vorlesen"
                className="p-1 text-[#BFB7AA] hover:text-[#4A433C] rounded transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-left px-2 sm:px-6">
              <div className="font-serif-display text-xl sm:text-2xl text-[#24201C] leading-relaxed font-normal whitespace-pre-line">
                {currentCard.back}
              </div>

              {currentCard.hint && (
                <div className="mt-4 text-xs text-[#756E65] pt-3 border-t border-[#E8E2D7]">
                  {currentCard.hint}
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-[#A0998E]">
              Bewerte deine Erinnerung (1, 2, 3)
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Rating Controls: Exquisite Calm Earth Tones */}
      <div className="py-4">
        {isFlipped ? (
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Wusste ich nicht: Terrakotta */}
            <button
              onClick={() => handleRate('again')}
              className="px-3 py-2.5 rounded-xl border border-[#E6D3CE] bg-[#FAF3F1] hover:bg-[#F4ECE9] text-[#873B2E] transition-colors text-center cursor-pointer shadow-2xs"
            >
              <div className="text-xs font-semibold">Wusste ich nicht</div>
              <div className="text-[10px] text-[#994537] mt-0.5">Taste 1</div>
            </button>

            {/* 2. Unsicher: Warmes Ocker */}
            <button
              onClick={() => handleRate('hard')}
              className="px-3 py-2.5 rounded-xl border border-[#E8DABF] bg-[#FAF5EB] hover:bg-[#F5EEDB] text-[#78561E] transition-colors text-center cursor-pointer shadow-2xs"
            >
              <div className="text-xs font-semibold">Unsicher</div>
              <div className="text-[10px] text-[#8A6426] mt-0.5">Taste 2</div>
            </button>

            {/* 3. Kann ich schon: Salbei */}
            <button
              onClick={() => handleRate('good')}
              className="px-3 py-2.5 rounded-xl border border-[#D0DDD2] bg-[#F1F5F2] hover:bg-[#E6EFE9] text-[#344D39] transition-colors text-center cursor-pointer shadow-2xs"
            >
              <div className="text-xs font-semibold">Kann ich schon</div>
              <div className="text-[10px] text-[#425E47] mt-0.5">Taste 3</div>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={handleFlip}
              className="px-6 py-2.5 bg-[#2A2723] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#1C1A18] transition-colors cursor-pointer shadow-2xs"
            >
              Antwort anzeigen (Leertaste)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
