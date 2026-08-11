import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { carrierOptions } from './OrderConstans';
import { formatCurrency } from './OrderHelpers';

const TrackingModal = ({
    open,
    onClose,
    order,
    trackingNumber,
    onTrackingNumberChange,
    carrier,
    onCarrierChange,
    onSave,
}) => {
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
                <AssignmentIcon />
                Información de Envío
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {order && (
                    <>
                        <Box
                            sx={{
                                bgcolor: '#F3E5F5',
                                p: 2,
                                borderRadius: 2,
                                mb: 3,
                                border: '1px solid #E1BEE7',
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Orden: <strong>ORD-{order.id}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Cliente: <strong>{order.user?.name || 'Cliente no disponible'}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Costo de envío: <strong>${formatCurrency(order.shippingCost)}</strong>
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Número de Guía"
                                    value={trackingNumber}
                                    onChange={onTrackingNumberChange}
                                    fullWidth
                                    margin="normal"
                                    placeholder="Ej: ABC123456789"
                                    helperText="Número de seguimiento proporcionado por la paquetería"
                                    required
                                    InputProps={{
                                        startAdornment: <AssignmentIcon sx={{ color: '#9C27B0', mr: 1 }} />,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel>Paquetería</InputLabel>
                                    <Select
                                        label="Paquetería"
                                        value={carrier}
                                        onChange={onCarrierChange}
                                        startAdornment={<DirectionsCarIcon sx={{ color: '#9C27B0', mr: 1 }} />}
                                    >
                                        {carrierOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                        Selecciona la paquetería utilizada para el envío
                                    </Typography>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#9C27B0', color: '#9C27B0' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={onSave}
                    disabled={!trackingNumber.trim() || !carrier.trim()}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                        color: '#fff',
                        '&:disabled': {
                            background: '#e0e0e0',
                            color: '#999',
                        },
                    }}
                >
                    Guardar Información de Envío
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TrackingModal;