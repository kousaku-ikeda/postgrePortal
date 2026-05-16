export interface QueryResult {
  columns: string[];
  rows: Record<string, string | number | null>[];
  affected_rows: number | null;
  column_types: string[];
}

export interface QueryHistoryResult {
  columns: string[];
  rows: Record<string, string | number | null>[];
}
