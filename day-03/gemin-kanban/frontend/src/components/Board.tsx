"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { BoardData } from "@/types/kanban";
import { initialBoardData } from "@/data/initialData";
import { Navbar } from "./Navbar";
import { Column } from "./Column";
import { AddCardModal } from "./AddCardModal";

export function Board() {
  const [boardData, setBoardData] = useState<BoardData>(initialBoardData);
  const [activeModalColId, setActiveModalColId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = boardData.columns[source.droppableId];
    const finishColumn = boardData.columns[destination.droppableId];

    if (!startColumn || !finishColumn) return;

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newCardIds = Array.from(startColumn.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        cardIds: newCardIds,
      };

      setBoardData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [newColumn.id]: newColumn,
        },
      }));
      return;
    }

    // Moving between different columns
    const startCardIds = Array.from(startColumn.cardIds);
    startCardIds.splice(source.index, 1);
    const newStartColumn = {
      ...startColumn,
      cardIds: startCardIds,
    };

    const finishCardIds = Array.from(finishColumn.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = {
      ...finishColumn,
      cardIds: finishCardIds,
    };

    setBoardData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    }));
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setBoardData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          title: newTitle,
        },
      },
    }));
  };

  const handleOpenAddModal = (columnId: string) => {
    setActiveModalColId(columnId);
  };

  const handleCloseAddModal = () => {
    setActiveModalColId(null);
  };

  const handleAddCard = (title: string, details: string) => {
    if (!activeModalColId) return;

    const newCardId = `card-${Date.now()}`;
    const newCard = {
      id: newCardId,
      title,
      details,
    };

    setBoardData((prev) => {
      const targetColumn = prev.columns[activeModalColId];
      if (!targetColumn) return prev;

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [newCardId]: newCard,
        },
        columns: {
          ...prev.columns,
          [activeModalColId]: {
            ...targetColumn,
            cardIds: [...targetColumn.cardIds, newCardId],
          },
        },
      };
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setBoardData((prev) => {
      const newCards = { ...prev.cards };
      delete newCards[cardId];

      const newColumns = { ...prev.columns };
      for (const colId of prev.columnOrder) {
        newColumns[colId] = {
          ...newColumns[colId],
          cardIds: newColumns[colId].cardIds.filter((id) => id !== cardId),
        };
      }

      return {
        ...prev,
        cards: newCards,
        columns: newColumns,
      };
    });
  };

  const totalCards = Object.keys(boardData.cards).length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f3f6fa] flex items-center justify-center">
        <div className="text-sm font-semibold text-[#032147]">
          Loading Board...
        </div>
      </div>
    );
  }

  const activeColumn = activeModalColId
    ? boardData.columns[activeModalColId]
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f6fa]">
      <Navbar totalCards={totalCards} />

      <main className="flex-1 p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div
            className="flex items-start gap-5 pb-6 min-w-max mx-auto max-w-7xl"
            data-testid="kanban-board-columns"
          >
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              const cards = column.cardIds
                .map((cardId) => boardData.cards[cardId])
                .filter(Boolean);

              return (
                <Column
                  key={column.id}
                  column={column}
                  cards={cards}
                  onRenameColumn={handleRenameColumn}
                  onDeleteCard={handleDeleteCard}
                  onOpenAddModal={handleOpenAddModal}
                />
              );
            })}
          </div>
        </DragDropContext>
      </main>

      <AddCardModal
        isOpen={activeModalColId !== null}
        columnTitle={activeColumn ? activeColumn.title : ""}
        onClose={handleCloseAddModal}
        onSubmit={handleAddCard}
      />
    </div>
  );
}
