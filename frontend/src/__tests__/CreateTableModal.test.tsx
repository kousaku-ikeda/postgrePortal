import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CreateTableModal from '../components/CreateTableModal';

describe('CreateTableModal', () => {
  it('does not render when closed', () => {
    render(
      <CreateTableModal
        open={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />
    );
    expect(screen.queryByText(/テーブル作成/)).not.toBeInTheDocument();
  });

  it('renders modal title and DDL textarea when open', () => {
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        schemaName="public"
      />
    );
    expect(screen.getByText('テーブル作成 - public')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onCreate with DDL when create is clicked', async () => {
    const mockCreate = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
        schemaName="public"
      />
    );
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'CREATE TABLE test (id INT)');
    await userEvent.click(screen.getByText('作成'));
    expect(mockCreate).toHaveBeenCalledWith('CREATE TABLE test (id INT)');
  });

  it('calls onClose when cancel is clicked', async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />
    );
    await userEvent.click(screen.getByText('キャンセル'));
    expect(mockClose).toHaveBeenCalled();
  });

  it('calls onClose when x button is clicked', async () => {
    const mockClose = vi.fn();
    render(
      <CreateTableModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
        schemaName="public"
      />
    );
    await userEvent.click(screen.getByTestId('modal-close-button'));
    expect(mockClose).toHaveBeenCalled();
  });
});
