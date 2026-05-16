import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CreateSchemaModal from "../components/CreateSchemaModal";

describe("CreateSchemaModal", () => {
  it("does not render when closed", () => {
    render(
      <CreateSchemaModal
        open={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    expect(screen.queryByText("スキーマ作成")).not.toBeInTheDocument();
  });

  it("renders modal title and all fields when open", () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    expect(screen.getByText("スキーマ作成 - testdb")).toBeInTheDocument();
    expect(screen.getByText("schema_name")).toBeInTheDocument();
    expect(screen.getByText("user_name")).toBeInTheDocument();
    expect(screen.getByText("schema_element")).toBeInTheDocument();
    expect(screen.getByText("IF NOT EXISTS")).toBeInTheDocument();
  });

  it("displays red asterisk for required schema_name field", () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("has IF NOT EXISTS checkbox checked by default", () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("shows validation error when schema_name is empty and create is clicked", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByText("作成"));
    expect(screen.getByText("Required field")).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("calls onCreate with form data when schema_name is provided", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "new_schema");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalledWith({
      schema_name: "new_schema",
      user_name: "",
      schema_element: "",
      ifNotExists: true,
    });
  });

  it("calls onClose when cancel is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByText("キャンセル"));
    expect(mockClose).toHaveBeenCalled();
  });

  it("calls onClose when x button is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByTestId("modal-close-button"));
    expect(mockClose).toHaveBeenCalled();
  });

  // FE-13-11
  it("renders clear button when open", () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    expect(screen.getByText("クリア")).toBeInTheDocument();
  });

  // FE-13-12
  it("buttons are ordered as 作成 then クリア then キャンセル", () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
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

  // FE-13-13
  it("clear button resets text fields to empty", async () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "my_schema");
    await userEvent.type(inputs[1], "admin");
    await userEvent.type(inputs[2], "CREATE TABLE t()");

    await userEvent.click(screen.getByText("クリア"));

    inputs.forEach((input) => {
      expect(input).toHaveValue("");
    });
  });

  // FE-13-14
  it("clear button resets IF NOT EXISTS checkbox to checked", async () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    // Uncheck the checkbox
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Click clear
    await userEvent.click(screen.getByText("クリア"));

    // Checkbox should be checked again (default)
    expect(checkbox).toBeChecked();
  });

  // FE-13-15
  it("modal stays open after clear button is clicked", async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockClose).not.toHaveBeenCalled();
    expect(screen.getByText("スキーマ作成 - testdb")).toBeInTheDocument();
  });

  // FE-13-16
  it("clear button does not trigger onCreate", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockCreate).not.toHaveBeenCalled();
  });

  // FE-13-17
  it("clear button does not trigger onClose", async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByText("クリア"));
    expect(mockClose).not.toHaveBeenCalled();
  });

  // FE-13-18
  it("can submit after clearing and re-entering schema_name", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "old_schema");
    await userEvent.click(screen.getByText("クリア"));
    await userEvent.type(inputs[0], "new_schema");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalledWith({
      schema_name: "new_schema",
      user_name: "",
      schema_element: "",
      ifNotExists: true,
    });
  });

  // FE-13-19
  it("existing 作成 button behavior unchanged", async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />,
    );
    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "test_schema");
    await userEvent.click(screen.getByText("作成"));
    expect(mockCreate).toHaveBeenCalled();
  });

  // FE-13-20
  it("existing キャンセル button behavior unchanged", async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByText("キャンセル"));
    expect(mockClose).toHaveBeenCalled();
  });

  // FE-13-21
  it("existing x button behavior unchanged", async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />,
    );
    await userEvent.click(screen.getByTestId("modal-close-button"));
    expect(mockClose).toHaveBeenCalled();
  });
});
