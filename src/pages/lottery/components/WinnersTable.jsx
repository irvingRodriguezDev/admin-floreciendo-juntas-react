import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import { gradients } from '../Theme';

const positionStyles = {
    1: { background: gradients.gold, color: '#8B4513' },
    2: { background: gradients.silver, color: '#333' },
    3: { background: gradients.bronze, color: '#fff' }
};

const WinnersTable = ({
    winners,
    loading,
    months = [],
    selectedMonth,
    formatDisplayDate,
    onMonthChange,
    onRefresh,
    disabled
}) => (
    <Box>
        {/* Barra: mes + total + actualizar */}
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            sx={{ px: 2, py: 1.25, mb: 2, bgcolor: '#fff5f9', borderRadius: 2 }}
        >
            <TextField
                select
                size="small"
                label="Mes"
                value={selectedMonth || ''}
                onChange={(e) => onMonthChange(e.target.value)}
                disabled={disabled}
                sx={{ minWidth: 180 }}
            >
                {months.map((month) => (
                    <MenuItem key={month} value={month}>
                        {formatDisplayDate(month)}
                    </MenuItem>
                ))}
            </TextField>

            <Typography variant="body2">
                👥 Total ganadores: <strong>{winners.length}</strong>
            </Typography>

            <Button
                variant="gradient"
                color="success"
                onClick={onRefresh}
                disabled={loading || disabled}
                startIcon={
                    loading ? <CircularProgress size={18} color="inherit" /> : <RefreshRounded />
                }
            >
                {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
        </Stack>

        {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, color: 'text.secondary' }}>
                <CircularProgress color="primary" size={50} sx={{ mb: 2.5 }} />
                <Typography>Cargando ganadores...</Typography>
            </Box>
        ) : winners.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography sx={{ fontSize: '4rem', opacity: 0.5, mb: 2 }}>🏆</Typography>
                <Typography>No hay ganadores para el mes seleccionado</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Selecciona otro mes o realiza nuevos sorteos
                </Typography>
            </Box>
        ) : (
            <>
                <TableContainer>
                    <Table stickyHeader sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Posición</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell>Premio</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {winners.map((w) => (
                                <TableRow key={w.id} hover sx={{ '&:hover': { bgcolor: '#fff5f9' } }}>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={`${w.position}°`}
                                            sx={{
                                                fontWeight: 700,
                                                ...(positionStyles[w.position] || { bgcolor: 'grey.200' })
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography noWrap sx={{ fontWeight: 600, minWidth: 150 }}>
                                            {w.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{w.email}</TableCell>
                                    <TableCell>{w.phone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={`🎁 ${w.prize_name}`}
                                            sx={{
                                                bgcolor: '#fff5f9',
                                                color: 'secondary.main',
                                                borderColor: 'primary.light',
                                                fontWeight: 500
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="body2" sx={{ mt: 2, p: 1.25, textAlign: 'center', color: 'text.secondary' }}>
                    💡 Puedes exportar esta tabla a Excel usando el botón "Exportar Excel"
                </Typography>
            </>
        )}
    </Box>
);

export default WinnersTable;