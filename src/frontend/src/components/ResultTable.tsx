import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import CellDetailModal from "./CellDetailModal";

interface ResultTableProps {
  columns: string[];
  rows: Record<string, string | number | null>[];
  isHistoryMode?: boolean;
  onRowClick?: (row: Record<string, string | number | null>) => void;
  height?: number;
  columnTypes?: string[];
}

type SortOrder = "asc" | "desc";

const TRUNCATE_MAX_LENGTH = 100;

const isTruncateTargetType = (typeName: string): boolean => {
  const lower = typeName.toLowerCase();
  if (lower === "vector" || lower === "json" || lower === "jsonb") {
    return true;
  }
  // PostgreSQL array types: internal names start with "_" (e.g., _float8, _int4, _text)
  // or display names contain "[]" (e.g., float[], int[])
  if (lower.startsWith("_") || lower.includes("[]")) {
    return true;
  }
  return false;
};

const truncateValue = (
  value: string,
  columnIndex: number,
  columnTypes: string[],
): string => {
  if (columnIndex >= columnTypes.length) return value;
  const typeName = columnTypes[columnIndex];
  if (!isTruncateTargetType(typeName)) return value;
  if (value.length > TRUNCATE_MAX_LENGTH) {
    return value.slice(0, TRUNCATE_MAX_LENGTH) + "...";
  }
  return value;
};

const isTruncated = (
  value: string,
  columnIndex: number,
  columnTypes: string[],
): boolean => {
  if (columnIndex >= columnTypes.length) return false;
  const typeName = columnTypes[columnIndex];
  if (!isTruncateTargetType(typeName)) return false;
  return value.length > TRUNCATE_MAX_LENGTH;
};

const formatExecutedAt = (value: string): string => {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/,
  );
  if (!match) return value;
  return `${match[1]}/${match[2]}/${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
};

const ResultTable: React.FC<ResultTableProps> = ({
  columns,
  rows,
  isHistoryMode = false,
  onRowClick,
  // height は親のBoxコンポーネントで制御されるため、コンポーネント内では使用しない
  // テスト仕様 FE-11-20 で渡されることが検証されている
  height: _height,
  columnTypes = [],
}) => {
  void _height;
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [cellModalColumnName, setCellModalColumnName] = useState("");
  const [cellModalCellValue, setCellModalCellValue] = useState("");

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortOrder("asc");
    }
  };

  const handleCellClick = (
    rawValue: string,
    columnName: string,
    columnIndex: number,
  ) => {
    // Do not open modal in HistoryMode (row click takes priority)
    if (isHistoryMode) return;
    // Only open modal for truncated cells
    if (!isTruncated(rawValue, columnIndex, columnTypes)) return;
    setCellModalColumnName(columnName);
    setCellModalCellValue(rawValue);
    setCellModalOpen(true);
  };

  const handleCellModalClose = () => {
    setCellModalOpen(false);
    setCellModalColumnName("");
    setCellModalCellValue("");
  };

  const sortedRows = useMemo(() => {
    if (sortColumn === null) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      if (av === null && bv === null) return 0;
      if (av === null) return sortOrder === "asc" ? 1 : -1;
      if (bv === null) return sortOrder === "asc" ? -1 : 1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortOrder === "asc" ? av - bv : bv - av;
      }
      const as =
        typeof av === "object" && av !== null ? JSON.stringify(av) : String(av);
      const bs =
        typeof bv === "object" && bv !== null ? JSON.stringify(bv) : String(bv);
      return sortOrder === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [rows, sortColumn, sortOrder]);

  if (columns.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          p: 4,
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Execute a query to see results here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        p: 2,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {columns.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    sortDirection={sortColumn === col ? sortOrder : false}
                    sx={{
                      cursor: "pointer",
                      userSelect: "none",
                      minWidth: 120,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      active={sortColumn === col}
                      direction={sortColumn === col ? sortOrder : "asc"}
                      onClick={() => handleSort(col)}
                    >
                      {col}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((row, idx) => (
                <TableRow
                  key={
                    columns
                      .map((col) => {
                        const v = row[col];
                        if (v === null || v === undefined) return "";
                        return typeof v === "object"
                          ? JSON.stringify(v)
                          : String(v);
                      })
                      .join("|") +
                    "|" +
                    idx
                  }
                  onClick={() => {
                    if (isHistoryMode && onRowClick) {
                      onRowClick(row);
                    }
                  }}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fafafa",
                    },
                    "&:hover": {
                      backgroundColor: "#e3f2fd",
                    },
                    transition: "background-color 0.1s",
                    cursor: isHistoryMode ? "pointer" : "default",
                  }}
                >
                  {columns.map((col, colIdx) => {
                    const rawValue =
                      row[col] === null
                        ? null
                        : typeof row[col] === "object" && row[col] !== null
                          ? JSON.stringify(row[col])
                          : String(row[col]);

                    const isNull = row[col] === null;
                    const cellIsTruncated =
                      !isNull &&
                      rawValue !== null &&
                      isTruncated(rawValue, colIdx, columnTypes);

                    return (
                      <TableCell
                        key={col}
                        sx={{
                          minWidth: 120,
                          whiteSpace: "nowrap",
                          cursor:
                            cellIsTruncated && !isHistoryMode
                              ? "pointer"
                              : undefined,
                        }}
                        onClick={
                          cellIsTruncated && rawValue !== null
                            ? (e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleCellClick(rawValue, col, colIdx);
                              }
                            : undefined
                        }
                      >
                        {isNull ? (
                          <Typography
                            component="span"
                            sx={{
                              color: "text.disabled",
                              fontStyle: "italic",
                              fontSize: "0.75rem",
                            }}
                          >
                            NULL
                          </Typography>
                        ) : isHistoryMode && col === "executed_at" ? (
                          formatExecutedAt(String(row[col]))
                        ) : (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "0.8rem",
                              ...(cellIsTruncated && {
                                color: "#1976d2",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }),
                            }}
                          >
                            {truncateValue(rawValue!, colIdx, columnTypes)}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cell detail modal - uses MUI Dialog (not DraggableModal) */}
      <CellDetailModal
        open={cellModalOpen}
        onClose={handleCellModalClose}
        columnName={cellModalColumnName}
        cellValue={cellModalCellValue}
      />
    </Box>
  );
};

export default ResultTable;
