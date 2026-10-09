import React from 'react';
import { Box, Chip, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { statusLabels, statusColors } from './OrderConstans';
import { formatCurrency, hasShippingCost } from './OrderHelpers';

const actionIconSx = {
    color: '#FF69B4',
    backgroundColor: '#FFF0F5',
    '&:hover': {
        backgroundColor: '#FFE1EE',
        transform: 'scale(1.05)',
    },
    transition: 'all 0.2s',
};

const OrderTableRow = ({ order, activeTab, onViewDetail, onEditShipping, onAddTracking }) => {
    return (
        <TableRow
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
                    <Typography
                        fontWeight="600"
                        sx={{ color: "#ff5c95" }}
                    >
                        {order.trackingNumber || "Sin guía"}
                    </Typography>
                ) : (
                    <Typography
                        fontWeight="600"
                        color={order.shippingPaid ? "success.main" : "text.secondary"}
                    >
                        {order.shippingPaid ? "Sí" : "No"}
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
                {activeTab === 0 && (
                    <Tooltip title="Ver detalle de venta" arrow>
                        <IconButton onClick={() => onViewDetail(order)} sx={actionIconSx}>
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                )}

                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={hasShippingCost(order) ? 'Editar Costo de Envío' : 'Agregar Costo de Envío'} arrow>
                            <IconButton
                                onClick={() => onEditShipping(order)}
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
                            <IconButton onClick={() => onViewDetail(order)} sx={actionIconSx}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Agregar información de envío" arrow>
                            <IconButton
                                onClick={() => onAddTracking(order)}
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
                            <IconButton onClick={() => onViewDetail(order)} sx={actionIconSx}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {activeTab === 3 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Ver detalle de venta" arrow>
                            <IconButton onClick={() => onViewDetail(order)} sx={actionIconSx}>
                                <VisibilityIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </TableCell>
        </TableRow>
    );
};

export default OrderTableRow;