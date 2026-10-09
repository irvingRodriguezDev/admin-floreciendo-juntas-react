import React from 'react';
import {
    Alert, Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Chip, CircularProgress, Dialog,
    DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, LinearProgress, List, ListItem,
    ListItemIcon, ListItemText, Paper, Skeleton, Step, StepLabel, Stepper, Stack, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EventIcon from '@mui/icons-material/Event';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingIcon from '@mui/icons-material/HourglassTop';
import PaidIcon from '@mui/icons-material/CheckCircle';
import TagIcon from '@mui/icons-material/Tag';
import NotesIcon from '@mui/icons-material/StickyNote2';
import StoreIcon from '@mui/icons-material/Storefront';
import QrIcon from '@mui/icons-material/QrCode2';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { statusLabels, statusColors } from './OrderConstans';
import { formatCurrency, formatLocalDate } from './OrderHelpers';
import OrderProductsDetail from './OrderProductsDetail';
import OrderPaymentsDetail from './OrderPaymentsDetail';
import FinancialSummary from './FinancialSummary';

const PINK = '#ff5c95';
const PINK_DARK = '#e6407c';
const PINK_LIGHT = '#ff8fb7';
const GRADIENT = `linear-gradient(135deg, ${PINK} 0%, ${PINK_LIGHT} 100%)`;
const soft = (a = 0.08) => alpha(PINK, a);

const money = (v) => `$${formatCurrency(v)}`;
const asDate = (v) => (v ? new Date(v) : null);

// ─── Piezas reutilizables ────────────────────────────────────────────────────
const IconAvatar = ({ children, color = PINK, size = 40 }) => (
    <Avatar sx={{ bgcolor: alpha(color, 0.12), color, width: size, height: size }}>{children}</Avatar>
);

const InfoCard = ({ icon, title, children, actions }) => (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, borderColor: soft(0.25), boxShadow: `0 6px 20px ${soft(0.08)}` }}>
        <CardHeader
            avatar={<IconAvatar>{icon}</IconAvatar>}
            title={title}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            sx={{ bgcolor: soft(0.06) }}
        />
        <Divider sx={{ borderColor: soft(0.2) }} />
        <CardContent sx={{ py: 0.5 }}><List dense disablePadding>{children}</List></CardContent>
        {actions && <CardActions sx={{ px: 2, pb: 2 }}>{actions}</CardActions>}
    </Card>
);

const Row = ({ icon, label, children }) => (
    <ListItem disableGutters sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: 36, color: PINK }}>{icon}</ListItemIcon>
        <ListItemText
            primary={label}
            secondary={children}
            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            secondaryTypographyProps={{ component: 'div', variant: 'body2', color: 'text.primary', fontWeight: 600 }}
        />
    </ListItem>
);

const Stat = ({ icon, label, value, color }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: alpha(color, 0.3), bgcolor: alpha(color, 0.05) }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
            <IconAvatar color={color}>{icon}</IconAvatar>
            <Box minWidth={0}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color }} noWrap>{value}</Typography>
            </Box>
        </Stack>
    </Paper>
);

const stepperSx = {
    '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': { color: PINK },
    '& .MuiStepConnector-line': { borderColor: soft(0.4) },
    '& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed': { fontWeight: 700 },
};

// ─── Modal ───────────────────────────────────────────────────────────────────
const OrderDetailModal = ({ open, onClose, selectedOrder, orderDetail: o, loading }) => {
    const status = o && statusColors[o.status];
    const total = Number(o?.totalAmount) || 0;
    const progress = total ? Math.min((Number(o.paidAmount) / total) * 100, 100) : 0;

    const timeline = o ? [
        { label: 'Creación', date: asDate(o.createdAt), text: new Date(o.createdAt).toLocaleDateString('es-MX') },
        o.startDate && { label: 'Inicio', date: asDate(o.startDate), text: formatLocalDate(o.startDate) },
        o.dueDate && { label: 'Vencimiento', date: asDate(o.dueDate), text: formatLocalDate(o.dueDate) },
    ].filter(Boolean) : [];
    const activeStep = timeline.filter(s => s.date <= new Date()).length;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper"
            PaperProps={{ sx: { borderRadius: { xs: 0, sm: 4 }, overflow: 'hidden' } }}>
            {/* Header */}
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{ background: GRADIENT, color: '#fff', p: { xs: 2.5, sm: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.22), color: '#fff', width: 52, height: 52 }}><ReceiptLongIcon /></Avatar>
                        <Box flex={1} minWidth={0}>
                            <Typography variant="h6" fontWeight={800}>Venta ORD-{selectedOrder?.id}</Typography>
                            {o && (
                                <Typography variant="body2" sx={{ opacity: 0.92 }}>
                                    Creada el {new Date(o.createdAt).toLocaleString('es-MX')}
                                </Typography>
                            )}
                        </Box>
                        {o && (
                            <Chip label={statusLabels[o.status] || o.status}
                                sx={{ fontWeight: 700, bgcolor: '#fff', color: PINK_DARK, ...(status && { color: status.color, background: status.bg }) }} />
                        )}
                        <IconButton onClick={onClose} aria-label="Cerrar" sx={{ color: '#fff', bgcolor: alpha('#fff', 0.15), '&:hover': { bgcolor: alpha('#fff', 0.3) } }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#FFFAFC' }}>
                {loading ? (
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: PINK }, bgcolor: soft(0.2) }} />
                        <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
                        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
                    </Stack>
                ) : o ? (
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {/* Resumen de pago */}
                        {/* <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, borderColor: soft(0.25), bgcolor: '#fff' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box position="relative" display="inline-flex">
                                        <CircularProgress variant="determinate" value={100} size={104} thickness={4} sx={{ color: soft(0.15), position: 'absolute' }} />
                                        <CircularProgress variant="determinate" value={progress} size={104} thickness={4} sx={{ color: PINK }} />
                                        <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
                                            <Typography variant="h6" fontWeight={800}>{Math.round(progress)}%</Typography>
                                            <Typography variant="caption" color="text.secondary">pagado</Typography>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={9}>
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12} sm={4}><Stat icon={<AccountBalanceWalletIcon />} label="Total" value={money(o.totalAmount)} color={PINK} /></Grid>
                                        <Grid item xs={12} sm={4}><Stat icon={<PaidIcon />} label="Pagado" value={money(o.paidAmount)} color="#2e9e5b" /></Grid>
                                        <Grid item xs={12} sm={4}><Stat icon={<PendingIcon />} label="Saldo pendiente" value={money(o.remainingAmount)} color="#f57c00" /></Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Paper> */}

                        {/* Línea de tiempo */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, borderColor: soft(0.25), bgcolor: '#fff' }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                <EventIcon sx={{ color: PINK }} />
                                <Typography variant="subtitle1" fontWeight={700}>Fechas importantes</Typography>
                            </Stack>
                            <Stepper alternativeLabel activeStep={activeStep} sx={stepperSx}>
                                {timeline.map(s => (
                                    <Step key={s.label}>
                                        <StepLabel optional={<Typography variant="caption">{s.text}</Typography>}>{s.label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Paper>

                        {!o.address && (
                            <Alert severity="warning" variant="outlined" sx={{ borderRadius: 3 }}>
                                Esta orden no tiene dirección de envío registrada.
                            </Alert>
                        )}

                        {/* Tarjetas de detalle */}
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} md={6}>
                                <InfoCard icon={<AssignmentIcon />} title="Información de la orden">
                                    <Row icon={<TagIcon fontSize="small" />} label="Número de orden">ORD-{o.id}</Row>
                                    <Divider component="li" sx={{ borderColor: soft(0.15) }} />
                                    <Row icon={<PaymentsIcon fontSize="small" />} label="Método de pago">{o.paymentMethod || 'No especificado'}</Row>
                                    {o.notes && <>
                                        <Divider component="li" sx={{ borderColor: soft(0.15) }} />
                                        <Row icon={<NotesIcon fontSize="small" />} label="Notas">
                                            <Typography variant="body2" fontStyle="italic" fontWeight={500}>{o.notes}</Typography>
                                        </Row>
                                    </>}
                                </InfoCard>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoCard
                                    icon={<LocalShippingIcon />}
                                    title="Información de envío"
                                    actions={o.trackingUrl && (
                                        <Button size="small" variant="outlined" href={o.trackingUrl} target="_blank" rel="noopener noreferrer"
                                            endIcon={<OpenInNewIcon />}
                                            sx={{ color: PINK, borderColor: PINK, borderRadius: 2, '&:hover': { borderColor: PINK_DARK, bgcolor: soft(0.08) } }}>
                                            Ver seguimiento
                                        </Button>
                                    )}
                                >
                                    <Row icon={<StoreIcon fontSize="small" />} label="Transportista">{o.carrier || 'No especificado'}</Row>
                                    <Divider component="li" sx={{ borderColor: soft(0.15) }} />
                                    <Row icon={<QrIcon fontSize="small" />} label="Número de guía">{o.trackingNumber || 'No asignado'}</Row>
                                    <Divider component="li" sx={{ borderColor: soft(0.15) }} />
                                    <Row icon={<AccountBalanceWalletIcon fontSize="small" />} label="Costo de envío">{money(o.shippingCost)}</Row>
                                    <Divider component="li" sx={{ borderColor: soft(0.15) }} />
                                    <Row icon={<PaidIcon fontSize="small" />} label="Envío pagado">
                                        <Chip size="small" label={o.shippingPaid ? 'Sí' : 'No'} color={o.shippingPaid ? 'success' : 'error'} variant="outlined" sx={{ fontWeight: 600 }} />
                                    </Row>
                                </InfoCard>
                            </Grid>
                        </Grid>

                        <OrderProductsDetail order={o} />
                        <OrderPaymentsDetail order={o} />
                        <FinancialSummary order={o} />
                    </Stack>
                ) : (
                    <Alert severity="error" sx={{ borderRadius: 3 }}>No se pudieron cargar los detalles de la orden.</Alert>
                )}
            </DialogContent>

            <Divider sx={{ borderColor: soft(0.2) }} />
            <DialogActions sx={{ p: 2, bgcolor: '#FFF5FA' }}>
                <Button onClick={onClose} variant="contained" disableElevation
                    sx={{ background: GRADIENT, color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, '&:hover': { background: PINK_DARK } }}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailModal;