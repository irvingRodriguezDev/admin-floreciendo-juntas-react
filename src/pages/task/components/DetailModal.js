import React from 'react';
import {
    Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, Grid, IconButton, LinearProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
// ✅ Importar ImageGrid
import ImageGrid from './ImageGrid';

const DetailModal = ({
    open,
    onClose,
    selectedTask,
    onOpenImage,  // ✅ Asegurar que recibe esta prop
    isMobile,
    modalPaper
}) => {
    // Si no hay tarea o no está calificada, no mostrar nada
    if (!selectedTask || selectedTask.status !== 'rated') return null;

    const ev = selectedTask.evaluationData;
    const maxEv = ev?.scores?.reduce((s, x) => s + (x.criterion?.max_score || 5), 0) || 0;
    const pctEv = maxEv > 0 ? ((ev?.total_score || 0) / maxEv) * 100 : 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={modalPaper}>
            <DialogTitle sx={{ bgcolor: '#FF5C93', color: '#fff', py: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, pr: isMobile ? 4 : 0 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                        <VisibilityIcon sx={{ color: '#fff' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#fff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            Detalle de Calificación
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                            {selectedTask.user.name}
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
                <>
                    {/* Información del estudiante */}
                    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 }, bgcolor: '#f5f5f5' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#FF5723', flexShrink: 0 }}>
                                        {selectedTask.user.avatar}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="h6" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {selectedTask.user.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#757575', wordBreak: 'break-all' }}>
                                            {selectedTask.user.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography><strong>Módulo:</strong> {selectedTask.moduleName}</Typography>
                                <Typography><strong>Certificación:</strong> {selectedTask.certificationName}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ✅ SECCIÓN DE IMÁGENES - Agregar esto */}
                    {selectedTask.images?.length > 0 && (
                        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                            <Typography variant="h6" gutterBottom>Imágenes Enviadas</Typography>
                            <ImageGrid 
                                taskId={selectedTask.id} 
                                images={selectedTask.images} 
                                onOpen={onOpenImage}  // ✅ Pasar la función para abrir el visor
                            />
                        </Box>
                    )}

                    <Divider sx={{ my: { xs: 2.5, sm: 4 } }} />
                    
                    {/* Calificaciones por Criterio */}
                    <Typography variant="h6" sx={{ mb: 1.5 }}>Calificaciones por Criterio</Typography>
                    <TableContainer component={Paper} sx={{ mb: { xs: 3, sm: 4 } }}>
                        <Table size={isMobile ? 'small' : 'medium'}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Criterio</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Calif.</TableCell>
                                    {!isMobile && <TableCell align="center" sx={{ fontWeight: 600 }}>Máx.</TableCell>}
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>{isMobile ? '%' : 'Porcentaje'}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ev?.scores?.map(scoreItem => {
                                    const c = scoreItem.criterion;
                                    const pct = (scoreItem.score / (c?.max_score || 5)) * 100;
                                    return (
                                        <TableRow key={scoreItem.id}>
                                            <TableCell>
                                                <Typography fontWeight="500" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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
                                                    sx={{ 
                                                        bgcolor: scoreItem.score >= 4 ? '#e8f5e9' : 
                                                                scoreItem.score >= 3 ? '#fff3e0' : '#ffebee', 
                                                        color: scoreItem.score >= 4 ? '#2e7d32' : 
                                                               scoreItem.score >= 3 ? '#ed6c02' : '#c62828', 
                                                        fontWeight: 600 
                                                    }} 
                                                />
                                            </TableCell>
                                            {!isMobile && <TableCell align="center" sx={{ color: '#757575' }}>{c?.max_score || 5}</TableCell>}
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                    {!isMobile && (
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={pct}
                                                            sx={{ 
                                                                width: 80, 
                                                                height: 8, 
                                                                borderRadius: 4, 
                                                                bgcolor: '#e0e0e0', 
                                                                '& .MuiLinearProgress-bar': { 
                                                                    bgcolor: pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336' 
                                                                } 
                                                            }} 
                                                        />
                                                    )}
                                                    <Typography variant="caption" sx={{ color: '#757575' }}>
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

                    {/* Resumen */}
                    {ev && (
                        <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f7ecf0', borderRadius: 2 }}>
                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Puntuación Total</Typography>
                                    <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>
                                        {ev.total_score}
                                        <Typography component="span" variant="body1" sx={{ color: '#64748b', ml: 0.5 }}>
                                            /{maxEv}
                                        </Typography>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Criterios Evaluados</Typography>
                                    <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>
                                        {ev.scores.length}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={pctEv}
                                    sx={{ 
                                        height: { xs: 6, sm: 8 }, 
                                        borderRadius: 4, 
                                        bgcolor: '#e2e8f0', 
                                        '& .MuiLinearProgress-bar': { bgcolor: '#FF5C93', borderRadius: 4 } 
                                    }} 
                                />
                            </Box>
                        </Paper>
                    )}
                </>
            </DialogContent>

            <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff' }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    fullWidth={isMobile} 
                    sx={{ bgcolor: '#FF5C93', color: '#fff', '&:hover': { bgcolor: '#e0456e' } }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DetailModal;