import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHealthCheck } from '../hooks/useHealthCheck';

describe('useHealthCheck', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state with null status and null error', () => {
    const { result } = renderHook(() => useHealthCheck());
    expect(result.current.status).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets status to ok when API responds successfully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as Response);

    const { result } = renderHook(() => useHealthCheck());
    await act(async () => {
      await result.current.checkHealth();
    });

    expect(result.current.status).toBe('ok');
    expect(result.current.error).toBeNull();
  });

  it('sets error when API call fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useHealthCheck());
    await act(async () => {
      await result.current.checkHealth();
    });

    expect(result.current.status).toBeNull();
    expect(result.current.error).toBe('Network error');
  });
});
