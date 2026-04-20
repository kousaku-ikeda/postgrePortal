import { useCallback } from 'react';
import type { ConnectionInfo } from '../types/api';
import type { TableStructure } from '../types/table';
import { API_BASE_URL } from '../config';

interface UseTableOperationsReturn {
  fetchTables: (
    connInfo: ConnectionInfo,
    databaseName: string,
    schemaName: string
  ) => Promise<string[]>;
  createTable: (
    connInfo: ConnectionInfo,
    databaseName: string,
    ddl: string
  ) => Promise<boolean>;
  deleteTable: (
    connInfo: ConnectionInfo,
    databaseName: string,
    schemaName: string,
    tableName: string
  ) => Promise<boolean>;
  fetchTableStructure: (
    connInfo: ConnectionInfo,
    databaseName: string,
    schemaName: string,
    tableName: string
  ) => Promise<TableStructure | null>;
}

export const useTableOperations = (): UseTableOperationsReturn => {
  const fetchTables = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      schemaName: string
    ): Promise<string[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tables/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            schema_name: schemaName,
          }),
        });
        if (!response.ok) {
          return [];
        }
        const data = await response.json();
        return data.tables as string[];
      } catch {
        return [];
      }
    },
    []
  );

  const createTable = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      ddl: string
    ): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tables/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            ddl,
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
        alert('クエリが間違っています。\n原因：ネットワークエラー');
        return false;
      }
    },
    []
  );

  const deleteTable = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      schemaName: string,
      tableName: string
    ): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tables/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            schema_name: schemaName,
            table_name: tableName,
          }),
        });
        if (!response.ok) {
          alert(`${tableName}の削除できませんでした`);
          return false;
        }
        return true;
      } catch {
        alert(`${tableName}の削除できませんでした`);
        return false;
      }
    },
    []
  );

  const fetchTableStructure = useCallback(
    async (
      connInfo: ConnectionInfo,
      databaseName: string,
      schemaName: string,
      tableName: string
    ): Promise<TableStructure | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tables/structure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: connInfo,
            database_name: databaseName,
            schema_name: schemaName,
            table_name: tableName,
          }),
        });
        if (!response.ok) {
          alert('テーブル構成が取得できませんでした');
          return null;
        }
        const data = await response.json();
        return data as TableStructure;
      } catch {
        alert('テーブル構成が取得できませんでした');
        return null;
      }
    },
    []
  );

  return { fetchTables, createTable, deleteTable, fetchTableStructure };
};
