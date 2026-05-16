import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CreateDatabaseModal from "../components/CreateDatabaseModal";

describe("CreateDatabaseModal", () => {
  it("does not render when closed", () => {
    render(
      <CreateDatabaseModal open={false} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    expect(screen.queryByText("データベース作成")).not.toBeInTheDocument();
  });

  it("renders modal title and all fields when open", () => {
    render(
      <CreateDatabaseModal open={true} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    expect(screen.getByText("データベース作成")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.getByText("template")).toBeInTheDocument();
    expect(screen.getByText("encoding")).toBeInTheDocument();
    expect(screen.getByText("lc_collate")).toBeInTheDocument();
    expect(screen.getByText("lc_ctype")).toBeInTheDocument();
    expect(screen.getByText("tablespace_name")).toBeInTheDocument();
    expect(screen.getByText("connlimit")).toBeInTheDocument();
  });

  it("displays red asterisk for required name field", () => {
    render(
      <CreateDatabaseModal open={true} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows validation error when name is empty and create is clicked", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
      />,
    );
    await userEvent.click(screen.getByText("作成"));
    expect(screen.getByText("Required field")).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText("キャンセル"));
    expect(mockClose).toHaveBeenCalled();
  });

  it("calls onClose when x button is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByTestId("modal-close-button"));
    expect(mockClose).toHaveBeenCalled();
  });

  // FE-13-01
  it("renders clear button when open", () => {
    render(
      <CreateDatabaseModal open={true} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    expect(screen.getByText("クリア")).toBeInTheDocument();
  });

  // FE-13-02
  it("buttons are ordered as 作成 then クリア then キャンセル", () => {
    render(
      <CreateDatabaseModal open={true} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    const buttons = screen
      .getAllByRole("button")
      .filter((btn) =>
        ["作成", "クリア", "キャンセル"].includes(btn.textContent || ""),
      );
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent("作成");
    expect(buttons[1]).toHaveTextContent("クリア");
    expect(buttons[2]).toHaveTextContent("キャンセル");
  });

  // FE-13-03
  it("clear button resets all 8 fields to empty", async () => {
    render(
      <CreateDatabaseModal open={true} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    const inputs = screen.getAllByRole("textbox");
    // Fill all 8 fields
    await userEvent.type(inputs[0], "testdb");
    await userEvent.type(inputs[1], "admin");
    await userEvent.type(inputs[2], "template1");
    await userEvent.type(inputs[3], "UTF8");
    await userEvent.type(inputs[4], "en_US.UTF-8");
    await userEvent.type(inputs[5], "en_US.UTF-8");
    await userEvent.type(inputs[6], "pg_default");
    await userEvent.type(inputs[7], "100");

    await userEvent.click(screen.getByText("クリア"));

    inputs.forEach((input) => {
      expect(input).toHaveValue("");
    });
  });

  // FE-13-04
  it("modal stays open after clear button is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockClose).not.toHaveBeenCalled();
    expect(screen.getByText("データベース作成")).toBeInTheDocument();
  });

  // FE-13-05
  it("clear button does not trigger onCreate", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // FE-13-06
  it("clear button does not trigger onClose", async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockClose).not.toHaveBeenCalled();
  });

  // FE-13-07
  it("can submit after clearing and re-entering name", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "old_name");
    await userEvent.click(screen.getByText("クリア"));
    await userEvent.type(inputs[0], "new_name");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalled();
  });

  // FE-13-08
  it("existing 作成 button behavior unchanged", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "mydb");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalled();
  });

  // FE-13-09
  it("existing キャンセル button behavior unchanged", async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText("キャンセル"));
    expect(mockClose).toHaveBeenCalled();
  });

  // FE-13-10
  it("existing x button behavior unchanged", async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByTestId("modal-close-button"));
    expect(mockClose).toHaveBeenCalled();
  });
});
