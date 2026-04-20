import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
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
});
