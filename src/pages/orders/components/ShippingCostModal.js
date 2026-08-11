import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { formatCurrency, hasShippingCost } from './OrderHelpers';

const ShippingCostModal = ({ open, onClose, order, value, onChange, onSave }) => {
    const isEditing = order && hasShippingCost(order);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF6B9D 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <LocalShippingIcon />
                {isEditing ? 'Editar Costo de Envío' : 'Agregar Costo de Envío'}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {order && (
                    <>
                        <Box
                            sx={{
                                bgcolor: '#FFF5FA',
                                p: 2,
                                borderRadius: 2,
                                mb: 3,
                                border: '1px solid #FFE6F0',
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Orden: <strong>ORD-{order.id}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Cliente: <strong>{order.user?.name || 'Cliente no disponible'}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total: <strong>${formatCurrency(order.totalAmount)}</strong>
                            </Typography>
                        </Box>

                        <TextField
                            label="Costo de Envío"
                            type="number"
                            value={value}
                            onChange={onChange}
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>,
                            }}
                            fullWidth
                            margin="normal"
                            placeholder="0.00"
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#ddd', color: '#666' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={onSave}
                    disabled={!value || parseFloat(value) < 0}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #FF6B9D 0%, #FF6B9D 100%)',
                        color: '#fff',
                        '&:disabled': {
                            background: '#e0e0e0',
                            color: '#999',
                        },
                    }}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShippingCostModal;