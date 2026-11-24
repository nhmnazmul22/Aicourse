"use client";

import { useRef, useState } from "react";
import { DragDropProvider, KeyboardSensor, PointerSensor } from "@dnd-kit/react";
import { useDroppable } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { addCard, deleteCard, initialBoard, moveCard, renameColumn, updateCard, type Board, type BoardColumn, type Card } from "@/lib/board";

function Icon({ name }: { name: "plus" | "more" | "close" | "grip" | "arrow" }) {
  if (name === "plus") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>;
  if (name === "close") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>;
  if (name === "more") return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="4" cy="10" r="1" /><circle cx="10" cy="10" r="1" /><circle cx="16" cy="10" r="1" /></svg>;
  if (name === "grip") return <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="4" r="1" /><circle cx="11" cy="4" r="1" /><circle cx="5" cy="8" r="1" /><circle cx="11" cy="8" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="11" cy="12" r="1" /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>;
}

function CardItem({ card, index, columnId, onEdit, onDelete }: {
  card: Card;
  index: number;
  columnId: string;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}) {
  const { ref, isDragging } = useSortable({ id: card.id, index, group: columnId, type: "card", accept: "card" });

  return (
    <article ref={ref} role="article" className={`task-card${isDragging ? " is-dragging" : ""}`} aria-label={card.title}>
      <div className="task-card-top">
        <span className="drag-grip" aria-hidden="true"><Icon name="grip" /></span>
        <button className="icon-button task-menu" type="button" aria-label={`Edit ${card.title}`} onClick={() => onEdit(card)}>
          <Icon name="more" />
        </button>
      </div>
      <button className="task-copy" type="button" onClick={() => onEdit(card)}>
        <span className="task-title">{card.title}</span>
        {card.details && <span className="task-details">{card.details}</span>}
      </button>
      <div className="task-card-bottom">
        <span className="task-mark" aria-hidden="true">{card.title.slice(0, 1).toUpperCase()}</span>
        <button className="delete-task" type="button" aria-label={`Delete ${card.title}`} onClick={() => onDelete(card.id)}>
          <Icon name="close" />
        </button>
      </div>
    </article>
  );
}

function Column({ column, onRename, onAdd, onEdit, onDelete }: {
  column: BoardColumn;
  onRename: (id: string, name: string) => void;
  onAdd: (columnId: string, title: string, details: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(column.name);
  const cancelRenameBlur = useRef(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const { ref: dropRef, isDropTarget } = useDroppable({ id: `column-${column.id}`, type: "column", accept: "card" });

  function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    cancelRenameBlur.current = true;
    commitName();
  }

  function commitName() {
    const trimmedName = name.trim();
    if (trimmedName) onRename(column.id, trimmedName);
    setName(trimmedName || column.name);
    setRenaming(false);
  }

  function saveCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(column.id, title, details);
    setTitle("");
    setDetails("");
    setAdding(false);
  }

  return (
    <section ref={dropRef} data-column={column.id} className={`board-column${isDropTarget ? " is-drop-target" : ""}`} aria-label={`${column.name} column`}>
      <header className="column-header">
        <div className="column-heading">
          {renaming ? (
            <form className="rename-form" onSubmit={saveName}>
              <label className="sr-only" htmlFor={`rename-${column.id}`}>Column name</label>
              <input id={`rename-${column.id}`} autoFocus value={name} onChange={(event) => setName(event.target.value)} onBlur={() => { if (cancelRenameBlur.current) { cancelRenameBlur.current = false; return; } commitName(); }} onKeyDown={(event) => { if (event.key === "Escape") { cancelRenameBlur.current = true; setName(column.name); setRenaming(false); } }} onFocus={(event) => event.currentTarget.select()} />
            </form>
          ) : (
            <button className="column-name" type="button" title="Rename column" onClick={() => { cancelRenameBlur.current = false; setName(column.name); setRenaming(true); }}>{column.name}</button>
          )}
          <span className="column-count">{column.cards.length}</span>
        </div>
        <button className="icon-button add-card-icon" type="button" aria-label={`Add card to ${column.name}`} onClick={() => setAdding((value) => !value)}>
          <Icon name="plus" />
        </button>
      </header>

      <div className="column-cards" aria-label={`${column.name} cards`}>
        {column.cards.map((card, index) => <CardItem key={card.id} card={card} index={index} columnId={column.id} onEdit={onEdit} onDelete={onDelete} />)}
        {column.cards.length === 0 && !adding && <p className="empty-column">Nothing here yet. Add a card or drop one in.</p>}
        {adding && (
          <form className="new-card-form" onSubmit={saveCard}>
            <label className="sr-only" htmlFor={`new-title-${column.id}`}>Card title</label>
            <input id={`new-title-${column.id}`} autoFocus placeholder="What needs to get done?" value={title} onChange={(event) => setTitle(event.target.value)} />
            <label className="sr-only" htmlFor={`new-details-${column.id}`}>Card details</label>
            <textarea id={`new-details-${column.id}`} placeholder="Add a few details…" rows={3} value={details} onChange={(event) => setDetails(event.target.value)} />
            <div className="form-actions">
              <button className="button button-primary" type="submit" disabled={!title.trim()}>Add card</button>
              <button className="button button-quiet" type="button" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {!adding && <button className="add-card-row" type="button" onClick={() => setAdding(true)}><Icon name="plus" /> Add a card</button>}
    </section>
  );
}

function EditDialog({ card, onSave, onClose }: { card: Card; onSave: (id: string, title: string, details: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title">
        <div className="dialog-heading">
          <div><span className="dialog-kicker">Card details</span><h2 id="edit-title">Edit card</h2></div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); if (title.trim()) onSave(card.id, title, details); }}>
          <label htmlFor="edit-card-title">Title</label>
          <input id="edit-card-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} />
          <label htmlFor="edit-card-details">Details</label>
          <textarea id="edit-card-details" rows={5} value={details} onChange={(event) => setDetails(event.target.value)} />
          <div className="form-actions dialog-actions">
            <button className="button button-primary" type="submit" disabled={!title.trim()}>Save changes</button>
            <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function BoardView() {
  const [board, setBoard] = useState<Board>(() => initialBoard.map((column) => ({ ...column, cards: [...column.cards] })));
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const boardBeforeDrag = useRef<Board | null>(null);
  const totalCards = board.reduce((total, column) => total + column.cards.length, 0);

  function handleDragOver(event: import("@dnd-kit/react").DragOverEvent) {
    const { source, target } = event.operation;
    if (!source || !isSortable(source) || source.type !== "card") return;
    event.preventDefault();
    if (!target) return;
    const targetColumn = isSortable(target)
      ? String(target.group ?? "")
      : String(target.id).replace(/^column-/, "");
    if (!targetColumn) return;
    if (source.id === target.id) return;
    const targetIndex = isSortable(target) ? target.index : Number.MAX_SAFE_INTEGER;
    setBoard((current) => {
      const sourceColumn = current.find((column) => column.cards.some((card) => card.id === String(source.id)));
      const destination = current.find((column) => column.id === targetColumn);
      if (!sourceColumn || !destination) return current;
      const sourceIndex = sourceColumn.cards.findIndex((card) => card.id === String(source.id));
      if (sourceColumn.id === targetColumn && sourceIndex === targetIndex) return current;
      return moveCard(current, String(source.id), targetColumn, targetIndex);
    });
  }

  function handleDragEnd(event: import("@dnd-kit/react").DragEndEvent) {
    if (event.canceled || !event.operation.target) {
      if (boardBeforeDrag.current) setBoard(boardBeforeDrag.current);
    }
    boardBeforeDrag.current = null;
  }

  function handleAdd(columnId: string, title: string, details: string) {
    setBoard((current) => addCard(current, columnId, { id: crypto.randomUUID(), title: title.trim(), details: details.trim() }));
  }

  function saveEdit(id: string, title: string, details: string) {
    setBoard((current) => updateCard(current, id, title.trim(), details.trim()));
    setEditingCard(null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#board" aria-label="Flowboard home"><span className="brand-mark"><i /><i /><i /></span><span>flowboard</span></a>
        <div className="topbar-right"><span className="workspace-label"><span className="workspace-dot" /> Studio workspace</span><span className="avatar" aria-label="Your profile">A</span></div>
      </header>

      <div className="page-content" id="board">
        <section className="board-intro">
          <div>
            <p className="breadcrumb">Projects <Icon name="arrow" /> <span>Product studio</span></p>
            <div className="board-title-row"><h1>Product sprint</h1><span className="live-indicator"><i /> In motion</span></div>
            <p className="board-subtitle">A clear view of what the team is shaping this week.</p>
          </div>
          <div className="board-summary"><span className="summary-number">{totalCards}</span><span className="summary-label">cards in play</span><span className="summary-rule" /></div>
        </section>

        <section className="board-wrap" aria-label="Product sprint board">
          <div className="board-toolbar"><div className="toolbar-title"><span className="toolbar-indicator" /> Sprint board <span className="toolbar-divider">/</span> <span className="toolbar-muted">Week 24</span></div><p>Drag cards to move work forward</p></div>
          <DragDropProvider
            sensors={[{ plugin: PointerSensor, options: { preventActivation: () => false } }, KeyboardSensor]}
            onDragStart={() => { boardBeforeDrag.current = board; }}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="board-columns">
              {board.map((column) => <Column key={column.id} column={column} onRename={(id, name) => setBoard((current) => renameColumn(current, id, name))} onAdd={handleAdd} onEdit={setEditingCard} onDelete={(id) => setBoard((current) => deleteCard(current, id))} />)}
            </div>
          </DragDropProvider>
        </section>
        <footer className="page-footer"><span>Small steps, clear progress.</span><span>Changes are temporary and reset when you reload.</span></footer>
      </div>

      {editingCard && <EditDialog key={editingCard.id} card={editingCard} onSave={saveEdit} onClose={() => setEditingCard(null)} />}
    </main>
  );
}
