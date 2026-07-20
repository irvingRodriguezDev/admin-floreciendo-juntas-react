// src/components/Live/LiveTable.js

import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    LinearProgress,
    Button,
} from '@mui/material';
import {
    PlayCircleOutline as PlayIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { statusLabels, statusColors, DEFAULT_PAGE_SIZE } from './constants';
import { formatDate } from '../utils/helpers';
import NoRowsOverlay from './NoRowsOverlay';

const LiveTable = ({
    displayRows,
    cargando,
    rowsState,
    setRowsState,
    handleOpenAdminModal,
    handleDelete,
    roleId,
}) => {
    const history = useHistory();

    if (cargando) {
        return (
            <Box sx={{ p: 4 }}>
                <LinearProgress sx={{
                    backgroundColor: '#FFE6F0',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#FF69B4' }
                }} />
            </Box>
        );
    }

    if (displayRows.length === 0) {
        return <NoRowsOverlay />;
    }

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                            <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                Título
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                Fecha
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>
                                Estado
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
                            .map((live) => (
                                <TableRow
                                    key={live.id}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: '#FFF5FA',
                                            transition: 'all 0.2s'
                                        },
                                    }}
                                >
                                    {/* TÍTULO */}
                                    <TableCell>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Typography variant="body2" fontWeight="600">
                                                {live.title}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* FECHA */}
                                    <TableCell align="center">
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(live.start_time)}
                                        </Typography>
                                    </TableCell>

                                    {/* ESTADO */}
                                    <TableCell align="center">
                                        <Chip
                                            label={statusLabels[live.status] || live.status || "Sin estado"}
                                            size="small"
                                            sx={{
                                                fontWeight: '600',
                                                color: statusColors[live.status]?.color || '#fff',
                                                background: statusColors[live.status]?.bg || '#FF5C92',
                                                boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                                minWidth: 100,
                                            }}
                                        />
                                    </TableCell>

                                    {/* ACCIONES */}
                                    <TableCell align="center">
                                        <Box display="flex" justifyContent="center" gap={1}>
                                            {/* Botón Ver Live - Siempre visible */}
                                            <Tooltip title="Ver live (Admin)" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenAdminModal(live)}
                                                    sx={{
                                                        color: '#4CAF50',
                                                        backgroundColor: '#E8F5E9',
                                                        '&:hover': {
                                                            backgroundColor: '#C8E6C9',
                                                            transform: 'scale(1.05)'
                                                        },
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <PlayIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Botones de Editar y Eliminar - Solo para roleId === 1 */}
                                            {roleId === 1 && (
                                                <>
                                                    <Tooltip title="Editar" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => history.push(`/lives/editlive/${live.id}`)}
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
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Eliminar" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(live.id)}
                                                            sx={{
                                                                color: '#EF5350',
                                                                backgroundColor: '#FFEBEE',
                                                                '&:hover': {
                                                                    backgroundColor: '#FFCDD2',
                                                                    transform: 'scale(1.05)',
                                                                },
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINACIÓN */}
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
                    {Math.min((rowsState.page + 1) * rowsState.pageSize, displayRows.length)}{' '}
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
                            '&:hover': {
                                backgroundColor: 'rgba(255, 105, 180, 0.1)',
                            }
                        }}
                    >
                        Anterior
                    </Button>
                    <Button
                        size="small"
                        disabled={(rowsState.page + 1) * rowsState.pageSize >= displayRows.length}
                        onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page + 1 }))}
                        sx={{
                            color: '#FF69B4',
                            '&:disabled': { color: '#ccc' },
                            '&:hover': {
                                backgroundColor: 'rgba(255, 105, 180, 0.1)',
                            }
                        }}
                    >
                        Siguiente
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default LiveTable;