import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { formatCurrency } from './OrderHelpers';

const FinancialSummary = ({ order }) => {
    if (!order) return null;

    const totalAmount = parseFloat(order.totalAmount || 0);
    const paidAmount = parseFloat(order.paidAmount || 0);
    const remainingAmount = parseFloat(order.remainingAmount || 0);
    const shippingCost = parseFloat(order.shippingCost || 0);

    return (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF5FA', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom color="#FF69B4">
                Resumen Financiero
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    <Typography>Total de la Orden:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography>${formatCurrency(totalAmount)}</Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography color="green">Pagado:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography color="green">${formatCurrency(paidAmount)}</Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography color="red">Saldo Pendiente:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography color="red">${formatCurrency(remainingAmount)}</Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography>Costo de envío:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography>${formatCurrency(shippingCost)}</Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography fontWeight="bold">Porcentaje Pagado:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography fontWeight="bold">
                        {totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0}%
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FinancialSummary;