import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AddCardModal } from "../AddCardModal";

describe("AddCardModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AddCardModal
        isOpen={false}
        columnTitle="To Do"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal when isOpen is true", () => {
    render(
      <AddCardModal
        isOpen={true}
        columnTitle="To Do"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add New Card")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("shows validation error when submitting with empty title", () => {
    const handleSubmit = vi.fn();
    render(
      <AddCardModal
        isOpen={true}
        columnTitle="To Do"
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const submitBtn = screen.getByTestId("submit-card-button");
    fireEvent.click(submitBtn);

    expect(screen.getByTestId("title-error")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit and onClose when valid data is submitted", () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddCardModal
        isOpen={true}
        columnTitle="To Do"
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const titleInput = screen.getByTestId("card-title-input");
    const detailsInput = screen.getByTestId("card-details-input");
    const submitBtn = screen.getByTestId("submit-card-button");

    fireEvent.change(titleInput, { target: { value: "New Feature" } });
    fireEvent.change(detailsInput, { target: { value: "Feature specifications" } });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith("New Feature", "Feature specifications");
    expect(handleClose).toHaveBeenCalled();
  });
});
