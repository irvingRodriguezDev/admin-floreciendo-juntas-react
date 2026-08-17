import React, { memo } from 'react';
import {
    Avatar, Box, Button, Card, CardActions, Chip, Divider,
    LinearProgress, Stack, Tooltip, Typography
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PersonIcon from '@mui/icons-material/Person';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';

const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
});

const TaskCard = memo(({ task, certColor, onRate, onViewDetail, isMobile }) => {
    const isRated = task.status === 'rated';
    const passedMin = isRated && task.maxScore > 0 && task.totalScore >= Math.ceil(task.maxScore * 0.8);

    return (
        <Card sx={{
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transition: 'all 0.3s', 
            border: '1px solid #e0e0e0', 
            overflow: 'visible', 
            position: 'relative',
            '&:hover': { 
                transform: { xs: 'none', sm: 'translateY(-8px)' }, 
                boxShadow: { xs: '0 8px 24px rgba(0,0,0,0.12)', sm: '0 16px 32px rgba(234, 14, 14, 0.16)' } 
            },
        }}>
            {/* Status badge */}
            <Box sx={{ 
                position: 'absolute', 
                top: -18, 
                right: -6, 
                zIndex: 1, 
                width: { xs: 38, sm: 45 }, 
                height: { xs: 38, sm: 45 }, 
                borderRadius: '50%', 
                bgcolor: isRated ? '#4caf50' : '#ff9800', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)' 
            }}>
                <Tooltip title={isRated ? 'Tarea calificada' : 'Tarea pendiente'}>
                    {isRated
                        ? <CheckCircleIcon sx={{ color: '#fff', fontSize: { xs: 18, sm: 22 } }} />
                        : <PendingActionsIcon sx={{ color: '#fff', fontSize: { xs: 18, sm: 22 } }} />}
                </Tooltip>
            </Box>

            {/* Header */}
            <Box sx={{
                p: { xs: 2, sm: 2.5 },
                background: 'linear-gradient(135deg, #FE6F9F 0%, #FE6F9FCC 100%)',
                borderTopLeftRadius: { xs: 8, sm: 12 },
                borderTopRightRadius: { xs: 8, sm: 12 },
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                    <Avatar sx={{ 
                        bgcolor: '#FF91B5', 
                        color: '#fff', 
                        width: { xs: 40, sm: 48 }, 
                        height: { xs: 40, sm: 48 }, 
                        fontSize: { xs: '0.9rem', sm: '1rem' }, 
                        flexShrink: 0 
                    }}>
                        {task.user.avatar || <PersonIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="700" sx={{ 
                            color: '#fff', 
                            fontSize: { xs: '0.85rem', sm: '1rem' }, 
                            display: '-webkit-box', 
                            WebkitBoxOrient: 'vertical', 
                            WebkitLineClamp: 2, 
                            overflow: 'hidden' 
                        }}>
                            {task.user.name}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                            color: '#fff', 
                            opacity: 0.9, 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                            display: 'block', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                        }}>
                            {task.user.email}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1 }}>
                <Stack direction="row" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                        icon={<BookIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />} 
                        label={task.moduleName} 
                        size="small"
                        sx={{ 
                            bgcolor: '#f5f5f5', 
                            color: certColor, 
                            fontWeight: 600, 
                            border: `1px solid ${certColor}`, 
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
                            height: 'auto', 
                            '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } 
                        }} 
                    />
                    <Chip 
                        icon={<SchoolIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />} 
                        label={task.certificationName} 
                        size="small"
                        sx={{ 
                            bgcolor: '#e3f2fd', 
                            color: '#1976d2', 
                            fontWeight: 600, 
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
                            height: 'auto', 
                            '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } 
                        }} 
                    />
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarTodayIcon sx={{ fontSize: { xs: 13, sm: 16 }, color: '#757575', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#757575', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                        {fmtDate(task.submittedAt)}
                    </Typography>
                </Box>
                {isRated && (
                    <Box>
                        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="600" sx={{ color: '#000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Puntuación Total
                                </Typography>
                                <Chip 
                                    label={`${task.totalScore}/${task.maxScore}`} 
                                    size="small"
                                    sx={{ 
                                        bgcolor: passedMin ? '#4caf50' : '#ff9800', 
                                        color: '#fff', 
                                        fontWeight: 700, 
                                        fontSize: { xs: '0.68rem', sm: '0.75rem' } 
                                    }} 
                                />
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={task.maxScore > 0 ? (task.totalScore / task.maxScore) * 100 : 0}
                                sx={{ 
                                    height: { xs: 6, sm: 8 }, 
                                    borderRadius: 4, 
                                    bgcolor: '#e0e0e0', 
                                    '& .MuiLinearProgress-bar': { bgcolor: passedMin ? '#4caf50' : '#ff9800' } 
                                }} 
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Promedio
                            </Typography>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {task.averageScore.toFixed(1)}/5.0
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Actions */}
            <CardActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
                {!isRated ? (
                    <Button 
                        variant="contained" 
                        fullWidth 
                        startIcon={<RateReviewIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} 
                        onClick={() => onRate(task)}
                        sx={{ 
                            background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`, 
                            color: '#fff', 
                            fontWeight: 600, 
                            py: { xs: 1, sm: 1.2 }, 
                            fontSize: { xs: '0.78rem', sm: '0.875rem' }, 
                            '&:hover': { background: `linear-gradient(135deg, ${certColor}CC 0%, ${certColor} 100%)` } 
                        }}
                    >
                        Calificar Tarea
                    </Button>
                ) : (
                    <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<VisibilityIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} 
                        onClick={() => onViewDetail(task)}
                        sx={{ 
                            borderColor: '#FF5B91', 
                            color: '#FF5B91', 
                            fontWeight: 600, 
                            py: { xs: 1, sm: 1.2 }, 
                            fontSize: { xs: '0.78rem', sm: '0.875rem' }, 
                            '&:hover': { borderColor: '#FF5B91', bgcolor: 'rgba(255,91,145,0.04)' } 
                        }}
                    >
                        Ver Detalle
                    </Button>
                )}
            </CardActions>
        </Card>
    );
});

export default TaskCard;