import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TableStructureModal from '../components/TableStructureModal';
import type { ColumnInfo, IndexInfo } from '../types/table';

const mockColumns: ColumnInfo[] = [
  {
    column_name: 'id',
    data_type: 'integer',
    is_nullable: 'NO',
    column_default: "nextval('test_id_seq'::regclass)",
  },
  {
    column_name: 'name',
    data_type: 'character varying',
    is_nullable: 'YES',
    column_default: null,
  },
];

const mockIndexes: IndexInfo[] = [
  {
    index_name: 'test_pkey',
    column_name: 'id',
    is_unique: true,
  },
];

describe('TableStructureModal', () => {
  it('does not render when closed', () => {
    render(
      <TableStructureModal
        open={false}
        onClose={vi.fn()}
        tableName="test_table"
        columns={mockColumns}
        indexes={mockIndexes}
      />
    );
    expect(screen.queryByText(/テーブル構成/)).not.toBeInTheDocument();
  });

  it('renders modal title and column info when open', () => {
    render(
      <TableStructureModal
        open={true}
        onClose={vi.fn()}
        tableName="test_table"
        columns={mockColumns}
        indexes={mockIndexes}
      />
    );
    expect(screen.getByText('テーブル構成 - test_table')).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getAllByText('id').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('integer')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
  });

  it('renders index info', () => {
    render(
      <TableStructureModal
        open={true}
        onClose={vi.fn()}
        tableName="test_table"
        columns={mockColumns}
        indexes={mockIndexes}
      />
    );
    expect(screen.getByText('Indexes')).toBeInTheDocument();
    expect(screen.getByText('test_pkey')).toBeInTheDocument();
  });

  it('renders no indexes message when empty', () => {
    render(
      <TableStructureModal
        open={true}
        onClose={vi.fn()}
        tableName="test_table"
        columns={mockColumns}
        indexes={[]}
      />
    );
    expect(screen.getByText('No indexes found.')).toBeInTheDocument();
  });
});
