import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import DraggableModal from './DraggableModal';
import type { SchemaFormData } from '../types/schema';
import { initialSchemaFormData } from '../types/schema';

interface CreateSchemaModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: SchemaFormData) => void;
  databaseName: string;
}

const CreateSchemaModal: React.FC<CreateSchemaModalProps> = ({
  open,
  onClose,
  onCreate,
  databaseName,
}) => {
  const [formData, setFormData] = useState<SchemaFormData>(initialSchemaFormData);
  const [nameError, setNameError] = useState(false);

  const handleChange =
    (field: keyof Omit<SchemaFormData, 'ifNotExists'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (field === 'schema_name' && nameError) {
        setNameError(false);
      }
    };

  const handleCreate = () => {
    if (!formData.schema_name.trim()) {
      setNameError(true);
      return;
    }
    onCreate(formData);
  };

  const handleCancel = () => {
    setFormData(initialSchemaFormData);
    setNameError(false);
    onClose();
  };

  return (
    <DraggableModal
      open={open}
      title={`スキーマ作成 - ${databaseName}`}
      onClose={handleCancel}
      width={480}
    >
      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
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

      {/* Form fields */}
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              width: 130,
              textAlign: 'right',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            schema_name
          </Typography>
          <TextField
            value={formData.schema_name}
            onChange={handleChange('schema_name')}
            fullWidth
            error={nameError}
            helperText={nameError ? 'Required field' : undefined}
          />
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
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              width: 130,
              textAlign: 'right',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            user_name
          </Typography>
          <TextField
            value={formData.user_name}
            onChange={handleChange('user_name')}
            fullWidth
          />
          <Box sx={{ width: 14, flexShrink: 0 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              width: 130,
              textAlign: 'right',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            schema_element
          </Typography>
          <TextField
            value={formData.schema_element}
            onChange={handleChange('schema_element')}
            fullWidth
          />
          <Box sx={{ width: 14, flexShrink: 0 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              width: 130,
              textAlign: 'right',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            IF NOT EXISTS
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.ifNotExists}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ifNotExists: e.target.checked,
                  }))
                }
                color="primary"
              />
            }
            label=""
          />
        </Box>
      </Stack>
    </DraggableModal>
  );
};

export default CreateSchemaModal;
