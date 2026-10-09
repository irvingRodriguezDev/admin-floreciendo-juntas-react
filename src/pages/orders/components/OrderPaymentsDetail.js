import React from 'react';
import {
    Avatar, Card, CardHeader, Chip, Divider, Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PaymentsIcon from '@mui/icons-material/Payments';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { formatCurrency, formatLocalDate } from './OrderHelpers';

const PINK = '#ff5c95';
const PINK_DARK = '#e6407c';
const soft = (a = 0.08) => alpha(PINK, a);
const money = (v) => `$${formatCurrency(v)}`;

// Cada estilo se define con un solo color; el fondo se deriva con alpha()
const paymentMethodStyles = {
    tarjeta: { color: '#1976D2', icon: <CreditCardIcon /> },
    efectivo: { color: '#2E7D32', icon: <AttachMoneyIcon /> },
    default: { color: '#7B1FA2', icon: <PaymentIcon /> },
};

const paymentTypeStyles = {
    initial: { label: 'Inicial', color: '#EF6C00' },
    partial: { label: 'Parcial', color: '#1565C0' },
    shipping: { label: 'Envío', color: '#2E7D32' },
};

const tintedChip = (color) => ({ bgcolor: alpha(color, 0.12), color, fontWeight: 600, '& .MuiChip-icon': { color } });

const cardSx = { mt: 2, borderRadius: 4, borderColor: soft(0.25), boxShadow: `0 6px 20px ${soft(0.08)}`, overflow: 'hidden' };
const headCell = { fontWeight: 700, color: PINK_DARK, borderBottom: `2px solid ${soft(0.25)}` };

const Header = ({ count }) => (
    <CardHeader
        avatar={<Avatar sx={{ bgcolor: soft(0.14), color: PINK }}><PaymentsIcon /></Avatar>}
        title="Pagos"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        action={count > 0 && (
            <Chip label={`${count} pago${count !== 1 ? 's' : ''}`} sx={{ fontWeight: 700, bgcolor: soft(0.14), color: PINK_DARK }} />
        )}
        sx={{ bgcolor: soft(0.06) }}
    />
);

const OrderPaymentsDetail = ({ order }) => {
    if (!order || !order.payments || order.payments.length === 0) {
        return (
            <Card variant="outlined" sx={cardSx}>
                <Header count={0} />
                <Divider sx={{ borderColor: soft(0.2) }} />
                <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center', bgcolor: '#fff' }}>
                    No hay pagos registrados para esta orden
                </Typography>
            </Card>
        );
    }

    const paidTotal = order.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return (
        <Card variant="outlined" sx={cardSx}>
            <Header count={order.payments.length} />
            <Divider sx={{ borderColor: soft(0.2) }} />

            <TableContainer sx={{ bgcolor: '#fff' }}>
                <Table size="small" sx={{ minWidth: 640 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: soft(0.05) }}>
                            <TableCell sx={headCell}>Fecha</TableCell>
                            <TableCell sx={headCell}>Método</TableCell>
                            <TableCell align="center" sx={headCell}>Tipo</TableCell>
                            <TableCell align="center" sx={headCell}>Estado</TableCell>
                            <TableCell align="right" sx={headCell}>Monto</TableCell>
                            <TableCell sx={headCell}>Referencia</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.payments.map((payment, index) => {
                            const method = paymentMethodStyles[payment.paymentMethod] || paymentMethodStyles.default;
                            const type = paymentTypeStyles[payment.type];
                            const done = payment.status === 'completado';

                            return (
                                <TableRow key={index} hover
                                    sx={{ '&:nth-of-type(even)': { bgcolor: soft(0.025) }, '&:hover': { bgcolor: `${soft(0.07)} !important` }, '&:last-child td': { borderBottom: 0 } }}>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatLocalDate(payment.paymentDate)}</TableCell>

                                    <TableCell>
                                        <Chip size="small" icon={method.icon} label={payment.paymentMethod || 'No especificado'} sx={tintedChip(method.color)} />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Chip size="small" label={type ? type.label : (payment.type || 'Regular')} sx={tintedChip(type ? type.color : '#7B1FA2')} />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            icon={done ? <CheckCircleIcon /> : <HourglassTopIcon />}
                                            label={done ? 'Completado' : payment.status || 'Pendiente'}
                                            sx={tintedChip(done ? '#2E7D32' : '#EF6C00')}
                                        />
                                    </TableCell>

                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{money(payment.amount)}</TableCell>

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

            <Divider sx={{ borderColor: soft(0.2) }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, bgcolor: soft(0.05) }}>
                <Typography variant="body2" color="text.secondary">Total de pagos registrados</Typography>
                <Typography fontWeight={800} sx={{ color: PINK_DARK }}>{money(paidTotal)}</Typography>
            </Stack>
        </Card>
    );
};

export default OrderPaymentsDetail;