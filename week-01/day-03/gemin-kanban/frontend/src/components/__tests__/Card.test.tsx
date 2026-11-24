import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Card } from "../Card";

describe("Card Component", () => {
  const sampleCard = {
    id: "card-1",
    title: "Test Card Title",
    details: "Test Card Details",
  };

  const renderWithDnd = (ui: React.ReactElement) => {
    return render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="col-1">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {ui}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  it("renders card title and details", () => {
    renderWithDnd(
      <Card card={sampleCard} index={0} onDelete={vi.fn()} />
    );

    expect(screen.getByText("Test Card Title")).toBeInTheDocument();
    expect(screen.getByText("Test Card Details")).toBeInTheDocument();
  });

  it("triggers onDelete callback when delete button is clicked", () => {
    const handleDelete = vi.fn();
    renderWithDnd(
      <Card card={sampleCard} index={0} onDelete={handleDelete} />
    );

    const deleteBtn = screen.getByTestId("delete-card-card-1");
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith("card-1");
  });
});
