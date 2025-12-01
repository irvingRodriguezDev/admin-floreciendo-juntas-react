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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
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
}));

const Order = () => {
    const classes = useStyles();

    const {
        orders,
        cargando,
        obtenerOrders,
        actualizarCostoEnvio
    } = useContext(OrdersContext);

    const [filterItems, setFilterItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [shippingCostInput, setShippingCostInput] = useState('');
    const [rowsState, setRowsState] = useState({
        page: 0,
        pageSize: 7,
    });

    useEffect(() => {
        obtenerOrders();
    }, []);

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
    };

    const statusColors = {
        pending: { bg: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)', color: '#fff' },
        shipped: { bg: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)', color: '#fff' },
        delivered: { bg: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: '#fff' },
        cancelled: { bg: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)', color: '#fff' },
        pagado: { bg: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: '#fff' },
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

    // Función para verificar si el envío está pagado
    const isShippingPaid = (order) => {
        return order.shippingPaid === true;
    };

    // Filtrado de órdenes
    const displayRows = useMemo(() => {
        let filtered = orders || [];

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
    }, [filterItems, orders, searchTerm]);

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

    const openShippingModal = (order) => {
        // No abrir el modal si el envío ya está pagado
        if (isShippingPaid(order)) {
            return;
        }

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
                    console.log('Enviando datos:', {
                        orderId: selectedOrder.id,
                        shippingCost: cost
                    });
                    await actualizarCostoEnvio(selectedOrder.id, cost);
                    closeShippingModal();
                } catch (error) {
                    console.error('Error al actualizar costo de envío:', error);
                }
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
                No se encontraron resultados
            </Typography>
        </Box>
    );

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
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #FF5C93)',
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
                            Lista de Órdenes
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                            Gestión completa de órdenes y costos de envío
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

                {/* CONTADOR DE RESULTADOS */}
                {searchTerm && (
                    <Box sx={{ px: 3, py: 1.5, bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0' }}>
                        <Typography variant="caption" color="text.secondary">
                            🔍 Mostrando {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para "{searchTerm}"
                        </Typography>
                    </Box>
                )}

                {cargando ? (
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
                                    <TableCell  align="center"sx={{ fontWeight: '700', color: '#FF69B4' }}>
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
                                        Total de la Orden
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Estado
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                        Envio Pagado
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
                                                        background: '#FF5C92',
                                                        boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                                        minWidth: 100,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography fontWeight="600" color="text.primary">
                                                    {order.shippingPaid=== true ? 'Sí' : 'No'}
                                                </Typography>
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
                                                <Tooltip
                                                    title={
                                                        isShippingPaid(order)
                                                            ? "Envío ya pagado - No se puede editar"
                                                            : hasShippingCost(order)
                                                                ? "Editar Costo de Envío"
                                                                : "Agregar Costo de Envío"
                                                    }
                                                    arrow
                                                >
                                                    <span>
                                                        <IconButton
                                                            onClick={() => openShippingModal(order)}
                                                            disabled={isShippingPaid(order)}
                                                            sx={{
                                                                color: isShippingPaid(order)
                                                                    ? '#999'
                                                                    : hasShippingCost(order)
                                                                        ? '#42A5F5'
                                                                        : '#FF6B9D',
                                                                backgroundColor: isShippingPaid(order)
                                                                    ? '#f5f5f5'
                                                                    : hasShippingCost(order)
                                                                        ? '#E3F2FD'
                                                                        : '#FFF0F5',
                                                                '&:hover': {
                                                                    backgroundColor: isShippingPaid(order)
                                                                        ? '#f5f5f5'
                                                                        : hasShippingCost(order)
                                                                            ? '#BBDEFB'
                                                                            : '#FFE1EE',
                                                                    transform: isShippingPaid(order) ? 'none' : 'scale(1.05)',
                                                                },
                                                                '&.Mui-disabled': {
                                                                    color: '#999',
                                                                    backgroundColor: '#f5f5f5',
                                                                },
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            {isShippingPaid(order) ? (
                                                                <LockIcon />
                                                            ) : hasShippingCost(order) ? (
                                                                <EditIcon />
                                                            ) : (
                                                                <LocalShippingIcon />
                                                            )}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* PAGINACIÓN MANUAL */}
                {!cargando && displayRows.length > 0 && (
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

            {/* MODAL DE COSTO DE ENVÍO */}
            <Dialog
                open={shippingModalOpen}
                onClose={closeShippingModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #FF6B9D 100%)',
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
                            background: 'linear-gradient(135deg, #FF6B9D 0%, #C969E0 100%)',
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
        </Box>
    );
};

export default Order;