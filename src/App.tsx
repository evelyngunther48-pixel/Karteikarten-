/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Subject, Deck, Flashcard } from './types';
import {
  loadSubjects,
  saveSubjects,
  loadDecks,
  saveDecks,
  loadCards,
  saveCards,
  resetAllDataToDefault,
} from './lib/storage';
import { isCardDue, getTodayDateString } from './lib/spacedRepetition';
import { Header } from './components/Header';
import { SubjectList } from './components/SubjectList';
import { SubjectView } from './components/SubjectView';
import { DeckDetail } from './components/DeckDetail';
import { StudySession } from './components/StudySession';
import { StatisticsView } from './components/StatisticsView';
import { DueSessionView } from './components/DueSessionView';
import { SubjectModal } from './components/SubjectModal';
import { DeckModal } from './components/DeckModal';
import { CreateCardModal } from './components/CreateCardModal';
import { CardManagerModal } from './components/CardManagerModal';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
  const [decks, setDecks] = useState<Deck[]>(() => loadDecks());
  const [cards, setCards] = useState<Flashcard[]>(() => loadCards());

  // Navigation state
  const [activeTab, setActiveTab] = useState<'subjects' | 'due' | 'stats'>('subjects');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Active study session state
  const [activeStudySession, setActiveStudySession] = useState<{
    deck: Deck;
    studyCards: Flashcard[];
  } | null>(null);

  // Modal dialog states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [deckModalSubjectId, setDeckModalSubjectId] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [createCardDeckId, setCreateCardDeckId] = useState<string | null>(null);

  const [isManageCardsModalOpen, setIsManageCardsModalOpen] = useState(false);
  const [manageCardsDeckId, setManageCardsDeckId] = useState<string | null>(null);

  // Persist to storage
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  const dueCardsTotal = cards.filter(isCardDue).length;
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentDeck = decks.find((d) => d.id === selectedDeckId);

  // Handlers for Subject operations
  const handleOpenCreateSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (data: { title: string; description: string; colorTheme: string }) => {
    if (editingSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editingSubject.id
            ? { ...s, ...data, updatedAt: Date.now() }
            : s
        )
      );
    } else {
      const newSubject: Subject = {
        id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: data.title,
        description: data.description,
        colorTheme: data.colorTheme,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSubjects((prev) => [newSubject, ...prev]);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    const decksToDelete = decks.filter((d) => d.subjectId === subjectId);
    const deckIds = decksToDelete.map((d) => d.id);

    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setDecks((prev) => prev.filter((d) => d.subjectId !== subjectId));
    setCards((prev) => prev.filter((c) => !deckIds.includes(c.deckId)));

    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
      setSelectedDeckId(null);
    }
  };

  // Handlers for Deck operations
  const handleOpenCreateDeck = (subjectId: string) => {
    setDeckModalSubjectId(subjectId);
    setEditingDeck(null);
    setIsDeckModalOpen(true);
  };

  const handleOpenEditDeck = (deck: Deck) => {
    setDeckModalSubjectId(deck.subjectId);
    setEditingDeck(deck);
    setIsDeckModalOpen(true);
  };

  const handleSaveDeck = (data: { title: string; description: string }) => {
    if (editingDeck) {
      setDecks((prev) =>
        prev.map((d) =>
          d.id === editingDeck.id
            ? { ...d, ...data, updatedAt: Date.now() }
            : d
        )
      );
    } else if (deckModalSubjectId) {
      const newDeck: Deck = {
        id: `deck-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        subjectId: deckModalSubjectId,
        title: data.title,
        description: data.description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setDecks((prev) => [...prev, newDeck]);
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setCards((prev) => prev.filter((c) => c.deckId !== deckId));
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null);
    }
  };

  const handleResetDeckProgress = (deckId: string) => {
    const today = getTodayDateString();
    setCards((prev) =>
      prev.map((c) =>
        c.deckId === deckId
          ? {
              ...c,
              status: 'new',
              repetition: 0,
              interval: 0,
              easeFactor: 2.5,
              nextReviewDate: today,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  // Handlers for Card operations
  const handleAddCards = (newCards: { front: string; back: string; hint?: string }[]) => {
    if (!createCardDeckId) return;

    const today = getTodayDateString();
    const createdList: Flashcard[] = newCards.map((c, idx) => ({
      id: `card-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      deckId: createCardDeckId,
      front: c.front,
      back: c.back,
      hint: c.hint,
      status: 'new',
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReviewDate: today,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    setCards((prev) => [...prev, ...createdList]);
  };

  const handleUpdateCard = (updatedCard: Flashcard) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleResetCardProgress = (cardId: string) => {
    const today = getTodayDateString();
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              status: 'new',
              repetition: 0,
              interval: 0,
              easeFactor: 2.5,
              nextReviewDate: today,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  // Study Session Launchers
  const handleStartStudyDeck = (deckId: string, dueOnly: boolean = false) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    const deckCards = cards.filter((c) => c.deckId === deckId);
    let studyCards = dueOnly ? deckCards.filter(isCardDue) : deckCards;

    if (studyCards.length === 0) {
      studyCards = deckCards;
    }

    if (studyCards.length === 0) {
      alert('Dieser Stapel hat noch keine Karten zum Lernen.');
      return;
    }

    setActiveStudySession({
      deck,
      studyCards,
    });
  };

  const handleStartDueSession = (deckId?: string) => {
    if (deckId) {
      handleStartStudyDeck(deckId, true);
      return;
    }

    const dueList = cards.filter(isCardDue);
    if (dueList.length === 0) {
      alert('Keine fälligen Karten für heute vorhanden.');
      return;
    }

    const virtualDeck: Deck = {
      id: 'virtual-due-deck',
      subjectId: 'all',
      title: 'Tagesfokus',
      description: 'Alle fälligen Karten',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveStudySession({
      deck: virtualDeck,
      studyCards: dueList,
    });
  };

  const handleImportBackup = (data: { subjects: Subject[]; decks: Deck[]; cards: Flashcard[] }) => {
    setSubjects(data.subjects);
    setDecks(data.decks);
    setCards(data.cards);
  };

  const handleResetAllData = () => {
    resetAllDataToDefault();
    setSubjects(loadSubjects());
    setDecks(loadDecks());
    setCards(loadCards());
    setSelectedSubjectId(null);
    setSelectedDeckId(null);
    setActiveStudySession(null);
  };

  // Full-screen distraction-free study mode
  if (activeStudySession) {
    const deckCards =
      activeStudySession.deck.id === 'virtual-due-deck'
        ? cards
        : cards.filter((c) => c.deckId === activeStudySession.deck.id);

    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <StudySession
          deck={activeStudySession.deck}
          cards={activeStudySession.studyCards}
          allDeckCards={deckCards}
          onUpdateCard={handleUpdateCard}
          onFinishSession={() => setActiveStudySession(null)}
          onBackToDeck={() => setActiveStudySession(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Quiet top header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'subjects') {
            setSelectedSubjectId(null);
            setSelectedDeckId(null);
          }
        }}
        onOpenCreateSubject={handleOpenCreateSubject}
        dueCount={dueCardsTotal}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'subjects' && (
          <>
            {/* View 1: Deck Detail Box View */}
            {selectedDeckId && currentDeck && currentSubject ? (
              <DeckDetail
                deck={currentDeck}
                subject={currentSubject}
                cards={cards.filter((c) => c.deckId === currentDeck.id)}
                onBack={() => setSelectedDeckId(null)}
                onStartStudy={(dueOnly) => handleStartStudyDeck(currentDeck.id, dueOnly)}
                onOpenAddCards={() => {
                  setCreateCardDeckId(currentDeck.id);
                  setIsCreateCardModalOpen(true);
                }}
                onOpenManageCards={() => {
                  setManageCardsDeckId(currentDeck.id);
                  setIsManageCardsModalOpen(true);
                }}
                onEditDeck={() => handleOpenEditDeck(currentDeck)}
                onDeleteDeck={() => handleDeleteDeck(currentDeck.id)}
                onResetProgress={() => handleResetDeckProgress(currentDeck.id)}
              />
            ) : selectedSubjectId && currentSubject ? (
              /* View 2: Subject View with Decks in Boxenansicht */
              <SubjectView
                subject={currentSubject}
                decks={decks.filter((d) => d.subjectId === currentSubject.id)}
                cards={cards}
                onBack={() => setSelectedSubjectId(null)}
                onSelectDeck={(deckId) => setSelectedDeckId(deckId)}
                onOpenCreateDeck={() => handleOpenCreateDeck(currentSubject.id)}
                onStartStudyDeck={(deckId) => handleStartStudyDeck(deckId, false)}
                onOpenAddCards={(deckId) => {
                  setCreateCardDeckId(deckId);
                  setIsCreateCardModalOpen(true);
                }}
                onEditSubject={() => handleOpenEditSubject(currentSubject)}
                onDeleteSubject={() => handleDeleteSubject(currentSubject.id)}
                onEditDeck={(deck) => handleOpenEditDeck(deck)}
                onDeleteDeck={(deckId) => handleDeleteDeck(deckId)}
              />
            ) : (
              /* View 3: All Subjects in Boxenansicht */
              <SubjectList
                subjects={subjects}
                decks={decks}
                cards={cards}
                onSelectSubject={(subjectId) => setSelectedSubjectId(subjectId)}
                onOpenCreateSubject={handleOpenCreateSubject}
                onStartDueSession={() => handleStartDueSession()}
              />
            )}
          </>
        )}

        {activeTab === 'due' && (
          <DueSessionView
            subjects={subjects}
            decks={decks}
            cards={cards}
            onStartDueStudy={(deckId) => handleStartDueSession(deckId)}
            onSelectDeck={(deckId) => {
              const deck = decks.find((d) => d.id === deckId);
              if (deck) {
                setSelectedSubjectId(deck.subjectId);
                setSelectedDeckId(deck.id);
                setActiveTab('subjects');
              }
            }}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            subjects={subjects}
            decks={decks}
            cards={cards}
            onImportBackup={handleImportBackup}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />

      {deckModalSubjectId && (
        <DeckModal
          isOpen={isDeckModalOpen}
          subjectTitle={
            subjects.find((s) => s.id === deckModalSubjectId)?.title || 'Fach'
          }
          onClose={() => {
            setIsDeckModalOpen(false);
            setEditingDeck(null);
            setDeckModalSubjectId(null);
          }}
          onSave={handleSaveDeck}
          initialDeck={editingDeck}
        />
      )}

      {createCardDeckId && (
        <CreateCardModal
          isOpen={isCreateCardModalOpen}
          deck={decks.find((d) => d.id === createCardDeckId)!}
          onClose={() => {
            setIsCreateCardModalOpen(false);
            setCreateCardDeckId(null);
          }}
          onAddCards={handleAddCards}
        />
      )}

      {manageCardsDeckId && (
        <CardManagerModal
          isOpen={isManageCardsModalOpen}
          deck={decks.find((d) => d.id === manageCardsDeckId)!}
          cards={cards.filter((c) => c.deckId === manageCardsDeckId)}
          onClose={() => {
            setIsManageCardsModalOpen(false);
            setManageCardsDeckId(null);
          }}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onResetCardProgress={handleResetCardProgress}
          onOpenCreateCard={() => {
            setCreateCardDeckId(manageCardsDeckId);
            setIsCreateCardModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
