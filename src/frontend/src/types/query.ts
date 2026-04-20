export interface QueryResult {
  columns: string[];
  rows: Record<string, string | number | null>[];
  affected_rows: number | null;
}
