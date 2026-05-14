import React, { useContext, useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    Chip,
    IconButton,
    Fade,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Tabs,
    Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LinkIcon from '@mui/icons-material/Link';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import OrdersContext from '../../context/OrdersContext/OrdersContext';

const useStyles = makeStyles(() => ({
    filterContainer: {
        padding: 24,
        marginBottom: 24,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #FFEEF8 0%, #FFE0F0 100%)',
        border: '1px solid #FFD6EA',
        boxShadow: '0 4px 20px rgba(255, 105, 180, 0.12)',
    },
    filterHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    tabPanel: {
        padding: 0,
    },
}));

const Order = () => {
    const classes = useStyles();

    const {
        cargando,
        ordenesActivas,
        ordenesLiquidadas,
        enviosPagados,
        ordenesEnviadas,
        obtenerOrders,
        obtenerOrdenesActivas,
        obtenerOrdenesCompletadas,
        obtenerOrdenesEnvioPagado,
        obtenerOrdenesEnviadas,
        actualizarCostoEnvio,
        actualizarGuiaEnvio,
        marcarComoEnviado,
        obtenerOrderPorId
    } = useContext(OrdersContext);

    const [activeTab, setActiveTab] = useState(0);
    const [filterItems, setFilterItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [shippingCostInput, setShippingCostInput] = useState('');
    const [trackingNumberInput, setTrackingNumberInput] = useState('');
    const [carrierInput, setCarrierInput] = useState('');
    const [initialLoad, setInitialLoad] = useState(false);
    const [loadingTabs, setLoadingTabs] = useState({
        0: false,
        1: false,
        2: false,
        3: false
    });

    const [rowsState, setRowsState] = useState({
        page: 0,
        pageSize: 7,
    });

    // Opciones para las paqueterías
    const carrierOptions = [
        { value: 'DHL', label: 'DHL' },
        { value: 'Estafeta', label: 'Estafeta' },
        { value: 'Fedex', label: 'Fedex' },
    ];

    // Cargar TODOS los datos al montar el componente
    useEffect(() => {
        const cargarTodosLosDatos = async () => {
            try {
                setLoadingTabs(prev => ({ ...prev, 0: true, 1: true, 2: true, 3: true }));

                // Cargar todas las categorías en paralelo
                await Promise.all([
                    cargarOrdenesActivas(),
                    cargarOrdenesLiquidadas(),
                    cargarEnviosPagados(),
                    cargarOrdenesEnviadas()
                ]);

                setInitialLoad(true);
            } catch (error) {
                console.error('Error al cargar los datos iniciales:', error);
            } finally {
                setLoadingTabs(prev => ({ ...prev, 0: false, 1: false, 2: false, 3: false }));
            }
        };

        cargarTodosLosDatos();
    }, []);

    // Función para cambiar de tab
    const handleTabChange = async (event, newValue) => {
        setActiveTab(newValue);
        setRowsState((prev) => ({ ...prev, page: 0 }));
        setSearchTerm('');

        // Solo recargar si no se ha cargado previamente
        if (!initialLoad) {
            setLoadingTabs(prev => ({ ...prev, [newValue]: true }));
            try {
                switch (newValue) {
                    case 0:
                        await cargarOrdenesActivas();
                        break;
                    case 1:
                        await cargarOrdenesLiquidadas();
                        break;
                    case 2:
                        await cargarEnviosPagados();
                        break;
                    case 3:
                        await cargarOrdenesEnviadas();
                        break;
                }
            } finally {
                setLoadingTabs(prev => ({ ...prev, [newValue]: false }));
            }
        }
    };

    const cargarOrdenesActivas = async () => {
        if (obtenerOrdenesActivas) {
            await obtenerOrdenesActivas();
        }
    };

    const cargarOrdenesLiquidadas = async () => {
        if (obtenerOrdenesCompletadas) {
            await obtenerOrdenesCompletadas();
        }
    };

    const cargarEnviosPagados = async () => {
        if (obtenerOrdenesEnvioPagado) {
            await obtenerOrdenesEnvioPagado();
        }
    };

    const cargarOrdenesEnviadas = async () => {
        if (obtenerOrdenesEnviadas) {
            await obtenerOrdenesEnviadas();
        }
    };

    const filters = [
        { label: 'Número de Orden', title: 'orderNumber' },
        { label: 'Cliente', title: 'customerName' },
        { label: 'Estado', title: 'status' },
    ];

    const statusLabels = {
        pending: 'Pendiente',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        pagado: 'Pagado',
        activo: 'Activo',
    };

    const statusColors = {
        pending: { bg: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)', color: '#fff' },
        shipped: { bg: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)', color: '#fff' },
        delivered: { bg: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: '#fff' },
        cancelled: { bg: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)', color: '#fff' },
        pagado: { bg: 'linear-gradient(135deg, #45a049 0%, #45a049 100%)', color: '#fff' },
        activo: { bg: 'linear-gradient(135deg, #FF5C93 0%, #FF5C93 100%)', color: '#fff' },
    };

    // Obtener las órdenes según el tab activo
    const getOrdersToDisplay = () => {
        let orders = [];
        switch (activeTab) {
            case 0:
                orders = ordenesActivas || [];
                break;
            case 1:
                orders = ordenesLiquidadas || [];
                break;
            case 2:
                orders = enviosPagados || [];
                break;
            case 3:
                orders = ordenesEnviadas || [];
                break;
            default:
                orders = [];
        }
        return orders;
    };

    const getCurrentOrders = () => {
        return getOrdersToDisplay();
    };

    // Función para formatear montos de string a número
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '0.00';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
    };

    // Función para verificar si tiene costo de envío
    const hasShippingCost = (order) => {
        const shippingCost = order.shippingCost;
        return shippingCost !== null && shippingCost !== undefined && shippingCost !== "0.00" && parseFloat(shippingCost) > 0;
    };

    // Función para verificar si tiene número de guía
    const hasTrackingNumber = (order) => {
        return order.trackingNumber && order.trackingNumber.trim() !== '';
    };

    // Filtrado de órdenes con búsqueda
    const displayRows = useMemo(() => {
        let filtered = getOrdersToDisplay();

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter((row) => {
                const orderNumber = `ORD-${row.id}`.toLowerCase();
                const customerName = row.user?.name?.toLowerCase() || 'Cliente no disponible';
                const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                return orderNumber.includes(search) || customerName.includes(search) || status.includes(search);
            });
        }

        if (filterItems.length > 0) {
            filtered = filtered.filter((row) =>
                filterItems.every((filter) => {
                    const field = filter.fields.selectedField;
                    const value = filter.fields.filterValue.toLowerCase();

                    if (field === 'orderNumber') {
                        const orderNumber = `ORD-${row.id}`.toLowerCase();
                        return orderNumber.includes(value);
                    } else if (field === 'customerName') {
                        const customerName = row.user?.name?.toLowerCase() || 'Cliente no disponible';
                        return customerName.includes(value);
                    } else if (field === 'status') {
                        const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                        return status.includes(value);
                    }
                    return false;
                })
            );
        }

        return filtered;
    }, [filterItems, searchTerm, activeTab, ordenesActivas, ordenesLiquidadas, enviosPagados, ordenesEnviadas]);

    const handleChange = (id) => (e) => {
        const { name, value } = e.target;
        setFilterItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, fields: { ...item.fields, [name]: value } } : item
            )
        );
    };

    const handleReset = () => {
        setFilterItems([]);
        setShowFilters(false);
    };

    const addFilter = () => {
        const newItem = {
            id: Date.now(),
            fields: {
                selectedField: filters[0].title,
                filterValue: '',
            },
        };
        setFilterItems([...filterItems, newItem]);
        setShowFilters(true);
    };

    const deleteFilter = (id) => setFilterItems(filterItems.filter((item) => item.id !== id));

    // Modal para ver detalle de venta
    const openDetailModal = async (order) => {
        setSelectedOrder(order);
        setDetailLoading(true);
        setDetailModalOpen(true);

        try {
            const response = await obtenerOrderPorId(order.id);
            setOrderDetail(response.order);
        } catch (error) {
            console.error('Error al obtener detalles de la orden:', error);
            setOrderDetail(order);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedOrder(null);
        setOrderDetail(null);
        setDetailLoading(false);
    };

    // Modal para agregar costo de envío
    const openShippingModal = (order) => {
        setSelectedOrder(order);
        const currentShippingCost = order.shippingCost;
        const numericCost = currentShippingCost && currentShippingCost !== "0.00" ? parseFloat(currentShippingCost) : '';
        setShippingCostInput(numericCost !== '' ? numericCost.toString() : '');
        setShippingModalOpen(true);
    };

    const closeShippingModal = () => {
        setShippingModalOpen(false);
        setSelectedOrder(null);
        setShippingCostInput('');
    };

    const handleSaveShippingCost = async () => {
        if (selectedOrder && shippingCostInput) {
            const cost = parseFloat(shippingCostInput);
            if (!isNaN(cost) && cost >= 0) {
                try {
                    await actualizarCostoEnvio(selectedOrder.id, cost);
                    closeShippingModal();
                    // Recargar las órdenes liquidadas
                    setLoadingTabs(prev => ({ ...prev, 1: true }));
                    await cargarOrdenesLiquidadas();
                    setLoadingTabs(prev => ({ ...prev, 1: false }));
                } catch (error) {
                    console.error('Error al actualizar costo de envío:', error);
                    setLoadingTabs(prev => ({ ...prev, 1: false }));
                }
            }
        }
    };

    // Modal para agregar número de guía
    const openTrackingModal = (order) => {
        setSelectedOrder(order);
        setTrackingNumberInput(order.trackingNumber || '');
        setCarrierInput(order.carrier || '');
        setTrackingModalOpen(true);
    };

    const closeTrackingModal = () => {
        setTrackingModalOpen(false);
        setSelectedOrder(null);
        setTrackingNumberInput('');
        setCarrierInput('');
    };

    const handleSaveTrackingNumber = async () => {
        if (selectedOrder && trackingNumberInput.trim() && carrierInput.trim()) {
            try {
                await actualizarGuiaEnvio(
                    selectedOrder.id,
                    trackingNumberInput.trim(),
                    carrierInput.trim(),
                );
                closeTrackingModal();
                // Recargar las órdenes
                setLoadingTabs(prev => ({ ...prev, 2: true }));
                await cargarEnviosPagados();
                setLoadingTabs(prev => ({ ...prev, 2: false }));
            } catch (error) {
                console.error('Error al actualizar número de guía:', error);
                setLoadingTabs(prev => ({ ...prev, 2: false }));
            }
        }
    };

    // Modal para marcar como enviado
    const openSendModal = (order) => {
        setSelectedOrder(order);
        setSendModalOpen(true);
    };

    const closeSendModal = () => {
        setSendModalOpen(false);
        setSelectedOrder(null);
    };

    const handleMarkAsSent = async () => {
        if (selectedOrder) {
            try {
                setLoadingTabs(prev => ({ ...prev, 2: true, 3: true }));
                await marcarComoEnviado(selectedOrder.id);
                closeSendModal();
                // Recargar ambas pestañas afectadas
                await Promise.all([
                    cargarEnviosPagados(),
                    cargarOrdenesEnviadas()
                ]);
            } catch (error) {
                console.error('Error al marcar como enviado:', error);
            } finally {
                setLoadingTabs(prev => ({ ...prev, 2: false, 3: false }));
            }
        }
    };

    const NoRowsOverlay = () => (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="200px"
            gap={2}
        >
            <SearchIcon sx={{ fontSize: 48, color: '#FFB3DC' }} />
            <Typography variant="body1" color="text.secondary">
                {loadingTabs[activeTab] ? 'Cargando órdenes...' : 'No se encontraron órdenes en esta categoría'}
            </Typography>
        </Box>
    );

    // 🔹 Componente para los detalles de los productos
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
                                    <TableCell align="center">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell align="right">
                                        ${formatCurrency(item.unitPrice)}
                                    </TableCell>
                                    <TableCell align="right">
                                        ${formatCurrency(item.subtotal)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    // 🔹 Componente para los detalles de pagos
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
                            {order.payments.map((payment, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {(() => {
                                            const [year, month, day] = payment.paymentDate.split("-");
                                            const localDate = new Date(year, month - 1, day);
                                            return localDate.toLocaleDateString('es-MX');
                                        })()}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={payment.paymentMethod || 'No especificado'}
                                            size="small"
                                            sx={{
                                                backgroundColor: payment.paymentMethod === 'tarjeta' ? '#E3F2FD' :
                                                    payment.paymentMethod === 'efectivo' ? '#E8F5E9' : '#F3E5F5',
                                                color: payment.paymentMethod === 'tarjeta' ? '#1976D2' :
                                                    payment.paymentMethod === 'efectivo' ? '#2E7D32' : '#7B1FA2',
                                                fontWeight: '500'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={
                                                payment.type === 'initial'
                                                    ? 'Inicial'
                                                    : payment.type === 'partial'
                                                        ? 'Parcial'
                                                        : payment.type === 'shipping'
                                                            ? 'Envío'
                                                            : payment.type || 'Regular'
                                            }
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    payment.type === 'initial'
                                                        ? '#FFF3E0'
                                                        : payment.type === 'partial'
                                                            ? '#E3F2FD'
                                                            : payment.type === 'shipping'
                                                                ? '#E8F5E9'
                                                                : '#F3E5F5',
                                                color:
                                                    payment.type === 'initial'
                                                        ? '#EF6C00'
                                                        : payment.type === 'partial'
                                                            ? '#1565C0'
                                                            : payment.type === 'shipping'
                                                                ? '#2E7D32'
                                                                : '#7B1FA2',
                                                fontWeight: '500'
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
                                                fontWeight: '500'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="600">
                                            ${formatCurrency(payment.amount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {payment.reference || 'Sin referencia'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    // 🔹 Componente para resumen financiero
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

    // Determinar si se debe mostrar el loader principal o el de cada tab
    const isLoading = cargando || loadingTabs[activeTab];

    return (
        <Box>
            {/* FILTROS */}
            {filterItems.length > 0 && (
                <Fade in={showFilters || filterItems.length > 0}>
                    <Paper className={classes.filterContainer}>
                        <Box className={classes.filterHeader}>
                            <FilterAltIcon sx={{ color: '#FF69B4', fontSize: 24 }} />
                            <Typography variant="h6" fontWeight="700" sx={{ color: '#FF69B4' }}>
                                Filtros Activos
                            </Typography>
                        </Box>

                        {filterItems.map((item) => (
                            <Box
                                key={item.id}
                                sx={{
                                    backgroundColor: '#fff',
                                    borderRadius: 3,
                                    p: 2,
                                    mb: 2,
                                    boxShadow: '0 2px 8px rgba(255, 182, 217, 0.15)',
                                }}
                            >
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>Campo</InputLabel>
                                            <Select
                                                label="Campo"
                                                name="selectedField"
                                                value={item.fields.selectedField}
                                                onChange={handleChange(item.id)}
                                                sx={{
                                                    borderRadius: 2,
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#FFD6EA',
                                                    },
                                                }}
                                            >
                                                {filters.map((f) => (
                                                    <MenuItem key={f.title} value={f.title}>
                                                        {f.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={6}>
                                        <TextField
                                            label="Contiene"
                                            name="filterValue"
                                            size="small"
                                            fullWidth
                                            value={item.fields.filterValue}
                                            onChange={handleChange(item.id)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '& fieldset': {
                                                        borderColor: '#FFD6EA',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={2}>
                                        <IconButton
                                            onClick={() => deleteFilter(item.id)}
                                            sx={{
                                                color: '#FF6B9D',
                                                backgroundColor: '#FFF0F5',
                                                '&:hover': {
                                                    backgroundColor: '#FFE1EE',
                                                },
                                            }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #FF6B9D 0%, #C969E0 100%)',
                                    color: '#fff',
                                    fontWeight: '600',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
                                }}
                            >
                                Aplicar
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ClearAllIcon />}
                                onClick={handleReset}
                                sx={{
                                    borderColor: '#FF6B9D',
                                    color: '#FF6B9D',
                                    fontWeight: '600',
                                    borderRadius: 2,
                                    '&:hover': {
                                        borderColor: '#FF5A8C',
                                        backgroundColor: '#FFF5FA',
                                    },
                                }}
                            >
                                Limpiar Todo
                            </Button>
                        </Stack>
                    </Paper>
                </Fade>
            )}

            {/* TABLA CON ESTILO DASHBOARD */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #FFE6F0',
                }}
            >
                {/* ENCABEZADO CON TÍTULO Y BUSCADOR */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
                        p: 3,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    {/* TÍTULO */}
                    <Box>
                        <Typography variant="h6" fontWeight="700">
                            {activeTab === 0 ? 'Órdenes Activas' :
                                activeTab === 1 ? 'Órdenes Liquidadas' :
                                    activeTab === 2 ? 'Envíos Pagados' : 'Órdenes Enviadas'}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                            {activeTab === 0 ? 'Órdenes pendientes de procesar' :
                                activeTab === 1 ? 'Agregar costo de envío' :
                                    activeTab === 2 ? 'Agregar número de guía' : 'Órdenes ya enviadas'}
                        </Typography>
                    </Box>

                    {/* BUSCADOR */}
                    <TextField
                        placeholder="Buscar por orden, cliente o estado..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setRowsState((prev) => ({ ...prev, page: 0 }));
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                            minWidth: 300,
                            maxWidth: 400,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '& fieldset': { borderColor: '#FFD6EA' },
                                '&:hover fieldset': { borderColor: '#FF69B4' },
                                '&.Mui-focused fieldset': { borderColor: '#FF69B4' },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon sx={{ color: '#FF69B4', mr: 1 }} />
                            ),
                            endAdornment: searchTerm && (
                                <IconButton
                                    size="small"
                                    onClick={() => setSearchTerm('')}
                                    sx={{ color: '#FF6B9D' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>

                {/* TABS DE ESTADOS */}
                <Box sx={{
                    bgcolor: '#FFF5FA',
                    borderBottom: '1px solid #FFE6F0',
                    px: 3,
                    pt: 2
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                color: '#666',
                                minHeight: 48,
                                opacity: loadingTabs[activeTab] ? 0.7 : 1,
                                '&.Mui-selected': {
                                    color: '#FF69B4',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#FF69B4',
                                height: 3,
                            },
                        }}
                    >
                        <Tab
                            icon={<AssignmentIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Activas (${ordenesActivas?.length || 0})`}
                            disabled={loadingTabs[0]}
                        />
                        <Tab
                            icon={<LocalShippingIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Liquidadas (${ordenesLiquidadas?.length || 0})`}
                            disabled={loadingTabs[1]}
                        />
                        <Tab
                            icon={<LockIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Envios Pagados (${enviosPagados?.length || 0})`}
                            disabled={loadingTabs[2]}
                        />
                        <Tab
                            icon={<SendIcon sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Enviados (${ordenesEnviadas?.length || 0})`}
                            disabled={loadingTabs[3]}
                        />
                    </Tabs>
                </Box>

                {/* CONTADOR DE RESULTADOS */}
                {searchTerm && (
                    <Box sx={{ px: 3, py: 1.5, bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0' }}>
                        <Typography variant="caption" color="text.secondary">
                            🔍 Mostrando {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para "{searchTerm}"
                        </Typography>
                    </Box>
                )}

                {/* CONTENIDO DE LA TABLA */}
                {isLoading ? (
                    <Box sx={{ p: 4 }}>
                        <LinearProgress sx={{
                            backgroundColor: '#FFE6F0',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#FF69B4',
                            }
                        }} />
                    </Box>
                ) : displayRows.length === 0 ? (
                    <NoRowsOverlay />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Número de Orden
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Cliente
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Fecha
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Dirección
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Total
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Estado
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        {activeTab === 3 ? 'Número de Guía' : 'Envio Pagado'}
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Costo de Envío
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayRows
                                    .slice(
                                        rowsState.page * rowsState.pageSize,
                                        rowsState.page * rowsState.pageSize + rowsState.pageSize
                                    )
                                    .map((order) => (
                                        <TableRow
                                            key={order.id}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: '#FFF5FA',
                                                    transition: 'all 0.2s',
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Typography align="center" fontWeight="600" color="text.primary">
                                                    ORD-{order.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography align="center" variant="body2" color="text.secondary">
                                                    {order.user?.name || 'Cliente no disponible'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {order.address ? (
                                                    <Box display="flex" flexDirection="column">
                                                        <Typography variant="body2" fontWeight="bold">
                                                            Calle: {order.address.street} {order.address.number}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Estado y Ciudad: {order.address.city}, {order.address.state}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            CP: {order.address.zipCode}
                                                        </Typography>
                                                        {order.address.instructions && (
                                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                                Referencia: {order.address.instructions}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="error">
                                                        Sin dirección
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight="600" color="text.primary">
                                                    ${formatCurrency(order.totalAmount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={statusLabels[order.status] || order.status}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: '600',
                                                        color: statusColors[order.status]?.color || '#fff',
                                                        background: statusColors[order.status]?.bg || '#FF5C92',
                                                        boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                                        minWidth: 100,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {activeTab === 3 ? (
                                                    <Typography fontWeight="600" color="primary.main">
                                                        {order.trackingNumber || 'Sin guía'}
                                                    </Typography>
                                                ) : (
                                                    <Typography fontWeight="600" color={order.shippingPaid ? 'success.main' : 'text.secondary'}>
                                                        {order.shippingPaid ? 'Sí' : 'No'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {hasShippingCost(order) ? (
                                                    <Typography fontWeight="600" color="success.main">
                                                        ${formatCurrency(order.shippingCost)}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">
                                                        No asignado
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {/* Acciones según el tab activo */}
                                                {activeTab === 0 && (
                                                    <Tooltip title="Ver detalle de venta" arrow>
                                                        <IconButton
                                                            onClick={() => openDetailModal(order)}
                                                            sx={{
                                                                color: '#FF69B4',
                                                                backgroundColor: '#FFF0F5',
                                                                '&:hover': {
                                                                    backgroundColor: '#FFE1EE',
                                                                    transform: 'scale(1.05)',
                                                                },
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {activeTab === 1 && (
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Tooltip title={hasShippingCost(order) ? "Editar Costo de Envío" : "Agregar Costo de Envío"} arrow>
                                                            <IconButton
                                                                onClick={() => openShippingModal(order)}
                                                                sx={{
                                                                    color: hasShippingCost(order) ? '#42A5F5' : '#FF6B9D',
                                                                    backgroundColor: hasShippingCost(order) ? '#E3F2FD' : '#FFF0F5',
                                                                    '&:hover': {
                                                                        backgroundColor: hasShippingCost(order) ? '#BBDEFB' : '#FFE1EE',
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                {hasShippingCost(order) ? <EditIcon /> : <LocalShippingIcon />}
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Ver detalle de venta" arrow>
                                                            <IconButton
                                                                onClick={() => openDetailModal(order)}
                                                                sx={{
                                                                    color: '#FF69B4',
                                                                    backgroundColor: '#FFF0F5',
                                                                    '&:hover': {
                                                                        backgroundColor: '#FFE1EE',
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}

                                                {activeTab === 2 && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <Tooltip title="Agregar información de envío" arrow>
                                                            <IconButton
                                                                onClick={() => openTrackingModal(order)}
                                                                sx={{
                                                                    color: '#9C27B0',
                                                                    backgroundColor: '#F3E5F5',
                                                                    '&:hover': {
                                                                        backgroundColor: '#E1BEE7',
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                <AssignmentIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Ver detalle de venta" arrow>
                                                            <IconButton
                                                                onClick={() => openDetailModal(order)}
                                                                sx={{
                                                                    color: '#FF69B4',
                                                                    backgroundColor: '#FFF0F5',
                                                                    '&:hover': {
                                                                        backgroundColor: '#FFE1EE',
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}

                                                {activeTab === 3 && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <Tooltip title="Ver detalle de venta" arrow>
                                                            <IconButton
                                                                onClick={() => openDetailModal(order)}
                                                                sx={{
                                                                    color: '#FF69B4',
                                                                    backgroundColor: '#FFF0F5',
                                                                    '&:hover': {
                                                                        backgroundColor: '#FFE1EE',
                                                                        transform: 'scale(1.05)',
                                                                    },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* PAGINACIÓN MANUAL */}
                {!isLoading && displayRows.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: '#FFF5FA',
                            borderTop: '1px solid #FFE6F0',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Mostrando {rowsState.page * rowsState.pageSize + 1} -{' '}
                            {Math.min(
                                (rowsState.page + 1) * rowsState.pageSize,
                                displayRows.length
                            )}{' '}
                            de {displayRows.length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                disabled={rowsState.page === 0}
                                onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page - 1 }))}
                                sx={{
                                    color: '#FF69B4',
                                    '&:disabled': { color: '#ccc' },
                                }}
                            >
                                Anterior
                            </Button>
                            <Button
                                size="small"
                                disabled={
                                    (rowsState.page + 1) * rowsState.pageSize >= displayRows.length
                                }
                                onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page + 1 }))}
                                sx={{
                                    color: '#FF69B4',
                                    '&:disabled': { color: '#ccc' },
                                }}
                            >
                                Siguiente
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* 🔹 MODAL PARA VER DETALLE DE VENTA */}
            <Dialog
                open={detailModalOpen}
                onClose={closeDetailModal}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #FF69B4 0%, #FF5C93 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <VisibilityIcon />
                    Detalle de Venta - ORD-{selectedOrder?.id}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <LinearProgress sx={{ width: '100%' }} />
                        </Box>
                    ) : orderDetail ? (
                        <Box>
                            {/* Información general de la orden */}
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
                                        {/* <Typography variant="body2" gutterBottom>
                                            <strong>Fecha Actualización:</strong> {new Date(orderDetail.updatedAt).toLocaleString('es-MX')}
                                        </Typography> */}
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
                                        {/* <Typography variant="body2" gutterBottom>
                                            <strong>Carrito ID:</strong> {orderDetail.cartId}
                                        </Typography> */}
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
                                            {orderDetail.startDate && (() => {
                                                const [year, month, day] = orderDetail.startDate.split("-");
                                                const localDate = new Date(year, month - 1, day);
                                                return (
                                                    <Typography variant="body2" gutterBottom>
                                                        <strong>Fecha Inicio:</strong> {localDate.toLocaleDateString('es-MX')}
                                                    </Typography>
                                                );
                                            })()}

                                            {orderDetail.dueDate && (() => {
                                                const [year, month, day] = orderDetail.dueDate.split("-");
                                                const localDate = new Date(year, month - 1, day);
                                                return (
                                                    <Typography variant="body2" gutterBottom>
                                                        <strong>Fecha Vencimiento:</strong> {localDate.toLocaleDateString('es-MX')}
                                                    </Typography>
                                                );
                                            })()}

                                        {/* <Typography variant="body2" gutterBottom>
                                            <strong>Descuento Stock:</strong>
                                            <Chip
                                                label={orderDetail.stockDiscounted ? 'Sí' : 'No'}
                                                size="small"
                                                sx={{
                                                    ml: 1,
                                                    backgroundColor: orderDetail.stockDiscounted ? '#E8F5E9' : '#FFEBEE',
                                                    color: orderDetail.stockDiscounted ? '#2E7D32' : '#D32F2F',
                                                    fontWeight: '500'
                                                }}
                                            />
                                        </Typography> */}
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
                                                    fontWeight: '500'
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
                                                {/* <Typography variant="body2" gutterBottom>
                                                    <strong>Dirección ID:</strong> {orderDetail.deliveryAddressId}
                                                </Typography> */}
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

                            {/* Lista de productos */}
                            <OrderProductsDetail order={orderDetail} />

                            {/* Información de pagos */}
                            <OrderPaymentsDetail order={orderDetail} />

                            {/* Resumen financiero */}
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
                        onClick={closeDetailModal}
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

            {/* MODAL DE COSTO DE ENVÍO */}
            <Dialog
                open={shippingModalOpen}
                onClose={closeShippingModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF6B9D 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <LocalShippingIcon />
                    {selectedOrder && hasShippingCost(selectedOrder) ? 'Editar Costo de Envío' : 'Agregar Costo de Envío'}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedOrder && (
                        <>
                            <Box sx={{
                                bgcolor: '#FFF5FA',
                                p: 2,
                                borderRadius: 2,
                                mb: 3,
                                border: '1px solid #FFE6F0',
                            }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Orden: <strong>ORD-{selectedOrder.id}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Cliente: <strong>{selectedOrder.user?.name || 'Cliente no disponible'}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total: <strong>${formatCurrency(selectedOrder.totalAmount)}</strong>
                                </Typography>
                            </Box>

                            <TextField
                                label="Costo de Envío"
                                type="number"
                                value={shippingCostInput}
                                onChange={(e) => setShippingCostInput(e.target.value)}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>,
                                }}
                                fullWidth
                                margin="normal"
                                placeholder="0.00"
                                inputProps={{
                                    min: 0,
                                    step: 0.01,
                                }}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={closeShippingModal}
                        variant="outlined"
                        sx={{
                            borderColor: '#ddd',
                            color: '#666',
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveShippingCost}
                        disabled={!shippingCostInput || parseFloat(shippingCostInput) < 0}
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

            {/* 🔹 MODAL PARA AGREGAR INFORMACIÓN DE ENVÍO */}
            <Dialog
                open={trackingModalOpen}
                onClose={closeTrackingModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF6B9D 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <AssignmentIcon />
                    Información de Envío
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedOrder && (
                        <>
                            <Box sx={{
                                bgcolor: '#F3E5F5',
                                p: 2,
                                borderRadius: 2,
                                mb: 3,
                                border: '1px solid #E1BEE7',
                            }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Orden: <strong>ORD-{selectedOrder.id}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Cliente: <strong>{selectedOrder.user?.name || 'Cliente no disponible'}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Costo de envío: <strong>${formatCurrency(selectedOrder.shippingCost)}</strong>
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Número de Guía"
                                        value={trackingNumberInput}
                                        onChange={(e) => setTrackingNumberInput(e.target.value)}
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
                                            value={carrierInput}
                                            onChange={(e) => setCarrierInput(e.target.value)}
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
                    <Button
                        onClick={closeTrackingModal}
                        variant="outlined"
                        sx={{
                            borderColor: '#9C27B0',
                            color: '#9C27B0',
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveTrackingNumber}
                        disabled={!trackingNumberInput.trim() || !carrierInput.trim()}
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

            {/* MODAL PARA MARCAR COMO ENVIADO */}
            <Dialog
                open={sendModalOpen}
                onClose={closeSendModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <CheckCircleIcon />
                    Confirmar Envío
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedOrder && (
                        <>
                            <Box sx={{
                                bgcolor: '#E8F5E9',
                                p: 2,
                                borderRadius: 2,
                                mb: 3,
                                border: '1px solid #C8E6C9',
                            }}>
                                <Typography variant="body1" fontWeight="bold" gutterBottom>
                                    ¿Confirmar que la orden ha sido enviada?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Orden: <strong>ORD-{selectedOrder.id}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Cliente: <strong>{selectedOrder.user?.name}</strong>
                                </Typography>
                                {selectedOrder.carrier && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Paquetería: <strong>{selectedOrder.carrier}</strong>
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Número de guía: <strong>{selectedOrder.trackingNumber || 'No asignado'}</strong>
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                Esta acción cambiará el estado de la orden a "Enviado" y notificará al cliente.
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={closeSendModal}
                        variant="outlined"
                        sx={{
                            borderColor: '#4CAF50',
                            color: '#4CAF50',
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleMarkAsSent}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                            color: '#fff',
                        }}
                    >
                        Confirmar Envío
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Order;