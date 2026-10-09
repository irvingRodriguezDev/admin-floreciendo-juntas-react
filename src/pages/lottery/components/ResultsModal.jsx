import React, { useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TiktokIcon from '../TiktokIcon';
import { launchSuccessConfetti } from '../launchSuccessConfetti';
import { launchFireworks } from '../lauchSuccessFireworks';

const pop = keyframes`
    from { transform: scale(0); }
    to   { transform: scale(1); }
`;

/**
 * Fila de información: Avatar + etiqueta + valor.
 * Usa Paper (variant="outlined") y colores del tema en lugar de hex fijos.
 */
const InfoRow = ({ avatar, avatarColor = 'primary', label, value, children }) => (
    <Paper
        variant="outlined"
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderColor: 'transparent',
            bgcolor: (theme) => alpha(theme.palette[avatarColor].main, 0.08)
        }}
    >
        <Avatar
            sx={{
                width: 50,
                height: 50,
                fontWeight: 800,
                bgcolor: `${avatarColor}.main`,
                color: `${avatarColor}.contrastText`
            }}
        >
            {avatar}
        </Avatar>
        <Stack sx={{ minWidth: 0 }} spacing={0.25}>
            <Typography variant="overline" color={`${avatarColor}.dark`} sx={{ lineHeight: 1.5 }}>
                {label}
            </Typography>
            <Typography variant="h6" component="strong" sx={{ overflowWrap: 'anywhere', lineHeight: 1.3 }}>
                {value}
            </Typography>
            {children}
        </Stack>
    </Paper>
);

const ResultsModal = ({ winner, selectedPrize, raffleResult, onClose }) => {
    useEffect(() => {
        launchSuccessConfetti();
        launchFireworks();
    }, []);

    const hasTiktok = winner.tiktokUsername !== null && winner.tiktokUsername !== undefined;

    return (
        <Dialog
            open
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            slotProps={{
                backdrop: { sx: { backdropFilter: 'blur(4px)' } },
                paper: { sx: { borderRadius: 4, overflow: 'hidden' } }
            }}
        >
            {/* Encabezado */}
            <DialogTitle
                component="div"
                sx={{
                    position: 'relative',
                    textAlign: 'center',
                    py: 5,
                    color: 'primary.contrastText',
                    background: (theme) =>
                        `linear-gradient(150deg, ${theme.palette.primary.light}, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark})`
                }}
            >
                <IconButton
                    onClick={onClose}
                    title="Cerrar"
                    aria-label="Cerrar"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: 'inherit',
                        bgcolor: (theme) => alpha(theme.palette.common.white, 0.25),
                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.common.white, 0.45) }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Avatar
                    sx={{
                        width: 84,
                        height: 84,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
                        color: 'inherit',
                        animation: `${pop} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both`
                    }}
                >
                    <EmojiEventsIcon sx={{ fontSize: 48 }} />
                </Avatar>

                <Typography variant="h4" component="h2" fontWeight={800} gutterBottom={!!raffleResult?.message}>
                    ¡Felicidades!
                </Typography>
                {raffleResult?.message && (
                    <Typography variant="body1" sx={{ opacity: 0.92 }}>
                        {raffleResult.message}
                    </Typography>
                )}
            </DialogTitle>

            {/* Contenido */}
            <DialogContent sx={{ pt: '24px !important' }}>
                <Stack spacing={2}>
                    <InfoRow avatar={winner.name.charAt(0)} label="Ganador" value={winner.name}>
                        {hasTiktok && (
                            <Box sx={{ pt: 0.5 }}>
                                <Chip
                                    icon={<TiktokIcon width="20" />}
                                    label={`@${winner.tiktokUsername}`}
                                    sx={{
                                        height: 39,
                                        pl: 1.5, // 👈 mueve icono + texto hacia la derecha
                                        fontWeight: 700,
                                        color: 'common.white',
                                        bgcolor: 'common.black',
                                        border: 1.5,
                                        borderColor: 'primary.light',
                                        boxShadow: (theme) =>
                                            `0 0 10px ${alpha(theme.palette.primary.light, 0.55)}`,
                                        '& .MuiChip-icon': {
                                            ml: 0,
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </InfoRow>

                    <InfoRow
                        avatar={<CardGiftcardIcon />}
                        avatarColor="error"
                        label="Premio"
                        value={selectedPrize.name}
                    >
                        <Alert
                            severity="error"
                            variant="standard"
                            icon={<WarningAmberIcon fontSize="inherit" />}
                            sx={{ mt: 0.5, p: 0, bgcolor: 'transparent', '& .MuiAlert-message': { py: 0 } }}
                        >
                            Ya no está disponible para futuros sorteos
                        </Alert>
                    </InfoRow>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
                <Button onClick={onClose} variant="contained" size="large" fullWidth sx={{ py: 1.5, fontWeight: 700 }}>
                    🌸 Realizar nuevo sorteo
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ResultsModal;