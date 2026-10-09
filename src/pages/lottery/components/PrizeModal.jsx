import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { gradients } from '../Theme';

const PrizeModal = ({ onClose, onCreate }) => {
    const [newPrizeName, setNewPrizeName] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!newPrizeName.trim()) return;
        setCreating(true);
        const success = await onCreate(newPrizeName, isPremium);
        setCreating(false);
        if (success) onClose();
    };

    const canCreate = newPrizeName.trim() && !creating;

    return (
        <Dialog
            open
            onClose={creating ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    border: '2px solid #ff69b4',
                    background: 'linear-gradient(145deg, #ffffff 0%, #fff5f9 100%)',
                    boxShadow: '0 25px 50px rgba(255,20,147,0.25)',
                    overflow: 'hidden'
                }
            }}
            slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.75)' } } }}
        >
            <DialogTitle
                component="div"
                sx={{
                    background: gradients.pink,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 4,
                    py: 3
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                        }}
                    >
                        🌸
                    </Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', sm: '1.8rem' } }}>
                        Crear Nuevo Premio
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    disabled={creating}
                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}
                    aria-label="Cerrar"
                >
                    ✕
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: '30px !important' }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: '1.1rem', fontWeight: 600, mb: 1.25 }}>
                    <span>🏷️</span> Nombre del Premio
                </Typography>
                <TextField
                    fullWidth
                    autoFocus
                    value={newPrizeName}
                    onChange={(e) => setNewPrizeName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !creating && handleCreate()}
                    placeholder="Kit profesional de uñas, Salón de tus sueños..."
                    disabled={creating}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#fff',
                            borderRadius: 3,
                            '& fieldset': { borderWidth: 2, borderColor: 'primary.light' },
                            '&:hover fieldset': { borderColor: 'primary.light' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(255,105,180,0.2)' }
                        }
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        mt: 1.25,
                        px: 2,
                        py: 1.5,
                        bgcolor: '#fff0f6',
                        borderRadius: 2.5,
                        borderLeft: '4px solid #ff69b4',
                        color: 'text.secondary',
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                    }}
                >
                    <span>💡</span>
                    Este nombre aparecerá en un pétalo de la flor y será visible para todos los participantes
                </Box>

                <Paper
                    variant="outlined"
                    onClick={() => !creating && setIsPremium((prev) => !prev)}
                    sx={{
                        mt: 2,
                        px: 2,
                        py: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderWidth: 2,
                        borderRadius: 3,
                        borderColor: isPremium ? 'secondary.main' : 'primary.light',
                        background: isPremium ? 'linear-gradient(135deg, #fff0f8, #ffe0f2)' : '#fff',
                        cursor: creating ? 'not-allowed' : 'pointer',
                        userSelect: 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Checkbox
                        checked={isPremium}
                        disabled={creating}
                        tabIndex={-1}
                        disableRipple
                        color="secondary"
                        sx={{ p: 0.5 }}
                    />
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <span>⭐</span>
                            <Typography sx={{ fontWeight: 700, color: isPremium ? 'secondary.main' : 'text.primary' }}>
                                Premio Premium
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', color: '#888' }}>
                            Marca si este premio es de categoría premium
                        </Typography>
                    </Box>
                </Paper>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 4,
                    py: 2.5,
                    gap: 1.5,
                    background: gradients.soft,
                    borderTop: '1px solid #ffd1dc'
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={creating}
                    sx={{
                        px: 3.5,
                        py: 1.5,
                        borderRadius: 3,
                        color: 'text.secondary',
                        border: '1px solid #ddd',
                        background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)'
                    }}
                >
                    ↩️ Cancelar
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={!canCreate}
                    variant="contained"
                    sx={{
                        px: 3.5,
                        py: 1.5,
                        minWidth: 150,
                        borderRadius: 3,
                        border: '1px solid #ff1493',
                        background: gradients.pink,
                        '&.Mui-disabled': { color: '#fff', opacity: 0.5, background: gradients.pink }
                    }}
                >
                    {creating ? (
                        <>
                            <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                            Creando...
                        </>
                    ) : (
                        <>✅ Crear Premio</>
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrizeModal;