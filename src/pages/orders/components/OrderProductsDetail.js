import React from 'react';
import {
    Avatar, Card, CardHeader, Chip, Divider, Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { formatCurrency } from './OrderHelpers';

const PINK = '#ff5c95';
const soft = (a = 0.08) => alpha(PINK, a);
const money = (v) => `$${formatCurrency(v)}`;

const cardSx = { mt: 2, borderRadius: 4, borderColor: soft(0.25), boxShadow: `0 6px 20px ${soft(0.08)}`, overflow: 'hidden' };

const headCell = { fontWeight: 700, color: '#e6407c', borderBottom: `2px solid ${soft(0.25)}` };

const OrderProductsDetail = ({ order }) => {
    if (!order || !order.items || order.items.length === 0) {
        return (
            <Card variant="outlined" sx={{ ...cardSx, p: 4, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: soft(0.12), color: PINK, width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                    <ShoppingBagIcon />
                </Avatar>
                <Typography color="text.secondary">No hay productos en esta orden</Typography>
            </Card>
        );
    }

    const itemsTotal = order.items.reduce((sum, i) => sum + parseFloat(i.subtotal || 0), 0);

    return (
        <Card variant="outlined" sx={cardSx}>
            <CardHeader
                avatar={<Avatar sx={{ bgcolor: soft(0.14), color: PINK }}><Inventory2Icon /></Avatar>}
                title="Productos"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                action={<Chip label={`${order.items.length} producto${order.items.length !== 1 ? 's' : ''}`} sx={{ fontWeight: 700, bgcolor: soft(0.14), color: '#e6407c' }} />}
                sx={{ bgcolor: soft(0.06) }}
            />
            <Divider sx={{ borderColor: soft(0.2) }} />

            <TableContainer sx={{ bgcolor: '#fff' }}>
                <Table size="small" sx={{ minWidth: 480 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: soft(0.05) }}>
                            <TableCell sx={headCell}>Producto</TableCell>
                            <TableCell align="center" sx={headCell}>Cantidad</TableCell>
                            <TableCell align="right" sx={headCell}>Precio unitario</TableCell>
                            <TableCell align="right" sx={headCell}>Subtotal</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.items.map((item, index) => {
                            const name = item.product?.name || 'Producto sin nombre';
                            return (
                                <TableRow key={index} hover sx={{ '&:nth-of-type(even)': { bgcolor: soft(0.025) }, '&:hover': { bgcolor: `${soft(0.07)} !important` }, '&:last-child td': { borderBottom: 0 } }}>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: soft(0.12), color: PINK, fontSize: 14, fontWeight: 700 }}>
                                                {name[0].toUpperCase()}
                                            </Avatar>
                                            <Typography fontWeight={600}>{name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip size="small" label={`× ${item.quantity}`} sx={{ fontWeight: 700, bgcolor: soft(0.1), color: '#e6407c' }} />
                                    </TableCell>
                                    <TableCell align="right">{money(item.unitPrice)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{money(item.subtotal)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ borderColor: soft(0.2) }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, bgcolor: soft(0.05) }}>
                <Typography variant="body2" color="text.secondary">Total de productos</Typography>
                <Typography fontWeight={800} sx={{ color: '#e6407c' }}>{money(itemsTotal)}</Typography>
            </Stack>
        </Card>
    );
};

export default OrderProductsDetail;