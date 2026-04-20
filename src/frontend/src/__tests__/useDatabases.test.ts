import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDatabases } from '../hooks/useDatabases';

describe('useDatabases', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial empty databases', () => {
    const { result } = renderHook(() => useDatabases());
    expect(result.current.databases).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches databases successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ databases: ['postgres', 'template0'] }),
    } as Response);

    const { result } = renderHook(() => useDatabases());
    await act(async () => {
      await result.current.fetchDatabases({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'test',
      });
    });

    expect(result.current.databases).toHaveLength(2);
    expect(result.current.databases[0].name).toBe('postgres');
    expect(result.current.databases[1].name).toBe('template0');
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error and shows alert', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'データベースが取得できませんでした' }),
    } as Response);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useDatabases());
    await act(async () => {
      await result.current.fetchDatabases({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'wrong',
      });
    });

    expect(result.current.databases).toEqual([]);
    expect(alertSpy).toHaveBeenCalledWith('データベースが取得できませんでした');
  });
});
