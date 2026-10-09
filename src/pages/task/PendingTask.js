import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import {
    Alert, Avatar, Box, Button, Card, CardMedia, Chip, Dialog, DialogContent, DialogTitle,
    Divider, Fade, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel,
    MenuItem, Pagination, Paper, Select, Skeleton, Snackbar, Stack, TextField, Tooltip, Typography,
    useMediaQuery, useTheme,
} from '@mui/material';
import {
    Search as SearchIcon, SearchOff as SearchOffIcon, Close as CloseIcon, PendingActions as PendingActionsIcon,
    DeleteOutline as DeleteOutlineIcon, Image as ImageIcon, Book as BookIcon, School as SchoolIcon,
    Person as PersonIcon, CalendarToday as CalendarTodayIcon, ClearAll as ClearAllIcon,
    Visibility as VisibilityIcon, Email as EmailIcon, Badge as BadgeIcon, AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import clienteAxios from '../../config/Axios';

// ─── Constantes y helpers ────────────────────────────────────────────────────
const CDN = 'https://cdn.floreciendojuntas.com';
const PINK = '#FF5C93';
const PINK_DARK = '#E94E88';
const GRADIENT = 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)';
const CERT_COLORS = ['#FF6B9D', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#795548'];
const SEARCH_DEBOUNCE_MS = 600;

const absFill = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' };
const flexRow = { display: 'flex', alignItems: 'center', gap: 1 };
const iconSx = { color: '#757575', mr: 1, fontSize: 20 };
const smallIcon = { fontSize: 14, color: '#757575' };

const fieldSx = (border = '#FFD6EA') => ({
    bgcolor: '#fff',
    borderRadius: 2,
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '& fieldset': { borderColor: border },
        '&:hover fieldset, &.Mui-focused fieldset': { borderColor: PINK },
    },
    '& .MuiInputLabel-root, & .MuiInputLabel-root.Mui-focused, & .MuiSelect-icon': { color: PINK },
});

const fmtDate = (d, long = false) =>
    new Date(d).toLocaleDateString('es-MX', {
        year: 'numeric', month: long ? 'long' : 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', ...(long && { second: '2-digit' }),
    });

const chipSx = (bgcolor, color, extra = {}) => ({
    bgcolor, color, fontWeight: 600, fontSize: '0.72rem', height: 'auto',
    '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 }, '& .MuiChip-icon': { color }, ...extra,
});

const transformTask = (task, certifications) => {
    const moduleId = task.moduleId ?? task.module?.id;
    const certId = task.module?.certificationId || 1;
    const cert = certifications.find(c => c.originalId === certId);
    const name = task.user?.name;
    return {
        id: task.id,
        user: {
            name: name || 'Usuario',
            email: task.user?.email || '',
            id: task.userId ?? task.user?.id,
            avatar: name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U',
        },
        certificationId: cert?.id ?? `cert_${certId}`,
        certificationName: cert?.name ?? task.module?.certification_name ?? `Certificación ${certId}`,
        certColor: cert?.color || '#757575',
        moduleId: moduleId?.toString() ?? '',
        moduleName: task.module?.title || `Módulo ${moduleId}`,
        submittedAt: task.createdAt,
        images: [task.photo_1, task.photo_2, task.photo_3].filter(Boolean).map(p => ({ url: `${CDN}${p}` })),
    };
};

// ─── SweetAlert: confirmación de eliminación ─────────────────────────────────
const confirmDeleteTask = (task) =>
    Swal.fire({
        title: '¿Eliminar tarea?',
        html: `Se eliminará la tarea de <strong>${task?.user?.name ?? 'este usuario'}</strong>. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#9E9E9E',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
    }).then((r) => r.isConfirmed);

const toast = (icon, title) =>
    Swal.fire({ icon, title, timer: 1800, showConfirmButton: false, toast: false });

// ─── Componentes UI ──────────────────────────────────────────────────────────
const PageHeader = ({ icon, title, subtitle, children }) => (
    <Box sx={{ background: GRADIENT, color: '#fff', p: { xs: 2.5, sm: 3 }, gap: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

const IconText = ({ icon, children, variant = 'caption', ...rest }) => (
    <Box sx={flexRow}>{icon}<Typography variant={variant} color="text.secondary" {...rest}>{children}</Typography></Box>
);

const Section = ({ icon, title, color = 'text.primary', sm, children }) => (
    <Grid item xs={12} sm={sm}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ ...flexRow, mb: 2, color }}>{icon} {title}</Typography>
            {children}
        </Paper>
    </Grid>
);

// ─── ImageGrid ───────────────────────────────────────────────────────────────
const ImageGrid = memo(({ taskId, images, onOpen }) => {
    const [errors, setErrors] = useState({});
    return (
        <Grid container spacing={{ xs: 1, sm: 2 }}>
            {images.map((img, idx) => (
                <Grid item xs={4} key={`${taskId}-img-${idx}`}>
                    <Paper onClick={() => onOpen(img.url)}
                        sx={{ cursor: 'pointer', borderRadius: 2, overflow: 'hidden', position: 'relative', pt: '100%', '&:hover': { opacity: 0.8 } }}>
                        {errors[idx] ? (
                            <Box sx={{ ...absFill, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                <ImageIcon sx={{ color: '#bdbdbd' }} />
                            </Box>
                        ) : (
                            <CardMedia component="img" image={img.url} alt={`Img ${idx + 1}`}
                                onError={() => setErrors(p => ({ ...p, [idx]: true }))}
                                sx={{ ...absFill, objectFit: 'cover' }} />
                        )}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
});

// ─── PendingTaskCard ─────────────────────────────────────────────────────────
const PendingTaskCard = memo(({ task, onDelete, onViewDetail }) => (
    <Card sx={{
        height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #FFE6F0',
        boxShadow: '0 4px 16px rgba(255,92,147,0.08)', transition: 'all 0.25s',
        '&:hover': { transform: { sm: 'translateY(-4px)' }, boxShadow: '0 12px 28px rgba(255,92,147,0.18)' },
    }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, background: GRADIENT }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', width: 44, height: 44, fontSize: '0.95rem', fontWeight: 700 }}>
                {task.user.avatar || <PersonIcon />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} noWrap sx={{ color: '#fff', fontSize: '0.95rem' }}>{task.user.name}</Typography>
                <Typography variant="caption" noWrap sx={{ color: '#fff', opacity: 0.9, display: 'block' }}>{task.user.email}</Typography>
            </Box>
        </Stack>

        <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip size="small" icon={<BookIcon />} label={task.moduleName}
                    sx={chipSx('#fff', task.certColor, { border: `1px solid ${task.certColor}` })} />
                <Chip size="small" icon={<SchoolIcon />} label={task.certificationName} sx={chipSx('#e3f2fd', '#1976d2')} />
            </Stack>
            <IconText icon={<CalendarTodayIcon sx={{ ...smallIcon, fontSize: 15 }} />}>{fmtDate(task.submittedAt)}</IconText>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ p: 2, pt: 0 }}>
            <Button fullWidth variant="contained" startIcon={<VisibilityIcon />} onClick={() => onViewDetail(task)}
                sx={{ bgcolor: PINK, color: '#fff', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: PINK_DARK, boxShadow: 'none' } }}>
                Ver detalle
            </Button>
            <Tooltip title="Eliminar tarea">
                <IconButton onClick={() => onDelete(task)}
                    sx={{ color: '#f44336', border: '1px solid #f44336', borderRadius: 1, '&:hover': { bgcolor: '#FEF4F6' } }}>
                    <DeleteOutlineIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    </Card>
));

// ─── TaskDetailDialog ────────────────────────────────────────────────────────
const TaskDetailDialog = ({ task, onClose, onOpenImage }) => {
    if (!task) return null;
    const n = task.images.length;
    return (
        <Dialog open onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 }, maxHeight: '90vh' } }}>
            <DialogTitle sx={{ p: 0 }}>
                <PageHeader icon={<PendingActionsIcon />} title="Detalle de tarea" subtitle={`Enviada el ${fmtDate(task.submittedAt)}`}>
                    <IconButton onClick={onClose} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
                </PageHeader>
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#FFFAFC' }}>
                <Grid container spacing={3}>
                    <Section icon={<PersonIcon />} title="Información del usuario" color={PINK}>
                        <Box sx={{ ...flexRow, gap: 2, flexWrap: 'wrap' }}>
                            <Avatar sx={{ background: GRADIENT, width: 56, height: 56, fontWeight: 700 }}>{task.user.avatar || <PersonIcon />}</Avatar>
                            <Box>
                                <Typography fontWeight={600}>{task.user.name}</Typography>
                                <IconText variant="body2" icon={<EmailIcon sx={smallIcon} />}>{task.user.email}</IconText>
                                {task.user.id && <IconText icon={<BadgeIcon sx={smallIcon} />}>ID usuario: {task.user.id}</IconText>}
                            </Box>
                        </Box>
                    </Section>

                    <Section sm={6} icon={<BookIcon />} title="Módulo" color="#4caf50">
                        <Typography fontWeight={500}>{task.moduleName}</Typography>
                        <Typography variant="caption" color="text.secondary">ID módulo: {task.moduleId}</Typography>
                    </Section>

                    <Section sm={6} icon={<SchoolIcon />} title="Certificación" color="#1976d2">
                        <Typography fontWeight={500}>{task.certificationName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            ID certificación: {task.certificationId?.replace('cert_', '')}
                        </Typography>
                    </Section>

                    <Section icon={<PendingActionsIcon />} title="Información de la tarea" color="#ff9800">
                        <Box sx={{ ...flexRow, mb: 2 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: '#757575' }} />
                            <Typography variant="body2"><strong>Fecha de envío:</strong> {fmtDate(task.submittedAt, true)}</Typography>
                        </Box>
                        <Chip icon={<PendingActionsIcon />} label="Pendiente de revisión" sx={chipSx('#fff3e0', '#ff9800', { height: 32 })} />
                    </Section>

                    <Section icon={<ImageIcon />} title={`Evidencias (${n} imagen${n !== 1 ? 'es' : ''})`}>
                        {n > 0 ? (
                            <ImageGrid taskId={task.id} images={task.images} onOpen={onOpenImage} />
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                No hay imágenes subidas para esta tarea.
                            </Typography>
                        )}
                    </Section>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

// ─── ImageViewer (zoom + arrastre) ───────────────────────────────────────────
const ImageViewer = ({ url, onClose, isMobile }) => {
    const [zoom, setZoom] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const changeZoom = (delta) => setZoom(z => Math.min(Math.max(z + delta, 0.5), 4));
    const reset = () => { setZoom(1); setPos({ x: 0, y: 0 }); };
    const stop = (e) => e.stopPropagation();
    const endDrag = () => setDragging(false);

    useEffect(reset, [url]);

    const zoomBtn = (label, onClick, size = 22) => (
        <IconButton size="small" onClick={onClick} sx={{ color: '#fff' }}>
            <Typography sx={{ fontSize: size, lineHeight: 1 }}>{label}</Typography>
        </IconButton>
    );

    return (
        <Dialog open={!!url} onClose={onClose} maxWidth="lg" fullWidth fullScreen={isMobile}
            PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden', m: isMobile ? 0 : 2 } }}
            BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.85)' } }}>
            <Box
                onWheel={(e) => changeZoom(e.deltaY > 0 ? -0.15 : 0.15)}
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
                    setDragging(true);
                }}
                onPointerMove={(e) => dragging && setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                sx={{
                    position: 'relative', minHeight: isMobile ? '100vh' : 400, overflow: 'hidden', userSelect: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    touchAction: 'none', cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
                }}>
                <IconButton onClick={onClose} onPointerDown={stop}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}>
                    <CloseIcon />
                </IconButton>

                <Box onPointerDown={stop}
                    sx={{ ...flexRow, position: 'absolute', bottom: { xs: 24, sm: 16 }, left: '50%', transform: 'translateX(-50%)', zIndex: 10, bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 4, px: 2, py: 0.5 }}>
                    {zoomBtn('−', () => changeZoom(-0.25))}
                    <Typography sx={{ color: '#fff', minWidth: 50, textAlign: 'center', fontSize: 14 }}>{Math.round(zoom * 100)}%</Typography>
                    {zoomBtn('+', () => changeZoom(0.25))}
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />
                    {zoomBtn('Reset', reset, 12)}
                </Box>

                {url && (
                    <Box component="img" src={url} alt="Vista ampliada" draggable={false}
                        sx={{
                            maxWidth: '100%', maxHeight: isMobile ? '80vh' : '85vh', objectFit: 'contain', borderRadius: 1,
                            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`, transformOrigin: 'center center',
                            willChange: 'transform', transition: dragging ? 'none' : 'transform 0.2s ease', pointerEvents: 'none',
                        }} />
                )}
            </Box>
        </Dialog>
    );
};

// ─── FilterSelect ────────────────────────────────────────────────────────────
const FilterSelect = ({ label, icon, value, onChange, options, allLabel, disabled, helper }) => (
    <FormControl fullWidth size="small" disabled={disabled} sx={fieldSx(PINK)}>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={onChange} startAdornment={icon}>
            <MenuItem value="all">{allLabel}</MenuItem>
            {options.map(o => (
                <MenuItem key={o.id} value={o.id}>
                    <Box sx={flexRow}>
                        {o.color && <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: o.color, flexShrink: 0 }} />}
                        <Typography component="span" noWrap>{o.name}</Typography>
                    </Box>
                </MenuItem>
            ))}
        </Select>
        {helper && <FormHelperText>{helper}</FormHelperText>}
    </FormControl>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const PendingTask = () => {
    const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
    const itemsPerPage = isMobile ? 6 : 12;

    const [loading, setLoading] = useState(false);
    const [loadingCerts, setLoadingCerts] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef(null);

    const [selectedCert, setSelectedCert] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');
    const [filteredModules, setFilteredModules] = useState([]);

    const [certifications, setCertifications] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });

    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [snack, setSnack] = useState(null);

    const hasActiveFilters = searchTerm || selectedCert !== 'all' || selectedModule !== 'all';
    const search = debouncedSearch.trim();

    // ─── Data ────────────────────────────────────────────────────────────────
    const fetchTasks = useCallback(async (page = 1) => {
        const params = {
            page: search ? 1 : page,
            limit: search ? 9999 : itemsPerPage,
            ...(selectedCert !== 'all' && { certificationId: selectedCert.replace('cert_', '') }),
            ...(selectedModule !== 'all' && { moduleId: selectedModule }),
        };
        try {
            setLoading(true);
            const { data } = await clienteAxios.get('/module-submission/submitted', { params });
            const list = Array.isArray(data) ? data : data.data;
            setTasks(list.map(t => transformTask(t, certifications)));
            setPageInfo(Array.isArray(data)
                ? { page: 1, totalPages: 1, total: data.length }
                : { page: data.page, totalPages: data.totalPages, total: data.total });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, selectedCert, selectedModule, itemsPerPage, certifications]);

    // ─── Effects ─────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                setLoadingCerts(true);
                const { data } = await clienteAxios.get('/certifications/active');
                setCertifications(data.map((c, i) => ({
                    id: `cert_${c.id}`, originalId: c.id, name: c.name,
                    color: CERT_COLORS[i % CERT_COLORS.length],
                })));
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingCerts(false);
            }
        })();
        return () => clearTimeout(searchTimerRef.current);
    }, []);

    useEffect(() => {
        if (certifications.length) fetchTasks(1);
    }, [fetchTasks, certifications.length]);

    useEffect(() => {
        if (selectedCert === 'all') { setFilteredModules([]); return; }
        (async () => {
            try {
                setLoadingModules(true);
                const { data } = await clienteAxios.get(`/module-certifications/${selectedCert.replace('cert_', '')}`);
                setFilteredModules(data.map(m => ({ id: m.id.toString(), name: m.title || m.name })));
            } catch (e) {
                console.error(e);
                setFilteredModules([]);
            } finally {
                setLoadingModules(false);
            }
        })();
    }, [selectedCert]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS);
    };

    const clearSearch = () => {
        clearTimeout(searchTimerRef.current);
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const handleCertChange = (e) => { setSelectedCert(e.target.value); setSelectedModule('all'); };

    const clearFilters = () => { setSelectedCert('all'); setSelectedModule('all'); clearSearch(); };

    const handlePageChange = (_, value) => {
        fetchTasks(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ⭐ ELIMINAR: SweetAlert2 reemplaza al Dialog de MUI
    const handleDeleteTask = async (task) => {
        const confirmed = await confirmDeleteTask(task);
        if (!confirmed) return;

        try {
            await clienteAxios.delete('/module-submission/delete', { data: { submissionId: task.id } });
            setTasks(prev => prev.filter(t => t.id !== task.id));
            setPageInfo(prev => ({ ...prev, total: prev.total - 1 }));
            if (selectedTask?.id === task.id) setSelectedTask(null);
            toast('success', 'Tarea eliminada correctamente');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo eliminar la tarea.',
            });
        }
    };

    // ─── Derived ─────────────────────────────────────────────────────────────
    const displayRows = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return tasks;
        return tasks.filter(t =>
            [t.user.name, t.user.email, String(t.id), t.moduleName, t.certificationName]
                .some(v => v.toLowerCase().includes(q))
        );
    }, [tasks, search]);

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Paper elevation={0} sx={{ borderRadius: 4, mb: 3, overflow: 'hidden', border: '1px solid #FFE6F0', boxShadow: '0 8px 24px rgba(255,92,147,0.08)' }}>
                <PageHeader icon={<PendingActionsIcon />} title="Tareas pendientes" subtitle="Gestiona las tareas enviadas aún sin calificar">
                    <Chip label={`${pageInfo.total} pendiente${pageInfo.total !== 1 ? 's' : ''}`}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }} />
                </PageHeader>

                <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#FFF5FA', borderTop: '1px solid #FFE6F0' }}>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                        <Grid item xs={12} sm={6} md={3}>
                            <FilterSelect label="Certificación" icon={<SchoolIcon sx={iconSx} />} value={selectedCert}
                                onChange={handleCertChange} options={certifications} allLabel="Todas las certificaciones"
                                disabled={loadingCerts} helper={loadingCerts && 'Cargando certificaciones...'} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FilterSelect label="Módulo" icon={<BookIcon sx={iconSx} />} value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)} options={filteredModules}
                                allLabel={loadingModules ? 'Cargando módulos...' : 'Todos los módulos'}
                                disabled={filteredModules.length === 0 || loadingModules}
                                helper={loadingModules && 'Cargando módulos...'} />
                        </Grid>
                        <Grid item xs={12} md={hasActiveFilters ? 5 : 6}>
                            <TextField fullWidth size="small" placeholder="Buscar por usuario, email, módulo o ID..."
                                value={searchTerm} onChange={handleSearchChange} sx={fieldSx()}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: PINK }} /></InputAdornment>,
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={clearSearch} sx={{ color: PINK }}><CloseIcon fontSize="small" /></IconButton>
                                        </InputAdornment>
                                    ),
                                }} />
                        </Grid>
                        {hasActiveFilters && (
                            <Grid item xs={12} md={1}>
                                <Button fullWidth size="small" onClick={clearFilters} startIcon={<ClearAllIcon />}
                                    sx={{ color: PINK, whiteSpace: 'nowrap', height: 40 }}>
                                    {!isMobile && 'Limpiar'}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>

            {loading ? (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Skeleton variant="rounded" height={isMobile ? 220 : 250} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : displayRows.length === 0 ? (
                <Fade in>
                    <Paper elevation={0} sx={{ p: { xs: 5, sm: 8 }, textAlign: 'center', borderRadius: 4, border: '1px solid #FFE6F0' }}>
                        <Avatar sx={{ bgcolor: '#FFF0F7', width: 72, height: 72, mx: 'auto', mb: 2 }}>
                            <SearchOffIcon sx={{ fontSize: 38, color: '#FFB3DC' }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" gutterBottom>No hay tareas pendientes</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: hasActiveFilters ? 3 : 0 }}>
                            {hasActiveFilters ? 'Intenta con otros filtros' : 'No hay tareas pendientes disponibles'}
                        </Typography>
                        {hasActiveFilters && (
                            <Button variant="outlined" onClick={clearFilters} startIcon={<ClearAllIcon />}
                                sx={{ borderColor: PINK, color: PINK, borderRadius: 2, '&:hover': { borderColor: PINK_DARK, bgcolor: '#FFF5FA' } }}>
                                Limpiar filtros
                            </Button>
                        )}
                    </Paper>
                </Fade>
            ) : (
                <>
                    <Fade in>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                            {displayRows.map(task => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
                                    <PendingTaskCard task={task} onDelete={handleDeleteTask} onViewDetail={setSelectedTask} />
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>

                    {pageInfo.totalPages > 1 && !search && (
                        <Stack alignItems="center" spacing={1} sx={{ mt: { xs: 3, sm: 4 } }}>
                            <Pagination count={pageInfo.totalPages} page={pageInfo.page} onChange={handlePageChange}
                                shape="rounded" size={isMobile ? 'small' : 'medium'}
                                sx={{ '& .Mui-selected': { bgcolor: `${PINK} !important`, color: '#fff' } }} />
                            <Typography variant="caption" color="text.secondary">
                                {pageInfo.page} de {pageInfo.totalPages} páginas · {pageInfo.total} pendientes en total
                            </Typography>
                        </Stack>
                    )}

                    {search && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                            {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para «{debouncedSearch}»
                        </Typography>
                    )}
                </>
            )}

            <TaskDetailDialog task={selectedTask} onClose={() => setSelectedTask(null)} onOpenImage={setSelectedImage} />
            <ImageViewer url={selectedImage} onClose={() => setSelectedImage(null)} isMobile={isMobile} />

            <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack?.severity} variant="filled" onClose={() => setSnack(null)}>{snack?.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PendingTask;