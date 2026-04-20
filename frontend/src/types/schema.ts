export interface SchemaFormData {
  schema_name: string;
  user_name: string;
  schema_element: string;
  ifNotExists: boolean;
}

export const initialSchemaFormData: SchemaFormData = {
  schema_name: '',
  user_name: '',
  schema_element: '',
  ifNotExists: true,
};
