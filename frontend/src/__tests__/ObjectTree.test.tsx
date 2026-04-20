import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ObjectTree from '../components/ObjectTree';
import type { SchemaNode } from '../types/api';

const noop = vi.fn();

const defaultProps = {
  selectedDb: 'postgres',
  onEditSchema: noop,
  onDeleteSchema: noop,
  onDeleteTable: noop,
  onClickTable: noop,
  onExpandSchema: noop,
};

describe('ObjectTree', () => {
  const mockSchemas: SchemaNode[] = [
    {
      name: 'public',
      tables: [{ name: 'users' }, { name: 'orders' }],
    },
    { name: 'private', tables: [] },
  ];

  it('renders schema names', () => {
    render(<ObjectTree schemas={mockSchemas} {...defaultProps} />);
    expect(screen.getByText('public')).toBeInTheDocument();
    expect(screen.getByText('private')).toBeInTheDocument();
  });

  it('renders empty tree when no schemas', () => {
    render(<ObjectTree schemas={[]} {...defaultProps} />);
    expect(screen.queryByTestId(/schema-row-/)).not.toBeInTheDocument();
  });

  it('shows "+" prefix when schema is collapsed', () => {
    render(<ObjectTree schemas={mockSchemas} {...defaultProps} />);
    const toggleBtn = screen.getByTestId('toggle-schema-public');
    expect(toggleBtn).toHaveTextContent('+');
  });

  it('shows "-" prefix when schema is expanded', async () => {
    render(<ObjectTree schemas={mockSchemas} {...defaultProps} />);
    const toggleBtn = screen.getByTestId('toggle-schema-public');
    await userEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent('-');
  });

  it('calls onExpandSchema when schema is expanded', async () => {
    const mockExpand = vi.fn();
    render(
      <ObjectTree schemas={mockSchemas} {...defaultProps} onExpandSchema={mockExpand} />
    );
    await userEvent.click(screen.getByTestId('toggle-schema-public'));
    expect(mockExpand).toHaveBeenCalledWith('public');
  });

  it('shows tables after expanding schema', async () => {
    render(<ObjectTree schemas={mockSchemas} {...defaultProps} />);
    await userEvent.click(screen.getByTestId('toggle-schema-public'));
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('orders')).toBeInTheDocument();
  });

  it('calls onEditSchema when edit icon is clicked', async () => {
    const mockEdit = vi.fn();
    render(
      <ObjectTree schemas={mockSchemas} {...defaultProps} onEditSchema={mockEdit} />
    );
    await userEvent.click(screen.getByTestId('edit-schema-public'));
    expect(mockEdit).toHaveBeenCalledWith('public');
  });

  it('calls onDeleteSchema when delete icon is clicked', async () => {
    const mockDelete = vi.fn();
    render(
      <ObjectTree schemas={mockSchemas} {...defaultProps} onDeleteSchema={mockDelete} />
    );
    await userEvent.click(screen.getByTestId('delete-schema-public'));
    expect(mockDelete).toHaveBeenCalledWith('public');
  });

  it('calls onDeleteTable when table delete icon is clicked', async () => {
    const mockDelete = vi.fn();
    render(
      <ObjectTree schemas={mockSchemas} {...defaultProps} onDeleteTable={mockDelete} />
    );
    await userEvent.click(screen.getByTestId('toggle-schema-public'));
    await userEvent.click(screen.getByTestId('delete-table-public-users'));
    expect(mockDelete).toHaveBeenCalledWith('public', 'users');
  });

  it('calls onClickTable when table name is clicked', async () => {
    const mockClick = vi.fn();
    render(
      <ObjectTree schemas={mockSchemas} {...defaultProps} onClickTable={mockClick} />
    );
    await userEvent.click(screen.getByTestId('toggle-schema-public'));
    await userEvent.click(screen.getByText('users'));
    expect(mockClick).toHaveBeenCalledWith('public', 'users');
  });
});
