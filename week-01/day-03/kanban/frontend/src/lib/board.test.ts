import { describe, expect, it } from "vitest";
import { addCard, deleteCard, initialBoard, moveCard, renameColumn, updateCard, type Board } from "./board";

const board = (): Board => initialBoard.map((column) => ({ ...column, cards: column.cards.map((card) => ({ ...card })) }));

describe("board state", () => {
  it("starts with five named columns and sample cards", () => {
    const current = board();
    expect(current.map((column) => column.name)).toEqual(["Backlog", "To do", "In progress", "Review", "Done"]);
    expect(current.reduce((count, column) => count + column.cards.length, 0)).toBeGreaterThan(0);
  });

  it("renames a column and ignores a blank name", () => {
    const current = board();
    expect(renameColumn(current, "todo", "  Ready  ")[1].name).toBe("Ready");
    expect(renameColumn(current, "todo", "   ")).toBe(current);
  });

  it("adds a card to the requested column", () => {
    const next = addCard(board(), "review", { id: "new", title: "Review build", details: "Check release output." });
    expect(next[3].cards.at(-1)).toEqual({ id: "new", title: "Review build", details: "Check release output." });
  });

  it("updates a card title and details", () => {
    const next = updateCard(board(), "card-1", "New title", "New details");
    expect(next[0].cards[0]).toMatchObject({ title: "New title", details: "New details" });
  });

  it("deletes a card", () => {
    const next = deleteCard(board(), "card-1");
    expect(next.flatMap((column) => column.cards).some((card) => card.id === "card-1")).toBe(false);
  });

  it("reorders a card within its column", () => {
    const next = moveCard(board(), "card-1", "backlog", 1);
    expect(next[0].cards.map((card) => card.id)).toEqual(["card-2", "card-1"]);
  });

  it("moves a card to another column and can append to an empty column", () => {
    const current = board();
    current[4].cards = [];
    const next = moveCard(current, "card-1", "done", Number.MAX_SAFE_INTEGER);
    expect(next[0].cards.map((card) => card.id)).toEqual(["card-2"]);
    expect(next[4].cards.map((card) => card.id)).toEqual(["card-1"]);
  });
});
