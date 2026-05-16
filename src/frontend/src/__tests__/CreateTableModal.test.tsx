import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CreateTableModal from "../components/CreateTableModal";

describe("CreateTableModal", () => {
  it("does not render when closed", () => {
    render(
      <CreateTableModal
        open={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    expect(screen.queryByText(/テーブル作成/)).not.toBeInTheDocument();
  });

  it("renders modal title and DDL textarea when open", () => {
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    expect(screen.getByText("テーブル作成 - public")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onCreate with DDL when create is clicked", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        schemaName="public"
      />,
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "CREATE TABLE test (id INT)");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalledWith("CREATE TABLE test (id INT)");
  });

  it("calls onClose when cancel is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByText("キャンセル"));
    expect(mockClose).toHaveBeenCalled();
  });

  it("calls onClose when x button is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByTestId("modal-close-button"));
    expect(mockClose).toHaveBeenCalled();
  });

  // FE-13-22
  it("renders clear button when open", () => {
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    expect(screen.getByText("クリア")).toBeInTheDocument();
  });

  // FE-13-23
  it("buttons are ordered as 作成 then クリア then キャンセル", () => {
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />,
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

  // FE-13-24
  it("clear button resets DDL textarea to empty", async () => {
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "CREATE TABLE test (id INT);");

    await userEvent.click(screen.getByText("クリア"));

    expect(textarea).toHaveValue("");
  });

  // FE-13-25
  it("modal stays open after clear button is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockClose).not.toHaveBeenCalled();
    expect(screen.getByText("テーブル作成 - public")).toBeInTheDocument();
  });

  // FE-13-26
  it("clear button does not trigger onCreate", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // FE-13-27
  it("clear button does not trigger onClose", async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockClose).not.toHaveBeenCalled();
  });

  // FE-13-28
  it("can submit after clearing and re-entering DDL", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        schemaName="public"
      />,
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "CREATE TABLE old_table (id INT);");
    await userEvent.click(screen.getByText("クリア"));
    await userEvent.type(textarea, "CREATE TABLE new_table (id INT);");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalledWith("CREATE TABLE new_table (id INT);");
  });

  // FE-13-29
  it("existing 作成 button behavior unchanged", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        schemaName="public"
      />,
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "CREATE TABLE t (id INT);");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalledWith("CREATE TABLE t (id INT);");
  });

  // FE-13-30
  it("existing キャンセル button behavior unchanged", async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByText("キャンセル"));
    expect(mockClose).toHaveBeenCalled();
  });

  // FE-13-31
  it("existing x button behavior unchanged", async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />,
    );
    await userEvent.click(screen.getByTestId("modal-close-button"));
    expect(mockClose).toHaveBeenCalled();
  });
});
