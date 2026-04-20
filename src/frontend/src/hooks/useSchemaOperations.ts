import { useCallback } from 'react';
import type { ConnectionInfo } from '../types/api';
import type { SchemaFormData } from '../types/schema';
import { API_BASE_URL } from '../config';

interface UseSchemaOperationsReturn {
  fetchSchemas: (connInfo: ConnectionInfo, databaseName: string) => Promise<string[]>;
  createSchema: (
    connInfo: ConnectionInfo,
    databaseName: string,
    formData: SchemaFormData
  ) => Promise<boolean>;
  deleteSchema: (
    connInfo: ConnectionInfo,
    databaseName: string,
    schemaName: string
  ) => Promise<boolean>;
}

export const useSchemaOperations = (): UseSchemaOperationsReturn => {
  const fetchSchemas = useCallback(
    async (connInfo: ConnectionInfo, databaseName: string): Promise<string[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schemas/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
          }),
        });
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        return data.schemas as string[];
      } catch {
        return [];
      }
    },
    []
  );

  const createSchema = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      formData: SchemaFormData
    ): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schemas/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            schema_name: formData.schema_name,
            user_name: formData.user_name || null,
            schema_element: formData.schema_element || null,
            if_not_exists: formData.ifNotExists,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          const detail = data.detail as string;
          alert(detail);
          return false;
        }
        return true;
      } catch {
        alert('スキーマを作成できませんでした。\n原因：ネットワークエラー');
        return false;
      }
    },
    []
  );

  const deleteSchema = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      schemaName: string
    ): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schemas/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            name: schemaName,
          }),
        });
        if (!response.ok) {
          alert(`${schemaName}の削除できませんでした`);
          return false;
        }
        return true;
      } catch {
        alert(`${schemaName}の削除できませんでした`);
        return false;
      }
    },
    []
  );

  return { fetchSchemas, createSchema, deleteSchema };
};
