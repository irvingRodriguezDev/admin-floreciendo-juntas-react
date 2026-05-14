import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { makeStyles } from '@mui/styles';
import {
    Box, Button, Card, CardMedia, Chip, Dialog, FormControl,
    Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack,
    TextField, Tooltip, Typography, Avatar, Skeleton, CardActions,
    Fade, useTheme, useMediaQuery, FormHelperText, CircularProgress,
    Pagination, Divider, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import clienteAxios from '../../config/Axios';
import Swal from 'sweetalert2';

const useStyles = makeStyles(() => ({
    '@global': { '.swal2-container': { zIndex: '99999 !important' } },
}));

const CERT_COLORS = ['#FF6B9D', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#795548'];
const getCertColor = (i) => CERT_COLORS[i % CERT_COLORS.length];

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const fmtDateLong = (d) =>
    new Date(d).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

const parseResponse = (res) =>
    Array.isArray(res.data)
        ? { rawList: res.data, page: 1, totalPages: 1, total: res.data.length }
        : { rawList: res.data.data, page: res.data.page, totalPages: res.data.totalPages, total: res.data.total };

const getTotal = (res) =>
    Array.isArray(res.data) ? res.data.length : (res.data.total ?? 0);

// ─── ImageGrid ──────────────────────────────────────────────────────────────
const ImageGrid = memo(({ taskId, images, onOpen }) => {
    const [errors, setErrors] = useState({});
    return (
        <Grid container spacing={{ xs: 1, sm: 2 }}>
            {images.map((img, idx) => (
                <Grid item xs={4} key={`${taskId}-img-${idx}`}>
                    <Paper
                        sx={{
                            cursor: 'pointer', borderRadius: 2, overflow: 'hidden',
                            position: 'relative', paddingTop: '100%',
                            '&:hover': { opacity: 0.8 },
                        }}
                        onClick={() => onOpen(img.url)}
                    >
                        {!errors[idx] ? (
                            <CardMedia
                                component="img"
                                image={img.url}
                                alt={`Img ${idx + 1}`}
                                onError={() => setErrors(p => ({ ...p, [idx]: true }))}
                                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                <ImageIcon sx={{ color: '#bdbdbd' }} />
                            </Box>
                        )}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
});

// ─── PendingTaskCard ─────────────────────────────────────────────────────────
const PendingTaskCard = memo(({ task, certColor, onDelete, onViewDetail, isMobile }) => (
    <Card sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        borderRadius: { xs: 2, sm: 3 }, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transition: 'all 0.3s', border: '1px solid #e0e0e0', overflow: 'visible', position: 'relative',
        '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-6px)' },
            boxShadow: { xs: '0 8px 24px rgba(0,0,0,0.12)', sm: '0 16px 32px rgba(255,152,0,0.18)' },
        },
    }}>
        {/* Badge pendiente */}
        <Box sx={{
            position: 'absolute', top: -18, right: -6, zIndex: 1,
            width: { xs: 38, sm: 45 }, height: { xs: 38, sm: 45 }, borderRadius: '50%',
            bgcolor: '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
        }}>
            <Tooltip title="Tarea pendiente">
                <PendingActionsIcon sx={{ color: '#fff', fontSize: { xs: 18, sm: 22 } }} />
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
                    bgcolor: '#FF91B5', color: '#fff',
                    width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 },
                    fontSize: { xs: '0.9rem', sm: '1rem' }, flexShrink: 0,
                }}>
                    {task.user.avatar || <PersonIcon />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight="700" sx={{
                        color: '#fff', fontSize: { xs: '0.85rem', sm: '1rem' },
                        display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
                    }}>
                        {task.user.name}
                    </Typography>
                    <Typography variant="caption" sx={{
                        color: '#fff', opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
                        bgcolor: '#f5f5f5', color: certColor, fontWeight: 600,
                        border: `1px solid ${certColor}`, fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
                    }}
                />
                <Chip
                    icon={<SchoolIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />}
                    label={task.certificationName}
                    size="small"
                    sx={{
                        bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
                    }}
                />
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: { xs: 13, sm: 16 }, color: '#757575', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#757575', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                    {fmtDate(task.submittedAt)}
                </Typography>
            </Box>
        </Box>

        {/* Actions */}
        <CardActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
                variant="outlined"
                fullWidth
                startIcon={<VisibilityIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={() => onViewDetail(task)}
                sx={{
                    borderColor: '#1976d2', color: '#1976d2', fontWeight: 600,
                    py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.78rem', sm: '0.875rem' },
                    '&:hover': { borderColor: '#1565c0', bgcolor: 'rgba(25,118,210,0.06)', color: '#1565c0' },
                }}
            >
                Ver Detalle
            </Button>
            <Button
                variant="outlined"
                fullWidth
                startIcon={<DeleteOutlineIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={() => onDelete(task)}
                sx={{
                    borderColor: '#f44336', color: '#f44336', fontWeight: 600,
                    py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.78rem', sm: '0.875rem' },
                    '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244,67,54,0.06)', color: '#d32f2f' },
                }}
            >
                Eliminar Tarea
            </Button>
        </CardActions>
    </Card>
));

// ─── TaskDetailDialog ───────────────────────────────────────────────────────
const TaskDetailDialog = ({ open, task, onClose, onOpenImage }) => {
    if (!task) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 3 },
                    m: { xs: 0, sm: 2 },
                    maxHeight: '90vh',
                }
            }}
        >
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #FE6F9F 0%, #FE6F9FCC 100%)',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
            }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PendingActionsIcon /> Detalle de Tarea
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={3}>
                    {/* Información del Usuario */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#FE6F9F' }}>
                                <PersonIcon /> Información del Usuario
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Avatar sx={{ bgcolor: '#FE6F9F', width: 56, height: 56 }}>
                                        {task.user.avatar || <PersonIcon />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body1" fontWeight="600">{task.user.name}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <EmailIcon sx={{ fontSize: 14, color: '#757575' }} />
                                            <Typography variant="body2" color="text.secondary">{task.user.email}</Typography>
                                        </Box>
                                        {task.user.id && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                <BadgeIcon sx={{ fontSize: 14, color: '#757575' }} />
                                                <Typography variant="caption" color="text.secondary">ID Usuario: {task.user.id}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Información de Módulo y Certificación */}
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#4caf50' }}>
                                <BookIcon /> Módulo
                            </Typography>
                            <Typography variant="body1" fontWeight="500">{task.moduleName}</Typography>
                            <Typography variant="caption" color="text.secondary">ID Módulo: {task.moduleId}</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#1976d2' }}>
                                <SchoolIcon /> Certificación
                            </Typography>
                            <Typography variant="body1" fontWeight="500">{task.certificationName}</Typography>
                            <Typography variant="caption" color="text.secondary">ID Certificación: {task.certificationId?.replace('cert_', '')}</Typography>
                        </Paper>
                    </Grid>

                    {/* Metadatos de la tarea */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#ff9800' }}>
                                <PendingActionsIcon /> Información de la Tarea
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTimeIcon sx={{ fontSize: 16, color: '#757575' }} />
                                        <Typography variant="body2">
                                            <strong>Fecha de envío:</strong> {fmtDateLong(task.submittedAt)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                {/* <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UpdateIcon sx={{ fontSize: 16, color: '#757575' }} />
                                        <Typography variant="body2">
                                            <strong>ID Tarea:</strong> {task.id}
                                        </Typography>
                                    </Box>
                                </Grid> */}
                                <Grid item xs={12}>
                                    <Chip
                                        label="Estado: Pendiente de revisión"
                                        icon={<PendingActionsIcon />}
                                        sx={{ bgcolor: '#fff3e0', color: '#ff9800', fontWeight: 600 }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Imágenes subidas */}
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <ImageIcon /> Evidencias ({task.images.length} imagen{task.images.length !== 1 ? 'es' : ''})
                            </Typography>
                            {task.images.length > 0 ? (
                                <ImageGrid
                                    taskId={task.id}
                                    images={task.images}
                                    onOpen={onOpenImage}
                                />
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                    No hay imágenes subidas para esta tarea.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                {/* <Button
                    variant="outlined"
                    onClick={onClose}
                    startIcon={<CloseIcon />}
                >
                    Cerrar
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        onClose();
                        // Podrías pasar una función para eliminar desde aquí también
                    }}
                    startIcon={<DeleteOutlineIcon />}
                >
                    Eliminar Tarea
                </Button> */}
            </DialogActions>
        </Dialog>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PendingTask = () => {
    const theme = useTheme();
    useStyles();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ─── State ────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [loadingCerts, setLoadingCerts] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef(null);
    const searchMounted = useRef(false);

    const [selectedCert, setSelectedCert] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');
    const [filteredModules, setFilteredModules] = useState([]);

    const [certifications, setCertifications] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 });

    // Estados para el detalle de la tarea
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const itemsPerPage = isMobile ? 6 : 12;

    // ─── transformTask ────────────────────────────────────────────────────────
    const transformTask = useCallback((task) => {
        const moduleId = task.moduleId ?? task.module?.id;
        const certId = task.module?.certificationId || 1;
        const cert = certifications.find(c => c.originalId === certId);
        return {
            id: task.id,
            user: {
                name: task.user?.name || 'Usuario',
                email: task.user?.email || '',
                id: task.userId ?? task.user?.id,
                avatar: task.user?.name
                    ? task.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'U',
            },
            certificationId: cert ? cert.id : `cert_${certId}`,
            certificationName: cert?.name ?? task.module?.certification_name ?? `Certificación ${certId}`,
            moduleId: moduleId?.toString() ?? '',
            moduleName: task.module?.title || `Módulo ${moduleId}`,
            submittedAt: task.createdAt,
            images: [task.photo_1, task.photo_2, task.photo_3]
                .filter(Boolean)
                .map(p => ({ url: `https://cdn.floreciendojuntas.com${p}` })),
        };
    }, [certifications]);

    // ─── buildParams ──────────────────────────────────────────────────────────
    const buildParams = useCallback((pageNum, search, certId, modId) => ({
        ...(search?.trim() ? { page: 1, limit: 9999 } : { page: pageNum, limit: itemsPerPage }),
        ...(certId && certId !== 'all' && { certificationId: certId.replace('cert_', '') }),
        ...(modId && modId !== 'all' && { moduleId: modId }),
    }), [itemsPerPage]);

    // ─── fetchTasks ───────────────────────────────────────────────────────────
    const fetchTasks = useCallback(async (pageNum = 1, search = '', certId = 'all', modId = 'all') => {
        try {
            setLoading(true);
            const res = await clienteAxios.get('/module-submission/submitted', {
                params: buildParams(pageNum, search, certId, modId),
            });
            const { rawList, page, totalPages, total } = parseResponse(res);
            setTasks(rawList.map(t => transformTask(t)));
            setPageInfo({ page, totalPages, total });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [buildParams, transformTask]);

    // ─── fetchCertifications ──────────────────────────────────────────────────
    const fetchCertifications = async () => {
        try {
            setLoadingCerts(true);
            const res = await clienteAxios.get('/certifications/active');
            setCertifications(res.data.map((c, i) => ({
                id: `cert_${c.id}`,
                originalId: c.id,
                name: c.name,
                color: getCertColor(i),
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCerts(false);
        }
    };

    // ─── fetchModulesByCert ───────────────────────────────────────────────────
    const fetchModulesByCert = useCallback(async (certId) => {
        if (!certId || certId === 'all') { setFilteredModules([]); return; }
        try {
            setLoadingModules(true);
            const res = await clienteAxios.get(`/module-certifications/${certId.replace('cert_', '')}`);
            setFilteredModules(res.data.map(m => ({ id: m.id.toString(), name: m.title || m.name })));
        } catch (e) {
            console.error(e);
            setFilteredModules([]);
        } finally {
            setLoadingModules(false);
        }
    }, []);

    // ─── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => { fetchCertifications(); }, []);

    useEffect(() => {
        if (certifications.length === 0) return;
        fetchTasks(1, '', 'all', 'all');
    }, [certifications]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!searchMounted.current) { searchMounted.current = true; return; }
        if (certifications.length === 0) return;
        fetchTasks(1, debouncedSearch, selectedCert, selectedModule);
    }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchModulesByCert(selectedCert !== 'all' ? selectedCert : null);
    }, [selectedCert, fetchModulesByCert]);

    useEffect(() => () => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    }, []);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(e.target.value), 600);
    };

    const clearSearch = () => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const handleCertChange = (e) => {
        const newCert = e.target.value;
        setSelectedCert(newCert);
        setSelectedModule('all');
        fetchTasks(1, debouncedSearch, newCert, 'all');
    };

    const handleModuleChange = (e) => {
        const newMod = e.target.value;
        setSelectedModule(newMod);
        fetchTasks(1, debouncedSearch, selectedCert, newMod);
    };

    const clearFilters = () => {
        setSelectedModule('all');
        setSelectedCert('all');
        setFilteredModules([]);
        clearSearch();
        fetchTasks(1, '', 'all', 'all');
    };

    const handlePageChange = (_, value) => {
        fetchTasks(value, debouncedSearch, selectedCert, selectedModule);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─── View Detail Handler ─────────────────────────────────────────────────
    const handleViewDetail = (task) => {
        setSelectedTask(task);
        setDetailDialogOpen(true);
    };

    const handleCloseDetail = () => {
        setDetailDialogOpen(false);
        setSelectedTask(null);
    };

    // ─── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (task) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar tarea?',
            html: `Se eliminará la tarea de <strong>${task.user.name}</strong>.<br/>Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#9e9e9e',
        });

        if (!result.isConfirmed) return;

        try {
            setDeleting(true);
            // Endpoint correcto para eliminar
            await clienteAxios.delete('/module-submission/delete', {
                data: { submissionId: task.id }
            });

            // Actualizar lista localmente
            setTasks(prev => prev.filter(t => t.id !== task.id));
            setPageInfo(prev => ({ ...prev, total: prev.total - 1 }));

            // Si el detalle estaba abierto, cerrarlo
            if (detailDialogOpen && selectedTask?.id === task.id) {
                handleCloseDetail();
            }

            Swal.fire({
                icon: 'success',
                title: '¡Tarea eliminada!',
                text: 'La tarea ha sido eliminada correctamente.',
                confirmButtonColor: '#4caf50',
                timer: 2500,
                timerProgressBar: true,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo eliminar la tarea.',
                confirmButtonColor: '#f44336',
            });
        } finally {
            setDeleting(false);
        }
    };

    // ─── Image viewer ─────────────────────────────────────────────────────────
    const openImageViewer = (url) => {
        setSelectedImage(url);
        setImageViewerOpen(true);
        setZoomLevel(1);
        setImagePos({ x: 0, y: 0 });
    };
    const closeImageViewer = () => {
        setImageViewerOpen(false);
        setSelectedImage(null);
        setZoomLevel(1);
        setImagePos({ x: 0, y: 0 });
    };

    // ─── Derived ──────────────────────────────────────────────────────────────
    const hasActiveFilters = searchTerm || selectedCert !== 'all' || selectedModule !== 'all';

    const displayRows = useMemo(() => {
        if (!debouncedSearch.trim()) return tasks;
        const q = debouncedSearch.trim().toLowerCase();
        return tasks.filter(t =>
            t.user.name.toLowerCase().includes(q) ||
            t.user.email.toLowerCase().includes(q) ||
            String(t.id).includes(q) ||
            t.moduleName.toLowerCase().includes(q) ||
            t.certificationName.toLowerCase().includes(q)
        );
    }, [tasks, debouncedSearch]);

    const modalPaper = { sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>

            {/* ── Header ── */}
            <Paper sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}>

                {/* Banner */}
                <Box sx={{ background: 'linear-gradient(135deg, #FF5C93 0%, #f73b7a 100%)', p: { xs: 2.5, sm: 3, md: 4 }, color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
                        <Box>
                            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, color: '#fff', fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' } }}>
                                <PendingActionsIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} /> Tareas Pendientes
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#fff', opacity: 0.9, mt: 0.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                                Gestiona las tareas enviadas aún sin calificar
                            </Typography>
                        </Box>
                        <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, minWidth: { xs: 0, md: 120 }, textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="700" sx={{ color: '#ffb74d', fontSize: { xs: '1.6rem', sm: '2.125rem' }, lineHeight: 1.1 }}>
                                {pageInfo.total}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#fff', fontSize: { xs: '0.62rem', sm: '0.75rem' }, display: 'block', mt: 0.3 }}>
                                Pendientes
                            </Typography>
                        </Paper>
                    </Box>
                </Box>

                {/* Filtros */}
                <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#fff' }}>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small" disabled={loadingCerts}>
                                <InputLabel>Certificación</InputLabel>
                                <Select
                                    value={selectedCert}
                                    label="Certificación"
                                    onChange={handleCertChange}
                                    startAdornment={<SchoolIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}
                                >
                                    <MenuItem value="all">Todas las Certificaciones</MenuItem>
                                    {certifications.map(c => (
                                        <MenuItem key={c.id} value={c.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loadingCerts && <FormHelperText>Cargando certificaciones...</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Módulo</InputLabel>
                                <Select
                                    value={selectedModule}
                                    label="Módulo"
                                    onChange={handleModuleChange}
                                    disabled={filteredModules.length === 0 || loadingModules}
                                    startAdornment={<BookIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}
                                >
                                    <MenuItem value="all">
                                        {loadingModules ? 'Cargando módulos...' : 'Todos los Módulos'}
                                    </MenuItem>
                                    {filteredModules.map(m => ( 
                                        <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                    ))}
                                </Select>
                                {loadingModules && <FormHelperText>Cargando módulos...</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={hasActiveFilters ? 5 : 6}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por usuario, email, módulo o ID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />,
                                    endAdornment: searchTerm && (
                                        <IconButton size="small" onClick={clearSearch}>
                                            <CloseIcon fontSize="small" sx={{ color: '#757575' }} />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Grid>

                        {hasActiveFilters && (
                            <Grid item xs={12} sm={12} md={1} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={clearFilters}
                                    startIcon={<ClearAllIcon />}
                                    fullWidth
                                    sx={{ color: '#FF5C93', whiteSpace: 'nowrap', height: 40 }}
                                >
                                    {!isMobile && 'Limpiar'}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>

            {/* ── Cards ── */}
            {loading ? (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Skeleton variant="rectangular" height={isMobile ? 240 : 290} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : displayRows.length === 0 ? (
                <Fade in>
                    <Paper sx={{ p: { xs: 5, sm: 8 }, textAlign: 'center', borderRadius: { xs: 2, sm: 4 } }}>
                        <PendingActionsIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#e0e0e0', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: '#757575', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} gutterBottom>
                            No hay tareas pendientes
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                            {hasActiveFilters ? 'Intenta con otros filtros' : 'No hay tareas pendientes disponibles'}
                        </Typography>
                        {hasActiveFilters && (
                            <Button variant="contained" onClick={clearFilters} startIcon={<ClearAllIcon />} sx={{ bgcolor: '#FE5A91' }}>
                                Limpiar Filtros
                            </Button>
                        )}
                    </Paper>
                </Fade>
            ) : (
                <>
                    <Fade in>
                        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                            {displayRows.map(task => {
                                const certColor = certifications.find(c => c.id === task.certificationId)?.color || '#757575';
                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
                                        <PendingTaskCard
                                            task={task}
                                            certColor={certColor}
                                            isMobile={isMobile}
                                            onDelete={handleDelete}
                                            onViewDetail={handleViewDetail}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Fade>

                    {pageInfo.totalPages > 1 && !debouncedSearch && (
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: { xs: 3, sm: 4 }, gap: 1 }}>
                            <Pagination
                                count={pageInfo.totalPages}
                                page={pageInfo.page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                size={isMobile ? 'small' : 'medium'}
                            />
                            <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                                Página {pageInfo.page} de {pageInfo.totalPages} · {pageInfo.total} pendientes en total
                            </Typography>
                        </Box>
                    )}

                    {debouncedSearch && (
                        <Box display="flex" justifyContent="center" sx={{ mt: { xs: 2, sm: 3 } }}>
                            <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                                {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para «{debouncedSearch}»
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            {/* ── TASK DETAIL DIALOG ── */}
            <TaskDetailDialog
                open={detailDialogOpen}
                task={selectedTask}
                onClose={handleCloseDetail}
                onOpenImage={openImageViewer}
            />

            {/* ── IMAGE VIEWER ── */}
            <Dialog
                open={imageViewerOpen}
                onClose={closeImageViewer}
                maxWidth="lg"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden', m: isMobile ? 0 : 2 } }}
                BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.85)' } }}
            >
                <Box
                    sx={{ position: 'relative', minHeight: isMobile ? '100vh' : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', userSelect: 'none' }}
                    onWheel={e => { e.preventDefault(); setZoomLevel(p => Math.min(Math.max(p + (e.deltaY > 0 ? -0.15 : 0.15), 0.5), 4)); }}
                    onMouseDown={e => { setIsDragging(true); setDragStart({ x: e.clientX - imagePos.x, y: e.clientY - imagePos.y }); }}
                    onMouseMove={e => { if (isDragging) setImagePos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={e => { if (e.touches.length === 1) { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - imagePos.x, y: e.touches[0].clientY - imagePos.y }); } }}
                    onTouchMove={e => { if (isDragging && e.touches.length === 1) setImagePos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); }}
                    onTouchEnd={() => setIsDragging(false)}
                >
                    <IconButton
                        onClick={closeImageViewer}
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ position: 'absolute', bottom: { xs: 24, sm: 16 }, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 4, px: 2, py: 0.5 }}>
                        <IconButton size="small" onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.5))} sx={{ color: '#fff' }}>
                            <Typography sx={{ fontSize: 22, lineHeight: 1 }}>−</Typography>
                        </IconButton>
                        <Typography sx={{ color: '#fff', minWidth: 50, textAlign: 'center', fontSize: 14 }}>
                            {Math.round(zoomLevel * 100)}%
                        </Typography>
                        <IconButton size="small" onClick={() => setZoomLevel(p => Math.min(p + 0.25, 4))} sx={{ color: '#fff' }}>
                            <Typography sx={{ fontSize: 22, lineHeight: 1 }}>+</Typography>
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />
                        <IconButton size="small" onClick={() => { setZoomLevel(1); setImagePos({ x: 0, y: 0 }); }} sx={{ color: '#fff' }}>
                            <Typography sx={{ fontSize: 12 }}>Reset</Typography>
                        </IconButton>
                    </Box>

                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Vista ampliada"
                            draggable={false}
                            style={{
                                maxWidth: '100%',
                                maxHeight: isMobile ? '80vh' : '85vh',
                                objectFit: 'contain',
                                borderRadius: 8,
                                transform: `translate(${imagePos.x}px,${imagePos.y}px) scale(${zoomLevel})`,
                                transition: isDragging ? 'transform 0.05s linear' : 'transform 0.2s ease',
                                cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
                                willChange: 'transform',
                                transformOrigin: 'center center',
                            }}
                        />
                    )}
                </Box>
            </Dialog>
        </Box>
    );
};

export default PendingTask;