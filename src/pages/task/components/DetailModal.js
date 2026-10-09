import React from 'react';
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, Grid, IconButton, LinearProgress, Paper,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import ImageIcon from '@mui/icons-material/Image';
import ChecklistIcon from '@mui/icons-material/Checklist';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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

// Sección tipo card reutilizable
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

const DetailModal = ({
    open,
    onClose,
    selectedTask,
    onOpenImage,
    isMobile,
    modalPaper
}) => {
    if (!selectedTask || selectedTask.status !== 'rated') return null;

    const ev = selectedTask.evaluationData;
    const maxEv = ev?.scores?.reduce((s, x) => s + (x.criterion?.max_score || 5), 0) || 0;
    const pctEv = maxEv > 0 ? ((ev?.total_score || 0) / maxEv) * 100 : 0;

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
                    icon={<VisibilityIcon />}
                    title="Detalle de calificación"
                    subtitle={selectedTask.user.name}
                >
                    <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </PageHeader>
            </DialogTitle>

            {/* ── Contenido ── */}
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#FFFAFC' }}>
                <Grid container spacing={3}>
                    {/* Info usuario */}
                    <Section icon={<PersonIcon />} title="Información del usuario" color={PINK}>
                        <Box sx={{ ...flexRow, gap: 2, flexWrap: 'wrap' }}>
                            <Avatar sx={{ background: GRADIENT, width: 56, height: 56, fontWeight: 700 }}>
                                {selectedTask.user.avatar || <PersonIcon />}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={600}>{selectedTask.user.name}</Typography>
                                <Box sx={{ ...flexRow, mt: 0.5 }}>
                                    <EmailIcon sx={{ fontSize: 14, color: '#757575' }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                                        {selectedTask.user.email}
                                    </Typography>
                                </Box>
                                {selectedTask.user.id && (
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

                    {/* Módulo */}
                    <Section sm={6} icon={<BookIcon />} title="Módulo" color="#4caf50">
                        <Typography fontWeight={500}>{selectedTask.moduleName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID módulo: {selectedTask.moduleId}
                        </Typography>
                    </Section>

                    {/* Certificación */}
                    <Section sm={6} icon={<SchoolIcon />} title="Certificación" color="#1976d2">
                        <Typography fontWeight={500}>{selectedTask.certificationName}</Typography>
                        {selectedTask.certificationId && (
                            <Typography variant="caption" color="text.secondary">
                                {selectedTask.certificationId?.replace?.('cert_', '') || ''}
                            </Typography>
                        )}
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

                    {/* Calificaciones por criterio */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #FFE6F0', bgcolor: '#fff' }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ ...flexRow, mb: 2.5, color: PINK }}>
                                <ChecklistIcon /> Calificaciones por criterio
                            </Typography>

                            <TableContainer>
                                <Table size={isMobile ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                                            <TableCell sx={{ fontWeight: 700, color: PINK, borderBottom: '1px solid #FFE6F0' }}>Criterio</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, color: PINK, borderBottom: '1px solid #FFE6F0' }}>Calif.</TableCell>
                                            {!isMobile && (
                                                <TableCell align="center" sx={{ fontWeight: 700, color: PINK, borderBottom: '1px solid #FFE6F0' }}>Máx.</TableCell>
                                            )}
                                            <TableCell align="center" sx={{ fontWeight: 700, color: PINK, borderBottom: '1px solid #FFE6F0' }}>
                                                {isMobile ? '%' : 'Porcentaje'}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ev?.scores?.map(scoreItem => {
                                            const c = scoreItem.criterion;
                                            const pct = (scoreItem.score / (c?.max_score || 5)) * 100;
                                            const isGood = pct >= 80;
                                            const isMid = pct >= 60 && pct < 80;
                                            return (
                                                <TableRow key={scoreItem.id} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                                                    <TableCell>
                                                        <Typography fontWeight={600} sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                                                            {c?.title || `Criterio ${scoreItem.criterionId}`}
                                                        </Typography>
                                                        {c?.description && !isMobile && (
                                                            <Typography variant="caption" sx={{ color: '#757575' }}>
                                                                {c.description}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={isMobile ? `${scoreItem.score}/${c?.max_score || 5}` : `${scoreItem.score}`}
                                                            size="small"
                                                            sx={chipSx(
                                                                isGood ? '#e8f5e9' : isMid ? '#fff3e0' : '#ffebee',
                                                                isGood ? '#2e7d32' : isMid ? '#ed6c02' : '#c62828'
                                                            )}
                                                        />
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell align="center" sx={{ color: '#757575' }}>
                                                            {c?.max_score || 5}
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                            {!isMobile && (
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={pct}
                                                                    sx={{
                                                                        width: 80, height: 8, borderRadius: 4,
                                                                        bgcolor: '#FFE6F0',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            background: isGood
                                                                                ? 'linear-gradient(135deg,#4caf50,#2e7d32)'
                                                                                : isMid
                                                                                    ? 'linear-gradient(135deg,#ff9800,#ed6c02)'
                                                                                    : GRADIENT,
                                                                            borderRadius: 4,
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                            <Typography variant="caption" fontWeight={700} sx={{ color: PINK }}>
                                                                {pct.toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    {/* Resumen */}
                    {ev && (
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
                                    <EmojiEventsIcon /> Resumen de calificación
                                </Typography>
                                <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="body2" sx={{ color: '#757575' }}>Puntuación total</Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ color: PINK }}>
                                            {ev.total_score}
                                            <Typography component="span" variant="h6" sx={{ color: '#757575', fontWeight: 500 }}>
                                                {' '}/ {maxEv}
                                            </Typography>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="body2" sx={{ color: '#757575' }}>Criterios evaluados</Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ color: PINK }}>
                                            {ev.scores.length}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" sx={{ color: '#757575' }}>Progreso</Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ color: PINK }}>
                                            {pctEv.toFixed(1)}%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pctEv}
                                            sx={{
                                                height: { xs: 8, sm: 10 },
                                                borderRadius: 5,
                                                bgcolor: '#FFE6F0',
                                                '& .MuiLinearProgress-bar': {
                                                    background: pctEv >= 80
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
            </DialogContent>

            {/* ── Acciones ── */}
            <DialogActions
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: '#FFF5FA',
                    borderTop: '1px solid #FFE6F0',
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth={isMobile}
                    sx={{
                        background: GRADIENT,
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 4,
                        boxShadow: 'none',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)',
                            boxShadow: 'none',
                        },
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DetailModal;