import React, { memo } from 'react';
import {
    Avatar, Box, Button, Card, Chip, Divider, LinearProgress, Stack, Typography,
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PersonIcon from '@mui/icons-material/Person';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PINK = '#FF5C93';
const GRADIENT = 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)';

const STATUS = {
    pending: { label: 'Pendiente', color: '#ff9800', bg: '#fff3e0', icon: <PendingActionsIcon /> },
    rated: { label: 'Calificada', color: '#28a745', bg: '#EAFCDD', icon: <CheckCircleOutlineIcon /> },
};

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

const chipSx = (bgcolor, color, extra = {}) => ({
    bgcolor, color, fontWeight: 600, fontSize: '0.72rem',
    height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
    '& .MuiChip-icon': { color }, ...extra,
});

const TaskCard = memo(({ task, certColor, onRate, onViewDetail }) => {
    const isRated = task.status === 'rated';
    const status = STATUS[isRated ? 'rated' : 'pending'];

    // Aprobado con el 80% o más del puntaje máximo
    const passedMin = isRated && task.maxScore > 0 && task.totalScore >= Math.ceil(task.maxScore * 0.8);
    const scoreColor = passedMin ? '#4caf50' : '#ff9800';
    const percent = task.maxScore > 0 ? (task.totalScore / task.maxScore) * 100 : 0;

    return (
        <Card sx={{
            height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #FFE6F0',
            boxShadow: '0 4px 16px rgba(255,92,147,0.08)', transition: 'all 0.25s',
            '&:hover': { transform: { sm: 'translateY(-4px)' }, boxShadow: '0 12px 28px rgba(255,92,147,0.18)' },
        }}>
            {/* Usuario */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, background: GRADIENT }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', width: 44, height: 44, fontSize: '0.95rem', fontWeight: 700 }}>
                    {task.user.avatar || <PersonIcon />}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap sx={{ color: '#fff', fontSize: '0.95rem' }}>{task.user.name}</Typography>
                    <Typography variant="caption" noWrap sx={{ color: '#fff', opacity: 0.9, display: 'block' }}>{task.user.email}</Typography>
                </Box>
            </Stack>

            {/* Cuerpo */}
            <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip size="small" icon={<BookIcon />} label={task.moduleName}
                        sx={chipSx('#fff', certColor, { border: `1px solid ${certColor}` })} />
                    <Chip size="small" icon={<SchoolIcon />} label={task.certificationName}
                        sx={chipSx('#e3f2fd', '#1976d2')} />
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarTodayIcon sx={{ fontSize: 15, color: '#757575' }} />
                        <Typography variant="caption" color="text.secondary">{fmtDate(task.submittedAt)}</Typography>
                    </Stack>
                    <Chip size="small" icon={status.icon} label={status.label}
                        sx={chipSx(status.bg, status.color, { height: 22, border: `1px solid ${status.color}` })} />
                </Stack>

                {isRated && (
                    <>
                        <Divider />
                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography variant="body2" fontWeight={600}>Puntuación total</Typography>
                                <Chip size="small" label={`${task.totalScore}/${task.maxScore}`}
                                    sx={{ bgcolor: scoreColor, color: '#fff', fontWeight: 700 }} />
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={percent}
                                sx={{ height: 8, borderRadius: 4, bgcolor: '#FFE6F0', '& .MuiLinearProgress-bar': { bgcolor: scoreColor } }}
                            />
                        </Box>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Promedio</Typography>
                            <Typography variant="body2" fontWeight={700}>{task.averageScore.toFixed(1)}/5.0</Typography>
                        </Stack>
                    </>
                )}
            </Stack>

            {/* Acción */}
            <Box sx={{ p: 2, pt: 0 }}>
                {isRated ? (
                    <Button fullWidth variant="outlined" startIcon={<VisibilityIcon />} onClick={() => onViewDetail(task)}
                        sx={{ borderColor: PINK, color: PINK, fontWeight: 600, '&:hover': { borderColor: '#E94E88', bgcolor: '#FFF5FA' } }}>
                        Ver detalle
                    </Button>
                ) : (
                    <Button fullWidth variant="contained" startIcon={<RateReviewIcon />} onClick={() => onRate(task)}
                        sx={{
                            color: '#fff', fontWeight: 600, boxShadow: 'none',
                            background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`,
                            '&:hover': { background: `linear-gradient(135deg, ${certColor}CC 0%, ${certColor} 100%)`, boxShadow: 'none' },
                        }}>
                        Calificar tarea
                    </Button>
                )}
            </Box>
        </Card>
    );
});

export default TaskCard;