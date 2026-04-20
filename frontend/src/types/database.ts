export interface DatabaseFormData {
  name: string;
  user_name: string;
  template: string;
  encoding: string;
  lc_collate: string;
  lc_ctype: string;
  tablespace_name: string;
  connlimit: string;
}

export const initialDatabaseFormData: DatabaseFormData = {
  name: '',
  user_name: '',
  template: '',
  encoding: '',
  lc_collate: '',
  lc_ctype: '',
  tablespace_name: '',
  connlimit: '',
};
