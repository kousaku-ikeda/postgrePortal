export interface HealthResponse {
  status: string;
}

export interface ConnectionInfo {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface DatabaseListResponse {
  databases: string[];
}

export interface DatabaseNode {
  name: string;
  schemas: SchemaNode[];
}

export interface SchemaNode {
  name: string;
  tables: TableNode[];
}

export interface TableNode {
  name: string;
}
