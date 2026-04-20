import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CreateDatabaseModal from '../components/CreateDatabaseModal';

describe('CreateDatabaseModal', () => {
  it('does not render when closed', () => {
    render(
      <CreateDatabaseModal
        open={false}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.queryByText('データベース作成')).not.toBeInTheDocument();
  });

  it('renders modal title and all fields when open', () => {
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('データベース作成')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('user_name')).toBeInTheDocument();
    expect(screen.getByText('template')).toBeInTheDocument();
    expect(screen.getByText('encoding')).toBeInTheDocument();
    expect(screen.getByText('lc_collate')).toBeInTheDocument();
    expect(screen.getByText('lc_ctype')).toBeInTheDocument();
    expect(screen.getByText('tablespace_name')).toBeInTheDocument();
    expect(screen.getByText('connlimit')).toBeInTheDocument();
  });

  it('displays red asterisk for required name field', () => {
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={vi.fn()}
      />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows validation error when name is empty and create is clicked', async () => {
    const mockCreate = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={vi.fn()}
        onCreate={mockCreate}
      />
    );
    await userEvent.click(screen.getByText('作成'));
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText('キャンセル'));
    expect(mockClose).toHaveBeenCalled();
  });

  it('calls onClose when x button is clicked', async () => {
    const mockClose = vi.fn();
    render(
      <CreateDatabaseModal
        open={true}
        onClose={mockClose}
        onCreate={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('modal-close-button'));
    expect(mockClose).toHaveBeenCalled();
  });
});
