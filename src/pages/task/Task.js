import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { makeStyles } from '@mui/styles';
import {
    Box,
    Button,
    Card,
    CardMedia,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    Divider,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge,
    Alert,
    AlertTitle,
    Skeleton,
    CardActions,
    CardHeader,
    Collapse,
    Fade,
    Zoom,
    Grow,
    Slide,
    useTheme,
    useMediaQuery,
    alpha,
    FormHelperText,
    CircularProgress,
    Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ImageIcon from '@mui/icons-material/Image';
import GradeIcon from '@mui/icons-material/Grade';
import BookIcon from '@mui/icons-material/Book';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChecklistIcon from '@mui/icons-material/Checklist';
import RuleIcon from '@mui/icons-material/Rule';
import clienteAxios from '../../config/Axios';
import Swal from 'sweetalert2';

const useStyles = makeStyles((theme) => ({
    filterContainer: {
        padding: 24,
        marginBottom: 24,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    },
    '@global': {
        '.swal2-container': {
            zIndex: '99999 !important',
        },
    },
}));

const Task = () => {
    const theme = useTheme();
    const classes = useStyles();

    // Responsive breakpoints
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    // Función para obtener color de certificación
    const getCertificationColor = (index) => {
        const colors = [
            '#FF6B9D', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#795548'
        ];
        return colors[index % colors.length];
    };

    // ─── Estados UI ──────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [loadingCertifications, setLoadingCertifications] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);

    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [certificateModalOpen, setCertificateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [selectedCertification, setSelectedCertification] = useState('all');
    const [selectedModule, setSelectedModule] = useState('all');
    const [imageErrors, setImageErrors] = useState({});
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [filteredModulesByCert, setFilteredModulesByCert] = useState([]);

    // ─── Datos de la API ─────────────────────────────────────────────────────
    const [certifications, setCertifications] = useState([]);
    const [modules, setModules] = useState([]);

    // Datos paginados — cada tab tiene su propia slice de datos
    const [submittedTasks, setSubmittedTasks] = useState([]);
    const [reviewedTasks, setReviewedTasks] = useState([]);

    // Paginación del servidor
    const [submittedPagination, setSubmittedPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [reviewedPagination, setReviewedPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const itemsPerPage = isMobile ? 6 : 12;

    // Paginación activa según el tab
    const activePagination = activeTab === 0 ? submittedPagination : reviewedPagination;
    const setActivePagination = activeTab === 0 ? setSubmittedPagination : setReviewedPagination;

    // ─── Criterios y calificación ─────────────────────────────────────────────
    const [moduleCriteria, setModuleCriteria] = useState({});
    const [loadingModuleCriteria, setLoadingModuleCriteria] = useState({});
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState('');

    // ─── Debounce del buscador ───────────────────────────────────────────────
    // Espera 500 ms después de que el usuario deje de escribir antes de llamar a la API
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 500);
    };

    // Limpiar timer al desmontar
    useEffect(() => () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); }, []);

    const fetchModuleCriteria = useCallback(async (moduleId) => {
        if (moduleCriteria[moduleId]) return;

        try {
            setLoadingModuleCriteria(prev => ({ ...prev, [moduleId]: true }));
            const response = await clienteAxios.get(`/module-criterion/${moduleId}`);

            const transformedCriteria = response.data.map(criterion => ({
                id: criterion.id.toString(),
                moduleId: criterion.moduleId.toString(),
                title: criterion.title,
                description: criterion.description || 'Sin descripción',
                max_score: criterion.max_score,
                icon: getCriterionIcon(criterion.title),
            }));

            setModuleCriteria(prev => ({
                ...prev,
                [moduleId]: transformedCriteria
            }));
        } catch (error) {
            console.error(`Error al obtener criterios del módulo ${moduleId}:`, error);
        } finally {
            setLoadingModuleCriteria(prev => ({ ...prev, [moduleId]: false }));
        }
    }, [moduleCriteria]);

    const getCriterionIcon = (title) => {
        const icons = {
            'Manicura': '💅',
            'Sellado': '🔒',
            'Superficie': '📐',
            'Apex': '📏',
            'Terminado': '✨',
            'Blick': '⭐',
            'Cutícula': '✂️',
            'Convexo': '📈',
            'Cóncava': '📉',
            'default': '📋'
        };

        for (const [key, icon] of Object.entries(icons)) {
            if (title.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return icons.default;
    };

    const fetchCertifications = async () => {
        try {
            setLoadingCertifications(true);
            const response = await clienteAxios.get('/certifications/active');

            const transformedCerts = response.data.map((cert, index) => ({
                id: `cert_${cert.id}`,
                originalId: cert.id,
                name: cert.name,
                description: cert.description,
                color: getCertificationColor(index),
                modules: []
            }));

            setCertifications(transformedCerts);
        } catch (error) {
            console.error('Error al obtener certificaciones:', error);
        } finally {
            setLoadingCertifications(false);
        }
    };

    const handleImageError = (taskId, imageIndex) => {
        setImageErrors(prev => ({
            ...prev,
            [`${taskId}-${imageIndex}`]: true
        }));
    };

    // ─── Helper: transforma un task crudo de la API ──────────────────────────
    const transformTask = useCallback((task, status) => {
        const certificationId = task.module?.certificationId || 1;
        const certification = certifications.find(c => c.originalId === certificationId);
        return {
            id: task.id,
            user: {
                name: task.user?.name || 'Usuario',
                email: task.user?.email || '',
                id: task.userId,
                avatar: task.user?.name
                    ? task.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                    : 'U',
            },
            certificationId: certification ? certification.id : `cert_${certificationId}`,
            certificationName: certification ? certification.name : `Certificación ${certificationId}`,
            moduleId: task.moduleId.toString(),
            moduleName: task.module?.title || `Módulo ${task.moduleId}`,
            submittedAt: task.createdAt,
            ratedAt: task.updatedAt,
            images: [
                { url: task.photo_1 ? `https://cdn.floreciendojuntas.com${task.photo_1}` : null },
                { url: task.photo_2 ? `https://cdn.floreciendojuntas.com${task.photo_2}` : null },
                { url: task.photo_3 ? `https://cdn.floreciendojuntas.com${task.photo_3}` : null },
            ].filter(img => img.url !== null),
            status,
            originalData: task,
        };
    }, [certifications]);

    // ─── Fetch Submitted (paginado + búsqueda server-side) ───────────────────
    const fetchSubmittedTasks = useCallback(async (pageNum = 1, search = '') => {
        try {
            setLoading(true);

            const params = { page: pageNum, limit: itemsPerPage };
            if (search.trim()) params.search = search.trim();

            const response = await clienteAxios.get('/module-submission/submitted', { params });

            // La API devuelve { data: [...], page, totalPages, total }
            const { data: rawList, page: currentPage, totalPages, total } = response.data;

            const transformed = rawList.map(t => transformTask(t, 'pending'));
            setSubmittedTasks(transformed);
            setSubmittedPagination({ page: currentPage, totalPages, total });

            // Extraer módulos únicos del primer fetch (sin búsqueda activa)
            if (!search.trim() && pageNum === 1) {
                const uniqueModules = [];
                transformed.forEach(task => {
                    if (!uniqueModules.find(m => m.id === task.moduleId)) {
                        uniqueModules.push({ id: task.moduleId, name: task.moduleName, certificationId: task.certificationId });
                    }
                });
                setModules(uniqueModules);
            }
        } catch (error) {
            console.error('Error al obtener tareas enviadas:', error);
        } finally {
            setLoading(false);
        }
    }, [certifications, itemsPerPage, transformTask]);

    // ─── Fetch Reviewed (paginado + búsqueda server-side) ───────────────────
    const fetchReviewedTasks = useCallback(async (pageNum = 1, search = '') => {
        try {
            setLoading(true);

            const params = { page: pageNum, limit: itemsPerPage };
            if (search.trim()) params.search = search.trim();

            const response = await clienteAxios.get('/module-submission/reviewed', { params });

            const { data: rawList, page: currentPage, totalPages, total } = response.data;

            const transformed = rawList.map(t => transformTask(t, 'rated'));
            setReviewedTasks(transformed);
            setReviewedPagination({ page: currentPage, totalPages, total });
        } catch (error) {
            console.error('Error al obtener tareas revisadas:', error);
        } finally {
            setLoading(false);
        }
    }, [certifications, itemsPerPage, transformTask]);

    // ─── Evaluación de una tarea ─────────────────────────────────────────────
    const fetchTaskEvaluation = async (submissionId) => {
        try {
            const response = await clienteAxios.get(`/module-evaluation/${submissionId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener evaluación:', error);
            return null;
        }
    };

    const fetchModulesByCertification = useCallback(async (certificationId) => {
        if (!certificationId || certificationId === 'all') {
            setFilteredModulesByCert([]);
            return;
        }

        try {
            setLoadingModules(true);
            const originalId = certificationId.replace('cert_', '');
            const response = await clienteAxios.get(`/module-certifications/${originalId}`);

            const transformedModules = response.data.map(module => ({
                id: module.id.toString(),
                name: module.title || module.name,
                certificationId: certificationId,
            }));

            setFilteredModulesByCert(transformedModules);
        } catch (error) {
            console.error('Error al obtener módulos por certificación:', error);
            setFilteredModulesByCert([]);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los módulos de esta certificación',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setLoadingModules(false);
        }
    }, []);

    useEffect(() => {
        fetchCertifications();
    }, []);

    // Carga inicial cuando las certs están listas
    useEffect(() => {
        if (certifications.length > 0) {
            fetchSubmittedTasks(1, '');
            fetchReviewedTasks(1, '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [certifications]);

    // Re-fetch al aplicar búsqueda debounced (siempre desde página 1)
    useEffect(() => {
        if (certifications.length === 0) return;
        if (activeTab === 0) {
            setSubmittedPagination(prev => ({ ...prev, page: 1 }));
            fetchSubmittedTasks(1, debouncedSearch);
        } else {
            setReviewedPagination(prev => ({ ...prev, page: 1 }));
            fetchReviewedTasks(1, debouncedSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        if (selectedCertification && selectedCertification !== 'all') {
            fetchModulesByCertification(selectedCertification);
        } else {
            setFilteredModulesByCert([]);
        }
    }, [selectedCertification, fetchModulesByCertification]);

    const getModuleTaskCount = (moduleId) => {
        const tasks = activeTab === 0 ? submittedTasks : reviewedTasks;
        return tasks.filter(task => task.moduleId === moduleId).length;
    };

    const modulesToShow = useMemo(() => {
        if (selectedCertification !== 'all' && filteredModulesByCert.length > 0) {
            return filteredModulesByCert;
        }
        return modules;
    }, [selectedCertification, filteredModulesByCert, modules]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setSelectedModule('all');
        setSelectedCertification('all');
        setSearchTerm('');
        setDebouncedSearch('');
        setFilteredModulesByCert([]);
        // Recargar el tab que se activa desde página 1
        if (newValue === 0) {
            setSubmittedPagination(prev => ({ ...prev, page: 1 }));
            fetchSubmittedTasks(1, '');
        } else {
            setReviewedPagination(prev => ({ ...prev, page: 1 }));
            fetchReviewedTasks(1, '');
        }
    };

    const handleCertificationChange = (event) => {
        const value = event.target.value;
        setSelectedCertification(value);
        setSelectedModule('all');
        // Volver a página 1
        setActivePagination(prev => ({ ...prev, page: 1 }));
    };

    // Los datos ya vienen filtrados y paginados desde el servidor.
    // Aplicamos solo filtros locales de cert/módulo sobre la página actual.
    const displayRows = useMemo(() => {
        let rows = activeTab === 0 ? submittedTasks : reviewedTasks;

        if (selectedCertification !== 'all') {
            rows = rows.filter(t => t.certificationId === selectedCertification);
        }
        if (selectedModule !== 'all') {
            rows = rows.filter(t => t.moduleId === selectedModule);
        }
        return rows;
    }, [activeTab, submittedTasks, reviewedTasks, selectedCertification, selectedModule]);

    const stats = useMemo(() => ({
        total: submittedPagination.total + reviewedPagination.total,
        pending: submittedPagination.total,
        reviewed: reviewedPagination.total,
        certifications: certifications.length,
    }), [submittedPagination.total, reviewedPagination.total, certifications.length]);

    const calculateScores = (currentRatings, moduleId) => {
        const criteria = moduleCriteria[moduleId] || [];
        if (criteria.length === 0) return { total: 0, average: 0, maxScore: 0 };

        const total = Object.values(currentRatings || ratings).reduce((sum, val) => sum + (val || 0), 0);
        const maxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);
        const average = criteria.length > 0 ? total / criteria.length : 0;

        return { total, average, maxScore };
    };

    const openRatingModal = async (task) => {
        setSelectedTask(task);

        if (!moduleCriteria[task.moduleId]) {
            await fetchModuleCriteria(task.moduleId);
        }

        const criteria = moduleCriteria[task.moduleId] || [];
        const initialRatings = {};
        criteria.forEach(criterion => {
            initialRatings[criterion.id] = 0;
        });

        setRatings(initialRatings);
        setComments('');
        setRatingModalOpen(true);
    };

    const handleSaveRating = async () => {
        if (!selectedTask) return;

        try {
            setLoading(true);

            const criteria = moduleCriteria[selectedTask.moduleId] || [];

            const evaluationData = {
                submissionId: selectedTask.id,
                feedback: comments || "Sin comentarios",
                scores: Object.entries(ratings).map(([criterionId, score]) => ({
                    criterionId: parseInt(criterionId),
                    score: score
                }))
            };

            const response = await clienteAxios.post('/module-evaluation', evaluationData);

            const total = Object.values(ratings).reduce((sum, val) => sum + (val || 0), 0);
            const maxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);
            const average = criteria.length > 0 ? total / criteria.length : 0;

            // Refrescar desde el servidor
            await fetchSubmittedTasks(submittedPagination.page, debouncedSearch);
            await fetchReviewedTasks(1, debouncedSearch);
            closeRatingModal();

            Swal.fire({
                icon: 'success',
                title: '¡Calificación guardada!',
                text: 'La tarea ha sido calificada exitosamente.',
                confirmButtonColor: '#4361ee',
                confirmButtonText: 'Aceptar',
                timer: 3000,
                timerProgressBar: true,
            });

        } catch (error) {
            console.error('Error al guardar calificación:', error);

            let errorMessage = 'Error al guardar la calificación';
            let errorTitle = 'Error';

            if (error.response) {
                errorMessage = error.response.data.message || 'Error del servidor';

                if (error.response.status === 400) {
                    errorTitle = 'Datos inválidos';
                    if (error.response.data.errors) {
                        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
                    }
                } else if (error.response.status === 401) {
                    errorTitle = 'No autorizado';
                    errorMessage = 'No tienes permisos para realizar esta acción';
                } else if (error.response.status === 404) {
                    errorTitle = 'No encontrado';
                    errorMessage = 'La tarea o los criterios no existen';
                } else if (error.response.status === 500) {
                    errorTitle = 'Error del servidor';
                    errorMessage = 'Ocurrió un error en el servidor. Intenta más tarde.';
                }
            } else if (error.request) {
                errorTitle = 'Error de conexión';
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            }

            Swal.fire({
                icon: 'error',
                title: errorTitle,
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Entendido',
            });
        } finally {
            setLoading(false);
        }
    };

    const closeRatingModal = () => {
        setRatingModalOpen(false);
        setSelectedTask(null);
        setRatings({});
        setComments('');
    };

    const openDetailModal = async (task) => {
        setSelectedTask(task);

        if (task.status === 'rated') {
            try {
                const evaluation = await fetchTaskEvaluation(task.id);
                if (evaluation) {
                    const ratingsMap = {};
                    const criteriaDetails = [];

                    evaluation.scores.forEach(score => {
                        ratingsMap[score.criterionId.toString()] = score.score;

                        if (score.criterion) {
                            criteriaDetails.push({
                                id: score.criterion.id.toString(),
                                title: score.criterion.title,
                                description: score.criterion.description || 'Sin descripción',
                                max_score: score.criterion.max_score,
                                score: score.score
                            });
                        }
                    });

                    const averageScore = evaluation.scores.length > 0
                        ? evaluation.total_score / evaluation.scores.length
                        : 0;

                    const updatedTask = {
                        ...task,
                        ratings: ratingsMap,
                        comments: evaluation.general_feedback,
                        totalScore: evaluation.total_score,
                        maxScore: evaluation.scores.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0),
                        averageScore: averageScore,
                        evaluationData: evaluation,
                        criteriaDetails: criteriaDetails
                    };
                    setSelectedTask(updatedTask);
                }
            } catch (error) {
                console.error('Error al cargar evaluación:', error);
            }
        }

        setDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedTask(null);
    };

    const openImageViewer = (image) => {
        setSelectedImage(image);
        setImageViewerOpen(true);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const closeImageViewer = () => {
        setImageViewerOpen(false);
        setSelectedImage(null);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const handleDownloadCertificate = async () => {
        if (!selectedTask) return;
        try {
            // TODO: llamar al endpoint de descarga
            setCertificateModalOpen(false);
        } catch (error) {
            console.error('Error al descargar certificado:', error);
        }
    };

    const clearFilters = () => {
        setSelectedModule('all');
        setSelectedCertification('all');
        setSearchTerm('');
        setDebouncedSearch('');
        setFilteredModulesByCert([]);
        if (activeTab === 0) {
            setSubmittedPagination(prev => ({ ...prev, page: 1 }));
            fetchSubmittedTasks(1, '');
        } else {
            setReviewedPagination(prev => ({ ...prev, page: 1 }));
            fetchReviewedTasks(1, '');
        }
    };

    // Componente de tarjeta de tarea
    const TaskCard = ({ task, onRate, onViewDetail }) => {
        const isRated = task.status === 'rated';
        const maxScore = task.maxScore || 25;
        const minScore = Math.ceil(maxScore * 0.8);
        const passedMinimum = isRated && task.totalScore >= minScore;

        const certification = certifications.find(c => c.id === task.certificationId);
        const certColor = certification?.color || '#757575';

        return (
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s',
                    border: '1px solid #e0e0e0',
                    overflow: 'visible',
                    '&:hover': {
                        transform: { xs: 'none', sm: 'translateY(-8px)' },
                        boxShadow: { xs: '0 8px 24px rgba(0,0,0,0.12)', sm: '0 16px 32px rgba(0,0,0,0.16)' },
                    },
                    position: 'relative',
                }}
            >
                {/* Círculo de estado */}
                <Box
                    sx={{
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
                        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                    }}
                >
                    {isRated
                        ? <Tooltip title="Tarea calificada"><CheckCircleIcon sx={{ color: '#ffffff', fontSize: { xs: 18, sm: 22 } }} /></Tooltip>
                        : <Tooltip title="Tarea pendiente"><PendingActionsIcon sx={{ color: '#ffffff', fontSize: { xs: 18, sm: 22 } }} /></Tooltip>
                    }
                </Box>

                {/* Header de la tarjeta */}
                <Box
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`,
                        color: '#ffffff',
                        borderTopLeftRadius: { xs: 8, sm: 12 },
                        borderTopRightRadius: { xs: 8, sm: 12 },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                        <Avatar sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            flexShrink: 0,
                        }}>
                            {task.user.avatar || <PersonIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="700"
                                sx={{
                                    color: '#ffffff',
                                    fontSize: { xs: '0.85rem', sm: '1rem' },
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.3,
                                }}
                            >
                                {task.user.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#ffffff',
                                    opacity: 0.9,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {task.user.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Cuerpo de la tarjeta */}
                <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1 }}>
                    <Stack
                        direction="row"
                        sx={{
                            mb: 2,
                            flexWrap: 'wrap',
                            columnGap: 1,
                            rowGap: 1.5,
                        }}
                    >
                        <Chip
                            icon={<BookIcon sx={{ fontSize: { xs: 13, sm: 16 } }} />}
                            label={task.moduleName}
                            size="small"
                            sx={{
                                bgcolor: '#f5f5f5',
                                color: certColor,
                                fontWeight: 600,
                                border: `1px solid ${certColor}`,
                                maxWidth: '100%',
                                height: 'auto',
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                '& .MuiChip-label': {
                                    whiteSpace: 'normal',
                                    py: 0.5,
                                },
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
                                maxWidth: '100%',
                                height: 'auto',
                                '& .MuiChip-label': {
                                    whiteSpace: 'normal',
                                    py: 0.5,
                                },
                            }}
                        />
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarTodayIcon sx={{ fontSize: { xs: 13, sm: 16 }, color: '#757575', flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#757575', fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                            {new Date(task.submittedAt).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>
                    </Box>

                    {isRated && (
                        <Box>
                            <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
                            {/* <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ color: '#000000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                        Puntuación Total
                                    </Typography>
                                    <Chip
                                        label={`${task.totalScore || 0}`}
                                        size="small"
                                        sx={{
                                            bgcolor: passedMinimum ? '#4caf50' : '#ff9800',
                                            color: '#ffffff',
                                            fontWeight: '700',
                                            fontSize: { xs: '0.68rem', sm: '0.75rem' },
                                        }}
                                    />
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={((task.totalScore || 0) / maxScore) * 100}
                                    sx={{
                                        height: { xs: 6, sm: 8 },
                                        borderRadius: 4,
                                        bgcolor: '#e0e0e0',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: passedMinimum ? '#4caf50' : '#ff9800',
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    Promedio
                                </Typography>
                                <Typography variant="body2" fontWeight="700" sx={{ color: '#000000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                    {task.averageScore ? task.averageScore.toFixed(1) : '0.0'}/5.0
                                </Typography>
                            </Box> */}
                        </Box>
                    )}
                </Box>

                {/* Acciones de la tarjeta */}
                <CardActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
                    {!isRated ? (
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<RateReviewIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                            onClick={() => onRate(task)}
                            sx={{
                                background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`,
                                color: '#ffffff',
                                fontWeight: 600,
                                py: { xs: 1, sm: 1.2 },
                                fontSize: { xs: '0.78rem', sm: '0.875rem' },
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${certColor}CC 0%, ${certColor} 100%)`,
                                },
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
                                '&:hover': {
                                    borderColor: '#FF5B91',
                                    backgroundColor: 'rgba(255,91,145,0.04)',
                                }
                            }}
                        >
                            Ver Detalle
                        </Button>
                    )}
                </CardActions>
            </Card>
        );
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
            {/* Header */}
            <Paper sx={{ borderRadius: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, overflow: 'hidden' }}>
                {/* Banner principal */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #FF5C93 0%, #f73b7a 100%)',
                    p: { xs: 2.5, sm: 3, md: 4 },
                    color: '#ffffff',
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 2.5, md: 3 },
                    }}>
                        {/* Título */}
                        <Box>
                            <Typography
                                variant="h4"
                                fontWeight="700"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 1, sm: 2 },
                                    color: '#ffffff',
                                    fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.125rem' },
                                }}
                            >
                                <GradeIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, color: '#ffffff' }} />
                                Evaluación de Tareas
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#ffffff',
                                    opacity: 0.9,
                                    mt: 0.5,
                                    fontSize: { xs: '0.85rem', sm: '1rem' },
                                }}
                            >
                                Gestiona y califica las tareas enviadas
                            </Typography>
                        </Box>

                        {/* Estadísticas */}
                        <Stack
                            direction="row"
                            spacing={{ xs: 1, sm: 2 }}
                            sx={{ width: { xs: '100%', md: 'auto' } }}
                        >
                            {[
                                { value: stats.total, label: 'Total', color: '#ffffff' },
                                { value: stats.pending, label: 'Pendientes', color: '#ffb74d' },
                                { value: stats.reviewed, label: 'Calificadas', color: '#81c784' },
                            ].map((stat, i) => (
                                <Paper
                                    key={i}
                                    sx={{
                                        p: { xs: 1.5, sm: 2 },
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        borderRadius: 2,
                                        flex: { xs: 1, md: 'none' },
                                        minWidth: { xs: 0, md: 100 },
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        fontWeight="700"
                                        sx={{
                                            color: stat.color,
                                            fontSize: { xs: '1.4rem', sm: '2.125rem' },
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#ffffff',
                                            fontSize: { xs: '0.62rem', sm: '0.75rem' },
                                            display: 'block',
                                            mt: 0.3,
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Filtros */}
                <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#ffffff' }}>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                        {/* Certificación */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small" disabled={loadingCertifications}>
                                <InputLabel sx={{ color: '#000000' }}>Certificación</InputLabel>
                                <Select
                                    value={selectedCertification}
                                    label="Certificación"
                                    onChange={handleCertificationChange}
                                    startAdornment={<SchoolIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}
                                    sx={{ color: '#000000' }}
                                >
                                    <MenuItem value="all">Todas las Certificaciones</MenuItem>
                                    {certifications.map((cert) => (
                                        <MenuItem key={cert.id} value={cert.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cert.color, flexShrink: 0 }} />
                                                <span style={{ color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {cert.name}
                                                </span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loadingCertifications && (
                                    <FormHelperText sx={{ color: '#757575' }}>Cargando certificaciones...</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Módulo */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: '#000000' }}>Módulo</InputLabel>
                                <Select
                                    value={selectedModule}
                                    label="Módulo"
                                    onChange={(e) => setSelectedModule(e.target.value)}
                                    startAdornment={<BookIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />}
                                    disabled={modulesToShow.length === 0 || loadingModules}
                                    sx={{ color: '#000000' }}
                                >
                                    <MenuItem value="all">
                                        {loadingModules ? 'Cargando módulos...' : 'Todos los Módulos'}
                                    </MenuItem>
                                    {modulesToShow.map((module) => {
                                        const taskCount = getModuleTaskCount(module.id);
                                        return (
                                            <MenuItem key={module.id} value={module.id}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: 1 }}>
                                                    <span style={{ color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {module.name}
                                                    </span>
                                                    {taskCount > 0 && (
                                                        <Chip
                                                            label={taskCount}
                                                            size="small"
                                                            sx={{
                                                                ml: 'auto',
                                                                flexShrink: 0,
                                                                height: 20,
                                                                bgcolor: activeTab === 0 ? '#ff9800' : '#4caf50',
                                                                color: '#ffffff',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                {loadingModules && (
                                    <FormHelperText sx={{ color: '#757575' }}>Cargando módulos...</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* Búsqueda */}
                        <Grid item xs={12} sm={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por usuario, email o ID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: '#757575', mr: 1, fontSize: 20 }} />,
                                    endAdornment: searchTerm && (
                                        <IconButton size="small" onClick={() => {
                                            setSearchTerm('');
                                            setDebouncedSearch('');
                                        }}>
                                            <CloseIcon fontSize="small" sx={{ color: '#757575' }} />
                                        </IconButton>
                                    ),
                                }}
                                sx={{
                                    '& .MuiInputBase-input': { color: '#000000' },
                                    '& .MuiInputLabel-root': { color: '#757575' },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0', bgcolor: '#ffffff' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            px: { xs: 1, sm: 2, md: 3 },
                            '& .MuiTab-root': {
                                minWidth: { xs: 'auto', sm: 160 },
                                px: { xs: 1.5, sm: 2 },
                            },
                        }}
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                    <span style={{
                                        color: activeTab === 0 ? '#FF5C93' : '#757575',
                                        fontSize: isMobile ? '0.78rem' : '0.875rem',
                                    }}>
                                        Pendientes
                                    </span>
                                    <Chip
                                        label={submittedPagination.total}
                                        size="small"
                                        sx={{
                                            bgcolor: '#ff9800',
                                            color: '#ffffff',
                                            height: { xs: 18, sm: 22 },
                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                        }}
                                    />
                                </Box>
                            }
                            icon={<PendingActionsIcon sx={{ color: activeTab === 0 ? '#FF5C93' : '#757575', fontSize: { xs: 18, sm: 24 } }} />}
                            iconPosition="start"
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                                    <span style={{
                                        color: activeTab === 1 ? '#FF5C93' : '#757575',
                                        fontSize: isMobile ? '0.78rem' : '0.875rem',
                                    }}>
                                        Calificadas
                                    </span>
                                    <Chip
                                        label={reviewedPagination.total}
                                        size="small"
                                        sx={{
                                            bgcolor: '#4caf50',
                                            color: '#ffffff',
                                            height: { xs: 18, sm: 22 },
                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                        }}
                                    />
                                </Box>
                            }
                            icon={<AssignmentTurnedInIcon sx={{ color: activeTab === 1 ? '#FF5C93' : '#757575', fontSize: { xs: 18, sm: 24 } }} />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>
            </Paper>

            {/* Contenido principal */}
            {loading ? (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Skeleton variant="rectangular" height={isMobile ? 280 : 360} sx={{ borderRadius: 3, bgcolor: '#f5f5f5' }} />
                        </Grid>
                    ))}
                </Grid>
            ) : displayRows.length === 0 ? (
                <Fade in={true}>
                    <Paper sx={{ p: { xs: 5, sm: 8 }, textAlign: 'center', borderRadius: { xs: 2, sm: 4 }, bgcolor: '#ffffff' }}>
                        <SearchIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#e0e0e0', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: '#757575', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} gutterBottom>
                            No se encontraron tareas
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {searchTerm || selectedCertification !== 'all' || selectedModule !== 'all'
                                ? 'Intenta con otros filtros de búsqueda'
                                : 'No hay tareas disponibles en este momento'}
                        </Typography>
                        {(searchTerm || selectedCertification !== 'all' || selectedModule !== 'all') && (
                            <Button variant="contained" onClick={clearFilters} startIcon={<ClearAllIcon />} sx={{ bgcolor: '#FE5A91' }}>
                                Limpiar Filtros
                            </Button>
                        )}
                    </Paper>
                </Fade>
            ) : (
                <>
                    <Fade in={true}>
                        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                            {displayRows.map(task => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
                                    <TaskCard task={task} onRate={openRatingModal} onViewDetail={openDetailModal} />
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>

                    {/* Paginación server-side */}
                    {activePagination.totalPages > 1 && (
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: { xs: 3, sm: 4 }, gap: 1 }}>
                            <Pagination
                                count={activePagination.totalPages}
                                page={activePagination.page}
                                onChange={(e, value) => {
                                    if (activeTab === 0) {
                                        setSubmittedPagination(prev => ({ ...prev, page: value }));
                                        fetchSubmittedTasks(value, debouncedSearch);
                                    } else {
                                        setReviewedPagination(prev => ({ ...prev, page: value }));
                                        fetchReviewedTasks(value, debouncedSearch);
                                    }
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                color="primary"
                                shape="rounded"
                                size={isMobile ? 'small' : 'medium'}
                            />
                            <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                                Página {activePagination.page} de {activePagination.totalPages}
                                {' '}·{' '}
                                {activePagination.total} {activeTab === 0 ? 'pendientes' : 'calificadas'} en total
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            {/* ─── MODAL DE CALIFICACIÓN ─────────────────────────────────── */}
            <Dialog
                open={ratingModalOpen}
                onClose={closeRatingModal}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 3,
                        m: isMobile ? 0 : 2,
                    }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#FF5B92', color: '#ffffff', py: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, pr: isMobile ? 4 : 0 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                            <RateReviewIcon sx={{ color: '#ffffff', fontSize: { xs: 18, sm: 24 } }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#ffffff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Calificar Tarea
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {selectedTask?.user.name}
                            </Typography>
                        </Box>
                    </Box>
                    {isMobile && (
                        <IconButton
                            onClick={closeRatingModal}
                            sx={{ position: 'absolute', top: 8, right: 8, color: '#ffffff' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#ffffff' }}>
                    {selectedTask && (
                        <>
                            {/* Info del módulo */}
                            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <Chip
                                                icon={<BookIcon sx={{ color: '#757575' }} />}
                                                label={selectedTask.moduleName}
                                                size="small"
                                                sx={{ color: '#000000', bgcolor: '#e0e0e0' }}
                                            />
                                            <Chip
                                                icon={<SchoolIcon sx={{ color: '#757575' }} />}
                                                label={selectedTask.certificationName}
                                                size="small"
                                                sx={{ color: '#000000', bgcolor: '#e0e0e0' }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ color: '#000000', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                            <strong>Estudiante:</strong> {selectedTask.user.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#000000', fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>
                                            <strong>Email:</strong> {selectedTask.user.email}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Imágenes */}
                            {selectedTask.images?.length > 0 && (
                                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                                    <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#000000', mb: 1.5, fontSize: { xs: '0.9rem', sm: '1rem' } }} gutterBottom>
                                        Imágenes Enviadas
                                    </Typography>
                                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                                        {selectedTask.images.map((img, idx) => (
                                            <Grid item xs={4} key={`modal-${selectedTask.id}-${idx}`}>
                                                <Paper
                                                    sx={{
                                                        cursor: 'pointer',
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        paddingTop: '100%',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => openImageViewer(img.url)}
                                                >
                                                    {!imageErrors[`${selectedTask.id}-${idx}`] ? (
                                                        <CardMedia
                                                            component="img"
                                                            image={img.url}
                                                            alt={`Img ${idx + 1}`}
                                                            onError={() => handleImageError(selectedTask.id, idx)}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0, left: 0,
                                                                width: '100%', height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: 0, left: 0,
                                                            width: '100%', height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: '#f5f5f5',
                                                        }}>
                                                            <ImageIcon sx={{ color: '#bdbdbd' }} />
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            <Divider sx={{ my: { xs: 2.5, sm: 4 }, borderColor: '#e0e0e0' }} />

                            {/* Criterios */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
                                <ChecklistIcon sx={{ color: '#FE5A91', fontSize: { xs: 20, sm: 24 } }} />
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#FE5A91', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    Criterios de Evaluación del Módulo
                                </Typography>
                            </Box>

                            {loadingModuleCriteria[selectedTask.moduleId] ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress sx={{ color: '#FE5A91' }} />
                                </Box>
                            ) : (
                                <>
                                    {moduleCriteria[selectedTask.moduleId]?.length > 0 ? (
                                        <>
                                            <Typography variant="body2" sx={{ color: '#757575', mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                                Califica cada criterio según el desempeño del estudiante
                                            </Typography>

                                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                                {moduleCriteria[selectedTask.moduleId].map((criterion) => (
                                                    <Grid item xs={12} key={criterion.id}>
                                                        <Paper sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#fafafa' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 }, alignItems: 'flex-start' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, mr: 1 }}>
                                                                    <Typography variant="h6" sx={{ color: '#000000', fontSize: { xs: '1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
                                                                        {criterion.icon}
                                                                    </Typography>
                                                                    <Box>
                                                                        <Typography fontWeight="600" sx={{ color: '#000000', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                                                                            {criterion.title}
                                                                        </Typography>
                                                                        {criterion.description && (
                                                                            <Typography variant="caption" sx={{ color: '#757575', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
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
                                                                        color: '#ffffff',
                                                                        flexShrink: 0,
                                                                        fontSize: { xs: '0.68rem', sm: '0.75rem' },
                                                                    }}
                                                                />
                                                            </Box>

                                                            {/* Botones de puntuación — responsive */}
                                                            <Box sx={{
                                                                display: 'flex',
                                                                gap: { xs: 0.75, sm: 1 },
                                                                flexWrap: 'nowrap',
                                                            }}>
                                                                {[1, 2, 3, 4, 5].map(value => (
                                                                    <Button
                                                                        key={value}
                                                                        variant={ratings[criterion.id] === value ? 'contained' : 'outlined'}
                                                                        onClick={() => setRatings({ ...ratings, [criterion.id]: value })}
                                                                        sx={{
                                                                            flex: 1,
                                                                            minWidth: 0,
                                                                            height: { xs: 38, sm: 44 },
                                                                            fontSize: { xs: '0.85rem', sm: '1rem' },
                                                                            fontWeight: 600,
                                                                            borderRadius: 1.5,
                                                                            p: 0,
                                                                            ...(ratings[criterion.id] === value && {
                                                                                background: value >= 4 ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' :
                                                                                    value >= 3 ? 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)' :
                                                                                        'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                                                                color: '#ffffff',
                                                                            }),
                                                                            ...(ratings[criterion.id] !== value && {
                                                                                borderColor: '#bdbdbd',
                                                                                color: '#000000',
                                                                                '&:hover': {
                                                                                    borderColor: '#1976d2',
                                                                                    backgroundColor: '#e3f2fd',
                                                                                }
                                                                            })
                                                                        }}
                                                                    >
                                                                        {value}
                                                                    </Button>
                                                                ))}
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            {/* Resumen */}
                                            <Paper sx={{ mt: { xs: 3, sm: 4 }, p: { xs: 2, sm: 3 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                                <Typography variant="h6" fontWeight="600" sx={{ color: '#2e7d32', fontSize: { xs: '1rem', sm: '1.25rem' } }} gutterBottom>
                                                    Resumen de Calificación
                                                </Typography>
                                                {(() => {
                                                    const { total, average, maxScore } = calculateScores(ratings, selectedTask.moduleId);
                                                    const minScore = Math.ceil(maxScore * 0.8);
                                                    const percentage = maxScore > 0 ? (total / maxScore) * 100 : 0;

                                                    return (
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                    Puntuación Total
                                                                </Typography>
                                                                <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32', fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
                                                                    {total}/{maxScore}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={12}>
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                        <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                            Progreso
                                                                        </Typography>
                                                                        <Typography variant="body2" fontWeight="600" sx={{ color: '#2e7d32', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                            {percentage.toFixed(1)}%
                                                                        </Typography>
                                                                    </Box>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={percentage}
                                                                        sx={{
                                                                            height: { xs: 8, sm: 10 },
                                                                            borderRadius: 5,
                                                                            bgcolor: '#e0e0e0',
                                                                            '& .MuiLinearProgress-bar': {
                                                                                bgcolor: total >= minScore ? '#4caf50' : '#ff9800',
                                                                                borderRadius: 5,
                                                                            },
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    );
                                                })()}
                                            </Paper>
                                        </>
                                    ) : (
                                        <Alert severity="info" sx={{ bgcolor: '#e3f2fd', color: '#01579b' }}>
                                            No hay criterios de evaluación definidos para este módulo
                                        </Alert>
                                    )}
                                </>
                            )}

                            {/* Comentarios */}
                            <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={isMobile ? 3 : 4}
                                    label="Comentarios (opcional)"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Escribe comentarios constructivos para ayudar al estudiante a mejorar..."
                                    sx={{
                                        '& .MuiInputLabel-root': { color: '#757575' },
                                        '& .MuiInputBase-input': { color: '#000000', fontSize: { xs: '0.85rem', sm: '1rem' } },
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#ffffff', gap: 1 }}>
                    <Button onClick={closeRatingModal} sx={{ color: '#757575' }} fullWidth={isMobile}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveRating}
                        variant="contained"
                        fullWidth={isMobile}
                        disabled={Object.values(ratings).every(v => v === 0) || loadingModuleCriteria[selectedTask?.moduleId]}
                        sx={{ bgcolor: '#4caf50', color: '#ffffff', '&:hover': { bgcolor: '#2e7d32' } }}
                    >
                        Guardar Calificación
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── MODAL DE DETALLE ─────────────────────────────────────── */}
            <Dialog
                open={detailModalOpen}
                onClose={closeDetailModal}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 3,
                        m: isMobile ? 0 : 2,
                    }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#FF5C93', color: '#ffffff', py: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, pr: isMobile ? 4 : 0 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                            <VisibilityIcon sx={{ color: '#ffffff', fontSize: { xs: 18, sm: 24 } }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#ffffff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                Detalle de Calificación
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {selectedTask?.user.name}
                            </Typography>
                        </Box>
                    </Box>
                    {isMobile && (
                        <IconButton
                            onClick={closeDetailModal}
                            sx={{ position: 'absolute', top: 8, right: 8, color: '#ffffff' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#ffffff' }}>
                    {selectedTask && selectedTask.status === 'rated' && (
                        <>
                            {/* Info del estudiante */}
                            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 }, bgcolor: '#f5f5f5' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#FF5723', flexShrink: 0 }}>{selectedTask.user.avatar}</Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="h6" sx={{ color: '#000000', fontSize: { xs: '0.95rem', sm: '1.25rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {selectedTask.user.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.75rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>
                                                    {selectedTask.user.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography sx={{ color: '#000000', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                            <strong>Módulo:</strong> {selectedTask.moduleName}
                                        </Typography>
                                        <Typography sx={{ color: '#000000', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                            <strong>Certificación:</strong> {selectedTask.certificationName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Imágenes */}
                            {selectedTask.images?.length > 0 && (
                                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                                    <Typography variant="h6" sx={{ color: '#000000', fontSize: { xs: '0.95rem', sm: '1.25rem' } }} gutterBottom>
                                        Imágenes
                                    </Typography>
                                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                                        {selectedTask.images.map((img, idx) => (
                                            <Grid item xs={4} key={`detail-${selectedTask.id}-${idx}`}>
                                                <Paper
                                                    sx={{ cursor: 'pointer', borderRadius: 2, overflow: 'hidden', position: 'relative', paddingTop: '100%' }}
                                                    onClick={() => openImageViewer(img.url)}
                                                >
                                                    {!imageErrors[`${selectedTask.id}-${idx}`] ? (
                                                        <CardMedia
                                                            component="img"
                                                            image={img.url}
                                                            alt={`Img ${idx + 1}`}
                                                            onError={() => handleImageError(selectedTask.id, idx)}
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
                                </Box>
                            )}

                            <Divider sx={{ my: { xs: 2.5, sm: 4 }, borderColor: '#e0e0e0' }} />

                            {/* Tabla de calificaciones — responsiva */}
                            <Typography variant="h6" sx={{ color: '#000000', fontSize: { xs: '0.95rem', sm: '1.25rem' }, mb: 1.5 }}>
                                Calificaciones por Criterio
                            </Typography>

                            <TableContainer component={Paper} sx={{ mb: { xs: 3, sm: 4 }, overflowX: 'auto' }}>
                                <Table size={isMobile ? 'small' : 'medium'}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ color: '#000000', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                Criterio
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: '#000000', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                                                Calif.
                                            </TableCell>
                                            {!isMobile && (
                                                <TableCell align="center" sx={{ color: '#000000', fontWeight: 600 }}>
                                                    Máx.
                                                </TableCell>
                                            )}
                                            <TableCell align="center" sx={{ color: '#000000', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                {isMobile ? '%' : 'Porcentaje'}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedTask.evaluationData?.scores.map((scoreItem) => {
                                            const criterion = scoreItem.criterion;
                                            const percentage = (scoreItem.score / (criterion?.max_score || 5)) * 100;

                                            return (
                                                <TableRow key={scoreItem.id}>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography fontWeight="500" sx={{ color: '#000000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                                {criterion?.title || `Criterio ${scoreItem.criterionId}`}
                                                            </Typography>
                                                            {criterion?.description && !isMobile && (
                                                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                                                    {criterion.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={isMobile ? `${scoreItem.score}/${criterion?.max_score || 5}` : `${scoreItem.score}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: scoreItem.score >= 4 ? '#e8f5e9' :
                                                                    scoreItem.score >= 3 ? '#fff3e0' : '#ffebee',
                                                                color: scoreItem.score >= 4 ? '#2e7d32' :
                                                                    scoreItem.score >= 3 ? '#ed6c02' : '#c62828',
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                            }}
                                                        />
                                                    </TableCell>
                                                    {!isMobile && (
                                                        <TableCell align="center" sx={{ color: '#757575' }}>
                                                            {criterion?.max_score || 5}
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, justifyContent: 'center' }}>
                                                            {!isMobile && (
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={percentage}
                                                                    sx={{
                                                                        width: 80,
                                                                        height: 8,
                                                                        borderRadius: 4,
                                                                        bgcolor: '#e0e0e0',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: percentage >= 80 ? '#4caf50' :
                                                                                percentage >= 60 ? '#ff9800' : '#f44336',
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                            <Typography variant="caption" sx={{ color: '#757575', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                                {percentage.toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Resumen con datos de la evaluación */}
                            <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f7ecf0', borderRadius: 2 }}>
                                <Grid container spacing={{ xs: 2, sm: 3 }}>
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            Puntuación Total
                                        </Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93', fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
                                            {selectedTask.evaluationData?.total_score || selectedTask.totalScore}
                                            <Typography component="span" variant="body1" sx={{ color: '#64748b', ml: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                /{selectedTask.evaluationData?.scores?.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0) || selectedTask.maxScore}
                                            </Typography>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            Criterios Evaluados
                                        </Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93', fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
                                            {selectedTask.evaluationData?.scores?.length || 0}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {selectedTask.evaluationData && (
                                    <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(selectedTask.evaluationData.total_score /
                                                selectedTask.evaluationData.scores.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0)) * 100}
                                            sx={{
                                                height: { xs: 6, sm: 8 },
                                                borderRadius: 4,
                                                bgcolor: '#e2e8f0',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: selectedTask.evaluationData.total_score >=
                                                        (selectedTask.evaluationData.scores.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0) * 0.8)
                                                        ? '#10b981' : '#f59e0b',
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                )}

                                {(selectedTask.evaluationData?.general_feedback || selectedTask.comments) && (
                                    <Box sx={{ mt: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, borderTop: '1px solid #e2e8f0' }}>
                                        <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                            Comentarios del Evaluador
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
                                            {selectedTask.evaluationData?.general_feedback || selectedTask.comments}
                                        </Typography>
                                    </Box>
                                )}

                                {selectedTask.evaluationData && (
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                            Evaluado el: {new Date(selectedTask.evaluationData.evaluated_at).toLocaleString('es-MX', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#ffffff' }}>
                    <Button
                        onClick={closeDetailModal}
                        variant="contained"
                        fullWidth={isMobile}
                        sx={{ bgcolor: '#FF5C93', color: '#ffffff', '&:hover': { bgcolor: '#e0456e' } }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── MODAL DE CERTIFICADO ─────────────────────────────────── */}
            <Dialog
                open={certificateModalOpen}
                onClose={() => setCertificateModalOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, m: isMobile ? 0 : 2 } }}
            >
                <DialogTitle sx={{ bgcolor: '#ff9800', color: '#000000', textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                    <EmojiEventsIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: '#000000', mb: 2 }} />
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#000000', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                        ¡Felicidades!
                    </Typography>
                    {isMobile && (
                        <IconButton
                            onClick={() => setCertificateModalOpen(false)}
                            sx={{ position: 'absolute', top: 8, right: 8, color: '#000000' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center', bgcolor: '#ffffff' }}>
                    {selectedTask && (
                        <>
                            <Typography variant="h5" fontWeight="600" sx={{ color: '#000000', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} gutterBottom>
                                {selectedTask.user.name}
                            </Typography>
                            <Chip
                                icon={<BookIcon sx={{ color: '#ffffff' }} />}
                                label={selectedTask.moduleName}
                                sx={{ mb: 3, bgcolor: '#1976d2', color: '#ffffff' }}
                            />
                            <Typography variant="body1" sx={{ color: '#757575', fontSize: { xs: '0.85rem', sm: '1rem' } }} paragraph>
                                Ha completado exitosamente la tarea
                            </Typography>
                            <Paper sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ color: '#757575', fontSize: { xs: '0.8rem', sm: '0.875rem' } }} gutterBottom>
                                    Puntuación Obtenida
                                </Typography>
                                <Typography variant="h1" sx={{ color: '#2e7d32', fontSize: { xs: '3rem', sm: '6rem' } }} fontWeight="700">
                                    {selectedTask.totalScore}
                                    <Typography component="span" variant="h4" sx={{ color: '#757575', fontSize: { xs: '1.2rem', sm: '2.125rem' } }}>
                                        /{selectedTask.maxScore || 25}
                                    </Typography>
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#757575', fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                                    Promedio: {selectedTask.averageScore}/5.0
                                </Typography>
                            </Paper>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 }, justifyContent: 'center', gap: 2, bgcolor: '#ffffff', flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button
                        onClick={() => setCertificateModalOpen(false)}
                        variant="outlined"
                        fullWidth={isMobile}
                        sx={{ borderColor: '#757575', color: '#757575' }}
                    >
                        Cerrar
                    </Button>
                    <Button
                        onClick={handleDownloadCertificate}
                        variant="contained"
                        fullWidth={isMobile}
                        startIcon={<DownloadIcon />}
                        sx={{ bgcolor: '#ff9800', color: '#000000', '&:hover': { bgcolor: '#f57c00' } }}
                    >
                        Descargar Certificado
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── VISOR DE IMÁGENES ─────────────────────────────────────── */}
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
                    sx={{
                        position: 'relative',
                        minHeight: isMobile ? '100vh' : 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        userSelect: 'none',
                    }}
                    onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.15 : 0.15;
                        setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.5), 4));
                    }}
                    onMouseDown={(e) => {
                        setIsDragging(true);
                        setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
                    }}
                    onMouseMove={(e) => {
                        if (isDragging) {
                            setImagePosition({
                                x: e.clientX - dragStart.x,
                                y: e.clientY - dragStart.y,
                            });
                        }
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    // Touch events para móvil
                    onTouchStart={(e) => {
                        if (e.touches.length === 1) {
                            setIsDragging(true);
                            setDragStart({ x: e.touches[0].clientX - imagePosition.x, y: e.touches[0].clientY - imagePosition.y });
                        }
                    }}
                    onTouchMove={(e) => {
                        if (isDragging && e.touches.length === 1) {
                            setImagePosition({
                                x: e.touches[0].clientX - dragStart.x,
                                y: e.touches[0].clientY - dragStart.y,
                            });
                        }
                    }}
                    onTouchEnd={() => setIsDragging(false)}
                >
                    {/* Botón cerrar */}
                    <IconButton
                        onClick={closeImageViewer}
                        sx={{
                            position: 'absolute', top: 8, right: 8, zIndex: 10,
                            bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Controles de zoom */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: { xs: 24, sm: 16 },
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'rgba(0,0,0,0.55)',
                        borderRadius: 4,
                        px: 2,
                        py: 0.5,
                    }}>
                        <IconButton size="small"
                            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                            sx={{ color: '#fff' }}
                        >
                            <Typography sx={{ fontSize: 22, lineHeight: 1 }}>−</Typography>
                        </IconButton>
                        <Typography sx={{ color: '#fff', minWidth: 50, textAlign: 'center', fontSize: 14 }}>
                            {Math.round(zoomLevel * 100)}%
                        </Typography>
                        <IconButton size="small"
                            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 4))}
                            sx={{ color: '#fff' }}
                        >
                            <Typography sx={{ fontSize: 22, lineHeight: 1 }}>+</Typography>
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5 }} />
                        <IconButton size="small"
                            onClick={() => { setZoomLevel(1); setImagePosition({ x: 0, y: 0 }); }}
                            sx={{ color: '#fff' }}
                        >
                            <Typography sx={{ fontSize: 12 }}>Reset</Typography>
                        </IconButton>
                    </Box>

                    {/* Imagen */}
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
                                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`,
                                transition: isDragging ? 'transform 0.05s linear' : 'transform 0.2s ease',
                                cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
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

export default Task;