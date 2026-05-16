import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ResultTable from "../components/ResultTable";

describe("ResultTable", () => {
  it("shows placeholder when no results", () => {
    render(<ResultTable columns={[]} rows={[]} />);
    expect(
      screen.getByText("Execute a query to see results here."),
    ).toBeInTheDocument();
  });

  it("renders column headers and row data", () => {
    const columns = ["id", "name"];
    const rows = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    render(<ResultTable columns={columns} rows={rows} />);
    // Headers
    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    // Data
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("sorts rows ascending then descending on column header click", async () => {
    const user = userEvent.setup();
    const columns = ["name"];
    const rows = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
    render(<ResultTable columns={columns} rows={rows} />);

    const cells = () => screen.getAllByRole("cell").map((c) => c.textContent);

    // 初期順: Charlie, Alice, Bob
    expect(cells()).toEqual(["Charlie", "Alice", "Bob"]);

    // 昇順
    await user.click(screen.getByRole("button", { name: /name/i }));
    expect(cells()).toEqual(["Alice", "Bob", "Charlie"]);

    // 降順
    await user.click(screen.getByRole("button", { name: /name/i }));
    expect(cells()).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("renders NULL for null values", () => {
    const columns = ["name"];
    const rows = [{ name: null }];
    render(<ResultTable columns={columns} rows={rows} />);
    expect(screen.getByText("NULL")).toBeInTheDocument();
  });

  it("calls onRowClick with row data when history mode is active", async () => {
    const user = userEvent.setup();
    const mockRowClick = vi.fn();
    const columns = ["id", "executed_at", "query_text"];
    const rows = [
      { id: 1, executed_at: "2024-01-01 10:00:00", query_text: "SELECT 1" },
      { id: 2, executed_at: "2024-01-01 09:00:00", query_text: "SELECT 2" },
    ];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={true}
        onRowClick={mockRowClick}
      />,
    );
    const tableRows = screen.getAllByRole("row");
    // tableRows[0] is header, tableRows[1] is first data row
    await user.click(tableRows[1]);
    expect(mockRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it("does not call onRowClick when history mode is not active", async () => {
    const user = userEvent.setup();
    const mockRowClick = vi.fn();
    const columns = ["id", "name"];
    const rows = [{ id: 1, name: "Alice" }];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={false}
        onRowClick={mockRowClick}
      />,
    );
    const tableRows = screen.getAllByRole("row");
    await user.click(tableRows[1]);
    expect(mockRowClick).not.toHaveBeenCalled();
  });

  it("displays all querylog columns in history mode", () => {
    const columns = ["id", "executed_at", "query_text"];
    const rows = [
      { id: 1, executed_at: "2024-01-01 10:00:00", query_text: "SELECT 1" },
    ];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={true}
        onRowClick={vi.fn()}
      />,
    );
    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("executed_at")).toBeInTheDocument();
    expect(screen.getByText("query_text")).toBeInTheDocument();
  });

  it("formats executed_at as yyyy/mm/dd hh:mm:ss in history mode", () => {
    const columns = ["id", "executed_at", "query_text"];
    const rows = [
      { id: 1, executed_at: "2024-01-01 10:00:00", query_text: "SELECT 1" },
    ];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={true}
        onRowClick={vi.fn()}
      />,
    );
    expect(screen.getByText("2024/01/01 10:00:00")).toBeInTheDocument();
  });

  it("does not format executed_at when not in history mode", () => {
    const columns = ["id", "executed_at", "query_text"];
    const rows = [
      { id: 1, executed_at: "2024-01-01 10:00:00", query_text: "SELECT 1" },
    ];
    render(<ResultTable columns={columns} rows={rows} isHistoryMode={false} />);
    expect(screen.getByText("2024-01-01 10:00:00")).toBeInTheDocument();
  });

  // Sprint 3: truncation tests for target data types
  describe("cell text truncation", () => {
    const longText = "a".repeat(150); // 150 characters
    const exactly100 = "b".repeat(100); // exactly 100 characters
    const short99 = "c".repeat(99); // 99 characters

    it('truncates vector column text over 100 chars with "..."', () => {
      const columns = ["embedding"];
      const rows = [{ embedding: longText }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );
      const expected = longText.slice(0, 100) + "...";
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('truncates json column text over 100 chars with "..."', () => {
      const columns = ["data"];
      const rows = [{ data: longText }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["json"]} />,
      );
      const expected = longText.slice(0, 100) + "...";
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('truncates jsonb column text over 100 chars with "..."', () => {
      const columns = ["data"];
      const rows = [{ data: longText }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["jsonb"]} />,
      );
      const expected = longText.slice(0, 100) + "...";
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('truncates array type (float[]) column text over 100 chars with "..."', () => {
      const columns = ["values"];
      const rows = [{ values: longText }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["_float8"]} />,
      );
      const expected = longText.slice(0, 100) + "...";
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it("does not truncate text column even if over 100 chars", () => {
      const columns = ["description"];
      const rows = [{ description: longText }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["text"]} />,
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("does not truncate varchar column even if over 100 chars", () => {
      const columns = ["name"];
      const rows = [{ name: longText }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["varchar"]} />,
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("does not truncate integer column", () => {
      const columns = ["id"];
      const rows = [{ id: 42 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["int4"]} />,
      );
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("shows full text for target type column with exactly 100 chars", () => {
      const columns = ["embedding"];
      const rows = [{ embedding: exactly100 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );
      expect(screen.getByText(exactly100)).toBeInTheDocument();
    });

    it("shows full text for target type column with under 100 chars", () => {
      const columns = ["embedding"];
      const rows = [{ embedding: short99 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );
      expect(screen.getByText(short99)).toBeInTheDocument();
    });

    it("does not truncate NULL values in target type columns", () => {
      const columns = ["embedding"];
      const rows = [{ embedding: null }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );
      expect(screen.getByText("NULL")).toBeInTheDocument();
    });

    it("does not truncate header text", () => {
      const longColName = "x".repeat(150);
      const columns = [longColName];
      const rows = [{ [longColName]: "some value" }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );
      // Header should show full column name
      expect(screen.getByText(longColName)).toBeInTheDocument();
    });

    it("sorts by original data, not truncated text", async () => {
      const user = userEvent.setup();
      const row1Value = "a".repeat(50) + "z".repeat(101); // starts with 'a', total 151 chars
      const row2Value = "b".repeat(50) + "a".repeat(101); // starts with 'b', total 151 chars
      const columns = ["data"];
      const rows = [{ data: row2Value }, { data: row1Value }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["json"]} />,
      );

      // Click to sort ascending
      await user.click(screen.getByRole("button", { name: /data/i }));

      // After ascending sort, row1Value (starts with 'a') should come first
      const cells = screen.getAllByRole("cell").map((c) => c.textContent);
      expect(cells[0]).toBe(row1Value.slice(0, 100) + "...");
      expect(cells[1]).toBe(row2Value.slice(0, 100) + "...");
    });

    it("works without columnTypes prop (backward compatibility)", () => {
      const columns = ["id", "name"];
      const rows = [{ id: 1, name: "Alice" }];
      render(<ResultTable columns={columns} rows={rows} />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  // Sprint 4: cell detail modal tests
  describe("cell detail modal", () => {
    const longText150 = "x".repeat(150);
    const shortText99 = "y".repeat(99);

    // FE-12-09
    it("opens modal when truncated cell is clicked", async () => {
      const user = userEvent.setup();
      const columns = ["embedding"];
      const rows = [{ embedding: longText150 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      const truncatedText = longText150.slice(0, 100) + "...";
      await user.click(screen.getByText(truncatedText));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText("embedding")).toBeInTheDocument();
    });

    // FE-12-10
    it("shows full cell value in modal after clicking truncated cell", async () => {
      const user = userEvent.setup();
      const columns = ["embedding"];
      const rows = [{ embedding: longText150 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      const truncatedText = longText150.slice(0, 100) + "...";
      await user.click(screen.getByText(truncatedText));

      expect(screen.getByText(longText150)).toBeInTheDocument();
    });

    // FE-12-11
    it("does not open modal when non-truncated cell is clicked", async () => {
      const user = userEvent.setup();
      const columns = ["embedding"];
      const rows = [{ embedding: shortText99 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      await user.click(screen.getByText(shortText99));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // FE-12-12
    it("does not open modal when clicking non-target type cell", async () => {
      const user = userEvent.setup();
      const columns = ["description"];
      const rows = [{ description: longText150 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["text"]} />,
      );

      await user.click(screen.getByText(longText150));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // FE-12-13
    it("does not open modal when clicking NULL cell", async () => {
      const user = userEvent.setup();
      const columns = ["embedding"];
      const rows = [{ embedding: null }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      await user.click(screen.getByText("NULL"));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // FE-12-14
    it("does not open modal in HistoryMode when truncated cell is clicked", async () => {
      const user = userEvent.setup();
      const columns = ["embedding"];
      const rows = [{ embedding: longText150 }];
      render(
        <ResultTable
          columns={columns}
          rows={rows}
          columnTypes={["vector"]}
          isHistoryMode={true}
          onRowClick={vi.fn()}
        />,
      );

      const truncatedText = longText150.slice(0, 100) + "...";
      await user.click(screen.getByText(truncatedText));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // FE-12-15
    it("cell click stops propagation from row click", async () => {
      const user = userEvent.setup();
      const mockRowClick = vi.fn();
      const columns = ["embedding"];
      const rows = [{ embedding: longText150 }];
      render(
        <ResultTable
          columns={columns}
          rows={rows}
          columnTypes={["vector"]}
          isHistoryMode={false}
          onRowClick={mockRowClick}
        />,
      );

      const truncatedText = longText150.slice(0, 100) + "...";
      await user.click(screen.getByText(truncatedText));

      expect(mockRowClick).not.toHaveBeenCalled();
    });

    // FE-12-16
    it("closes modal when onClose is called", async () => {
      const user = userEvent.setup();
      const columns = ["embedding"];
      const rows = [{ embedding: longText150 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      const truncatedText = longText150.slice(0, 100) + "...";
      await user.click(screen.getByText(truncatedText));

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Close" }));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    // FE-12-17
    it("truncated cell has blue color style", () => {
      const columns = ["embedding"];
      const rows = [{ embedding: longText150 }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      const truncatedText = longText150.slice(0, 100) + "...";
      const element = screen.getByText(truncatedText);
      expect(element).toHaveStyle({ color: "#1976d2" });
    });

    // FE-12-18
    it("existing sort functionality still works", async () => {
      const user = userEvent.setup();
      const longA = "a".repeat(150);
      const longB = "b".repeat(150);
      const columns = ["embedding"];
      const rows = [{ embedding: longB }, { embedding: longA }];
      render(
        <ResultTable columns={columns} rows={rows} columnTypes={["vector"]} />,
      );

      // Click header to sort ascending
      await user.click(screen.getByRole("button", { name: /embedding/i }));

      const cells = screen.getAllByRole("cell").map((c) => c.textContent);
      expect(cells[0]).toBe(longA.slice(0, 100) + "...");
      expect(cells[1]).toBe(longB.slice(0, 100) + "...");

      // Click header to sort descending
      await user.click(screen.getByRole("button", { name: /embedding/i }));

      const cellsDesc = screen.getAllByRole("cell").map((c) => c.textContent);
      expect(cellsDesc[0]).toBe(longB.slice(0, 100) + "...");
      expect(cellsDesc[1]).toBe(longA.slice(0, 100) + "...");
    });

    // FE-12-19
    it("existing HistoryMode row click still works", async () => {
      const user = userEvent.setup();
      const mockRowClick = vi.fn();
      const columns = ["id", "executed_at", "query_text"];
      const rows = [
        { id: 1, executed_at: "2024-01-01 10:00:00", query_text: "SELECT 1" },
      ];
      render(
        <ResultTable
          columns={columns}
          rows={rows}
          isHistoryMode={true}
          onRowClick={mockRowClick}
        />,
      );

      const tableRows = screen.getAllByRole("row");
      // tableRows[0] is header, tableRows[1] is first data row
      await user.click(tableRows[1]);

      expect(mockRowClick).toHaveBeenCalledWith(rows[0]);
    });
  });
});
