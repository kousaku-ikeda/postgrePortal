import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import QueryEditor from '../components/QueryEditor';

// Wrapper to provide controlled sql state for tests that need typing
const ControlledQueryEditor: React.FC<{
  onExecute: (sql: string, limit: number) => void;
  affectedRows: null | number;
}> = ({ onExecute, affectedRows }) => {
  const [sql, setSql] = React.useState('');
  return (
    <QueryEditor
      sql={sql}
      onSqlChange={setSql}
      onExecute={onExecute}
      affectedRows={affectedRows}
    />
  );
};

describe('QueryEditor', () => {
  it('renders SQL textarea, limit input, and execute button', () => {
    render(
      <QueryEditor sql="" onSqlChange={vi.fn()} onExecute={vi.fn()} affectedRows={null} />
    );
    expect(screen.getByPlaceholderText('SELECT * FROM table_name;')).toBeInTheDocument();
    expect(screen.getByTestId('execute-button')).toBeInTheDocument();
    expect(screen.getByText('実行')).toBeInTheDocument();
  });

  it('has default limit value of 100', () => {
    render(
      <QueryEditor sql="" onSqlChange={vi.fn()} onExecute={vi.fn()} affectedRows={null} />
    );
    const limitInput = screen.getByLabelText('件数');
    expect(limitInput).toHaveValue('100');
  });

  it('calls onExecute with SQL and limit when execute button is clicked', async () => {
    const mockExecute = vi.fn();
    render(<ControlledQueryEditor onExecute={mockExecute} affectedRows={null} />);
    const sqlInput = screen.getByPlaceholderText('SELECT * FROM table_name;');
    await userEvent.type(sqlInput, 'SELECT 1');
    await userEvent.click(screen.getByText('実行'));
    expect(mockExecute).toHaveBeenCalledWith('SELECT 1', 100);
  });

  it('rejects non-numeric limit input', async () => {
    render(
      <QueryEditor sql="" onSqlChange={vi.fn()} onExecute={vi.fn()} affectedRows={null} />
    );
    const limitInput = screen.getByLabelText('件数');
    await userEvent.clear(limitInput);
    await userEvent.type(limitInput, '50');
    expect(limitInput).toHaveValue('50');
    await userEvent.clear(limitInput);
    await userEvent.type(limitInput, 'abc');
    expect(limitInput).not.toHaveValue('abc');
  });

  it('rejects negative limit input', async () => {
    render(
      <QueryEditor sql="" onSqlChange={vi.fn()} onExecute={vi.fn()} affectedRows={null} />
    );
    const limitInput = screen.getByLabelText('件数');
    await userEvent.clear(limitInput);
    await userEvent.type(limitInput, '-5');
    expect(limitInput).not.toHaveValue('-5');
  });

  it('uses 100 as default when limit is empty on execute', async () => {
    const mockExecute = vi.fn();
    render(<ControlledQueryEditor onExecute={mockExecute} affectedRows={null} />);
    const limitInput = screen.getByLabelText('件数');
    await userEvent.clear(limitInput);
    const sqlInput = screen.getByPlaceholderText('SELECT * FROM table_name;');
    await userEvent.type(sqlInput, 'SELECT 1');
    await userEvent.click(screen.getByText('実行'));
    expect(mockExecute).toHaveBeenCalledWith('SELECT 1', 100);
  });
});
