import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SendConfirmModal = ({ open, onClose, order, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <CheckCircleIcon />
                Confirmar Envío
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {order && (
                    <>
                        <Box
                            sx={{
                                bgcolor: '#E8F5E9',
                                p: 2,
                                borderRadius: 2,
                                mb: 3,
                                border: '1px solid #C8E6C9',
                            }}
                        >
                            <Typography variant="body1" fontWeight="bold" gutterBottom>
                                ¿Confirmar que la orden ha sido enviada?
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Orden: <strong>ORD-{order.id}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Cliente: <strong>{order.user?.name}</strong>
                            </Typography>
                            {order.carrier && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Paquetería: <strong>{order.carrier}</strong>
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Número de guía: <strong>{order.trackingNumber || 'No asignado'}</strong>
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            Esta acción cambiará el estado de la orden a "Enviado" y notificará al cliente.
                        </Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        color: '#fff',
                    }}
                >
                    Confirmar Envío
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendConfirmModal;