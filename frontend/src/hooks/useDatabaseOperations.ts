import { useCallback } from 'react';
import type { ConnectionInfo } from '../types/api';
import type { DatabaseFormData } from '../types/database';
import { API_BASE_URL } from '../config';

interface UseDatabaseOperationsReturn {
  createDatabase: (connInfo: ConnectionInfo, formData: DatabaseFormData) => Promise<boolean>;
  deleteDatabase: (connInfo: ConnectionInfo, name: string) => Promise<boolean>;
}

export const useDatabaseOperations = (): UseDatabaseOperationsReturn => {
  const createDatabase = useCallback(
    async (connInfo: ConnectionInfo, formData: DatabaseFormData): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/databases/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            name: formData.name,
            user_name: formData.user_name || null,
            template: formData.template || null,
            encoding: formData.encoding || null,
            lc_collate: formData.lc_collate || null,
            lc_ctype: formData.lc_ctype || null,
            tablespace_name: formData.tablespace_name || null,
            connlimit: formData.connlimit || null,
          }),
        });
        if (!response.ok) {
          alert('データベースが作成できませんでした');
          return false;
        }
        return true;
      } catch {
        alert('データベースが作成できませんでした');
        return false;
      }
    },
    []
  );

  const deleteDatabase = useCallback(
    async (connInfo: ConnectionInfo, name: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/databases/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            name,
          }),
        });
        if (!response.ok) {
          alert(`${name}の削除できませんでした`);
          return false;
        }
        return true;
      } catch {
        alert(`${name}の削除できませんでした`);
        return false;
      }
    },
    []
  );

  return { createDatabase, deleteDatabase };
};
