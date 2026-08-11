import React from 'react';
import {
    Box,
    Button,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OrderTableRow from './OrderTableRow';

const NoRowsOverlay = ({ isLoading }) => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px" gap={2}>
        <SearchIcon sx={{ fontSize: 48, color: '#FFB3DC' }} />
        <Typography variant="body1" color="text.secondary">
            {isLoading ? 'Cargando órdenes...' : 'No se encontraron órdenes en esta categoría'}
        </Typography>
    </Box>
);

const OrderTable = ({
    activeTab,
    isLoading,
    searchTerm,
    displayRows,
    rowsState,
    setRowsState,
    onViewDetail,
    onEditShipping,
    onAddTracking,
}) => {
    return (
        <>
            {searchTerm && (
                <Box sx={{ px: 3, py: 1.5, bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0' }}>
                    <Typography variant="caption" color="text.secondary">
                        🔍 Mostrando {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para "{searchTerm}"
                    </Typography>
                </Box>
            )}

            {isLoading ? (
                <Box sx={{ p: 4 }}>
                    <LinearProgress
                        sx={{
                            backgroundColor: '#FFE6F0',
                            '& .MuiLinearProgress-bar': { backgroundColor: '#FF69B4' },
                        }}
                    />
                </Box>
            ) : displayRows.length === 0 ? (
                <NoRowsOverlay isLoading={isLoading} />
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
                                    <OrderTableRow
                                        key={order.id}
                                        order={order}
                                        activeTab={activeTab}
                                        onViewDetail={onViewDetail}
                                        onEditShipping={onEditShipping}
                                        onAddTracking={onAddTracking}
                                    />
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

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
                        {Math.min((rowsState.page + 1) * rowsState.pageSize, displayRows.length)} de {displayRows.length}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            disabled={rowsState.page === 0}
                            onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page - 1 }))}
                            sx={{ color: '#FF69B4', '&:disabled': { color: '#ccc' } }}
                        >
                            Anterior
                        </Button>
                        <Button
                            size="small"
                            disabled={(rowsState.page + 1) * rowsState.pageSize >= displayRows.length}
                            onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page + 1 }))}
                            sx={{ color: '#FF69B4', '&:disabled': { color: '#ccc' } }}
                        >
                            Siguiente
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default OrderTable;