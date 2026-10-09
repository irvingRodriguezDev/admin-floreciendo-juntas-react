import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

const statusStyles = {
    winner: {
        bgcolor: '#f8d7e3',
        color: '#C71585',
        borderColor: '#FF69B4',
    },
    'past-due': {
        bgcolor: '#fff3cd',
        color: '#856404',
        borderColor: '#ffc107',
    },
    active: {
        bgcolor: '#49A94D',
        color: '#fff',
        borderColor: '#a3d9b1',
    },
};


const ParticipantsTable = ({ participants, loading, currentWinners, onRefresh }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, color: 'text.secondary' }}>
                <CircularProgress color="primary" size={50} sx={{ mb: 2.5 }} />
                <Typography>Cargando participantes...</Typography>
            </Box>
        );
    }

    if (participants.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                <Typography sx={{ fontSize: '4rem', opacity: 0.5, mb: 2 }}>👥</Typography>
                <Typography>No hay participantes disponibles</Typography>
                <Button variant="contained" onClick={onRefresh} sx={{ mt: 2.5, px: 3 }}>
                    Intentar de nuevo
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer>
                <Table stickyHeader sx={{ minWidth: 700 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {participants.map((participant) => {
                            const wInfo = currentWinners.find((w) => w.id === participant.id);
                            const isWinner = Boolean(wInfo);
                            const status = participant['subscriptions.status'];
                            const statusKey = isWinner ? 'winner' : status === 'past_due' ? 'past-due' : 'active';
                            const statusLabel = isWinner ? 'Premiado' : status === 'past_due' ? 'Vencido' : 'Activo';

                            return (
                                <TableRow
                                    key={participant.id}
                                    hover
                                    sx={{ '&:hover': { bgcolor: '#fff5f9' } }}
                                >
                                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary', width: 80 }}>
                                        {participant.id}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, minWidth: 150 }}>
                                            <Typography noWrap sx={{ fontWeight: 600 }}>
                                                {participant.name}
                                            </Typography>
                                            {isWinner && (
                                                <Chip
                                                    size="small"
                                                    label="🏆 GANADOR"
                                                    title={`Premio: ${wInfo.prize}`}
                                                    sx={{
                                                        alignSelf: 'flex-start',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        color: '#8B4513',
                                                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{participant.email}</TableCell>
                                    <TableCell>{participant.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={statusLabel}
                                            sx={{ fontWeight: 600, ...statusStyles[statusKey] }}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {currentWinners.length > 0 && (
                <Paper
                    variant="outlined"
                    sx={{
                        mt: 3.5,
                        p: 2.5,
                        borderWidth: 2,
                        borderColor: 'primary.light',
                        background: 'linear-gradient(135deg, #fff8fb 0%, #fff0f6 100%)'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, fontSize: '1.2rem' }}>
                        🏆 Ganadores de Hoy
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 1.5
                        }}
                    >
                        {currentWinners.map((w, idx) => (
                            <Paper
                                key={idx}
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.75,
                                    borderColor: 'primary.light',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                                }}
                            >
                                <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {w.name}
                                </Typography>
                                <Typography sx={{ color: 'primary.main', fontWeight: 500, fontSize: '0.85rem' }}>
                                    🎁 {w.prize}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                    {w.timestamp}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default ParticipantsTable;