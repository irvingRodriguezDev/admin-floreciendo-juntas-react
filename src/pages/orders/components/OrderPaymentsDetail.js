import React from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
} from '@mui/material';
import { formatCurrency, formatLocalDate } from './OrderHelpers';

const paymentMethodStyles = {
    tarjeta: { backgroundColor: '#E3F2FD', color: '#1976D2' },
    efectivo: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
    default: { backgroundColor: '#F3E5F5', color: '#7B1FA2' },
};

const paymentTypeStyles = {
    initial: { label: 'Inicial', backgroundColor: '#FFF3E0', color: '#EF6C00' },
    partial: { label: 'Parcial', backgroundColor: '#E3F2FD', color: '#1565C0' },
    shipping: { label: 'Envío', backgroundColor: '#E8F5E9', color: '#2E7D32' },
};

const OrderPaymentsDetail = ({ order }) => {
    if (!order || !order.payments || order.payments.length === 0) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Pagos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No hay pagos registrados para esta orden
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Pagos ({order.payments.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Método</TableCell>
                            <TableCell align="center">Tipo</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="right">Monto</TableCell>
                            <TableCell>Referencia</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.payments.map((payment, index) => {
                            const methodStyle = paymentMethodStyles[payment.paymentMethod] || paymentMethodStyles.default;
                            const typeStyle = paymentTypeStyles[payment.type];

                            return (
                                <TableRow key={index}>
                                    <TableCell>{formatLocalDate(payment.paymentDate)}</TableCell>

                                    <TableCell>
                                        <Chip
                                            label={payment.paymentMethod || 'No especificado'}
                                            size="small"
                                            sx={{ ...methodStyle, fontWeight: '500' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={typeStyle ? typeStyle.label : (payment.type || 'Regular')}
                                            size="small"
                                            sx={{
                                                backgroundColor: typeStyle ? typeStyle.backgroundColor : '#F3E5F5',
                                                color: typeStyle ? typeStyle.color : '#7B1FA2',
                                                fontWeight: '500',
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Chip
                                            label={payment.status === 'completado' ? 'Completado' : payment.status || 'Pendiente'}
                                            size="small"
                                            sx={{
                                                backgroundColor: payment.status === 'completado' ? '#E8F5E9' : '#FFF3E0',
                                                color: payment.status === 'completado' ? '#2E7D32' : '#EF6C00',
                                                fontWeight: '500',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="600">${formatCurrency(payment.amount)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {payment.reference || 'Sin referencia'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default OrderPaymentsDetail;