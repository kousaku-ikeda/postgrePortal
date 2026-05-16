import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CellDetailModal from "../components/CellDetailModal";

describe("CellDetailModal", () => {
  // FE-12-01
  it("does not render when open is false", () => {
    render(
      <CellDetailModal
        open={false}
        onClose={vi.fn()}
        columnName="embedding"
        cellValue="full content"
      />,
    );
    expect(screen.queryByText("embedding")).not.toBeInTheDocument();
  });

  // FE-12-02
  it("renders column name as title when open", () => {
    render(
      <CellDetailModal
        open={true}
        onClose={vi.fn()}
        columnName="embedding"
        cellValue="full content"
      />,
    );
    expect(screen.getByText("embedding")).toBeInTheDocument();
  });

  // FE-12-03
  it("renders full cell value in body when open", () => {
    render(
      <CellDetailModal
        open={true}
        onClose={vi.fn()}
        columnName="col"
        cellValue="long full content text"
      />,
    );
    expect(screen.getByText("long full content text")).toBeInTheDocument();
  });

  // FE-12-04
  it("renders close button (x) in title bar", () => {
    render(
      <CellDetailModal
        open={true}
        onClose={vi.fn()}
        columnName="col"
        cellValue="value"
      />,
    );
    expect(screen.getByLabelText("close")).toBeInTheDocument();
  });

  // FE-12-05
  it("renders Close button in dialog actions", () => {
    render(
      <CellDetailModal
        open={true}
        onClose={vi.fn()}
        columnName="col"
        cellValue="value"
      />,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  // FE-12-06
  it("calls onClose when x button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CellDetailModal
        open={true}
        onClose={onClose}
        columnName="col"
        cellValue="value"
      />,
    );
    await user.click(screen.getByLabelText("close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // FE-12-07
  it("calls onClose when Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CellDetailModal
        open={true}
        onClose={onClose}
        columnName="col"
        cellValue="value"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // FE-12-08
  it("uses MUI Dialog component", () => {
    render(
      <CellDetailModal
        open={true}
        onClose={vi.fn()}
        columnName="col"
        cellValue="value"
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
