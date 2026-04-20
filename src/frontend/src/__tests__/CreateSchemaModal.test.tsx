import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CreateSchemaModal from '../components/CreateSchemaModal';

describe('CreateSchemaModal', () => {
  it('does not render when closed', () => {
    render(
      <CreateSchemaModal
        open={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />
    );
    expect(screen.queryByText('スキーマ作成')).not.toBeInTheDocument();
  });

  it('renders modal title and all fields when open', () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />
    );
    expect(screen.getByText('スキーマ作成 - testdb')).toBeInTheDocument();
    expect(screen.getByText('schema_name')).toBeInTheDocument();
    expect(screen.getByText('user_name')).toBeInTheDocument();
    expect(screen.getByText('schema_element')).toBeInTheDocument();
    expect(screen.getByText('IF NOT EXISTS')).toBeInTheDocument();
  });

  it('displays red asterisk for required schema_name field', () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('has IF NOT EXISTS checkbox checked by default', () => {
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        databaseName="testdb"
      />
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('shows validation error when schema_name is empty and create is clicked', async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />
    );
    await userEvent.click(screen.getByText('作成'));
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('calls onCreate with form data when schema_name is provided', async () => {
    const mockCreate = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        databaseName="testdb"
      />
    );
    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'new_schema');
    await userEvent.click(screen.getByText('作成'));
    expect(mockCreate).toHaveBeenCalledWith({
      schema_name: 'new_schema',
      user_name: '',
      schema_element: '',
      ifNotExists: true,
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />
    );
    await userEvent.click(screen.getByText('キャンセル'));
    expect(mockClose).toHaveBeenCalled();
  });

  it('calls onClose when x button is clicked', async () => {
    const mockClose = vi.fn();
    render(
      <CreateSchemaModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        databaseName="testdb"
      />
    );
    await userEvent.click(screen.getByTestId('modal-close-button'));
    expect(mockClose).toHaveBeenCalled();
  });
});
