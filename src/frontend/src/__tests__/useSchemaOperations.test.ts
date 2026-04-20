import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSchemaOperations } from '../hooks/useSchemaOperations';
import type { ConnectionInfo } from '../types/api';

const mockConnInfo: ConnectionInfo = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'test',
};

describe('useSchemaOperations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('fetchSchemas returns schema list on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ schemas: ['public', 'pg_catalog'] }),
    } as Response);

    const { result } = renderHook(() => useSchemaOperations());
    let schemas: string[] = [];
    await act(async () => {
      schemas = await result.current.fetchSchemas(mockConnInfo, 'testdb');
    });
    expect(schemas).toEqual(['public', 'pg_catalog']);
  });

  it('fetchSchemas returns empty array on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'error' }),
    } as Response);

    const { result } = renderHook(() => useSchemaOperations());
    let schemas: string[] = [];
    await act(async () => {
      schemas = await result.current.fetchSchemas(mockConnInfo, 'testdb');
    });
    expect(schemas).toEqual([]);
  });

  it('createSchema returns true on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok' }),
    } as Response);

    const { result } = renderHook(() => useSchemaOperations());
    let success = false;
    await act(async () => {
      success = await result.current.createSchema(mockConnInfo, 'testdb', {
        schema_name: 'new_schema',
        user_name: '',
        schema_element: '',
        ifNotExists: true,
      });
    });
    expect(success).toBe(true);
  });

  it('createSchema returns false and alerts on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        detail: 'スキーマを作成できませんでした。\n原因：permission denied',
      }),
    } as Response);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useSchemaOperations());
    let success = true;
    await act(async () => {
      success = await result.current.createSchema(mockConnInfo, 'testdb', {
        schema_name: 'new_schema',
        user_name: '',
        schema_element: '',
        ifNotExists: false,
      });
    });
    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith(
      'スキーマを作成できませんでした。\n原因：permission denied'
    );
  });

  it('deleteSchema returns true on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok' }),
    } as Response);

    const { result } = renderHook(() => useSchemaOperations());
    let success = false;
    await act(async () => {
      success = await result.current.deleteSchema(
        mockConnInfo,
        'testdb',
        'my_schema'
      );
    });
    expect(success).toBe(true);
  });

  it('deleteSchema returns false and alerts on failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'my_schemaの削除できませんでした' }),
    } as Response);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useSchemaOperations());
    let success = true;
    await act(async () => {
      success = await result.current.deleteSchema(
        mockConnInfo,
        'testdb',
        'my_schema'
      );
    });
    expect(success).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('my_schemaの削除できませんでした');
  });
});
