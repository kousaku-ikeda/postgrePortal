import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import Close from '@mui/icons-material/Close';
import { useDraggable } from '../hooks/useDraggable';

interface DraggableModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

const DraggableModal: React.FC<DraggableModalProps> = ({
  open,
  title,
  onClose,
  width = 480,
  children,
}) => {
  const { position, handleMouseDown } = useDraggable({ x: 0, y: 0 });

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      <Box
        data-testid="draggable-modal"
        sx={{
          position: 'absolute',
          width,
          transform: `translate(${position.x}px, ${position.y}px)`,
          backgroundColor: '#fff',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Title bar - draggable */}
        <Box
          data-testid="modal-title-bar"
          onMouseDown={handleMouseDown}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.2,
            background: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
            cursor: 'grab',
            userSelect: 'none',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#1a2027',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            data-testid="modal-close-button"
            sx={{
              color: '#555',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: '#d32f2f',
              },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2.5 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default DraggableModal;
