import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Board } from "../Board";

describe("Board Component", () => {
  it("renders exactly 5 columns with initial dummy data", () => {
    render(<Board />);

    expect(screen.getByTestId("column-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-3")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-4")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-5")).toBeInTheDocument();

    // Verify initial column titles
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();

    // Verify some sample cards are rendered
    expect(screen.getByText("Market research analysis")).toBeInTheDocument();
    expect(screen.getByText("API gateway authentication")).toBeInTheDocument();
  });

  it("can add a new card to a column", () => {
    render(<Board />);

    const addBtn = screen.getByTestId("add-card-button-col-1");
    fireEvent.click(addBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const titleInput = screen.getByTestId("card-title-input");
    const detailsInput = screen.getByTestId("card-details-input");
    const submitBtn = screen.getByTestId("submit-card-button");

    fireEvent.change(titleInput, { target: { value: "Automated Vitest Test" } });
    fireEvent.change(detailsInput, { target: { value: "Verifying card addition via unit test" } });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Automated Vitest Test")).toBeInTheDocument();
    expect(screen.getByText("Verifying card addition via unit test")).toBeInTheDocument();
  });

  it("can delete an existing card", () => {
    render(<Board />);

    expect(screen.getByText("Market research analysis")).toBeInTheDocument();

    const deleteBtn = screen.getByTestId("delete-card-card-1");
    fireEvent.click(deleteBtn);

    expect(screen.queryByText("Market research analysis")).not.toBeInTheDocument();
  });

  it("can rename a column", () => {
    render(<Board />);

    const columnTitle = screen.getByTestId("column-title-col-1");
    fireEvent.click(columnTitle);

    const input = screen.getByTestId("column-title-input-col-1");
    fireEvent.change(input, { target: { value: "Triage" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Triage")).toBeInTheDocument();
  });
});
