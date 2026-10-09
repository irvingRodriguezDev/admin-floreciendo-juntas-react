import React from 'react';
import { Avatar, Box, Card, CardContent, CardHeader, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { formatCurrency } from './OrderHelpers';

const PINK = '#ff5c95';
const soft = (a = 0.08) => alpha(PINK, a);

const Line = ({ icon, label, value, color = 'text.primary' }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.25 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent', color }}>{icon}</Avatar>
        <Typography flex={1} color={color === 'text.primary' ? 'text.secondary' : color}>{label}</Typography>
        <Typography fontWeight={700} sx={{ color }}>{value}</Typography>
    </Stack>
);

const FinancialSummary = ({ order }) => {
    if (!order) return null;

    const totalAmount = parseFloat(order.totalAmount || 0);
    const paidAmount = parseFloat(order.paidAmount || 0);
    const remainingAmount = parseFloat(order.remainingAmount || 0);
    const shippingCost = parseFloat(order.shippingCost || 0);
    const percent = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
    const money = (v) => `$${formatCurrency(v)}`;

    return (
        <Card variant="outlined" sx={{ mt: 2, borderRadius: 4, borderColor: soft(0.25), boxShadow: `0 6px 20px ${soft(0.08)}`, overflow: 'hidden' }}>
            <CardHeader
                avatar={<Avatar sx={{ bgcolor: soft(0.14), color: PINK }}><SummarizeIcon /></Avatar>}
                title="Resumen financiero"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                action={<Chip label={`${percent.toFixed(1)}% pagado`} sx={{ fontWeight: 700, bgcolor: soft(0.14), color: '#e6407c' }} />}
                sx={{ bgcolor: soft(0.06) }}
            />
            <Divider sx={{ borderColor: soft(0.2) }} />

            <CardContent sx={{ bgcolor: '#fff' }}>
                {/* Progreso de pago */}
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">Porcentaje pagado</Typography>
                        <Typography variant="caption" fontWeight={700}>{percent.toFixed(1)}%</Typography>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(percent, 100)}
                        sx={{ height: 10, borderRadius: 5, bgcolor: soft(0.15), '& .MuiLinearProgress-bar': { borderRadius: 5, background: `linear-gradient(90deg, ${PINK}, #ff8fb7)` } }}
                    />
                </Box>

                <Line icon={<ReceiptIcon />} label="Total de la orden" value={money(totalAmount)} />
                <Divider sx={{ borderColor: soft(0.15) }} />
                <Line icon={<LocalShippingIcon />} label="Costo de envío" value={money(shippingCost)} />
                <Divider sx={{ borderColor: soft(0.15) }} />
                <Line icon={<CheckCircleIcon />} label="Pagado" value={money(paidAmount)} color="success.main" />
                <Divider sx={{ borderColor: soft(0.15) }} />
                <Line icon={<HourglassTopIcon />} label="Saldo pendiente" value={money(remainingAmount)} color="error.main" />
            </CardContent>
        </Card>
    );
};

export default FinancialSummary;