import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  InputAdornment,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

interface QueryEditorProps {
  sql: string;
  onSqlChange: (sql: string) => void;
  onExecute: (sql: string, limit: number) => void;
  affectedRows: number | null;
  height?: number;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ sql, onSqlChange, onExecute, affectedRows, height }) => {
  const [limit, setLimit] = useState('100');
  const [prevLimit, setPrevLimit] = useState('100');

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setLimit('');
      return;
    }
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
      setLimit(prevLimit);
      return;
    }
    setPrevLimit(value);
    setLimit(value);
  };

  const handleLimitBlur = () => {
    if (limit === '') {
      setLimit('100');
      setPrevLimit('100');
    }
  };

  const handleExecute = () => {
    const effectiveLimit = limit === '' ? 100 : Number(limit);
    onExecute(sql, effectiveLimit);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        ...(height !== undefined
          ? { height, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
          : {}),
      }}
    >
      <TextField
        multiline
        rows={height !== undefined ? undefined : 6}
        fullWidth
        placeholder="SELECT * FROM table_name;"
        value={sql}
        onChange={(e) => onSqlChange(e.target.value)}
        data-testid="sql-input"
        sx={{
          mb: 1.5,
          ...(height !== undefined ? { flex: 1, minHeight: 0 } : {}),
          '& .MuiOutlinedInput-root': {
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            backgroundColor: '#fafafa',
            ...(height !== undefined ? { height: '100%', alignItems: 'flex-start' } : {}),
          },
          '& .MuiInputBase-inputMultiline': {
            ...(height !== undefined
              ? { height: '100% !important', overflow: 'auto !important', resize: 'none' }
              : {}),
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1.5,
        }}
      >
        <TextField
          label="件数"
          value={limit}
          onChange={handleLimitChange}
          onBlur={handleLimitBlur}
          data-testid="limit-input"
          sx={{
            width: 120,
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                  #
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={handleExecute}
          data-testid="execute-button"
          sx={{
            px: 3,
            py: 0.8,
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          }}
        >
          実行
        </Button>
        {affectedRows !== null && (
          <Chip
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
            label={`${affectedRows} 行が影響を受けました`}
            size="small"
            color="success"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default QueryEditor;
