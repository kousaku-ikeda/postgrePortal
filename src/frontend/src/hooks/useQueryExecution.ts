import { useCallback } from 'react';
import type { ConnectionInfo } from '../types/api';
import type { QueryResult, QueryHistoryResult } from '../types/query';
import { API_BASE_URL } from '../config';

interface UseQueryExecutionReturn {
  executeQuery: (
    connInfo: ConnectionInfo,
    databaseName: string,
    sql: string,
    limit: number
  ) => Promise<QueryResult | null>;
  fetchHistory: (
    connInfo: ConnectionInfo,
    databaseName: string
  ) => Promise<QueryHistoryResult | null>;
}

export const useQueryExecution = (): UseQueryExecutionReturn => {
  const executeQuery = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      sql: string,
      limit: number
    ): Promise<QueryResult | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/query/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            sql,
            limit,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          const detail = data.detail as string;
          alert(detail);
          return null;
        }
        const data = await response.json();
        return data as QueryResult;
      } catch {
        alert('クエリが間違っています。\n原因：ネットワークエラー');
        return null;
      }
    },
    []
  );

  const fetchHistory = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string
    ): Promise<QueryHistoryResult | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/query/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          const detail = data.detail as string;
          alert(detail);
          return null;
        }
        const data = await response.json();
        return data as QueryHistoryResult;
      } catch {
        alert('クエリ履歴の取得に失敗しました');
        return null;
      }
    },
    []
  );

  return { executeQuery, fetchHistory };
};
