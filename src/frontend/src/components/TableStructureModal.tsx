import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DraggableModal from './DraggableModal';
import type { ColumnInfo, IndexInfo } from '../types/table';

interface TableStructureModalProps {
  open: boolean;
  onClose: () => void;
  tableName: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}

const TableStructureModal: React.FC<TableStructureModalProps> = ({
  open,
  onClose,
  tableName,
  columns,
  indexes,
}) => {
  return (
    <DraggableModal
      open={open}
      title={`テーブル構成 - ${tableName}`}
      onClose={onClose}
      width={640}
    >
      {/* Columns section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ViewColumnIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Columns
          </Typography>
        </Box>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Column Name</TableCell>
                <TableCell>Data Type</TableCell>
                <TableCell>Nullable</TableCell>
                <TableCell>Default</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.map((col) => (
                <TableRow key={col.column_name}>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {col.column_name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={col.data_type}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={col.is_nullable}
                      size="small"
                      color={col.is_nullable === 'YES' ? 'default' : 'warning'}
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </TableCell>
                  <TableCell>
                    {col.column_default ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                        }}
                      >
                        {col.column_default}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          color: 'text.disabled',
                          fontSize: '0.75rem',
                        }}
                      >
                        NULL
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Indexes section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ListAltIcon sx={{ fontSize: 18, color: 'info.main' }} />
          <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Indexes
          </Typography>
        </Box>
        {indexes.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontStyle: 'italic', pl: 1 }}
          >
            No indexes found.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Index Name</TableCell>
                  <TableCell>Column</TableCell>
                  <TableCell>Unique</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indexes.map((idx, i) => (
                  <TableRow key={`${idx.index_name}-${i}`}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {idx.index_name}
                    </TableCell>
                    <TableCell>{idx.column_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={idx.is_unique ? 'YES' : 'NO'}
                        size="small"
                        color={idx.is_unique ? 'success' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </DraggableModal>
  );
};

export default TableStructureModal;
