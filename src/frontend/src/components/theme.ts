import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ffb300',
      light: '#ffe082',
      dark: '#ff8f00',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2027',
      secondary: '#5f6368',
    },
    info: {
      main: '#64b5f6',
      light: '#bbdefb',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h5: {
      fontWeight: 700,
      fontSize: '1.3rem',
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.9rem',
    },
    subtitle2: {
      fontWeight: 400,
      fontSize: '0.85rem',
      color: '#5f6368',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#9e9e9e',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          padding: '6px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            fontSize: '0.875rem',
          },
        },
      },
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 4,
        },
        sizeSmall: {
          padding: 2,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '6px 12px',
          fontSize: '0.8rem',
          borderBottom: '1px solid #e0e0e0',
        },
        head: {
          fontWeight: 700,
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          borderBottom: '2px solid #1976d2',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#fafafa',
          },
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          overflow: 'hidden',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
