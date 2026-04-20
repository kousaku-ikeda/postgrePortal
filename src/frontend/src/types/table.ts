export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export interface IndexInfo {
  index_name: string;
  column_name: string;
  is_unique: boolean;
}

export interface TableStructure {
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}
