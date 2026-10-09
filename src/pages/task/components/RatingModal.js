import React, { useState, useEffect, useMemo } from 'react';
import {
    Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Grid, IconButton, LinearProgress,
    Paper, Typography, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
import ImageGrid from './ImageGrid';

// ─── Constantes (mismas que PendingTask) ─────────────────────────────────────
const PINK = '#FF5C93';
const GRADIENT = 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)';
const flexRow = { display: 'flex', alignItems: 'center', gap: 1 };

const chipSx = (bgcolor, color, extra = {}) => ({
    bgcolor, color, fontWeight: 600, fontSize: '0.72rem',
    height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 }, ...extra,
});

// Encabezado reutilizable (mismo patrón que PendingTask)
const PageHeader = ({ icon, title, subtitle, children }) => (
    <Box sx={{
        background: GRADIENT, color: '#fff', p: { xs: 2.5, sm: 3 }, gap: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative',
    }}>
        <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}>{icon}</Avatar>
            <Box>
                <Typography variant="h6" fontWeight={700}>{title}</Typography>
                {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
            </Box>
        </Stack>
        {children}
    </Box>
);

// Sección reutilizable tipo Card (mismo patrón que TaskDetailDialog)
const Section = ({ icon, title, color = PINK, sm, bg = '#fff', children }) => (
    <Grid item xs={12} sm={sm}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: bg, border: '1px solid #FFE6F0' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ ...flexRow, mb: 2, color }}>
                {icon} {title}
            </Typography>
            {children}
        </Paper>
    </Grid>
);

const RatingModal = ({
    open,
    onClose,
    selectedTask,
    moduleCriteria,
    loadingCriteria,
    onSave,
    onOpenImage,
    isMobile,
    modalPaper
}) => {
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleSave = async () => {
        const hasRatings = Object.values(ratings).some(v => v > 0);
        if (!hasRatings) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin calificaciones',
                text: 'Por favor, califica al menos un criterio antes de guardar.',
                confirmButtonColor: PINK
            });
            return;
        }

        setLoading(true);
        try {
            await onSave(ratings);
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
    const criteria = moduleCriteria[selectedTask?.moduleId] || [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 3 },
                    m: { xs: 0, sm: 2 },
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    ...modalPaper,
                }
            }}
        >
            {/* ── Header ── */}
            <DialogTitle sx={{ p: 0 }}>
                <PageHeader
                    icon={<RateReviewIcon />}
                    title="Calificar tarea"
                    subtitle={selectedTask?.user?.name || 'Cargando...'}
                >
                    <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </PageHeader>
            </DialogTitle>

            {/* ── Contenido ── */}
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#FFFAFC' }}>
                {selectedTask ? (
                    <Grid container spacing={3}>
                        {/* Info usuario */}
                        <Section icon={<PersonIcon />} title="Información del usuario" color={PINK}>
                            <Box sx={{ ...flexRow, gap: 2, flexWrap: 'wrap' }}>
                                <Avatar sx={{ background: GRADIENT, width: 56, height: 56, fontWeight: 700 }}>
                                    {selectedTask.user?.name
                                        ? selectedTask.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                        : <PersonIcon />}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={600}>{selectedTask.user?.name || 'N/A'}</Typography>
                                    <Box sx={{ ...flexRow, mt: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 14, color: '#757575' }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                            {selectedTask.user?.email || 'N/A'}
                                        </Typography>
                                    </Box>
                                    {selectedTask.user?.id && (
                                        <Box sx={{ ...flexRow, mt: 0.5 }}>
                                            <BadgeIcon sx={{ fontSize: 14, color: '#757575' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                ID usuario: {selectedTask.user.id}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Section>

                        {/* Módulo y Certificación */}
                        <Section sm={6} icon={<BookIcon />} title="Módulo" color="#4caf50">
                            <Typography fontWeight={500}>{selectedTask.moduleName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID módulo: {selectedTask.moduleId}
                            </Typography>
                        </Section>

                        <Section sm={6} icon={<SchoolIcon />} title="Certificación" color="#1976d2">
                            <Typography fontWeight={500}>{selectedTask.certificationName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {selectedTask.certificationId?.replace?.('cert_', '') || ''}
                            </Typography>
                        </Section>

                        {/* Evidencias */}
                        {selectedTask.images?.length > 0 && (
                            <Section
                                icon={<ImageIcon />}
                                title={`Evidencias (${selectedTask.images.length} imagen${selectedTask.images.length !== 1 ? 'es' : ''})`}
                            >
                                <ImageGrid
                                    taskId={selectedTask.id}
                                    images={selectedTask.images}
                                    onOpen={onOpenImage}
                                />
                            </Section>
                        )}

                        {/* Criterios */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #FFE6F0', bgcolor: '#fff' }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                    sx={{ ...flexRow, mb: 2.5, color: PINK }}
                                >
                                    <ChecklistIcon /> Criterios de evaluación
                                </Typography>

                                {loadingCriteria[selectedTask.moduleId] ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress sx={{ color: PINK }} />
                                    </Box>
                                ) : criteria.length > 0 ? (
                                    <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                                        {criteria.map(criterion => (
                                            <Grid item xs={12} key={criterion.id}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: { xs: 1.5, sm: 2 },
                                                        borderRadius: 2,
                                                        border: '1px solid #FFE6F0',
                                                        bgcolor: '#FFFAFC',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-start', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, minWidth: 0 }}>
                                                            <Typography variant="h6" sx={{ lineHeight: 1 }}>{criterion.icon}</Typography>
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography fontWeight={600} sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
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
                                                            sx={chipSx(
                                                                (ratings[criterion.id] || 0) >= 4 ? '#4caf50' :
                                                                    (ratings[criterion.id] || 0) >= 3 ? '#ff9800' : PINK,
                                                                '#fff',
                                                                { flexShrink: 0 }
                                                            )}
                                                        />
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 } }}>
                                                        {[1, 2, 3, 4, 5].map(v => {
                                                            const selected = ratings[criterion.id] === v;
                                                            return (
                                                                <Button
                                                                    key={v}
                                                                    variant={selected ? 'contained' : 'outlined'}
                                                                    onClick={() => setRatings(prev => ({ ...prev, [criterion.id]: v }))}
                                                                    sx={{
                                                                        flex: 1, minWidth: 0,
                                                                        height: { xs: 38, sm: 44 },
                                                                        fontSize: { xs: '0.85rem', sm: '1rem' },
                                                                        fontWeight: 700,
                                                                        borderRadius: 2,
                                                                        p: 0,
                                                                        ...(selected
                                                                            ? {
                                                                                background:
                                                                                    v >= 4 ? 'linear-gradient(135deg,#4caf50,#2e7d32)' :
                                                                                        v >= 3 ? 'linear-gradient(135deg,#ff9800,#ed6c02)' :
                                                                                            GRADIENT,
                                                                                color: '#fff',
                                                                                border: 'none',
                                                                                boxShadow: 'none',
                                                                            }
                                                                            : {
                                                                                borderColor: '#FFD6EA',
                                                                                color: PINK,
                                                                                bgcolor: '#fff',
                                                                                '&:hover': { borderColor: PINK, bgcolor: '#FFF5FA' },
                                                                            }),
                                                                    }}
                                                                >
                                                                    {v}
                                                                </Button>
                                                            );
                                                        })}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Alert severity="info">No hay criterios de evaluación definidos para este módulo</Alert>
                                )}
                            </Paper>
                        </Grid>

                        {/* Resumen */}
                        {criteria.length > 0 && !loadingCriteria[selectedTask.moduleId] && (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, sm: 3 },
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #FFF5FA 0%, #FFE6F0 100%)',
                                        border: '1px solid #FFD6EA',
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ ...flexRow, mb: 2, color: PINK }}>
                                        <ChecklistIcon /> Resumen de calificación
                                    </Typography>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="body2" sx={{ color: '#757575' }}>Puntuación total</Typography>
                                            <Typography variant="h4" fontWeight={700} sx={{ color: PINK }}>
                                                {ratingScore.total}
                                                <Typography component="span" variant="h6" sx={{ color: '#757575', fontWeight: 500 }}>
                                                    {' '}/ {ratingScore.maxScore}
                                                </Typography>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={8}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" sx={{ color: '#757575' }}>Progreso</Typography>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: PINK }}>
                                                    {ratingScore.pct.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={ratingScore.pct}
                                                sx={{
                                                    height: { xs: 8, sm: 10 },
                                                    borderRadius: 5,
                                                    bgcolor: '#FFE6F0',
                                                    '& .MuiLinearProgress-bar': {
                                                        background:
                                                            ratingScore.total >= Math.ceil(ratingScore.maxScore * 0.8)
                                                                ? 'linear-gradient(135deg,#4caf50,#2e7d32)'
                                                                : GRADIENT,
                                                        borderRadius: 5,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress sx={{ color: PINK }} />
                    </Box>
                )}
            </DialogContent>

            {/* ── Acciones ── */}
            <DialogActions
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: '#FFF5FA',
                    borderTop: '1px solid #FFE6F0',
                    gap: 1,
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={loading}
                    fullWidth={isMobile}
                    sx={{
                        color: PINK,
                        border: `1px solid ${PINK}`,
                        borderRadius: 2,
                        px: 3,
                        '&:hover': { bgcolor: '#FFF0F7', borderColor: '#E94E88' },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={!hasRatings || loadingCriteria[selectedTask?.moduleId] || loading}
                    fullWidth={isMobile}
                    sx={{
                        background: GRADIENT,
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': { background: 'linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)', boxShadow: 'none' },
                        '&.Mui-disabled': { background: '#f5f5f5', color: '#bdbdbd' },
                    }}
                >
                    {loading ? 'Guardando...' : 'Guardar calificación'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RatingModal;