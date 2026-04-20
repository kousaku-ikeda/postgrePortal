import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import DraggableModal from './DraggableModal';

interface CreateTableModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (ddl: string) => void;
  schemaName: string;
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({
  open,
  onClose,
  onCreate,
  schemaName,
}) => {
  const [ddl, setDdl] = useState('');

  const handleCreate = () => {
    onCreate(ddl);
  };

  const handleCancel = () => {
    setDdl('');
    onClose();
  };

  return (
    <DraggableModal
      open={open}
      title={`テーブル作成 - ${schemaName}`}
      onClose={handleCancel}
      width={560}
    >
      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{
            px: 3,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
            },
          }}
        >
          作成
        </Button>
        <Button
          variant="contained"
          onClick={handleCancel}
          sx={{
            px: 3,
            fontWeight: 700,
            color: '#1a2027',
            background: 'linear-gradient(135deg, #ffca28 0%, #ffb300 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ffc107 0%, #ffa000 100%)',
            },
          }}
        >
          キャンセル
        </Button>
      </Box>

      {/* DDL text area */}
      <TextField
        multiline
        rows={10}
        fullWidth
        placeholder={
          'CREATE TABLE schema_name.table_name (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);'
        }
        value={ddl}
        onChange={(e) => setDdl(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            backgroundColor: '#fafafa',
          },
        }}
      />
    </DraggableModal>
  );
};

export default CreateTableModal;
