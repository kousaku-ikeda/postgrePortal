import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import DraggableModal from './DraggableModal';
import type { DatabaseFormData } from '../types/database';
import { initialDatabaseFormData } from '../types/database';

interface CreateDatabaseModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: DatabaseFormData) => void;
}

const CreateDatabaseModal: React.FC<CreateDatabaseModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState<DatabaseFormData>(initialDatabaseFormData);
  const [nameError, setNameError] = useState(false);

  const handleChange =
    (field: keyof DatabaseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (field === 'name' && nameError) {
        setNameError(false);
      }
    };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      setNameError(true);
      return;
    }
    onCreate(formData);
  };

  const handleCancel = () => {
    setFormData(initialDatabaseFormData);
    setNameError(false);
    onClose();
  };

  const fields: Array<{
    key: keyof DatabaseFormData;
    label: string;
    required: boolean;
  }> = [
    { key: 'name', label: 'name', required: true },
    { key: 'user_name', label: 'user_name', required: false },
    { key: 'template', label: 'template', required: false },
    { key: 'encoding', label: 'encoding', required: false },
    { key: 'lc_collate', label: 'lc_collate', required: false },
    { key: 'lc_ctype', label: 'lc_ctype', required: false },
    { key: 'tablespace_name', label: 'tablespace_name', required: false },
    { key: 'connlimit', label: 'connlimit', required: false },
  ];

  return (
    <DraggableModal
      open={open}
      title="データベース作成"
      onClose={handleCancel}
      width={520}
    >
      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{
            px: 3,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
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

      {/* Form fields */}
      <Stack spacing={2}>
        {fields.map(({ key, label, required }) => (
          <Box
            key={key}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Typography
              variant="body2"
              sx={{
                width: 140,
                textAlign: 'right',
                fontWeight: 500,
                flexShrink: 0,
                color: [
                  'user_name',
                  'encoding',
                  'lc_collate',
                  'lc_ctype',
                ].includes(key)
                  ? 'primary.main'
                  : 'text.primary',
              }}
            >
              {label}
            </Typography>
            <TextField
              value={formData[key]}
              onChange={handleChange(key)}
              fullWidth
              error={key === 'name' && nameError}
              helperText={
                key === 'name' && nameError ? 'Required field' : undefined
              }
            />
            {required && (
              <Typography
                sx={{
                  color: 'error.main',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                *
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </DraggableModal>
  );
};

export default CreateDatabaseModal;
