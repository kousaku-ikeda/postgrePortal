import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTableOperations } from '../hooks/useTableOperations';
import type { ConnectionInfo } from '../types/api';

const mockConnInfo: ConnectionInfo = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'test',
};

describe('useTableOperations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('fetchTables returns table list on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tables: ['users', 'orders'] }),
    } as Response);

    const { result } = renderHook(() => useTableOperations());
    let tables: string[] = [];
    await act(async () => {
      tables = await result.current.fetchTables(mockConnInfo, 'testdb', 'public');
    });
    expect(tables).toEqual(['users', 'orders']);
  });

  it('createTable returns true on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok' }),
    } as Response);

    const { result } = renderHook(() => useTableOperations());
    let success = false;
    await act(async () => {
      success = await result.current.createTable(
        mockConnInfo,
        'testdb',
        'CREATE TABLE test (id INT)'
      );
    });
    expect(success).toBe(true);
  });

  it('createTable returns false and alerts on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        detail: 'クエリが間違っています。\n原因：syntax error',
      }),
    } as Response);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useTableOperations());
    let success = true;
    await act(async () => {
      success = await result.current.createTable(
        mockConnInfo,
        'testdb',
        'INVALID SQL'
      );
    });
    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith(
      'クエリが間違っています。\n原因：syntax error'
    );
  });

  it('deleteTable returns true on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok' }),
    } as Response);

    const { result } = renderHook(() => useTableOperations());
    let success = false;
    await act(async () => {
      success = await result.current.deleteTable(
        mockConnInfo,
        'testdb',
        'public',
        'users'
      );
    });
    expect(success).toBe(true);
  });

  it('deleteTable returns false and alerts on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'usersの削除できませんでした' }),
    } as Response);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useTableOperations());
    let success = true;
    await act(async () => {
      success = await result.current.deleteTable(
        mockConnInfo,
        'testdb',
        'public',
        'users'
      );
    });
    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('usersの削除できませんでした');
  });

  it('fetchTableStructure returns structure on success', async () => {
    const mockStructure = {
      columns: [
        { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: null },
      ],
      indexes: [
        { index_name: 'test_pkey', column_name: 'id', is_unique: true },
      ],
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockStructure,
    } as Response);

    const { result } = renderHook(() => useTableOperations());
    let structure = null;
    await act(async () => {
      structure = await result.current.fetchTableStructure(
        mockConnInfo,
        'testdb',
        'public',
        'users'
      );
    });
    expect(structure).toEqual(mockStructure);
  });
});
