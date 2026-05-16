import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import Close from "@mui/icons-material/Close";

interface CellDetailModalProps {
  open: boolean;
  onClose: () => void;
  columnName: string;
  cellValue: string;
}

const CellDetailModal: React.FC<CellDetailModalProps> = ({
  open,
  onClose,
  columnName,
  cellValue,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "10px",
            overflow: "hidden",
            maxHeight: "80vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          borderBottom: "1px solid #90caf9",
          px: 2.5,
          py: 1.5,
        }}
      >
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#1565c0",
          }}
        >
          {columnName}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="close"
          sx={{
            color: "#555",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.1)",
              color: "#d32f2f",
            },
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 2.5,
          mt: 1,
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#f8f9fa",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
            p: 2,
            fontFamily: '"Roboto Mono", "Consolas", monospace',
            fontSize: "0.85rem",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            color: "#1a2027",
          }}
        >
          {cellValue}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 6,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CellDetailModal;
