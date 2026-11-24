import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DragDropContext } from "@hello-pangea/dnd";
import { Column } from "../Column";

describe("Column Component", () => {
  const sampleColumn = {
    id: "col-1",
    title: "To Do",
    cardIds: ["card-1"],
  };

  const sampleCards = [
    {
      id: "card-1",
      title: "First Task",
      details: "Task details",
    },
  ];

  const renderWithDnd = (ui: React.ReactElement) => {
    return render(<DragDropContext onDragEnd={() => {}}>{ui}</DragDropContext>);
  };

  it("renders column title and card count", () => {
    renderWithDnd(
      <Column
        column={sampleColumn}
        cards={sampleCards}
        onRenameColumn={vi.fn()}
        onDeleteCard={vi.fn()}
        onOpenAddModal={vi.fn()}
      />
    );

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByTestId("column-count-col-1")).toHaveTextContent("1");
    expect(screen.getByText("First Task")).toBeInTheDocument();
  });

  it("allows renaming the column", () => {
    const handleRename = vi.fn();
    renderWithDnd(
      <Column
        column={sampleColumn}
        cards={sampleCards}
        onRenameColumn={handleRename}
        onDeleteCard={vi.fn()}
        onOpenAddModal={vi.fn()}
      />
    );

    const titleContainer = screen.getByTestId("column-title-col-1");
    fireEvent.click(titleContainer);

    const input = screen.getByTestId("column-title-input-col-1");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Ready Tasks" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleRename).toHaveBeenCalledWith("col-1", "Ready Tasks");
  });

  it("triggers onOpenAddModal when add button is clicked", () => {
    const handleAdd = vi.fn();
    renderWithDnd(
      <Column
        column={sampleColumn}
        cards={sampleCards}
        onRenameColumn={vi.fn()}
        onDeleteCard={vi.fn()}
        onOpenAddModal={handleAdd}
      />
    );

    const addBtn = screen.getByTestId("add-card-button-col-1");
    fireEvent.click(addBtn);

    expect(handleAdd).toHaveBeenCalledWith("col-1");
  });
});
