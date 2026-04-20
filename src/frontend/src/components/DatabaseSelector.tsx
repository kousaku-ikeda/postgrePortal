import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { SelectChangeEvent } from '@mui/material';

interface DatabaseSelectorProps {
  databases: string[];
  selectedDb: string | null;
  onSelectDb: (name: string) => void;
  onEditDatabase: () => void;
  onDeleteDatabase: () => void;
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  databases,
  selectedDb,
  onSelectDb,
  onEditDatabase,
  onDeleteDatabase,
}) => {
  const handleChange = (e: SelectChangeEvent) => {
    onSelectDb(e.target.value);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1, gap: 0.5 }}>
      <FormControl size="small" sx={{ flex: 1 }}>
        <Select
          displayEmpty
          value={selectedDb ?? ''}
          onChange={handleChange}
          data-testid="db-select"
          renderValue={(value) =>
            value === '' ? (
              <span style={{ color: '#9e9e9e' }}>データベースを選択</span>
            ) : (
              value
            )
          }
          sx={{ fontSize: '0.85rem' }}
        >
          {databases.map((db) => (
            <MenuItem key={db} value={db} sx={{ fontSize: '0.85rem' }}>
              {db}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title="スキーマ作成">
        <span>
          <IconButton
            size="small"
            onClick={onEditDatabase}
            disabled={selectedDb === null}
            data-testid="edit-db-btn"
            sx={{
              color: 'primary.light',
              '&:hover': { color: 'primary.main' },
              '&.Mui-disabled': { color: 'action.disabled' },
            }}
          >
            <EditOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="データベース削除">
        <span>
          <IconButton
            size="small"
            onClick={onDeleteDatabase}
            disabled={selectedDb === null}
            data-testid="delete-db-btn"
            sx={{
              color: 'error.light',
              '&:hover': { color: 'error.main' },
              '&.Mui-disabled': { color: 'action.disabled' },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default DatabaseSelector;
