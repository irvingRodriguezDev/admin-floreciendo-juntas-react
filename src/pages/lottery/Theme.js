import { createTheme } from '@mui/material/styles';

export const gradients = {
    pink: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
    pinkHeader: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
    soft: 'linear-gradient(135deg, #fff8fb 0%, #fff0f6 100%)',
    page: 'linear-gradient(135deg, #fff5f9 0%, #fff0f6 100%)',
    green: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    blue: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    orange: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    silver: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
    bronze: 'linear-gradient(135deg, #CD7F32, #A0522D)'
};

// <Button variant="gradient" color="info" />  -> degradado según el color
const buttonGradients = {
    primary: gradients.pink,
    info: gradients.blue,
    success: gradients.green,
    warning: gradients.orange
};

// Estilos globales para SweetAlert (se usan con <GlobalStyles />)
export const swalGlobalStyles = {
    '.swal2-container': { zIndex: '2000 !important' },
    '.swal2-popup': {
        fontFamily: "'Segoe UI', Arial, sans-serif !important",
        borderRadius: '20px !important',
        border: '2px solid #ff69b4 !important',
        boxShadow: '0 20px 60px rgba(255, 20, 147, 0.3) !important'
    },
    '.swal2-confirm': {
        background: 'linear-gradient(135deg, #ff69b4, #ff1493) !important',
        borderRadius: '50px !important',
        boxShadow: '0 4px 15px rgba(255, 105, 180, 0.4) !important'
    }
};

const theme = createTheme({
    palette: {
        primary: { main: '#ff69b4', dark: '#ff1493', light: '#ffb6c1', contrastText: '#fff' },
        secondary: { main: '#ff1493' },
        background: { default: '#fff5f9', paper: '#ffffff' },
        text: { primary: '#333333', secondary: '#666666' }
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: "'Segoe UI', Arial, sans-serif",
        button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
        /* ------------------------------ Button ------------------------------ */
        MuiButton: {
            styleOverrides: { root: { borderRadius: 8 } },
            variants: [
                // Botón de acción con degradado
                {
                    props: { variant: 'gradient' },
                    style: {
                        minHeight: 42,
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }
                },
                ...Object.entries(buttonGradients).map(([color, bg]) => ({
                    props: { variant: 'gradient', color },
                    style: {
                        background: bg,
                        '&:hover:not(.Mui-disabled)': {
                            background: bg,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 7px 18px rgba(0,0,0,0.14)'
                        },
                        '&.Mui-disabled': { color: '#fff', opacity: 0.48, background: bg }
                    }
                })),
                // Botón grande tipo "píldora" (Girar Flor)
                {
                    props: { variant: 'pill' },
                    style: ({ theme }) => ({
                        minWidth: 270,
                        padding: theme.spacing(2.1, 6),
                        borderRadius: 999,
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#fff',
                        background: gradients.pink,
                        boxShadow: '0 12px 30px rgba(255,105,180,0.35)',
                        transition: 'all 0.25s ease',
                        '&:hover:not(.Mui-disabled)': {
                            background: gradients.pink,
                            transform: 'translateY(-3px) scale(1.02)',
                            boxShadow: '0 16px 38px rgba(255,105,180,0.45)'
                        },
                        '&.Mui-disabled': { color: '#fff', opacity: 0.65, background: gradients.pink },
                        [theme.breakpoints.down('sm')]: {
                            minWidth: 0,
                            padding: theme.spacing(1.8, 4),
                            fontSize: '1.05rem'
                        }
                    })
                }
            ]
        },

        /* ------------------------------ Paper ------------------------------- */
        MuiPaper: {
            variants: [
                {
                    props: { variant: 'panel' },
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 600,
                        overflow: 'hidden',
                        borderRadius: 16,
                        backgroundColor: '#fff',
                        border: '1px solid rgba(255,105,180,0.12)',
                        boxShadow: '0 8px 30px rgba(136,19,84,0.08)',
                        transition: 'box-shadow 0.25s ease',
                        '&:hover': { boxShadow: '0 12px 38px rgba(136,19,84,0.11)' }
                    }
                },
                {
                    props: { variant: 'panelHeader' },
                    style: ({ theme }) => ({
                        borderRadius: 0,
                        padding: theme.spacing(2.5),
                        background:
                            'linear-gradient(135deg, rgba(255,240,247,0.95), rgba(255,248,251,0.98))',
                        borderBottom: '1px solid rgba(255,105,180,0.14)',
                        [theme.breakpoints.down('sm')]: { padding: theme.spacing(2) }
                    })
                },
                {
                    props: { variant: 'glass' },
                    style: {
                        backgroundColor: 'rgba(255,255,255,0.14)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        border: '1px solid rgba(255,255,255,0.22)'
                    }
                }
            ]
        },

        /* ------------------------------ Avatar ------------------------------ */
        MuiAvatar: {
            variants: [
                {
                    props: { variant: 'badge' },
                    style: {
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        color: '#ff69b4',
                        backgroundColor: 'rgba(255,105,180,0.1)'
                    }
                }
            ]
        },

        /* ------------------------- Toggle (switcher) ------------------------ */
        MuiToggleButtonGroup: {
            styleOverrides: {
                root: {
                    padding: 4,
                    gap: 4,
                    backgroundColor: '#f5f5f5',
                    border: '1px solid rgba(255,105,180,0.15)',
                    borderRadius: 10,
                    '& .MuiToggleButton-root': {
                        border: 'none',
                        margin: 0,
                        borderRadius: '8px !important'
                    }
                }
            }
        },
        MuiToggleButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    gap: 6,
                    padding: theme.spacing(0.9, 1.75),
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    '&.Mui-selected, &.Mui-selected:hover': {
                        color: '#fff',
                        backgroundColor: theme.palette.primary.main,
                        boxShadow: '0 4px 10px rgba(255,105,180,0.28)'
                    }
                })
            }
        },

        /* ----------------------------- Inputs ------------------------------- */
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    '& fieldset': { borderWidth: 1.5, borderColor: 'rgba(255,105,180,0.3)' },
                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                    '&.Mui-focused fieldset': {
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main
                    }
                })
            }
        },

        /* ------------------------------ Table ------------------------------- */
        MuiTableCell: {
            styleOverrides: {
                head: { background: '#fff8fb', fontWeight: 600, borderBottom: '2px solid #ffb6c1' }
            }
        }
    }
});

export default theme;