import { useState, useCallback } from 'react';
import type { ConnectionInfo, DatabaseNode } from '../types/api';
import { API_BASE_URL } from '../config';

interface UseDatabasesReturn {
  databases: DatabaseNode[];
  loading: boolean;
  error: string | null;
  fetchDatabases: (connInfo: ConnectionInfo) => Promise<void>;
  setDatabases: (databases: DatabaseNode[]) => void;
}

export const useDatabases = (): UseDatabasesReturn => {
  const [databases, setDatabases] = useState<DatabaseNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDatabases = useCallback(async (connInfo: ConnectionInfo) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/databases/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connInfo),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'データベースが取得できませんでした');
      }
      const data = await response.json();
      const dbNodes: DatabaseNode[] = (data.databases as string[]).map(
        (name: string) => ({
          name,
          schemas: [],
        })
      );
      setDatabases(dbNodes);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'データベースが取得できませんでした';
      setError(message);
      alert('データベースが取得できませんでした');
    } finally {
      setLoading(false);
    }
  }, []);

  return { databases, loading, error, fetchDatabases, setDatabases };
};
