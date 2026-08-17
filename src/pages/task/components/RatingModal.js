import React, { useState, useEffect, useMemo } from 'react';
import {
    Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, Grid, IconButton, LinearProgress,
    Paper, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ImageGrid from './ImageGrid';
import Swal from 'sweetalert2';

const RatingModal = ({
    open,
    onClose,
    selectedTask,
    moduleCriteria,
    loadingCriteria,
    onSave,  // ✅ Esta es la función que viene de Task.js
    onOpenImage,
    isMobile,
    modalPaper
}) => {
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(false);

    // Resetear ratings cuando se abre el modal
    useEffect(() => {
        if (selectedTask && moduleCriteria[selectedTask.moduleId]) {
            const initialRatings = {};
            moduleCriteria[selectedTask.moduleId].forEach(c => {
                initialRatings[c.id] = 0;
            });
            setRatings(initialRatings);
        }
    }, [selectedTask, moduleCriteria]);

    const ratingScore = useMemo(() => {
        const criteria = moduleCriteria[selectedTask?.moduleId] || [];
        const total = Object.values(ratings).reduce((s, v) => s + (v || 0), 0);
        const maxScore = criteria.reduce((s, c) => s + c.max_score, 0);
        const pct = maxScore > 0 ? (total / maxScore) * 100 : 0;
        return { total, maxScore, pct };
    }, [ratings, moduleCriteria, selectedTask?.moduleId]);

    // ✅ Función que maneja el guardado
    const handleSave = async () => {
        // Verificar que haya ratings seleccionados
        const hasRatings = Object.values(ratings).some(v => v > 0);
        if (!hasRatings) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin calificaciones',
                text: 'Por favor, califica al menos un criterio antes de guardar.',
                confirmButtonColor: '#ff9800'
            });
            return;
        }

        setLoading(true);
        try {
            // ✅ Llamar a la función onSave que viene de Task.js
            await onSave(ratings);
            // El modal se cierra desde Task.js después de guardar exitosamente
        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar la calificación',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    const hasRatings = Object.values(ratings).some(v => v > 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={modalPaper}>
            <DialogTitle sx={{ bgcolor: '#FF5B92', color: '#fff', py: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, pr: isMobile ? 4 : 0 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                        <RateReviewIcon sx={{ color: '#fff' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#fff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            Calificar Tarea
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                            {selectedTask?.user?.name || 'Cargando...'}
                        </Typography>
                    </Box>
                </Box>
                {isMobile && (
                    <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff' }}>
                {selectedTask ? (
                    <>
                        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                <Chip icon={<BookIcon />} label={selectedTask.moduleName} size="small" sx={{ bgcolor: '#e0e0e0' }} />
                                <Chip icon={<SchoolIcon />} label={selectedTask.certificationName} size="small" sx={{ bgcolor: '#e0e0e0' }} />
                            </Box>
                            <Typography variant="body2"><strong>Estudiante:</strong> {selectedTask.user?.name || 'N/A'}</Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                <strong>Email:</strong> {selectedTask.user?.email || 'N/A'}
                            </Typography>
                        </Paper>

                        {selectedTask.images?.length > 0 && (
                            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5 }}>
                                    Imágenes Enviadas
                                </Typography>
                                <ImageGrid 
                                    taskId={selectedTask.id} 
                                    images={selectedTask.images} 
                                    onOpen={onOpenImage} 
                                />
                            </Box>
                        )}

                        <Divider sx={{ my: { xs: 2.5, sm: 4 } }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
                            <ChecklistIcon sx={{ color: '#FE5A91' }} />
                            <Typography variant="h6" fontWeight="600" sx={{ color: '#FE5A91', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Criterios de Evaluación
                            </Typography>
                        </Box>

                        {loadingCriteria[selectedTask.moduleId] ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#FE5A91' }} />
                            </Box>
                        ) : moduleCriteria[selectedTask.moduleId]?.length > 0 ? (
                            <>
                                <Grid container spacing={{ xs: 2, sm: 3 }}>
                                    {moduleCriteria[selectedTask.moduleId].map(criterion => (
                                        <Grid item xs={12} key={criterion.id}>
                                            <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#fafafa' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 }, alignItems: 'flex-start' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, mr: 1 }}>
                                                        <Typography variant="h6">{criterion.icon}</Typography>
                                                        <Box>
                                                            <Typography fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                                                                {criterion.title}
                                                            </Typography>
                                                            {criterion.description && (
                                                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                                                    {criterion.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                    <Chip 
                                                        label={`${ratings[criterion.id] || 0}/${criterion.max_score}`} 
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: (ratings[criterion.id] || 0) >= 4 ? '#4caf50' : 
                                                                    (ratings[criterion.id] || 0) >= 3 ? '#ff9800' : '#f44336', 
                                                            color: '#fff', 
                                                            flexShrink: 0 
                                                        }} 
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 } }}>
                                                    {[1, 2, 3, 4, 5].map(v => (
                                                        <Button 
                                                            key={v} 
                                                            variant={ratings[criterion.id] === v ? 'contained' : 'outlined'}
                                                            onClick={() => {
                                                                setRatings(prev => ({
                                                                    ...prev,
                                                                    [criterion.id]: v
                                                                }));
                                                            }}
                                                            sx={{
                                                                flex: 1, 
                                                                minWidth: 0, 
                                                                height: { xs: 38, sm: 44 }, 
                                                                fontSize: { xs: '0.85rem', sm: '1rem' }, 
                                                                fontWeight: 600, 
                                                                borderRadius: 1.5, 
                                                                p: 0,
                                                                ...(ratings[criterion.id] === v && { 
                                                                    background: v >= 4 ? 'linear-gradient(135deg,#4caf50,#2e7d32)' : 
                                                                               v >= 3 ? 'linear-gradient(135deg,#ff9800,#ed6c02)' : 
                                                                               'linear-gradient(135deg,#f44336,#d32f2f)', 
                                                                    color: '#fff' 
                                                                }),
                                                                ...(ratings[criterion.id] !== v && { 
                                                                    borderColor: '#bdbdbd', 
                                                                    color: '#000', 
                                                                    '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' } 
                                                                }),
                                                            }}
                                                        >
                                                            {v}
                                                        </Button>
                                                    ))}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Paper sx={{ mt: { xs: 3, sm: 4 }, p: { xs: 2, sm: 3 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight="600" sx={{ color: '#2e7d32', mb: 2 }}>
                                        Resumen de Calificación
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#757575' }}>Puntuación Total</Typography>
                                            <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32' }}>
                                                {ratingScore.total}/{ratingScore.maxScore}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" sx={{ color: '#757575' }}>Progreso</Typography>
                                                <Typography variant="body2" fontWeight="600" sx={{ color: '#2e7d32' }}>
                                                    {ratingScore.pct.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={ratingScore.pct}
                                                sx={{ 
                                                    height: { xs: 8, sm: 10 }, 
                                                    borderRadius: 5, 
                                                    bgcolor: '#e0e0e0', 
                                                    '& .MuiLinearProgress-bar': { 
                                                        bgcolor: ratingScore.total >= Math.ceil(ratingScore.maxScore * 0.8) ? '#4caf50' : '#ff9800', 
                                                        borderRadius: 5 
                                                    } 
                                                }} 
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </>
                        ) : (
                            <Alert severity="info">No hay criterios de evaluación definidos para este módulo</Alert>
                        )}
                    </>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff', gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    sx={{ color: '#757575' }} 
                    fullWidth={isMobile}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    fullWidth={isMobile}
                    disabled={!hasRatings || loadingCriteria[selectedTask?.moduleId] || loading}
                    sx={{ bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#2e7d32' } }}
                >
                    {loading ? 'Guardando...' : 'Guardar Calificación'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RatingModal;