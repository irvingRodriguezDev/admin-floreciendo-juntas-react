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
} from '@mui/material';
import { formatCurrency } from './OrderHelpers';

const OrderProductsDetail = ({ order }) => {
    if (!order || !order.items || order.items.length === 0) {
        return <Typography>No hay productos en esta orden</Typography>;
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Productos ({order.items.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="right">Precio Unitario</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Typography fontWeight="medium">
                                        {item.product?.name || 'Producto sin nombre'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">${formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell align="right">${formatCurrency(item.subtotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default OrderProductsDetail;