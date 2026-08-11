import React from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    LinearProgress,
    Paper,
    Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { statusLabels, statusColors } from './OrderConstans';
import { formatCurrency, formatLocalDate } from './OrderHelpers';
import OrderProductsDetail from './OrderProductsDetail';
import OrderPaymentsDetail from './OrderPaymentsDetail';
import FinancialSummary from './FinancialSummary';

const OrderDetailModal = ({ open, onClose, selectedOrder, orderDetail, loading }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #FF69B4 0%, #FF5C93 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <VisibilityIcon />
                Detalle de Venta - ORD-{selectedOrder?.id}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <LinearProgress sx={{ width: '100%' }} />
                    </Box>
                ) : orderDetail ? (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: '#FFF5FA' }}>
                                    <Typography variant="h6" gutterBottom color="#FF69B4">
                                        <AssignmentIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                                        Información de la Orden
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Número:</strong> ORD-{orderDetail.id}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Fecha Creación:</strong> {new Date(orderDetail.createdAt).toLocaleString('es-MX')}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Estado:</strong>
                                        <Chip
                                            label={statusLabels[orderDetail.status] || orderDetail.status}
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                fontWeight: '600',
                                                color: statusColors[orderDetail.status]?.color || '#fff',
                                                background: statusColors[orderDetail.status]?.bg || '#FF5C92',
                                            }}
                                        />
                                    </Typography>
                                    {orderDetail.notes && (
                                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            <strong>Notas:</strong> {orderDetail.notes}
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: '#FFF5FA' }}>
                                    <Typography variant="h6" gutterBottom color="#FF69B4">
                                        <CalendarTodayIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                                        Fechas Importantes
                                    </Typography>
                                    {orderDetail.startDate && (
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Fecha Inicio:</strong> {formatLocalDate(orderDetail.startDate)}
                                        </Typography>
                                    )}

                                    {orderDetail.dueDate && (
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Fecha Vencimiento:</strong> {formatLocalDate(orderDetail.dueDate)}
                                        </Typography>
                                    )}

                                    <Typography variant="body2" gutterBottom>
                                        <strong>Método de Pago:</strong> {orderDetail.paymentMethod || 'No especificado'}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: '#FFF5FA' }}>
                                    <Typography variant="h6" gutterBottom color="#FF69B4">
                                        <AttachMoneyIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                                        Información Financiera
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Total:</strong> ${formatCurrency(orderDetail.totalAmount)}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Pagado:</strong> ${formatCurrency(orderDetail.paidAmount)}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Saldo Pendiente:</strong> ${formatCurrency(orderDetail.remainingAmount)}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>Costo Envío:</strong> ${formatCurrency(orderDetail.shippingCost)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Envío Pagado:</strong>
                                        <Chip
                                            label={orderDetail.shippingPaid ? 'Sí' : 'No'}
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                backgroundColor: orderDetail.shippingPaid ? '#E8F5E9' : '#FFEBEE',
                                                color: orderDetail.shippingPaid ? '#2E7D32' : '#D32F2F',
                                                fontWeight: '500',
                                            }}
                                        />
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: '#FFF5FA' }}>
                                    <Typography variant="h6" gutterBottom color="#FF69B4">
                                        <LocalShippingIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                                        Información de Envío
                                    </Typography>
                                    {orderDetail.address ? (
                                        <Box>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Transportista:</strong> {orderDetail.carrier || 'No especificado'}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Número de Guía:</strong> {orderDetail.trackingNumber || 'No asignado'}
                                            </Typography>
                                            {orderDetail.trackingUrl && (
                                                <Typography variant="body2">
                                                    <strong>URL Seguimiento:</strong>
                                                    <Button
                                                        size="small"
                                                        href={orderDetail.trackingUrl}
                                                        target="_blank"
                                                        sx={{ ml: 1 }}
                                                    >
                                                        Ver seguimiento
                                                    </Button>
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography variant="body2" gutterBottom color="error">
                                                <strong>Dirección:</strong> No registrada
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Transportista:</strong> {orderDetail.carrier || 'No especificado'}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Número de Guía:</strong> {orderDetail.trackingNumber || 'No asignado'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>

                        <OrderProductsDetail order={orderDetail} />
                        <OrderPaymentsDetail order={orderDetail} />
                        <FinancialSummary order={orderDetail} />
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography color="error">No se pudieron cargar los detalles de la orden.</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #FF69B4 0%, #FF5C93 100%)',
                        color: '#fff',
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailModal;