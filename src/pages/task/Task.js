import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
    Avatar, Box, Button, Chip, Fade, GlobalStyles, Grid, Pagination, Paper, Skeleton, Stack,
    Tab, Tabs, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import clienteAxios from '../../config/Axios';
import TaskHeader from './components/TaskHeader';
import TaskFilters from './components/TaskFilters';
import TaskCard from './components/TaskCard';
import RatingModal from './components/RatingModal';
import DetailModal from './components/DetailModal';
import ImageViewer from './components/ImageViewer';
import { getCertColor, parseResponse, getTotal } from './utils/Helpers';
import { ITEMS_PER_PAGE, ITEMS_PER_PAGE_MOBILE, SEARCH_DELAY } from './utils/Constans';
import Swal from 'sweetalert2';

// ─── Constantes ──────────────────────────────────────────────────────────────
const globalStyles = <GlobalStyles styles={{ '.swal2-container': { zIndex: '99999 !important' } }} />;

const CDN = 'https://cdn.floreciendojuntas.com';
const PINK = '#FF5C93';

// Configuración de cada pestaña (índice = activeTab)
const TABS = [
    { key: 'pending', label: 'Pendientes', endpoint: '/module-submission/submitted', icon: <PendingActionsIcon />, color: '#ff9800' },
    { key: 'rated', label: 'Calificadas', endpoint: '/module-submission/reviewed', icon: <AssignmentTurnedInIcon />, color: '#4caf50' },
];

const EMPTY_LIST = { rows: [], page: 1, totalPages: 1, total: 0 };

const CRITERION_ICONS = [
    ['Manicura', '💅'], ['Sellado', '🔒'], ['Superficie', '📐'], ['Apex', '📏'], ['Terminado', '✨'],
    ['Blick', '⭐'], ['Cutícula', '✂️'], ['Convexo', '📈'], ['Cóncava', '📉'],
];
const getCriterionIcon = (title) => CRITERION_ICONS.find(([word]) => title.includes(word))?.[1] || '📋';

const Task = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ─── State ───────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef(null);
    const searchMounted = useRef(false);

    const [loading, setLoading] = useState(false);
    const [loadingCerts, setLoadingCerts] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);

    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [selectedCert, setSelectedCert] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');
    const [filteredModules, setFilteredModules] = useState([]);

    const [certifications, setCertifications] = useState([]);
    const [certCounts, setCertCounts] = useState({});
    const [data, setData] = useState({ pending: EMPTY_LIST, rated: EMPTY_LIST });

    const [moduleCriteria, setModuleCriteria] = useState({});
    const [loadingCriteria, setLoadingCriteria] = useState({});
    const loadedCriteriaRef = useRef({});

    const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE;
    const activeList = data[TABS[activeTab].key];
    const hasActiveFilters = searchTerm || selectedCert !== 'all' || selectedModule !== 'all';

    // ─── Data ────────────────────────────────────────────────────────────────
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
            images: [task.photo_1, task.photo_2, task.photo_3].filter(Boolean).map(p => ({ url: `${CDN}${p}` })),
            totalScore: task.evaluation?.score_obtained ?? 0,
            maxScore: task.evaluation?.max_score_module ?? 0,
            averageScore: task.evaluation?.percentage ? (parseFloat(task.evaluation.percentage) / 100) * 5 : 0,
            status,
        };
    }, [certifications]);

    // tabIndex: 0 = pendientes, 1 = calificadas
    const fetchTasks = useCallback(async (tabIndex, pageNum = 1, search = '', certId = 'all', modId = 'all') => {
        const { key, endpoint } = TABS[tabIndex];
        const params = {
            ...(search.trim() ? { page: 1, limit: 9999 } : { page: pageNum, limit: itemsPerPage }),
            ...(certId !== 'all' && { certificationId: certId.replace('cert_', '') }),
            ...(modId !== 'all' && { moduleId: modId }),
        };
        try {
            setLoading(true);
            const res = await clienteAxios.get(endpoint, { params });
            const { rawList, page, totalPages, total } = parseResponse(res);
            setData(prev => ({ ...prev, [key]: { rows: rawList.map(t => transformTask(t, key)), page, totalPages, total } }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage, transformTask]);

    const refetch = (page = 1, search = '', cert = 'all', mod = 'all') => fetchTasks(activeTab, page, search, cert, mod);

    const fetchCertifications = async () => {
        try {
            setLoadingCerts(true);
            const res = await clienteAxios.get('/certifications/active');
            setCertifications(res.data.map((c, i) => ({
                id: `cert_${c.id}`, originalId: c.id, name: c.name,
                description: c.description, color: getCertColor(i), modules: [],
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCerts(false);
        }
    };

    const fetchCertCounts = useCallback(async (certs) => {
        const results = await Promise.allSettled(
            certs.map(c => Promise.all(
                TABS.map(({ endpoint }) =>
                    clienteAxios.get(endpoint, { params: { page: 1, limit: 1, certificationId: c.originalId } })
                )
            ))
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

    const fetchModuleCriteria = useCallback(async (moduleId) => {
        if (loadedCriteriaRef.current[moduleId]) return;
        loadedCriteriaRef.current[moduleId] = true;
        try {
            setLoadingCriteria(prev => ({ ...prev, [moduleId]: true }));
            const res = await clienteAxios.get(`/module-criterion/${moduleId}`);
            setModuleCriteria(prev => ({
                ...prev,
                [moduleId]: res.data.map(c => ({
                    id: c.id.toString(),
                    moduleId: c.moduleId.toString(),
                    title: c.title,
                    description: c.description || 'Sin descripción',
                    max_score: c.max_score,
                    icon: getCriterionIcon(c.title),
                })),
            }));
        } catch (e) {
            console.error(e);
            loadedCriteriaRef.current[moduleId] = false;
        } finally {
            setLoadingCriteria(prev => ({ ...prev, [moduleId]: false }));
        }
    }, []);

    // ─── Effects ─────────────────────────────────────────────────────────────
    useEffect(() => { fetchCertifications(); }, []);

    useEffect(() => {
        if (!certifications.length) return;
        fetchTasks(0, 1, '', 'all', 'all');
        fetchTasks(1, 1, '', 'all', 'all');
        fetchCertCounts(certifications);
    }, [certifications]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!searchMounted.current) { searchMounted.current = true; return; }
        if (certifications.length) refetch(1, debouncedSearch, selectedCert, selectedModule);
    }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchModulesByCert(selectedCert !== 'all' ? selectedCert : null);
    }, [selectedCert, fetchModulesByCert]);

    useEffect(() => () => clearTimeout(searchTimerRef.current), []);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), SEARCH_DELAY);
    };

    const clearSearch = () => {
        clearTimeout(searchTimerRef.current);
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const resetFilters = () => {
        setSelectedModule('all');
        setSelectedCert('all');
        setFilteredModules([]);
        clearSearch();
    };

    const handleTabChange = (_, newTab) => {
        setActiveTab(newTab);
        resetFilters();
        fetchTasks(newTab, 1, '', 'all', 'all');
    };

    const handleCertChange = (e) => {
        setSelectedCert(e.target.value);
        setSelectedModule('all');
        refetch(1, debouncedSearch, e.target.value, 'all');
    };

    const handleModuleChange = (e) => {
        setSelectedModule(e.target.value);
        refetch(1, debouncedSearch, selectedCert, e.target.value);
    };

    const clearFilters = () => {
        resetFilters();
        refetch(1, '', 'all', 'all');
    };

    const handlePageChange = (_, value) => {
        refetch(value, debouncedSearch, selectedCert, selectedModule);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calificar
    const openRatingModal = async (task) => {
        setSelectedTask(task);
        await fetchModuleCriteria(task.moduleId);
        setRatingModalOpen(true);
    };

    const closeRatingModal = () => { setRatingModalOpen(false); setSelectedTask(null); };

    const handleSaveRating = async (ratingsData) => {
        if (!selectedTask) return;
        try {
            setLoading(true);
            const scores = Object.entries(ratingsData).map(([criterionId, score]) => ({
                criterionId: parseInt(criterionId),
                score,
            }));

            await clienteAxios.post('/module-evaluation', { submissionId: selectedTask.id, feedback: null, scores });

            await fetchTasks(0, data.pending.page, debouncedSearch, selectedCert, selectedModule);
            await fetchTasks(1, 1, debouncedSearch, selectedCert, selectedModule);

            closeRatingModal();
            Swal.fire({
                icon: 'success',
                title: '¡Calificación guardada!',
                text: 'La tarea ha sido calificada exitosamente.',
                confirmButtonColor: '#4361ee',
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error('Error al guardar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar la calificación',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setLoading(false);
        }
    };

    // Detalle
    const openDetailModal = async (task) => {
        setSelectedTask(task);
        try {
            const { data: ev } = await clienteAxios.get(`/module-evaluation/${task.id}`);
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
        } catch (e) {
            console.error(e);
        }
        setDetailModalOpen(true);
    };

    const closeDetailModal = () => { setDetailModalOpen(false); setSelectedTask(null); };

    // ─── Derived ─────────────────────────────────────────────────────────────
    const displayRows = useMemo(() => {
        const q = debouncedSearch.trim().toLowerCase();
        if (!q) return activeList.rows;
        return activeList.rows.filter(t =>
            [t.user.name, t.user.email, String(t.id), t.moduleName, t.certificationName]
                .some(v => v.toLowerCase().includes(q))
        );
    }, [activeList.rows, debouncedSearch]);

    const stats = useMemo(() => ({
        total: data.pending.total + data.rated.total,
        pending: data.pending.total,
        reviewed: data.rated.total,
    }), [data.pending.total, data.rated.total]);

    const modalPaper = { sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
            {globalStyles}

            {/* ── Header + filtros + pestañas ── */}
            <Paper elevation={0} sx={{ borderRadius: 4, mb: 3, overflow: 'hidden', border: '1px solid #FFE6F0', boxShadow: '0 8px 24px rgba(255,92,147,0.08)' }}>
                <TaskHeader stats={stats} />

                <TaskFilters
                    selectedCert={selectedCert}
                    selectedModule={selectedModule}
                    searchTerm={searchTerm}
                    loadingCerts={loadingCerts}
                    loadingModules={loadingModules}
                    certifications={certifications}
                    filteredModules={filteredModules}
                    certCounts={certCounts}
                    hasActiveFilters={hasActiveFilters}
                    isMobile={isMobile}
                    onCertChange={handleCertChange}
                    onModuleChange={handleModuleChange}
                    onSearchChange={handleSearchChange}
                    onClearSearch={clearSearch}
                    onClearFilters={clearFilters}
                />

                <Box sx={{ bgcolor: '#FFF5FA', borderTop: '1px solid #FFE6F0', px: { xs: 1, sm: 3 }, pt: { xs: 0.5, sm: 1 } }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons={false}
                        sx={{
                            '& .MuiTabs-indicator': { bgcolor: PINK, height: 3, borderRadius: '3px 3px 0 0' },
                            '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600, color: '#757575', gap: 0.5, '&.Mui-selected': { color: PINK } },
                        }}
                    >
                        {TABS.map(({ key, label, icon, color }) => (
                            <Tab
                                key={key}
                                iconPosition="start"
                                icon={React.cloneElement(icon, { sx: { fontSize: 20 } })}
                                label={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <span>{label}</span>
                                        <Chip size="small" label={data[key].total}
                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, color: '#fff', bgcolor: color }} />
                                    </Stack>
                                }
                            />
                        ))}
                    </Tabs>
                </Box>
            </Paper>

            {/* ── Cards ── */}
            {loading ? (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Skeleton variant="rounded" height={isMobile ? 280 : 360} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : displayRows.length === 0 ? (
                <Fade in>
                    <Paper elevation={0} sx={{ p: { xs: 5, sm: 8 }, textAlign: 'center', borderRadius: 4, border: '1px solid #FFE6F0' }}>
                        <Avatar sx={{ bgcolor: '#FFF0F7', width: 72, height: 72, mx: 'auto', mb: 2 }}>
                            <SearchOffIcon sx={{ fontSize: 38, color: '#FFB3DC' }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" gutterBottom>No se encontraron tareas</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: hasActiveFilters ? 3 : 0 }}>
                            {hasActiveFilters ? 'Intenta con otros filtros' : 'No hay tareas disponibles'}
                        </Typography>
                        {hasActiveFilters && (
                            <Button variant="outlined" onClick={clearFilters} startIcon={<ClearAllIcon />}
                                sx={{ borderColor: PINK, color: PINK, borderRadius: 2, '&:hover': { borderColor: '#E94E88', bgcolor: '#FFF5FA' } }}>
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
                                    <TaskCard
                                        task={task}
                                        certColor={certifications.find(c => c.id === task.certificationId)?.color || '#757575'}
                                        isMobile={isMobile}
                                        onRate={openRatingModal}
                                        onViewDetail={openDetailModal}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>

                    {activeList.totalPages > 1 && !debouncedSearch && (
                        <Stack alignItems="center" spacing={1} sx={{ mt: { xs: 3, sm: 4 } }}>
                            <Pagination
                                count={activeList.totalPages}
                                page={activeList.page}
                                onChange={handlePageChange}
                                shape="rounded"
                                size={isMobile ? 'small' : 'medium'}
                                sx={{ '& .Mui-selected': { bgcolor: `${PINK} !important`, color: '#fff' } }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {activeList.page} de {activeList.totalPages} páginas · {activeList.total} {TABS[activeTab].label.toLowerCase()} en total
                            </Typography>
                        </Stack>
                    )}

                    {debouncedSearch && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                            {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para «{debouncedSearch}»
                        </Typography>
                    )}
                </>
            )}

            {/* ── Modals ── */}
            <RatingModal
                open={ratingModalOpen}
                onClose={closeRatingModal}
                selectedTask={selectedTask}
                moduleCriteria={moduleCriteria}
                loadingCriteria={loadingCriteria}
                onSave={handleSaveRating}
                onOpenImage={setSelectedImage}
                isMobile={isMobile}
                modalPaper={modalPaper}
            />

            <DetailModal
                open={detailModalOpen}
                onClose={closeDetailModal}
                selectedTask={selectedTask}
                onOpenImage={setSelectedImage}
                isMobile={isMobile}
                modalPaper={modalPaper}
            />

            <ImageViewer
                open={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                selectedImage={selectedImage}
                isMobile={isMobile}
            />
        </Box>
    );
};

export default Task;