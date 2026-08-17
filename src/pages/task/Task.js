import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
    Box, Button, Fade, Grid, Paper, Pagination, Skeleton, Tab, Tabs, 
    Typography, useMediaQuery, useTheme 
} from '@mui/material';
// ✅ CORRECTO: Importaciones de MUI Icons
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { makeStyles } from '@mui/styles';

import clienteAxios from '../../config/Axios';
import TaskHeader from './components/TaskHeader';
import TaskFilters from './components/TaskFilters';
import TaskCard from './components/TaskCard';
import RatingModal from './components/RatingModal';
import DetailModal from './components/DetailModal';
import CertificateModal from './components/CertificateModal';
import ImageViewer from './components/ImageViewer';
import { getCertColor, parseResponse, getTotal } from './utils/Helpers';
import { ITEMS_PER_PAGE, ITEMS_PER_PAGE_MOBILE, SEARCH_DELAY } from './utils/Constans';
import Swal from 'sweetalert2';

const useStyles = makeStyles(() => ({
    '@global': { '.swal2-container': { zIndex: '99999 !important' } },
}));

const Task = () => {
    const theme = useTheme();
    useStyles();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ─── State ────────────────────────────────────────────────────────────────
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
    const [certificateModalOpen, setCertificateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);

    const [selectedCert, setSelectedCert] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');
    const [filteredModules, setFilteredModules] = useState([]);

    const [certifications, setCertifications] = useState([]);
    const [submittedTasks, setSubmittedTasks] = useState([]);
    const [reviewedTasks, setReviewedTasks] = useState([]);
    const [submittedPage, setSubmittedPage] = useState({ page: 1, totalPages: 1, total: 0 });
    const [reviewedPage, setReviewedPage] = useState({ page: 1, totalPages: 1, total: 0 });
    const [moduleCriteria, setModuleCriteria] = useState({});
    const [loadingCriteria, setLoadingCriteria] = useState({});
    const loadedCriteriaRef = useRef({});
    const [certCounts, setCertCounts] = useState({});

    const itemsPerPage = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE;
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
    const buildParams = useCallback((pageNum, search, certId, modId) => ({
        ...(search?.trim() ? { page: 1, limit: 9999 } : { page: pageNum, limit: itemsPerPage }),
        ...(certId && certId !== 'all' && { certificationId: certId.replace('cert_', '') }),
        ...(modId && modId !== 'all' && { moduleId: modId }),
    }), [itemsPerPage]);

    // ─── fetchTasks ───────────────────────────────────────────────────────────
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
                    max_score: c.max_score, 
                    icon: c.title.includes('Manicura') ? '💅' : 
                          c.title.includes('Sellado') ? '🔒' :
                          c.title.includes('Superficie') ? '📐' :
                          c.title.includes('Apex') ? '📏' :
                          c.title.includes('Terminado') ? '✨' :
                          c.title.includes('Blick') ? '⭐' :
                          c.title.includes('Cutícula') ? '✂️' :
                          c.title.includes('Convexo') ? '📈' :
                          c.title.includes('Cóncava') ? '📉' : '📋',
                })),
            }));
        } catch (e) {
            console.error(e);
            loadedCriteriaRef.current[moduleId] = false;
        } finally { setLoadingCriteria(prev => ({ ...prev, [moduleId]: false })); }
    }, []);

    // ─── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => { fetchCertifications(); }, []);

    useEffect(() => {
        if (certifications.length === 0) return;
        fetchTasks(true, 1, '', 'all', 'all');
        fetchTasks(false, 1, '', 'all', 'all');
        fetchCertCounts(certifications);
    }, [certifications]);

    useEffect(() => {
        if (!searchMounted.current) { searchMounted.current = true; return; }
        if (certifications.length === 0) return;
        refetch(1, debouncedSearch, selectedCert, selectedModule);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchModulesByCert(selectedCert !== 'all' ? selectedCert : null);
    }, [selectedCert, fetchModulesByCert]);

    useEffect(() => () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); }, []);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => setDebouncedSearch(e.target.value), SEARCH_DELAY);
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

    // ─── Rating Handlers ──────────────────────────────────────────────────────
    const openRatingModal = async (task) => {
        setSelectedTask(task);
        await fetchModuleCriteria(task.moduleId);
        setRatingModalOpen(true);
    };

    const closeRatingModal = () => { 
        setRatingModalOpen(false); 
        setSelectedTask(null); 
    };

    // En Task.js
const handleSaveRating = async (ratingsData) => {  // ✅ Recibe ratings como parámetro
    if (!selectedTask) return;
    try {
        setLoading(true);
        // ✅ Usar ratingsData en lugar del state ratings
        const scores = Object.entries(ratingsData).map(([criterionId, score]) => ({ 
            criterionId: parseInt(criterionId), 
            score 
        }));
        
        await clienteAxios.post('/module-evaluation', {
            submissionId: selectedTask.id,
            feedback: null, // o comments si quieres agregar comentarios
            scores: scores,
        });
        
        // Recargar las tareas
        await fetchTasks(true, submittedPage.page, debouncedSearch, selectedCert, selectedModule);
        await fetchTasks(false, 1, debouncedSearch, selectedCert, selectedModule);
        
        // Cerrar el modal y mostrar éxito
        closeRatingModal();
        Swal.fire({ 
            icon: 'success', 
            title: '¡Calificación guardada!', 
            text: 'La tarea ha sido calificada exitosamente.',
            confirmButtonColor: '#4361ee', 
            timer: 3000, 
            timerProgressBar: true 
        });
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

    // ─── Detail Handlers ──────────────────────────────────────────────────────
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

    // ─── Image Viewer Handlers ───────────────────────────────────────────────
    const openImageViewer = (url) => { 
        setSelectedImage(url); 
        setImageViewerOpen(true); 
    };

    const closeImageViewer = () => { 
        setImageViewerOpen(false); 
        setSelectedImage(null); 
    };

    // ─── Certificate Handler ──────────────────────────────────────────────────
    const openCertificateModal = (task) => {
        setSelectedTask(task);
        setCertificateModalOpen(true);
    };

    // ─── Computed Values ──────────────────────────────────────────────────────
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

    const modalPaper = { sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
            {/* ── Header ── */}
            <Paper sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}>
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
                                        <span style={{ color: activeTab === i ? '#FF5C93' : '#757575', fontSize: isMobile ? '0.78rem' : '0.875rem' }}>
                                            {tab.label}
                                        </span>
                                        <span style={{ 
                                            background: tab.chipColor, 
                                            color: '#fff', 
                                            borderRadius: 16, 
                                            padding: '0 8px', 
                                            fontSize: '0.65rem', 
                                            height: 20, 
                                            display: 'flex', 
                                            alignItems: 'center' 
                                        }}>
                                            {tab.total}
                                        </span>
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
                        <Typography variant="h5" sx={{ color: '#757575', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} gutterBottom>
                            No se encontraron tareas
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                            {hasActiveFilters ? 'Intenta con otros filtros' : 'No hay tareas disponibles'}
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
                                        <TaskCard 
                                            task={task} 
                                            certColor={certColor} 
                                            isMobile={isMobile}
                                            onRate={openRatingModal} 
                                            onViewDetail={openDetailModal} 
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Fade>

                    {activePage.totalPages > 1 && !debouncedSearch && (
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: { xs: 3, sm: 4 }, gap: 1 }}>
                            <Pagination 
                                count={activePage.totalPages} 
                                page={activePage.page} 
                                onChange={handlePageChange} 
                                color="primary" 
                                shape="rounded" 
                                size={isMobile ? 'small' : 'medium'} 
                            />
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

            {/* ── Modals ── */}
            <RatingModal
                open={ratingModalOpen}
                onClose={closeRatingModal}
                selectedTask={selectedTask}
                moduleCriteria={moduleCriteria}
                loadingCriteria={loadingCriteria}
                onSave={handleSaveRating}
                onOpenImage={openImageViewer}
                isMobile={isMobile}
                modalPaper={modalPaper}
            />

            <DetailModal
                open={detailModalOpen}
                onClose={closeDetailModal}
                selectedTask={selectedTask}
                onOpenImage={openImageViewer}
                isMobile={isMobile}
                modalPaper={modalPaper}
            />

            <CertificateModal
                open={certificateModalOpen}
                onClose={() => setCertificateModalOpen(false)}
                selectedTask={selectedTask}
                isMobile={isMobile}
                modalPaper={modalPaper}
            />

            <ImageViewer
                open={imageViewerOpen}
                onClose={closeImageViewer}
                selectedImage={selectedImage}
                isMobile={isMobile}
            />
        </Box>
    );
};

export default Task;