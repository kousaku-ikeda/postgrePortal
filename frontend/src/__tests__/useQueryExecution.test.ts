import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQueryExecution } from '../hooks/useQueryExecution';
import type { ConnectionInfo } from '../types/api';

const mockConnInfo: ConnectionInfo = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'test',
};

describe('useQueryExecution', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('executeQuery returns result on success', async () => {
    const mockResult = {
      columns: ['id', 'name'],
      rows: [{ id: 1, name: 'Alice' }],
      affected_rows: 1,
    };
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResult,
    } as Response);

    const { result } = renderHook(() => useQueryExecution());
    let queryResult = null;
    await act(async () => {
      queryResult = await result.current.executeQuery(
        mockConnInfo,
        'testdb',
        'SELECT * FROM users',
        100
      );
    });
    expect(queryResult).toEqual(mockResult);
  });

  it('executeQuery returns null and alerts on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        detail: 'クエリが間違っています。\n原因：syntax error',
      }),
    } as Response);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useQueryExecution());
    let queryResult = undefined;
    await act(async () => {
      queryResult = await result.current.executeQuery(
        mockConnInfo,
        'testdb',
        'SELEC * FROM users',
        100
      );
    });
    expect(queryResult).toBeNull();
    expect(alertSpy).toHaveBeenCalledWith(
      'クエリが間違っています。\n原因：syntax error'
    );
  });
});
