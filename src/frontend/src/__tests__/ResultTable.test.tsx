import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ResultTable from '../components/ResultTable';

describe('ResultTable', () => {
  it('shows placeholder when no results', () => {
    render(<ResultTable columns={[]} rows={[]} />);
    expect(
      screen.getByText('Execute a query to see results here.')
    ).toBeInTheDocument();
  });

  it('renders column headers and row data', () => {
    const columns = ['id', 'name'];
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    render(<ResultTable columns={columns} rows={rows} />);
    // Headers
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    // Data
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('sorts rows ascending then descending on column header click', async () => {
    const user = userEvent.setup();
    const columns = ['name'];
    const rows = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
    render(<ResultTable columns={columns} rows={rows} />);

    const cells = () => screen.getAllByRole('cell').map((c) => c.textContent);

    // 初期順: Charlie, Alice, Bob
    expect(cells()).toEqual(['Charlie', 'Alice', 'Bob']);

    // 昇順
    await user.click(screen.getByRole('button', { name: /name/i }));
    expect(cells()).toEqual(['Alice', 'Bob', 'Charlie']);

    // 降順
    await user.click(screen.getByRole('button', { name: /name/i }));
    expect(cells()).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('renders NULL for null values', () => {
    const columns = ['name'];
    const rows = [{ name: null }];
    render(<ResultTable columns={columns} rows={rows} />);
    expect(screen.getByText('NULL')).toBeInTheDocument();
  });

  it('calls onRowClick with row data when history mode is active', async () => {
    const user = userEvent.setup();
    const mockRowClick = vi.fn();
    const columns = ['id', 'executed_at', 'query_text'];
    const rows = [
      { id: 1, executed_at: '2024-01-01 10:00:00', query_text: 'SELECT 1' },
      { id: 2, executed_at: '2024-01-01 09:00:00', query_text: 'SELECT 2' },
    ];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={true}
        onRowClick={mockRowClick}
      />
    );
    const tableRows = screen.getAllByRole('row');
    // tableRows[0] is header, tableRows[1] is first data row
    await user.click(tableRows[1]);
    expect(mockRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('does not call onRowClick when history mode is not active', async () => {
    const user = userEvent.setup();
    const mockRowClick = vi.fn();
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'Alice' }];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={false}
        onRowClick={mockRowClick}
      />
    );
    const tableRows = screen.getAllByRole('row');
    await user.click(tableRows[1]);
    expect(mockRowClick).not.toHaveBeenCalled();
  });

  it('displays all querylog columns in history mode', () => {
    const columns = ['id', 'executed_at', 'query_text'];
    const rows = [
      { id: 1, executed_at: '2024-01-01 10:00:00', query_text: 'SELECT 1' },
    ];
    render(
      <ResultTable
        columns={columns}
        rows={rows}
        isHistoryMode={true}
        onRowClick={vi.fn()}
      />
    );
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('executed_at')).toBeInTheDocument();
    expect(screen.getByText('query_text')).toBeInTheDocument();
  });

  it('formats executed_at as yyyy/mm/dd hh:mm:ss in history mode', () => {
    const columns = ['id', 'executed_at', 'query_text'];
    const rows = [{ id: 1, executed_at: '2024-01-01 10:00:00', query_text: 'SELECT 1' }];
    render(
      <ResultTable columns={columns} rows={rows} isHistoryMode={true} onRowClick={vi.fn()} />
    );
    expect(screen.getByText('2024/01/01 10:00:00')).toBeInTheDocument();
  });

  it('does not format executed_at when not in history mode', () => {
    const columns = ['id', 'executed_at', 'query_text'];
    const rows = [{ id: 1, executed_at: '2024-01-01 10:00:00', query_text: 'SELECT 1' }];
    render(
      <ResultTable columns={columns} rows={rows} isHistoryMode={false} />
    );
    expect(screen.getByText('2024-01-01 10:00:00')).toBeInTheDocument();
  });
});
