import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { makeStyles } from '@mui/styles';
import {
    Box, Button, Card, CardMedia, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, Grid, IconButton, InputLabel, LinearProgress,
    MenuItem, Paper, Select, Stack, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
    Divider, Avatar, Alert, Skeleton, CardActions, Fade, useTheme,
    useMediaQuery, FormHelperText, CircularProgress, Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ImageIcon from '@mui/icons-material/Image';
import GradeIcon from '@mui/icons-material/Grade';
import BookIcon from '@mui/icons-material/Book';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChecklistIcon from '@mui/icons-material/Checklist';
import clienteAxios from '../../config/Axios';
import Swal from 'sweetalert2';

const useStyles = makeStyles(() => ({
    '@global': { '.swal2-container': { zIndex: '99999 !important' } },
}));
const CERT_COLORS = ['#FF6B9D', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#795548'];
const CRITERION_ICONS = { Manicura: '💅', Sellado: '🔒', Superficie: '📐', Apex: '📏', Terminado: '✨', Blick: '⭐', Cutícula: '✂️', Convexo: '📈', Cóncava: '📉' };
const getCertColor = (i) => CERT_COLORS[i % CERT_COLORS.length];
const getCriterionIcon = (title) => {
    const key = Object.keys(CRITERION_ICONS).find(k => title.toLowerCase().includes(k.toLowerCase()));
    return key ? CRITERION_ICONS[key] : '📋';
};
const fmtDate = (d) => new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const parseResponse = (res) => Array.isArray(res.data)
    ? { rawList: res.data, page: 1, totalPages: 1, total: res.data.length }
    : { rawList: res.data.data, page: res.data.page, totalPages: res.data.totalPages, total: res.data.total };
const getTotal = (res) => Array.isArray(res.data) ? res.data.length : (res.data.total ?? 0);

// ─── CountChips ───────────────────────────────────────────────────────────────
const CountChips = ({ cnt }) => cnt ? (
    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
        {cnt.pending > 0 && <Chip label={cnt.pending} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#ff9800', color: '#fff', '& .MuiChip-label': { px: 0.8 } }} />}
        {cnt.reviewed > 0 && <Chip label={cnt.reviewed} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#4caf50', color: '#fff', '& .MuiChip-label': { px: 0.8 } }} />}
    </Box>
) : null;

// ─── ImageGrid ──────
const ImageGrid = memo(({ taskId, images, onOpen }) => {
    const [errors, setErrors] = useState({});
    return (
        <Grid container spacing={{ xs: 1, sm: 2 }}>
            {images.map((img, idx) => (
                <Grid item xs={4} key={`${taskId}-img-${idx}`}>
                    <Paper sx={{ cursor: 'pointer', borderRadius: 2, overflow: 'hidden', position: 'relative', paddingTop: '100%', '&:hover': { opacity: 0.8 } }} onClick={() => onOpen(img.url)}>
                        {!errors[idx] ? (
                            <CardMedia component="img" image={img.url} alt={`Img ${idx + 1}`}
                                onError={() => setErrors(p => ({ ...p, [idx]: true }))}
                                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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

// ─── TaskCard ────────────────────────────────────────────
const TaskCard = memo(({ task, certColor, onRate, onViewDetail, isMobile }) => {
    const isRated = task.status === 'rated';
    const passedMin = isRated && task.maxScore > 0 && task.totalScore >= Math.ceil(task.maxScore * 0.8);

    return (
        <Card sx={{
            height: '100%', display: 'flex', flexDirection: 'column',
            borderRadius: { xs: 2, sm: 3 }, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transition: 'all 0.3s', border: '1px solid #e0e0e0', overflow: 'visible', position: 'relative',
            '&:hover': { transform: { xs: 'none', sm: 'translateY(-8px)' }, boxShadow: { xs: '0 8px 24px rgba(0,0,0,0.12)', sm: '0 16px 32px rgba(234, 14, 14, 0.16)' } },
        }}>
            {/* Status badge */}
            <Box sx={{ position: 'absolute', top: -18, right: -6, zIndex: 1, width: { xs: 38, sm: 45 }, height: { xs: 38, sm: 45 }, borderRadius: '50%', bgcolor: isRated ? '#4caf50' : '#ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.25)' }}>
                <Tooltip title={isRated ? 'Tarea calificada' : 'Tarea pendiente'}>
                    {isRated
                        ? <CheckCircleIcon sx={{ color: '#fff', fontSize: { xs: 18, sm: 22 } }} />
                        : <PendingActionsIcon sx={{ color: '#fff', fontSize: { xs: 18, sm: 22 } }} />}
                </Tooltip>
            </Box>

            {/* Header */}
            <Box
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    background: 'linear-gradient(135deg, #FE6F9F 0%, #FE6F9FCC 100%)',
                    borderTopLeftRadius: { xs: 8, sm: 12 },
                    borderTopRightRadius: { xs: 8, sm: 12 },
                }}
            >                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                    <Avatar sx={{ bgcolor: '#FF91B5', color: '#fff', width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, fontSize: { xs: '0.9rem', sm: '1rem' }, flexShrink: 0 }}>
                        {task.user.avatar || <PersonIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#fff', fontSize: { xs: '0.85rem', sm: '1rem' }, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>{task.user.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#fff', opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.user.email}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1 }}>
                <Stack direction="row" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip icon={<BookIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />} label={task.moduleName} size="small"
                        sx={{ bgcolor: '#f5f5f5', color: certColor, fontWeight: 600, border: `1px solid ${certColor}`, fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }} />
                    <Chip icon={<SchoolIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />} label={task.certificationName} size="small"
                        sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }} />
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarTodayIcon sx={{ fontSize: { xs: 13, sm: 16 }, color: '#757575', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: '#757575', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>{fmtDate(task.submittedAt)}</Typography>
                </Box>
                {isRated && (
                    <Box>
                        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="600" sx={{ color: '#000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Puntuación Total</Typography>
                                <Chip label={`${task.totalScore}/${task.maxScore}`} size="small"
                                    sx={{ bgcolor: passedMin ? '#4caf50' : '#ff9800', color: '#fff', fontWeight: 700, fontSize: { xs: '0.68rem', sm: '0.75rem' } }} />
                            </Box>
                            <LinearProgress variant="determinate" value={task.maxScore > 0 ? (task.totalScore / task.maxScore) * 100 : 0}
                                sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: passedMin ? '#4caf50' : '#ff9800' } }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Promedio</Typography>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{task.averageScore.toFixed(1)}/5.0</Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Actions */}
            <CardActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
                {!isRated ? (
                    <Button variant="contained" fullWidth startIcon={<RateReviewIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} onClick={() => onRate(task)}
                        sx={{ background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`, color: '#fff', fontWeight: 600, py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.78rem', sm: '0.875rem' }, '&:hover': { background: `linear-gradient(135deg, ${certColor}CC 0%, ${certColor} 100%)` } }}>
                        Calificar Tarea
                    </Button>
                ) : (
                    <Button variant="outlined" fullWidth startIcon={<VisibilityIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />} onClick={() => onViewDetail(task)}
                        sx={{ borderColor: '#FF5B91', color: '#FF5B91', fontWeight: 600, py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.78rem', sm: '0.875rem' }, '&:hover': { borderColor: '#FF5B91', bgcolor: 'rgba(255,91,145,0.04)' } }}>
                        Ver Detalle
                    </Button>
                )}
            </CardActions>
        </Card>
    );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const Task = () => {
    const theme = useTheme();
    useStyles();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ─── State ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef(null);
    const searchMounted = useRef(false); // skip effect on first render

    const [loading, setLoading] = useState(false);
    const [loadingCerts, setLoadingCerts] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);

    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [certificateModalOpen, setCertificateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);

    const [selectedCert, setSelectedCert] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');
    const [filteredModules, setFilteredModules] = useState([]);

    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 });

    const [certifications, setCertifications] = useState([]);
    const [submittedTasks, setSubmittedTasks] = useState([]);
    const [reviewedTasks, setReviewedTasks] = useState([]);
    const [submittedPage, setSubmittedPage] = useState({ page: 1, totalPages: 1, total: 0 });
    const [reviewedPage, setReviewedPage] = useState({ page: 1, totalPages: 1, total: 0 });
    const [moduleCriteria, setModuleCriteria] = useState({});
    const [loadingCriteria, setLoadingCriteria] = useState({});
    const loadedCriteriaRef = useRef({});  // tracks already-fetched module IDs (avoids stale closure)
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState('');
    const [certCounts, setCertCounts] = useState({});

    const itemsPerPage = isMobile ? 6 : 12;
    const activePage = activeTab === 0 ? submittedPage : reviewedPage;

    // ─── transformTask ────────────────────────────────────────────────────────
    const transformTask = useCallback((task, status) => {
        const moduleId = task.moduleId ?? task.module?.id;
        const certId = task.module?.certificationId || 1;
        const cert = certifications.find(c => c.originalId === certId);
        return {
            id: task.id,
            user: {
                name: task.user?.name || 'Usuario',
                email: task.user?.email || '',
                id: task.userId ?? task.user?.id,
                avatar: task.user?.name ? task.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U',
            },
            certificationId: cert ? cert.id : `cert_${certId}`,
            certificationName: cert?.name ?? task.module?.certification_name ?? `Certificación ${certId}`,
            moduleId: moduleId?.toString() ?? '',
            moduleName: task.module?.title || `Módulo ${moduleId}`,
            submittedAt: task.createdAt,
            images: [task.photo_1, task.photo_2, task.photo_3]
                .filter(Boolean).map(p => ({ url: `https://cdn.floreciendojuntas.com${p}` })),
            totalScore: task.evaluation?.score_obtained ?? 0,
            maxScore: task.evaluation?.max_score_module ?? 0,
            averageScore: task.evaluation?.percentage ? (parseFloat(task.evaluation.percentage) / 100) * 5 : 0,
            status,
        };
    }, [certifications]);

    // ─── buildParams ──────────────────────────────────────────────────────────
    // When searching: large limit + no search param → fetch all, filter client-side
    const buildParams = useCallback((pageNum, search, certId, modId) => ({
        ...(search?.trim() ? { page: 1, limit: 9999 } : { page: pageNum, limit: itemsPerPage }),
        ...(certId && certId !== 'all' && { certificationId: certId.replace('cert_', '') }),
        ...(modId && modId !== 'all' && { moduleId: modId }),
    }), [itemsPerPage]);

    // ─── fetchTasks — unified fetch for both tabs ─────────────────────────────
    const fetchTasks = useCallback(async (isPending, pageNum = 1, search = '', certId = 'all', modId = 'all') => {
        const endpoint = isPending ? '/module-submission/submitted' : '/module-submission/reviewed';
        const setData = isPending ? setSubmittedTasks : setReviewedTasks;
        const setPage = isPending ? setSubmittedPage : setReviewedPage;
        const status = isPending ? 'pending' : 'rated';
        try {
            setLoading(true);
            const res = await clienteAxios.get(endpoint, { params: buildParams(pageNum, search, certId, modId) });
            const { rawList, page, totalPages, total } = parseResponse(res);
            setData(rawList.map(t => transformTask(t, status)));
            setPage({ page, totalPages, total });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [buildParams, transformTask]);

    // Shortcut: fetch only the active tab
    const refetch = useCallback((page = 1, search = '', cert = 'all', mod = 'all') => {
        fetchTasks(activeTab === 0, page, search, cert, mod);
    }, [activeTab, fetchTasks]);

    // ─── fetchCertifications ──────────────────────────────────────────────────
    const fetchCertifications = async () => {
        try {
            setLoadingCerts(true);
            const res = await clienteAxios.get('/certifications/active');
            setCertifications(res.data.map((c, i) => ({
                id: `cert_${c.id}`, originalId: c.id, name: c.name,
                description: c.description, color: getCertColor(i), modules: [],
            })));
        } catch (e) { console.error(e); }
        finally { setLoadingCerts(false); }
    };

    // ─── fetchCertCounts ──────────────────────────────────────────────────────
    const fetchCertCounts = useCallback(async (certs) => {
        const results = await Promise.allSettled(
            certs.map(c => Promise.all([
                clienteAxios.get('/module-submission/submitted', { params: { page: 1, limit: 1, certificationId: c.originalId } }),
                clienteAxios.get('/module-submission/reviewed', { params: { page: 1, limit: 1, certificationId: c.originalId } }),
            ]))
        );
        const counts = {};
        certs.forEach((c, i) => {
            if (results[i].status === 'fulfilled') {
                const [sub, rev] = results[i].value;
                counts[c.id] = { pending: getTotal(sub), reviewed: getTotal(rev) };
            }
        });
        setCertCounts(counts);
    }, []);

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
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los módulos', confirmButtonColor: '#ef4444' });
        } finally { setLoadingModules(false); }
    }, []);

    // ─── fetchModuleCriteria ──────────────────────────────────────────────────
    const fetchModuleCriteria = useCallback(async (moduleId) => {
        if (loadedCriteriaRef.current[moduleId]) return;
        loadedCriteriaRef.current[moduleId] = true;
        try {
            setLoadingCriteria(prev => ({ ...prev, [moduleId]: true }));
            const res = await clienteAxios.get(`/module-criterion/${moduleId}`);
            setModuleCriteria(prev => ({
                ...prev,
                [moduleId]: res.data.map(c => ({
                    id: c.id.toString(), moduleId: c.moduleId.toString(),
                    title: c.title, description: c.description || 'Sin descripción',
                    max_score: c.max_score, icon: getCriterionIcon(c.title),
                })),
            }));
        } catch (e) {
            console.error(e);
            loadedCriteriaRef.current[moduleId] = false; // allow retry on error
        } finally { setLoadingCriteria(prev => ({ ...prev, [moduleId]: false })); }
    }, []); // stable — no dependencies needed

    // ─── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => { fetchCertifications(); }, []);

    useEffect(() => {
        if (certifications.length === 0) return;
        fetchTasks(true, 1, '', 'all', 'all');
        fetchTasks(false, 1, '', 'all', 'all');
        fetchCertCounts(certifications);
    }, [certifications]); // eslint-disable-line react-hooks/exhaustive-deps

    // FIX: skip first render only; clearing search also fires a refetch correctly
    useEffect(() => {
        if (!searchMounted.current) { searchMounted.current = true; return; }
        if (certifications.length === 0) return;
        refetch(1, debouncedSearch, selectedCert, selectedModule);
    }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchModulesByCert(selectedCert !== 'all' ? selectedCert : null);
    }, [selectedCert, fetchModulesByCert]);

    useEffect(() => () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); }, []);

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

    const handleTabChange = (_, newTab) => {
        setActiveTab(newTab);
        setSelectedModule('all');
        setSelectedCert('all');
        setFilteredModules([]);
        clearSearch();
        (newTab === 0 ? setSubmittedPage : setReviewedPage)(p => ({ ...p, page: 1 }));
        fetchTasks(newTab === 0, 1, '', 'all', 'all');
    };

    const handleCertChange = (e) => {
        const newCert = e.target.value;
        setSelectedCert(newCert);
        setSelectedModule('all');
        refetch(1, debouncedSearch, newCert, 'all');
    };

    const handleModuleChange = (e) => {
        const newMod = e.target.value;
        setSelectedModule(newMod);
        refetch(1, debouncedSearch, selectedCert, newMod);
    };

    const clearFilters = () => {
        setSelectedModule('all');
        setSelectedCert('all');
        setFilteredModules([]);
        clearSearch();
        fetchTasks(activeTab === 0, 1, '', 'all', 'all');
    };

    const handlePageChange = (_, value) => {
        refetch(value, debouncedSearch, selectedCert, selectedModule);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─── Rating ───────────────────────────────────────────────────────────────
    const openRatingModal = async (task) => {
        setSelectedTask(task);
        setComments('');
        await fetchModuleCriteria(task.moduleId);
        setModuleCriteria(prev => {
            setRatings(Object.fromEntries((prev[task.moduleId] || []).map(c => [c.id, 0])));
            return prev;
        });
        setRatingModalOpen(true);
    };

    const closeRatingModal = () => { setRatingModalOpen(false); setSelectedTask(null); setRatings({}); setComments(''); };

    const handleSaveRating = async () => {
        if (!selectedTask) return;
        try {
            setLoading(true);
            await clienteAxios.post('/module-evaluation', {
                submissionId: selectedTask.id,
                feedback: comments || null,
                scores: Object.entries(ratings).map(([criterionId, score]) => ({ criterionId: parseInt(criterionId), score })),
            });
            fetchTasks(true, submittedPage.page, debouncedSearch, selectedCert, selectedModule);
            fetchTasks(false, 1, debouncedSearch, selectedCert, selectedModule);
            closeRatingModal();
            Swal.fire({ icon: 'success', title: '¡Calificación guardada!', text: 'La tarea ha sido calificada exitosamente.', confirmButtonColor: '#4361ee', timer: 3000, timerProgressBar: true });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar la calificación', confirmButtonColor: '#ef4444' });
        } finally { setLoading(false); }
    };

    // ─── Detalle modal ─────────────────────────────────────────────────────────
    const openDetailModal = async (task) => {
        setSelectedTask(task);
        try {
            const res = await clienteAxios.get(`/module-evaluation/${task.id}`);
            const ev = res.data;
            if (ev) {
                const photos = [ev.submission?.photo_1_url, ev.submission?.photo_2_url, ev.submission?.photo_3_url]
                    .filter(Boolean).map(url => ({ url }));
                setSelectedTask({
                    ...task,
                    images: photos.length > 0 ? photos : task.images,
                    comments: ev.general_feedback,
                    totalScore: ev.total_score,
                    maxScore: ev.scores.reduce((s, x) => s + (x.criterion?.max_score || 5), 0),
                    averageScore: ev.scores.length > 0 ? ev.total_score / ev.scores.length : 0,
                    evaluationData: ev,
                });
            }
        } catch (e) { console.error(e); }
        setDetailModalOpen(true);
    };

    const closeDetailModal = () => { setDetailModalOpen(false); setSelectedTask(null); };

    // ─── Image viewer ─────────────────────────────────────────────────────────
    const openImageViewer = (url) => { setSelectedImage(url); setImageViewerOpen(true); setZoomLevel(1); setImagePos({ x: 0, y: 0 }); };
    const closeImageViewer = () => { setImageViewerOpen(false); setSelectedImage(null); setZoomLevel(1); setImagePos({ x: 0, y: 0 }); };

    const hasActiveFilters = searchTerm || selectedCert !== 'all' || selectedModule !== 'all';

    const displayRows = useMemo(() => {
        const rows = activeTab === 0 ? submittedTasks : reviewedTasks;
        if (!debouncedSearch.trim()) return rows;
        const q = debouncedSearch.trim().toLowerCase();
        return rows.filter(t =>
            t.user.name.toLowerCase().includes(q) ||
            t.user.email.toLowerCase().includes(q) ||
            String(t.id).includes(q) ||
            t.moduleName.toLowerCase().includes(q) ||
            t.certificationName.toLowerCase().includes(q)
        );
    }, [activeTab, submittedTasks, reviewedTasks, debouncedSearch]);

    const stats = useMemo(() => ({
        total: submittedPage.total + reviewedPage.total,
        pending: submittedPage.total,
        reviewed: reviewedPage.total,
    }), [submittedPage.total, reviewedPage.total]);

    // Resumen de puntuación memorizado para el modo de calificación
    const ratingScore = useMemo(() => {
        const criteria = moduleCriteria[selectedTask?.moduleId] || [];
        const total = Object.values(ratings).reduce((s, v) => s + (v || 0), 0);
        const maxScore = criteria.reduce((s, c) => s + c.max_score, 0);
        const pct = maxScore > 0 ? (total / maxScore) * 100 : 0;
        return { total, maxScore, pct };
    }, [ratings, moduleCriteria, selectedTask?.moduleId]);

    const modalPaper = { sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>

            {/* ── Header ── */}
            <Paper sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}>

                {/* Banner */}
                <Box sx={{ background: 'linear-gradient(135deg, #FF5C93 0%, #f73b7a 100%)', p: { xs: 2.5, sm: 3, md: 4 }, color: '#fff' }}>
                    <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2.5, md: 3 } }}>
                        <Box>
                            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, color: '#fff', fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' } }}>
                                <GradeIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} /> Evaluación de Tareas
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#fff', opacity: 0.9, mt: 0.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>Gestiona y califica las tareas enviadas</Typography>
                        </Box>
                        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ width: { xs: '100%', md: 'auto' } }}>
                            {[
                                { value: stats.total, label: 'Total', color: '#fff' },
                                { value: stats.pending, label: 'Pendientes', color: '#ffb74d' },
                                { value: stats.reviewed, label: 'Calificadas', color: '#81c784' },
                            ].map((s, i) => (
                                <Paper key={i} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, flex: { xs: 1, md: 'none' }, minWidth: { xs: 0, md: 100 }, textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="700" sx={{ color: s.color, fontSize: { xs: '1.4rem', sm: '2.125rem' }, lineHeight: 1.1 }}>{s.value}</Typography>
                                    <Typography variant="caption" sx={{ color: '#fff', fontSize: { xs: '0.62rem', sm: '0.75rem' }, display: 'block', mt: 0.3 }}>{s.label}</Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Filtros */}
                <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#fff' }}>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small" disabled={loadingCerts}>
                                <InputLabel>Certificación</InputLabel>
                                <Select value={selectedCert} label="Certificación" onChange={handleCertChange}
                                    startAdornment={<SchoolIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}>
                                    <MenuItem value="all">Todas las Certificaciones</MenuItem>
                                    {certifications.map(c => (
                                        <MenuItem key={c.id} value={c.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                                </Box>
                                                <CountChips cnt={certCounts[c.id]} />
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
                                <Select value={selectedModule} label="Módulo" onChange={handleModuleChange}
                                    disabled={filteredModules.length === 0 || loadingModules}
                                    startAdornment={<BookIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}>
                                    <MenuItem value="all">{loadingModules ? 'Cargando módulos...' : 'Todos los Módulos'}</MenuItem>
                                    {filteredModules.map(m => (
                                        <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                                    ))}
                                </Select>
                                {loadingModules && <FormHelperText>Cargando módulos...</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={hasActiveFilters ? 5 : 6}>
                            <TextField fullWidth size="small"
                                placeholder="Buscar por usuario, email, módulo o ID..."
                                value={searchTerm} onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />,
                                    endAdornment: searchTerm && (
                                        <IconButton size="small" onClick={clearSearch}><CloseIcon fontSize="small" sx={{ color: '#757575' }} /></IconButton>
                                    ),
                                }} />
                        </Grid>

                        {hasActiveFilters && (
                            <Grid item xs={12} sm={12} md={1} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Button variant="text" size="small" onClick={clearFilters} startIcon={<ClearAllIcon />} fullWidth
                                    sx={{ color: '#FF5C93', whiteSpace: 'nowrap', height: 40 }}>
                                    {!isMobile && 'Limpiar'}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0', bgcolor: '#fff' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}
                        sx={{ px: { xs: 1, sm: 2, md: 3 }, '& .MuiTab-root': { minWidth: { xs: 'auto', sm: 160 }, px: { xs: 1.5, sm: 2 } } }}>
                        {[
                            { label: 'Pendientes', total: submittedPage.total, icon: <PendingActionsIcon />, chipColor: '#ff9800' },
                            { label: 'Calificadas', total: reviewedPage.total, icon: <AssignmentTurnedInIcon />, chipColor: '#4caf50' },
                        ].map((tab, i) => (
                            <Tab key={i}
                                icon={React.cloneElement(tab.icon, { sx: { color: activeTab === i ? '#FF5C93' : '#757575', fontSize: { xs: 18, sm: 24 } } })}
                                iconPosition="start"
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                        <span style={{ color: activeTab === i ? '#FF5C93' : '#757575', fontSize: isMobile ? '0.78rem' : '0.875rem' }}>{tab.label}</span>
                                        <Chip label={tab.total} size="small" sx={{ bgcolor: tab.chipColor, color: '#fff', height: { xs: 18, sm: 22 }, fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>
                </Box>
            </Paper>

            {/* ── Cards ── */}
            {loading ? (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Skeleton variant="rectangular" height={isMobile ? 280 : 360} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : displayRows.length === 0 ? (
                <Fade in>
                    <Paper sx={{ p: { xs: 5, sm: 8 }, textAlign: 'center', borderRadius: { xs: 2, sm: 4 } }}>
                        <SearchIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#e0e0e0', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: '#757575', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} gutterBottom>No se encontraron tareas</Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>{hasActiveFilters ? 'Intenta con otros filtros' : 'No hay tareas disponibles'}</Typography>
                        {hasActiveFilters && <Button variant="contained" onClick={clearFilters} startIcon={<ClearAllIcon />} sx={{ bgcolor: '#FE5A91' }}>Limpiar Filtros</Button>}
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
                                        <TaskCard task={task} certColor={certColor} isMobile={isMobile}
                                            onRate={openRatingModal} onViewDetail={openDetailModal} />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Fade>

                    {activePage.totalPages > 1 && !debouncedSearch && (
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: { xs: 3, sm: 4 }, gap: 1 }}>
                            <Pagination count={activePage.totalPages} page={activePage.page} onChange={handlePageChange} color="primary" shape="rounded" size={isMobile ? 'small' : 'medium'} />
                            <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                                Página {activePage.page} de {activePage.totalPages} · {activePage.total} {activeTab === 0 ? 'pendientes' : 'calificadas'} en total
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

            {/* ── MODAL DE CALIFICACION ── */}
            <Dialog open={ratingModalOpen} onClose={closeRatingModal} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={modalPaper}>
                <DialogTitle sx={{ bgcolor: '#FF5B92', color: '#fff', py: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, pr: isMobile ? 4 : 0 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}><RateReviewIcon sx={{ color: '#fff' }} /></Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>Calificar Tarea</Typography>
                            <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>{selectedTask?.user.name}</Typography>
                        </Box>
                    </Box>
                    {isMobile && <IconButton onClick={closeRatingModal} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}><CloseIcon /></IconButton>}
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff' }}>
                    {selectedTask && (
                        <>
                            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5' }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                    <Chip icon={<BookIcon />} label={selectedTask.moduleName} size="small" sx={{ bgcolor: '#e0e0e0' }} />
                                    <Chip icon={<SchoolIcon />} label={selectedTask.certificationName} size="small" sx={{ bgcolor: '#e0e0e0' }} />
                                </Box>
                                <Typography variant="body2"><strong>Estudiante:</strong> {selectedTask.user.name}</Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}><strong>Email:</strong> {selectedTask.user.email}</Typography>
                            </Paper>

                            {selectedTask.images?.length > 0 && (
                                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                                    <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5 }}>Imágenes Enviadas</Typography>
                                    <ImageGrid taskId={selectedTask.id} images={selectedTask.images} onOpen={openImageViewer} />
                                </Box>
                            )}

                            <Divider sx={{ my: { xs: 2.5, sm: 4 } }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
                                <ChecklistIcon sx={{ color: '#FE5A91' }} />
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#FE5A91', fontSize: { xs: '1rem', sm: '1.25rem' } }}>Criterios de Evaluación</Typography>
                            </Box>

                            {loadingCriteria[selectedTask.moduleId] ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: '#FE5A91' }} /></Box>
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
                                                                <Typography fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>{criterion.title}</Typography>
                                                                {criterion.description && <Typography variant="caption" sx={{ color: '#757575' }}>{criterion.description}</Typography>}
                                                            </Box>
                                                        </Box>
                                                        <Chip label={`${ratings[criterion.id] || 0}/${criterion.max_score}`} size="small"
                                                            sx={{ bgcolor: (ratings[criterion.id] || 0) >= 4 ? '#4caf50' : (ratings[criterion.id] || 0) >= 3 ? '#ff9800' : '#f44336', color: '#fff', flexShrink: 0 }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 } }}>
                                                        {[1, 2, 3, 4, 5].map(v => (
                                                            <Button key={v} variant={ratings[criterion.id] === v ? 'contained' : 'outlined'}
                                                                onClick={() => setRatings(p => ({ ...p, [criterion.id]: v }))}
                                                                sx={{
                                                                    flex: 1, minWidth: 0, height: { xs: 38, sm: 44 }, fontSize: { xs: '0.85rem', sm: '1rem' }, fontWeight: 600, borderRadius: 1.5, p: 0,
                                                                    ...(ratings[criterion.id] === v && { background: v >= 4 ? 'linear-gradient(135deg,#4caf50,#2e7d32)' : v >= 3 ? 'linear-gradient(135deg,#ff9800,#ed6c02)' : 'linear-gradient(135deg,#f44336,#d32f2f)', color: '#fff' }),
                                                                    ...(ratings[criterion.id] !== v && { borderColor: '#bdbdbd', color: '#000', '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' } }),
                                                                }}>
                                                                {v}
                                                            </Button>
                                                        ))}
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Paper sx={{ mt: { xs: 3, sm: 4 }, p: { xs: 2, sm: 3 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                        <Typography variant="h6" fontWeight="600" sx={{ color: '#2e7d32', mb: 2 }}>Resumen de Calificación</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: '#757575' }}>Puntuación Total</Typography>
                                                <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32' }}>{ratingScore.total}/{ratingScore.maxScore}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" sx={{ color: '#757575' }}>Progreso</Typography>
                                                    <Typography variant="body2" fontWeight="600" sx={{ color: '#2e7d32' }}>{ratingScore.pct.toFixed(1)}%</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={ratingScore.pct}
                                                    sx={{ height: { xs: 8, sm: 10 }, borderRadius: 5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: ratingScore.total >= Math.ceil(ratingScore.maxScore * 0.8) ? '#4caf50' : '#ff9800', borderRadius: 5 } }} />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </>
                            ) : (
                                <Alert severity="info">No hay criterios de evaluación definidos para este módulo</Alert>
                            )}

                            {/* <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                                <TextField fullWidth multiline rows={isMobile ? 3 : 4} label="Comentarios (opcional)"
                                    value={comments} onChange={e => setComments(e.target.value)}
                                    placeholder="Escribe comentarios constructivos..."
                                    sx={{ '& .MuiInputLabel-root': { color: '#757575' } }} />
                            </Box> */}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff', gap: 1 }}>
                    <Button onClick={closeRatingModal} sx={{ color: '#757575' }} fullWidth={isMobile}>Cancelar</Button>
                    <Button onClick={handleSaveRating} variant="contained" fullWidth={isMobile}
                        disabled={Object.values(ratings).every(v => v === 0) || !!loadingCriteria[selectedTask?.moduleId]}
                        sx={{ bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#2e7d32' } }}>
                        Guardar Calificación
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── DETALLE DEL MODAL ── */}
            <Dialog open={detailModalOpen} onClose={closeDetailModal} maxWidth="md" fullWidth fullScreen={isMobile} PaperProps={modalPaper}>
                <DialogTitle sx={{ bgcolor: '#FF5C93', color: '#fff', py: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, pr: isMobile ? 4 : 0 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}><VisibilityIcon sx={{ color: '#fff' }} /></Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>Detalle de Calificación</Typography>
                            <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>{selectedTask?.user.name}</Typography>
                        </Box>
                    </Box>
                    {isMobile && <IconButton onClick={closeDetailModal} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}><CloseIcon /></IconButton>}
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff' }}>
                    {selectedTask?.status === 'rated' && (
                        <>
                            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 }, bgcolor: '#f5f5f5' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#FF5723', flexShrink: 0 }}>{selectedTask.user.avatar}</Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedTask.user.name}</Typography>
                                                <Typography variant="body2" sx={{ color: '#757575', wordBreak: 'break-all' }}>{selectedTask.user.email}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography><strong>Módulo:</strong> {selectedTask.moduleName}</Typography>
                                        <Typography><strong>Certificación:</strong> {selectedTask.certificationName}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {selectedTask.images?.length > 0 && (
                                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                                    <Typography variant="h6" gutterBottom>Imágenes</Typography>
                                    <ImageGrid taskId={selectedTask.id} images={selectedTask.images} onOpen={openImageViewer} />
                                </Box>
                            )}

                            <Divider sx={{ my: { xs: 2.5, sm: 4 } }} />
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
                                        {selectedTask.evaluationData?.scores.map(scoreItem => {
                                            const c = scoreItem.criterion;
                                            const pct = (scoreItem.score / (c?.max_score || 5)) * 100;
                                            return (
                                                <TableRow key={scoreItem.id}>
                                                    <TableCell>
                                                        <Typography fontWeight="500" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{c?.title || `Criterio ${scoreItem.criterionId}`}</Typography>
                                                        {c?.description && !isMobile && <Typography variant="caption" sx={{ color: '#757575' }}>{c.description}</Typography>}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={isMobile ? `${scoreItem.score}/${c?.max_score || 5}` : `${scoreItem.score}`} size="small"
                                                            sx={{ bgcolor: scoreItem.score >= 4 ? '#e8f5e9' : scoreItem.score >= 3 ? '#fff3e0' : '#ffebee', color: scoreItem.score >= 4 ? '#2e7d32' : scoreItem.score >= 3 ? '#ed6c02' : '#c62828', fontWeight: 600 }} />
                                                    </TableCell>
                                                    {!isMobile && <TableCell align="center" sx={{ color: '#757575' }}>{c?.max_score || 5}</TableCell>}
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                            {!isMobile && <LinearProgress variant="determinate" value={pct}
                                                                sx={{ width: 80, height: 8, borderRadius: 4, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336' } }} />}
                                                            <Typography variant="caption" sx={{ color: '#757575' }}>{pct.toFixed(0)}%</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {selectedTask.evaluationData && (() => {
                                const ev = selectedTask.evaluationData;
                                const maxEv = ev.scores.reduce((s, x) => s + (x.criterion?.max_score || 5), 0);
                                const pctEv = maxEv > 0 ? (ev.total_score / maxEv) * 100 : 0;
                                return (
                                    <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f7ecf0', borderRadius: 2 }}>
                                        <Grid container spacing={{ xs: 2, sm: 3 }}>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="body2" sx={{ color: '#64748b' }}>Puntuación Total</Typography>
                                                <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>
                                                    {ev.total_score}
                                                    <Typography component="span" variant="body1" sx={{ color: '#64748b', ml: 0.5 }}>/{maxEv}</Typography>
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="body2" sx={{ color: '#64748b' }}>Criterios Evaluados</Typography>
                                                <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>{ev.scores.length}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                                            <LinearProgress variant="determinate" value={pctEv}
                                                sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#FF5C93', borderRadius: 4 } }} />
                                        </Box>
                                        {/* {ev.general_feedback && (
                                            <Box sx={{ mt: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, borderTop: '1px solid #e2e8f0' }}>
                                                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>Comentarios del Evaluador</Typography>
                                                <Typography variant="body2" sx={{ color: '#1e293b' }}>{ev.general_feedback}</Typography>
                                            </Box>
                                        )} */}
                                        {/* <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                Evaluado el: {new Date(ev.evaluated_at).toLocaleString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box> */}
                                    </Paper>
                                );
                            })()}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#fff' }}>
                    <Button onClick={closeDetailModal} variant="contained" fullWidth={isMobile} sx={{ bgcolor: '#FF5C93', color: '#fff', '&:hover': { bgcolor: '#e0456e' } }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* ── CERTIFICATE MODAL ── */}
            <Dialog open={certificateModalOpen} onClose={() => setCertificateModalOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile} PaperProps={modalPaper}>
                <DialogTitle sx={{ bgcolor: '#ff9800', textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                    <EmojiEventsIcon sx={{ fontSize: { xs: 60, sm: 80 }, mb: 2 }} />
                    <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>¡Felicidades!</Typography>
                    {isMobile && <IconButton onClick={() => setCertificateModalOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}><CloseIcon /></IconButton>}
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center', bgcolor: '#fff' }}>
                    {selectedTask && (
                        <>
                            <Typography variant="h5" fontWeight="600" gutterBottom>{selectedTask.user.name}</Typography>
                            <Chip icon={<BookIcon sx={{ color: '#fff' }} />} label={selectedTask.moduleName} sx={{ mb: 3, bgcolor: '#1976d2', color: '#fff' }} />
                            <Paper sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ color: '#757575' }} gutterBottom>Puntuación Obtenida</Typography>
                                <Typography variant="h1" sx={{ color: '#2e7d32', fontSize: { xs: '3rem', sm: '6rem' } }} fontWeight="700">
                                    {selectedTask.totalScore}
                                    <Typography component="span" variant="h4" sx={{ color: '#757575' }}>/{selectedTask.maxScore || 25}</Typography>
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#757575' }}>Promedio: {selectedTask.averageScore}/5.0</Typography>
                            </Paper>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: 'center', gap: 2, bgcolor: '#fff', flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button onClick={() => setCertificateModalOpen(false)} variant="outlined" fullWidth={isMobile} sx={{ borderColor: '#757575', color: '#757575' }}>Cerrar</Button>
                    <Button onClick={() => setCertificateModalOpen(false)} variant="contained" fullWidth={isMobile} startIcon={<DownloadIcon />} sx={{ bgcolor: '#ff9800', color: '#000', '&:hover': { bgcolor: '#f57c00' } }}>Descargar Certificado</Button>
                </DialogActions>
            </Dialog>

            {/* ── IMAGE VIEWER ── */}
            <Dialog open={imageViewerOpen} onClose={closeImageViewer} maxWidth="lg" fullWidth fullScreen={isMobile}
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden', m: isMobile ? 0 : 2 } }}
                BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.85)' } }}>
                <Box sx={{ position: 'relative', minHeight: isMobile ? '100vh' : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', userSelect: 'none' }}
                    onWheel={e => { e.preventDefault(); setZoomLevel(p => Math.min(Math.max(p + (e.deltaY > 0 ? -0.15 : 0.15), 0.5), 4)); }}
                    onMouseDown={e => { setIsDragging(true); setDragStart({ x: e.clientX - imagePos.x, y: e.clientY - imagePos.y }); }}
                    onMouseMove={e => { if (isDragging) setImagePos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                    onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
                    onTouchStart={e => { if (e.touches.length === 1) { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - imagePos.x, y: e.touches[0].clientY - imagePos.y }); } }}
                    onTouchMove={e => { if (isDragging && e.touches.length === 1) setImagePos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); }}
                    onTouchEnd={() => setIsDragging(false)}>

                    <IconButton onClick={closeImageViewer} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}><CloseIcon /></IconButton>
                    <Box sx={{ position: 'absolute', bottom: { xs: 24, sm: 16 }, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 4, px: 2, py: 0.5 }}>
                        <IconButton size="small" onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.5))} sx={{ color: '#fff' }}><Typography sx={{ fontSize: 22, lineHeight: 1 }}>−</Typography></IconButton>
                        <Typography sx={{ color: '#fff', minWidth: 50, textAlign: 'center', fontSize: 14 }}>{Math.round(zoomLevel * 100)}%</Typography>
                        <IconButton size="small" onClick={() => setZoomLevel(p => Math.min(p + 0.25, 4))} sx={{ color: '#fff' }}><Typography sx={{ fontSize: 22, lineHeight: 1 }}>+</Typography></IconButton>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />
                        <IconButton size="small" onClick={() => { setZoomLevel(1); setImagePos({ x: 0, y: 0 }); }} sx={{ color: '#fff' }}><Typography sx={{ fontSize: 12 }}>Reset</Typography></IconButton>
                    </Box>

                    {selectedImage && (
                        <img src={selectedImage} alt="Vista ampliada" draggable={false} style={{
                            maxWidth: '100%', maxHeight: isMobile ? '80vh' : '85vh', objectFit: 'contain', borderRadius: 8,
                            transform: `translate(${imagePos.x}px,${imagePos.y}px) scale(${zoomLevel})`,
                            transition: isDragging ? 'transform 0.05s linear' : 'transform 0.2s ease',
                            cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
                            willChange: 'transform', transformOrigin: 'center center',
                        }} />
                    )}
                </Box>
            </Dialog>
        </Box>
    );
};

export default Task;