import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
} from '@mui/material';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { SchemaNode } from '../types/api';

const SCHEMA_COLOR = '#1565C0';
const TABLE_COLOR = '#E65100';

interface ObjectTreeProps {
  schemas: SchemaNode[];
  selectedDb: string | null;
  onEditSchema: (schemaName: string) => void;
  onDeleteSchema: (schemaName: string) => void;
  onDeleteTable: (schemaName: string, tableName: string) => void;
  onClickTable: (schemaName: string, tableName: string) => void;
  onExpandSchema: (schemaName: string) => void;
}

const ObjectTree: React.FC<ObjectTreeProps> = ({
  schemas,
  selectedDb,
  onEditSchema,
  onDeleteSchema,
  onDeleteTable,
  onClickTable,
  onExpandSchema,
}) => {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setExpandedSchemas(new Set());
  }, [selectedDb]);

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      if (next.has(schemaName)) {
        next.delete(schemaName);
      } else {
        next.add(schemaName);
        onExpandSchema(schemaName);
      }
      return next;
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        overflow: 'auto',
        borderRadius: 0,
        p: 1,
      }}
    >
      {schemas.map((schema) => {
        const isSchemaExpanded = expandedSchemas.has(schema.name);

        return (
          <Box key={schema.name}>
            {/* Schema row */}
            <Box
              data-testid={`schema-row-${schema.name}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'action.hover' },
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: SCHEMA_COLOR,
                  mr: 0.75,
                  userSelect: 'none',
                  minWidth: '12px',
                }}
                onClick={() => toggleSchema(schema.name)}
                data-testid={`toggle-schema-${schema.name}`}
              >
                {isSchemaExpanded ? '-' : '+'}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontSize: '0.85rem',
                  color: SCHEMA_COLOR,
                  fontWeight: 500,
                }}
                onClick={() => toggleSchema(schema.name)}
              >
                {schema.name}
              </Typography>

              <Tooltip title="テーブル作成">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSchema(schema.name);
                  }}
                  data-testid={`edit-schema-${schema.name}`}
                  sx={{
                    color: 'primary.light',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  <EditOutlined sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="スキーマ削除">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSchema(schema.name);
                  }}
                  data-testid={`delete-schema-${schema.name}`}
                  sx={{
                    color: 'error.light',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Table children */}
            <Collapse in={isSchemaExpanded}>
              <Box sx={{ pl: 3 }}>
                {schema.tables.map((table) => (
                  <Box
                    key={table.name}
                    data-testid={`table-row-${schema.name}-${table.name}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 1,
                      '&:hover': { backgroundColor: 'action.hover' },
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        fontSize: '0.8rem',
                        color: TABLE_COLOR,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                      onClick={() => onClickTable(schema.name, table.name)}
                    >
                      {table.name}
                    </Typography>

                    <Tooltip title="テーブル削除">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTable(schema.name, table.name);
                        }}
                        data-testid={`delete-table-${schema.name}-${table.name}`}
                        sx={{
                          color: 'error.light',
                          '&:hover': { color: 'error.main' },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Paper>
  );
};

export default ObjectTree;
