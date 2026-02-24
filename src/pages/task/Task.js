import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
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

    // Función para obtener color de certificación
    const getCertificationColor = (index) => {
        const colors = [
            '#FF6B9D', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#795548'
        ];
        return colors[index % colors.length];
    };

    // Estados
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCertifications, setLoadingCertifications] = useState(false);
    const [loadingModules, setLoadingModules] = useState(false);
    const [loadingCriteria, setLoadingCriteria] = useState(false);
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
    // Estado para módulos filtrados por certificación
    const [filteredModulesByCert, setFilteredModulesByCert] = useState([]);

    // Estados para los datos de los endpoints
    const [certifications, setCertifications] = useState([]);
    const [modules, setModules] = useState([]);
    const [submittedTasks, setSubmittedTasks] = useState([]);
    const [reviewedTasks, setReviewedTasks] = useState([]);

    // Estado para los criterios de evaluación por módulo
    const [moduleCriteria, setModuleCriteria] = useState({});
    const [loadingModuleCriteria, setLoadingModuleCriteria] = useState({});

    // Estado para las calificaciones
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState('');

    const [page, setPage] = useState(1);
    const itemsPerPage = 12; // 12 tarjetas = 4 columnas x 3 filas

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCertification, selectedModule, activeTab]);

    // Función para obtener criterios de un módulo específico
    const fetchModuleCriteria = useCallback(async (moduleId) => {
        if (moduleCriteria[moduleId]) return;

        try {
            setLoadingModuleCriteria(prev => ({ ...prev, [moduleId]: true }));
            const response = await clienteAxios.get(`/module-criterion/${moduleId}`);
            console.log(`Criterios del módulo ${moduleId}:`, response.data);

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

    // Función para asignar iconos a los criterios
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

    // Función para obtener certificaciones activas
    const fetchCertifications = async () => {
        try {
            setLoadingCertifications(true);
            const response = await clienteAxios.get('/certifications/active');
            console.log('Certificaciones activas:', response.data);

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

    // Función para manejar errores de carga de imágenes
    const handleImageError = (taskId, imageIndex) => {
        setImageErrors(prev => ({
            ...prev,
            [`${taskId}-${imageIndex}`]: true
        }));
    };

    // Función para obtener las tareas enviadas (submitted)
    const fetchSubmittedTasks = async () => {
        try {
            setLoading(true);
            const response = await clienteAxios.get('/module-submission/submitted');
            console.log('Tareas enviadas:', response.data);

            const transformedTasks = response.data.map(task => {
                const certificationId = task.module?.certificationId || 1;
                const certification = certifications.find(c => c.originalId === certificationId);

                return {
                    id: task.id,
                    user: {
                        name: task.user?.name || 'Usuario',
                        email: task.user?.email || '',
                        id: task.userId,
                        avatar: task.user?.name ? task.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'
                    },
                    certificationId: certification ? certification.id : `cert_${certificationId}`,
                    certificationName: certification ? certification.name : `Certificación ${certificationId}`,
                    moduleId: task.moduleId.toString(),
                    moduleName: task.module?.title || `Módulo ${task.moduleId}`,
                    submittedAt: task.createdAt,
                    images: [
                        { url: task.photo_1 ? `https://cdn.floreciendojuntas.com${task.photo_1}` : null, original: task.photo_1 },
                        { url: task.photo_2 ? `https://cdn.floreciendojuntas.com${task.photo_2}` : null, original: task.photo_2 },
                        { url: task.photo_3 ? `https://cdn.floreciendojuntas.com${task.photo_3}` : null, original: task.photo_3 },
                    ].filter(img => img.url !== null),
                    status: 'pending',
                    originalData: task
                };
            });

            setSubmittedTasks(transformedTasks);

            const uniqueModules = [];
            transformedTasks.forEach(task => {
                if (!uniqueModules.find(m => m.id === task.moduleId)) {
                    uniqueModules.push({
                        id: task.moduleId,
                        name: task.moduleName,
                        certificationId: task.certificationId
                    });
                }
            });
            setModules(uniqueModules);

        } catch (error) {
            console.error('Error al obtener tareas enviadas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener la evaluación de una tarea
    const fetchTaskEvaluation = async (submissionId) => {
        try {
            const response = await clienteAxios.get(`/module-evaluation/${submissionId}`);
            console.log('Evaluación de la tarea:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al obtener evaluación:', error);
            return null;
        }
    };

    // Función para obtener las tareas revisadas (reviewed)
    const fetchReviewedTasks = async () => {
        try {
            setLoading(true);
            const response = await clienteAxios.get('/module-submission/reviewed');
            console.log('Tareas revisadas:', response.data);

            const transformedTasks = await Promise.all(response.data.map(async (task) => {
                let certificationId = 'cert_1';
                let certificationName = 'Certificación General';

                if (task.module?.certification) {
                    certificationId = `cert_${task.module.certification.id}`;
                    certificationName = task.module.certification.name;
                } else if (task.module?.certificationId) {
                    const certification = certifications.find(c => c.originalId === task.module.certificationId);
                    certificationId = certification ? certification.id : `cert_${task.module.certificationId}`;
                    certificationName = certification ? certification.name : `Certificación ${task.module.certificationId}`;
                }

                // Obtener la evaluación real si existe
                const evaluation = await fetchTaskEvaluation(task.id);

                // Calcular averageScore de manera segura
                let averageScore = 4.0; // valor por defecto
                if (evaluation && evaluation.scores && evaluation.scores.length > 0) {
                    averageScore = evaluation.total_score / evaluation.scores.length;
                }

                return {
                    id: task.id,
                    user: {
                        name: task.user?.name || 'Usuario',
                        email: task.user?.email || '',
                        id: task.userId,
                        avatar: task.user?.name ? task.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'
                    },
                    certificationId: certificationId,
                    certificationName: certificationName,
                    moduleId: task.moduleId.toString(),
                    moduleName: task.module?.title || `Módulo ${task.moduleId}`,
                    submittedAt: task.createdAt,
                    ratedAt: task.updatedAt,
                    images: [
                        { url: task.photo1 || (task.photo_1 ? `https://cdn.floreciendojuntas.com${task.photo_1}` : null) },
                        { url: task.photo2 || (task.photo_2 ? `https://cdn.floreciendojuntas.com${task.photo_2}` : null) },
                        { url: task.photo3 || (task.photo_3 ? `https://cdn.floreciendojuntas.com${task.photo_3}` : null) },
                    ].filter(img => img.url !== null),
                    status: 'rated',
                    ratings: evaluation ? evaluation.scores.reduce((acc, score) => {
                        acc[score.criterionId.toString()] = score.score;
                        return acc;
                    }, {}) : {},
                    totalScore: evaluation ? evaluation.total_score : 20,
                    maxScore: evaluation ? evaluation.scores.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0) : 25,
                    averageScore: averageScore,
                    comments: evaluation?.general_feedback || 'Tarea revisada correctamente',
                    certificateDownloaded: false,
                    evaluationData: evaluation,
                    originalData: task
                };
            }));

            setReviewedTasks(transformedTasks);

        } catch (error) {
            console.error('Error al obtener tareas revisadas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener módulos por certificación
    const fetchModulesByCertification = useCallback(async (certificationId) => {
        if (!certificationId || certificationId === 'all') {
            setFilteredModulesByCert([]);
            return;
        }

        try {
            setLoadingModules(true);
            // Extraer el ID original de la certificación (quitamos el prefijo 'cert_')
            const originalId = certificationId.replace('cert_', '');

            // Usar el endpoint correcto: /module-certifications/{id}
            const response = await clienteAxios.get(`/module-certifications/${originalId}`);

            console.log('Módulos por certificación:', response.data);

            // Transformar los módulos según la estructura que devuelve el endpoint
            const transformedModules = response.data.map(module => ({
                id: module.id.toString(),
                name: module.title || module.name,
                certificationId: certificationId,
            }));

            setFilteredModulesByCert(transformedModules);
        } catch (error) {
            console.error('Error al obtener módulos por certificación:', error);
            setFilteredModulesByCert([]);

            // Mostrar mensaje de error con SweetAlert
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

    // Cargar certificaciones al inicio
    useEffect(() => {
        fetchCertifications();
    }, []);

    // Cargar tareas después de tener las certificaciones
    useEffect(() => {
        if (certifications.length > 0) {
            fetchSubmittedTasks();
            fetchReviewedTasks();
        }
    }, [certifications]);

    // Efecto para cargar módulos cuando se selecciona una certificación
    useEffect(() => {
        if (selectedCertification && selectedCertification !== 'all') {
            fetchModulesByCertification(selectedCertification);
        } else {
            setFilteredModulesByCert([]);
        }
    }, [selectedCertification, fetchModulesByCertification]);

    // Función para obtener el conteo de tareas por módulo
    const getModuleTaskCount = (moduleId) => {
        const tasks = activeTab === 0 ? submittedTasks : reviewedTasks;
        return tasks.filter(task => task.moduleId === moduleId).length;
    };

    // Filtrar módulos para el selector (usa los módulos de la API si hay certificación seleccionada, sino usa todos)
    const modulesToShow = useMemo(() => {
        if (selectedCertification !== 'all' && filteredModulesByCert.length > 0) {
            return filteredModulesByCert;
        }
        return modules;
    }, [selectedCertification, filteredModulesByCert, modules]);

    // Cambio de tab
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setSelectedModule('all');
        setSelectedCertification('all');
        setSearchTerm('');
        setFilteredModulesByCert([]);
    };

    // Manejar cambio de certificación
    const handleCertificationChange = (event) => {
        const value = event.target.value;
        setSelectedCertification(value);
        setSelectedModule('all');
    };

    // Obtener tareas según el tab activo
    const getTasksToDisplay = () => {
        return activeTab === 0 ? submittedTasks : reviewedTasks;
    };

    // Filtrado de tareas
    const displayRows = useMemo(() => {
        let filtered = getTasksToDisplay();

        if (selectedCertification !== 'all') {
            filtered = filtered.filter((task) => task.certificationId === selectedCertification);
        }

        if (selectedModule !== 'all') {
            filtered = filtered.filter((task) => task.moduleId === selectedModule);
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter((task) => {
                const userName = task.user?.name?.toLowerCase() || '';
                const userEmail = task.user?.email?.toLowerCase() || '';
                const taskId = `TASK-${task.id}`.toLowerCase();
                const moduleName = task.moduleName?.toLowerCase() || '';
                const certName = task.certificationName?.toLowerCase() || '';

                return userName.includes(search) ||
                    userEmail.includes(search) ||
                    taskId.includes(search) ||
                    moduleName.includes(search) ||
                    certName.includes(search);
            });
        }

        return filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }, [searchTerm, selectedModule, selectedCertification, activeTab, submittedTasks, reviewedTasks]);

    // Calcular estadísticas
    const stats = useMemo(() => {
        return {
            total: submittedTasks.length + reviewedTasks.length,
            pending: submittedTasks.length,
            reviewed: reviewedTasks.length,
            certifications: certifications.length
        };
    }, [submittedTasks, reviewedTasks, certifications]);

    // Calcular puntuación total y promedio basado en los criterios del módulo
    const calculateScores = (currentRatings, moduleId) => {
        const criteria = moduleCriteria[moduleId] || [];
        if (criteria.length === 0) return { total: 0, average: 0, maxScore: 0 };

        const total = Object.values(currentRatings || ratings).reduce((sum, val) => sum + (val || 0), 0);
        const maxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);
        const average = criteria.length > 0 ? total / criteria.length : 0;

        return { total, average, maxScore };
    };

    // Abrir modal de calificación y cargar criterios del módulo
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

    // Guardar calificación
    const handleSaveRating = async () => {
        if (!selectedTask) return;

        try {
            setLoading(true);

            const criteria = moduleCriteria[selectedTask.moduleId] || [];

            // Preparar los datos en el formato requerido por el endpoint
            const evaluationData = {
                submissionId: selectedTask.id,
                feedback: comments || "Sin comentarios",
                scores: Object.entries(ratings).map(([criterionId, score]) => ({
                    criterionId: parseInt(criterionId),
                    score: score
                }))
            };

            console.log('Enviando datos de evaluación:', evaluationData);

            // Enviar al endpoint /module-evaluation
            const response = await clienteAxios.post('/module-evaluation', evaluationData);

            console.log('Respuesta del servidor:', response.data);

            // Calcular puntuaciones para la interfaz
            const total = Object.values(ratings).reduce((sum, val) => sum + (val || 0), 0);
            const maxScore = criteria.reduce((sum, c) => sum + c.max_score, 0);
            const average = criteria.length > 0 ? total / criteria.length : 0;

            const ratedTask = {
                ...selectedTask,
                status: 'rated',
                ratings: { ...ratings },
                totalScore: total,
                averageScore: parseFloat(Number(average).toFixed(2)),
                maxScore: maxScore,
                comments: comments,
                ratedAt: new Date().toISOString(),
                certificateDownloaded: false,
            };

            // Actualizar los estados locales
            setSubmittedTasks(submittedTasks.filter(t => t.id !== selectedTask.id));
            setReviewedTasks([ratedTask, ...reviewedTasks]);
            closeRatingModal();

            // Mostrar mensaje de éxito con SweetAlert
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

            // Mostrar mensaje de error más detallado con SweetAlert
            let errorMessage = 'Error al guardar la calificación';
            let errorTitle = 'Error';

            if (error.response) {
                console.error('Respuesta del servidor:', error.response.data);
                errorMessage = error.response.data.message || 'Error del servidor';

                // Si es error de validación, mostrar campos específicos
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

    // Cerrar modal de calificación
    const closeRatingModal = () => {
        setRatingModalOpen(false);
        setSelectedTask(null);
        setRatings({});
        setComments('');
    };

    // Abrir modal de detalle y cargar evaluación si existe
    const openDetailModal = async (task) => {
        setSelectedTask(task);

        // Si la tarea está calificada, obtener la evaluación real
        if (task.status === 'rated') {
            try {
                const evaluation = await fetchTaskEvaluation(task.id);
                if (evaluation) {
                    // Crear un mapa de calificaciones usando los datos de la evaluación
                    const ratingsMap = {};
                    const criteriaDetails = [];

                    evaluation.scores.forEach(score => {
                        ratingsMap[score.criterionId.toString()] = score.score;

                        // Guardar también la información completa del criterio si está disponible
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

                    // Calcular averageScore de manera segura
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

    // Cerrar modal de detalle
    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedTask(null);
    };

    // Visor de imágenes
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

    // Descargar certificado
    const handleDownloadCertificate = async () => {
        if (!selectedTask) return;

        try {
            console.log('Descargando certificado para:', selectedTask);
            setReviewedTasks(reviewedTasks.map(task =>
                task.id === selectedTask.id
                    ? { ...task, certificateDownloaded: true }
                    : task
            ));
            setCertificateModalOpen(false);
        } catch (error) {
            console.error('Error al descargar certificado:', error);
        }
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSelectedModule('all');
        setSelectedCertification('all');
        setSearchTerm('');
        setFilteredModulesByCert([]);
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
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s',
                    border: '1px solid #e0e0e0',
                    overflow: 'visible', // 👈 clave para que salga el círculo
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 32px rgba(0,0,0,0.16)',
                    },
                    position: 'relative',
                }}
            >
                {/* Círculo de estado mitad dentro mitad fuera */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -18,
                        right: -6,
                        zIndex: 1,
                        width: 45,
                        height: 45,
                        borderRadius: '50%',
                        bgcolor: isRated ? '#4caf50' : '#ff9800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                        // border: '3px solid #ffffff',
                    }}
                >
                    {isRated
                        ? <Tooltip title="Tarea calificada"><CheckCircleIcon sx={{ color: '#ffffff', fontSize: 22 }} /></Tooltip>
                        : <Tooltip title="Tarea pendiente"><PendingActionsIcon sx={{ color: '#ffffff', fontSize: 22 }} /></Tooltip>
                    }
                </Box>

                <Box
                    sx={{
                        p: 2.5,
                        background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`,
                        color: '#ffffff',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', width: 48, height: 48 }}>
                            {task.user.avatar || <PersonIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="700"
                                sx={{
                                    color: '#ffffff',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {task.user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#ffffff', opacity: 0.9 }} noWrap>
                                {task.user.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ p: 2.5, flex: 1 }}>
                    <Stack
                        direction="row"
                        sx={{
                            mb: 2,
                            flexWrap: 'wrap',
                            columnGap: 1,   // espacio horizontal
                            rowGap: 1.5,    // 👈 espacio vertical cuando hace wrap
                        }}
                    >
                        <Chip
                            icon={<BookIcon sx={{ fontSize: 16 }} />}
                            label={task.moduleName}
                            size="small"
                            sx={{
                                bgcolor: '#f5f5f5',
                                color: certColor,
                                fontWeight: 600,
                                border: `1px solid ${certColor}`,
                                maxWidth: '100%',
                                height: 'auto',
                                '& .MuiChip-label': {
                                    whiteSpace: 'normal',
                                },
                            }}
                        />

                        <Chip
                            icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                            label={task.certificationName}
                            size="small"
                            sx={{
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 600,
                            }}
                        />
                    </Stack>


                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, color: '#757575' }} />
                        <Typography variant="caption" sx={{ color: '#757575' }}>
                            {new Date(task.submittedAt).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>
                    </Box>

                    {task.images && task.images.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: '#757575', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ImageIcon fontSize="small" sx={{ color: '#757575' }} />
                                {task.images.length} imagen(es)
                            </Typography>
                            <Grid container spacing={1}>
                                {task.images.map((img, idx) => (
                                    <Grid item xs={4} key={`${task.id}-img-${idx}`}>
                                        <Paper
                                            sx={{
                                                cursor: 'pointer',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                paddingTop: '100%',
                                                '&:hover': { opacity: 0.8 },
                                            }}
                                            onClick={() => openImageViewer(img.url)}
                                        >
                                            {!imageErrors[`${task.id}-${idx}`] ? (
                                                <CardMedia
                                                    component="img"
                                                    image={img.url}
                                                    alt={`Imagen ${idx + 1}`}
                                                    onError={() => handleImageError(task.id, idx)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
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

                    {isRated && (
                        <Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ color: '#000000' }}>
                                        Puntuación Total
                                    </Typography>
                                    <Chip
                                        label={`${task.totalScore || 0}/${maxScore}`}
                                        size="small"
                                        sx={{
                                            bgcolor: passedMinimum ? '#4caf50' : '#ff9800',
                                            color: '#ffffff',
                                            fontWeight: '700',
                                        }}
                                    />
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={((task.totalScore || 0) / maxScore) * 100}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: '#e0e0e0',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: passedMinimum ? '#4caf50' : '#ff9800',
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                    Promedio
                                </Typography>
                                <Typography variant="body2" fontWeight="700" sx={{ color: '#000000' }}>
                                    {task.averageScore ? task.averageScore.toFixed(1) : '0.0'}/5.0
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                <CardActions sx={{ p: 2.5, pt: 0 }}>
                    {!isRated ? (
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<RateReviewIcon />}
                            onClick={() => onRate(task)}
                            sx={{
                                background: `linear-gradient(135deg, ${certColor} 0%, ${certColor}CC 100%)`,
                                color: '#ffffff',
                                fontWeight: 600,
                                py: 1.2,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${certColor}CC 0%, ${certColor} 100%)`,
                                },
                            }}
                        >
                            Calificar Tarea
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<VisibilityIcon />}
                                onClick={() => onViewDetail(task)}
                                sx={{
                                    borderColor: '#FF5B91',
                                    color: '#FF5B91',
                                    fontWeight: 600,
                                    '&:hover': {
                                        borderColor: '#FF5B91',
                                        backgroundColor: 'rgba(25,118,210,0.04)',
                                    }
                                }}
                            >
                                Ver Detalle
                            </Button>
                            {/* {passedMinimum && (
                                <IconButton
                                    onClick={() => {
                                        setSelectedTask(task);
                                        setCertificateModalOpen(true);
                                    }}
                                    sx={{ bgcolor: '#fff3e0', color: '#ed6c02' }}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            )} */}
                        </>
                    )}
                </CardActions>
            </Card>
        );
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Paper sx={{ borderRadius: 4, mb: 4, overflow: 'hidden' }}>
                <Box sx={{ background: 'linear-gradient(135deg, #FF5C93 0%, #f73b7a 100%)', p: 4, color: '#ffffff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#ffffff' }}>
                                <GradeIcon fontSize="large" sx={{ color: '#ffffff' }} />
                                Evaluación de Tareas
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#ffffff', opacity: 0.9, mt: 1 }}>
                                Gestiona y califica las tareas enviadas
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, minWidth: 100 }}>
                                <Typography variant="h4" fontWeight="700" align="center" sx={{ color: '#ffffff' }}>{stats.total}</Typography>
                                <Typography variant="caption" align="center" display="block" sx={{ color: '#ffffff' }}>Total</Typography>
                            </Paper>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, minWidth: 100 }}>
                                <Typography variant="h4" fontWeight="700" align="center" sx={{ color: '#ffb74d' }}>{stats.pending}</Typography>
                                <Typography variant="caption" align="center" display="block" sx={{ color: '#ffffff' }}>Pendientes</Typography>
                            </Paper>
                            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, minWidth: 100 }}>
                                <Typography variant="h4" fontWeight="700" align="center" sx={{ color: '#81c784' }}>{stats.reviewed}</Typography>
                                <Typography variant="caption" align="center" display="block" sx={{ color: '#ffffff' }}>Calificadas</Typography>
                            </Paper>
                        </Stack>
                    </Box>
                </Box>

                {/* Filtros */}
                <Box sx={{ p: 3, bgcolor: '#ffffff' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small" disabled={loadingCertifications}>
                                <InputLabel sx={{ color: '#000000' }}>Certificación</InputLabel>
                                <Select
                                    value={selectedCertification}
                                    label="Certificación"
                                    onChange={handleCertificationChange}
                                    startAdornment={<SchoolIcon sx={{ color: '#757575', mr: 1 }} />}
                                    sx={{ color: '#000000' }}
                                >
                                    <MenuItem value="all">Todas las Certificaciones</MenuItem>
                                    {certifications.map((cert) => (
                                        <MenuItem key={cert.id} value={cert.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cert.color }} />
                                                <span style={{ color: '#000000' }}>{cert.name}</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loadingCertifications && <FormHelperText sx={{ color: '#757575' }}>Cargando certificaciones...</FormHelperText>}
                            </FormControl>
                        </Grid>

                        {/* Selector de Módulos */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: '#000000' }}>Módulo</InputLabel>
                                <Select
                                    value={selectedModule}
                                    label="Módulo"
                                    onChange={(e) => setSelectedModule(e.target.value)}
                                    startAdornment={<BookIcon sx={{ color: '#757575', mr: 1 }} />}
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
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <span style={{ color: '#000000', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {module.name}
                                                    </span>
                                                    {taskCount > 0 && (
                                                        <Chip
                                                            label={taskCount}
                                                            size="small"
                                                            sx={{
                                                                ml: 1,
                                                                height: 20,
                                                                bgcolor: activeTab === 0 ? '#ff9800' : '#4caf50',
                                                                color: '#ffffff'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                {loadingModules && <FormHelperText sx={{ color: '#757575' }}>Cargando módulos...</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por usuario, email o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: '#757575', mr: 1 }} />,
                                    endAdornment: searchTerm && (
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
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

                        {/* <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={clearFilters}
                                startIcon={<ClearAllIcon />}
                                disabled={selectedCertification === 'all' && selectedModule === 'all' && !searchTerm}
                                sx={{
                                    borderColor: '#1976d2',
                                    color: '#1976d2',
                                    '&:hover': {
                                        borderColor: '#1565c0',
                                        backgroundColor: 'rgba(25,118,210,0.04)',
                                    }
                                }}
                            >
                                Limpiar
                            </Button>
                        </Grid> */}
                    </Grid>

                    {/* {(searchTerm || selectedCertification !== 'all' || selectedModule !== 'all') && (
                        <Fade in={true}>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FilterListIcon sx={{ color: '#757575', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                    Mostrando {displayRows.length} de {getTasksToDisplay().length} tareas
                                </Typography>
                                <Button size="small" onClick={clearFilters} sx={{ ml: 'auto', color: '#1976d2' }}>
                                    Ver todas
                                </Button>
                            </Box>
                        </Fade>
                    )} */}
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: '#e0e0e0', bgcolor: '#ffffff' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 3 }}>
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span style={{ color: activeTab === 0 ? '#FF5C93' : '#757575' }}>Pendientes</span>
                                    <Chip label={submittedTasks.length} size="small" sx={{ bgcolor: '#ff9800', color: '#ffffff' }} />
                                </Box>
                            }
                            icon={<PendingActionsIcon sx={{ color: activeTab === 0 ? '#FF5C93' : '#757575' }} />}
                            iconPosition="start"
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span style={{ color: activeTab === 1 ? '#FF5C93' : '#757575' }}>Calificadas</span>
                                    <Chip label={reviewedTasks.length} size="small" sx={{ bgcolor: '#4caf50', color: '#ffffff' }} />
                                </Box>
                            }
                            icon={<AssignmentTurnedInIcon sx={{ color: activeTab === 1 ? '#FF5C93' : '#757575' }} />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>
            </Paper>

            {/* Contenido principal */}
            {loading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Grid item xs={12} md={4} key={i}>
                            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, bgcolor: '#f5f5f5' }} />
                        </Grid>
                    ))}
                </Grid>
            ) : displayRows.length === 0 ? (
                <Fade in={true}>
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: '#ffffff' }}>
                        <SearchIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: '#757575' }} gutterBottom>
                            No se encontraron tareas
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                            {searchTerm || selectedCertification !== 'all' || selectedModule !== 'all'
                                ? 'Intenta con otros filtros de búsqueda'
                                : 'No hay tareas disponibles en este momento'}
                        </Typography>
                        {(searchTerm || selectedCertification !== 'all' || selectedModule !== 'all') && (
                            <Button variant="contained" onClick={clearFilters} startIcon={<ClearAllIcon />} sx={{ bgcolor: '#1976d2' }}>
                                Limpiar Filtros
                            </Button>
                        )}
                    </Paper>
                </Fade>
            ) : (
                <>
                    <Fade in={true}>
                        <Grid container spacing={3}>
                            {displayRows
                                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                                .map(task => (
                                    <Grid item xs={12} md={4} lg={3} key={task.id}>
                                        <TaskCard task={task} onRate={openRatingModal} onViewDetail={openDetailModal} />
                                    </Grid>
                                ))}
                        </Grid>
                    </Fade>

                    {displayRows.length > itemsPerPage && (
                        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                            <Pagination
                                count={Math.ceil(displayRows.length / itemsPerPage)}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Modal de Calificación */}
            <Dialog open={ratingModalOpen} onClose={closeRatingModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#FF5B92', color: '#ffffff', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><RateReviewIcon sx={{ color: '#ffffff' }} /></Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#ffffff' }}>Calificar Tarea</Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>{selectedTask?.user.name}</Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
                    {selectedTask && (
                        <>
                            {/* Información del módulo */}
                            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Chip
                                            icon={<BookIcon sx={{ color: '#757575' }} />}
                                            label={selectedTask.moduleName}
                                            sx={{ mr: 1, color: '#000000', bgcolor: '#e0e0e0' }}
                                        />
                                        <Chip
                                            icon={<SchoolIcon sx={{ color: '#757575' }} />}
                                            label={selectedTask.certificationName}
                                            sx={{ color: '#000000', bgcolor: '#e0e0e0' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ color: '#000000' }}>
                                            <strong>Estudiante:</strong> {selectedTask.user.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#000000' }}>
                                            <strong>Email:</strong> {selectedTask.user.email}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Imágenes */}
                            {selectedTask.images?.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#000000' }} gutterBottom>
                                        Imágenes Enviadas
                                    </Typography>
                                    <Grid container spacing={2}>
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
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
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

                            <Divider sx={{ my: 4, borderColor: '#e0e0e0' }} />

                            {/* Criterios de Evaluación del Módulo */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <ChecklistIcon sx={{ color: '#FE5A91' }} />
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#FE5A91' }}>
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
                                            <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
                                                Califica cada criterio según el desempeño del estudiante
                                            </Typography>

                                            <Grid container spacing={3}>
                                                {moduleCriteria[selectedTask.moduleId].map((criterion) => (
                                                    <Grid item xs={12} key={criterion.id}>
                                                        <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography variant="h6" sx={{ color: '#000000' }}>{criterion.icon}</Typography>
                                                                    <Box>
                                                                        <Typography fontWeight="600" sx={{ color: '#000000' }}>{criterion.title}</Typography>
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
                                                                        color: '#ffffff',
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                {[1, 2, 3, 4, 5].map(value => (
                                                                    <Button
                                                                        key={value}
                                                                        variant={ratings[criterion.id] === value ? 'contained' : 'outlined'}
                                                                        onClick={() => setRatings({ ...ratings, [criterion.id]: value })}
                                                                        sx={{
                                                                            minWidth: 50,
                                                                            height: 44,
                                                                            fontSize: '1rem',
                                                                            fontWeight: 600,
                                                                            borderRadius: 1.5,
                                                                            ...(ratings[criterion.id] === value && {
                                                                                background: value >= 4 ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' :
                                                                                    value >= 3 ? 'linear-gradient(135deg, #ff9800 0%, #ed6c02 100%)' :
                                                                                        'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                                                                color: '#ffffff',
                                                                                '&:hover': {
                                                                                    background: value >= 4 ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' :
                                                                                        value >= 3 ? 'linear-gradient(135deg, #ed6c02 0%, #c43c00 100%)' :
                                                                                            'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                                                                                }
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
                                            <Paper sx={{ mt: 4, p: 3, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                                <Typography variant="h6" fontWeight="600" sx={{ color: '#2e7d32' }} gutterBottom>
                                                    Resumen de Calificación
                                                </Typography>
                                                {(() => {
                                                    const { total, average, maxScore } = calculateScores(ratings, selectedTask.moduleId);
                                                    const minScore = Math.ceil(maxScore * 0.8);
                                                    const percentage = maxScore > 0 ? (total / maxScore) * 100 : 0;

                                                    return (
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                                                    Puntuación Total
                                                                </Typography>
                                                                <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32' }}>
                                                                    {total}/{maxScore}
                                                                </Typography>
                                                            </Grid>
                                                            {/* <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#757575' }}>
                                                                    Promedio
                                                                </Typography>
                                                                <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32' }}>
                                                                    {average.toFixed(1)}/5.0
                                                                </Typography>
                                                            </Grid> */}
                                                            <Grid item xs={12}>
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                        <Typography variant="body2" sx={{ color: '#757575' }}>
                                                                            Progreso
                                                                        </Typography>
                                                                        <Typography variant="body2" fontWeight="600" sx={{ color: '#2e7d32' }}>
                                                                            {percentage.toFixed(1)}%
                                                                        </Typography>
                                                                    </Box>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={percentage}
                                                                        sx={{
                                                                            height: 10,
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
                                                            <Grid item xs={12}>
                                                                {/* <Box sx={{
                                                                    p: 2,
                                                                    borderRadius: 1,
                                                                    bgcolor: total >= minScore ? '#c8e6c9' : '#fff3e0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}>
                                                                    {total >= minScore ? (
                                                                        <EmojiEventsIcon sx={{ color: '#2e7d32' }} />
                                                                    ) : (
                                                                        <TrendingUpIcon sx={{ color: '#ed6c02' }} />
                                                                    )}
                                                                    <Box>
                                                                        <Typography variant="subtitle2" sx={{ color: total >= minScore ? '#2e7d32' : '#ed6c02', fontWeight: 'bold' }}>
                                                                            {total >= minScore ? '¡Aprobado!' : 'Sigue Mejorando'}
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ color: total >= minScore ? '#2e7d32' : '#ed6c02' }}>
                                                                            {total >= minScore
                                                                                ? 'El estudiante ha alcanzado el puntaje mínimo para obtener el certificado.'
                                                                                : `Necesita ${minScore - total} puntos más para el certificado (mínimo ${minScore}/${maxScore}).`}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box> */}
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
                            <Box sx={{ mt: 4 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Comentarios (opcional)"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Escribe comentarios constructivos para ayudar al estudiante a mejorar..."
                                    sx={{
                                        '& .MuiInputLabel-root': { color: '#757575' },
                                        '& .MuiInputBase-input': { color: '#000000' },
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
                    <Button onClick={closeRatingModal} sx={{ color: '#757575' }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveRating}
                        variant="contained"
                        disabled={Object.values(ratings).every(v => v === 0) || loadingModuleCriteria[selectedTask?.moduleId]}
                        sx={{ bgcolor: '#4caf50', color: '#ffffff', '&:hover': { bgcolor: '#2e7d32' } }}
                    >
                        Guardar Calificación
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Detalle con criterios desde la evaluación */}
            <Dialog open={detailModalOpen} onClose={closeDetailModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#FF5C93', color: '#ffffff', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><VisibilityIcon sx={{ color: '#ffffff' }} /></Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#ffffff' }}>Detalle de Calificación</Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.9 }}>{selectedTask?.user.name}</Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
                    {selectedTask && selectedTask.status === 'rated' && (
                        <>
                            {/* Información del estudiante */}
                            <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#FF5723' }}>{selectedTask.user.avatar}</Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ color: '#000000' }}>{selectedTask.user.name}</Typography>
                                                <Typography variant="body2" sx={{ color: '#757575' }}>{selectedTask.user.email}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography sx={{ color: '#000000' }}><strong>Módulo:</strong> {selectedTask.moduleName}</Typography>
                                        <Typography sx={{ color: '#000000' }}><strong>Certificación:</strong> {selectedTask.certificationName}</Typography>
                                        {/* <Typography sx={{ color: '#000000' }}><strong>Envío:</strong> {new Date(selectedTask.submittedAt).toLocaleString()}</Typography> */}
                                        {/* <Typography sx={{ color: '#000000' }}>
                                            <strong>Calificación:</strong> {selectedTask.evaluationData ? new Date(selectedTask.evaluationData.evaluated_at).toLocaleString() : new Date(selectedTask.ratedAt).toLocaleString()}
                                        </Typography> */}
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Imágenes */}
                            {selectedTask.images?.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ color: '#000000' }} gutterBottom>Imágenes</Typography>
                                    <Grid container spacing={2}>
                                        {selectedTask.images.map((img, idx) => (
                                            <Grid item xs={4} key={`detail-${selectedTask.id}-${idx}`}>
                                                <Paper
                                                    sx={{
                                                        cursor: 'pointer',
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        paddingTop: '100%',
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
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
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

                            <Divider sx={{ my: 4, borderColor: '#e0e0e0' }} />

                            {/* Tabla de calificaciones usando los datos de la evaluación */}
                            <Typography variant="h6" sx={{ color: '#000000' }} gutterBottom>Calificaciones por Criterio</Typography>
                            <TableContainer component={Paper} sx={{ mb: 4 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ color: '#000000', fontWeight: 600 }}>Criterio</TableCell>
                                            <TableCell align="center" sx={{ color: '#000000', fontWeight: 600 }}>Calificación</TableCell>
                                            <TableCell align="center" sx={{ color: '#000000', fontWeight: 600 }}>Puntaje Máximo</TableCell>
                                            <TableCell align="center" sx={{ color: '#000000', fontWeight: 600 }}>Porcentaje</TableCell>
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
                                                            <Typography fontWeight="500" sx={{ color: '#000000' }}>
                                                                {criterion?.title || `Criterio ${scoreItem.criterionId}`}
                                                            </Typography>
                                                            {criterion?.description && (
                                                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                                                    {criterion.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={`${scoreItem.score}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: scoreItem.score >= 4 ? '#e8f5e9' :
                                                                    scoreItem.score >= 3 ? '#fff3e0' : '#ffebee',
                                                                color: scoreItem.score >= 4 ? '#2e7d32' :
                                                                    scoreItem.score >= 3 ? '#ed6c02' : '#c62828',
                                                                fontWeight: 600,
                                                                minWidth: 40,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ color: '#757575' }}>
                                                        {criterion?.max_score || 5}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
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
                                                            <Typography variant="caption" sx={{ color: '#757575', minWidth: 40 }}>
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
                            <Paper sx={{ p: 3, bgcolor: '#f7ecf0', borderRadius: 2 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>Puntuación Total</Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>
                                            {selectedTask.evaluationData?.total_score || selectedTask.totalScore}
                                            <Typography component="span" variant="body1" sx={{ color: '#64748b', ml: 1 }}>
                                                /{selectedTask.evaluationData?.scores?.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0) || selectedTask.maxScore}
                                            </Typography>
                                        </Typography>
                                    </Grid>
                                    {/* <Grid item xs={12} md={4}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>Promedio</Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>
                                            {selectedTask.averageScore.toFixed(1)}/5.0
                                        </Typography>
                                    </Grid> */}
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>Criterios Evaluados</Typography>
                                        <Typography variant="h4" fontWeight="700" sx={{ color: '#FF5C93' }}>
                                            {selectedTask.evaluationData?.scores?.length || 0}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {/* Barra de progreso total */}
                                {selectedTask.evaluationData && (
                                    <Box sx={{ mt: 3 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(selectedTask.evaluationData.total_score /
                                                selectedTask.evaluationData.scores.reduce((sum, s) => sum + (s.criterion?.max_score || 5), 0)) * 100}
                                            sx={{
                                                height: 8,
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

                                {/* Comentarios */}
                                {(selectedTask.evaluationData?.general_feedback || selectedTask.comments) && (
                                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                                        <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                                            Comentarios del Evaluador
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                            {selectedTask.evaluationData?.general_feedback || selectedTask.comments}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Fecha de evaluación */}
                                {selectedTask.evaluationData && (
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
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
                <DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
                    <Button onClick={closeDetailModal} variant="contained" sx={{ bgcolor: '#FF5C93', color: '#ffffff' }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Certificado */}
            <Dialog open={certificateModalOpen} onClose={() => setCertificateModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#ff9800', color: '#000000', textAlign: 'center', py: 4 }}>
                    <EmojiEventsIcon sx={{ fontSize: 80, color: '#000000', mb: 2 }} />
                    <Typography variant="h4" fontWeight="700" sx={{ color: '#000000' }}>¡Felicidades!</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4, textAlign: 'center', bgcolor: '#ffffff' }}>
                    {selectedTask && (
                        <>
                            <Typography variant="h5" fontWeight="600" sx={{ color: '#000000' }} gutterBottom>
                                {selectedTask.user.name}
                            </Typography>
                            <Chip
                                icon={<BookIcon sx={{ color: '#ffffff' }} />}
                                label={selectedTask.moduleName}
                                sx={{ mb: 3, bgcolor: '#1976d2', color: '#ffffff' }}
                            />
                            <Typography variant="body1" sx={{ color: '#757575' }} paragraph>
                                Ha completado exitosamente la tarea
                            </Typography>
                            <Paper sx={{ p: 4, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ color: '#757575' }} gutterBottom>
                                    Puntuación Obtenida
                                </Typography>
                                <Typography variant="h1" sx={{ color: '#2e7d32' }} fontWeight="700">
                                    {selectedTask.totalScore}
                                    <Typography component="span" variant="h4" sx={{ color: '#757575' }}>
                                        /{selectedTask.maxScore || 25}
                                    </Typography>
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#757575' }}>
                                    Promedio: {selectedTask.averageScore}/5.0
                                </Typography>
                            </Paper>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, bgcolor: '#ffffff' }}>
                    <Button onClick={() => setCertificateModalOpen(false)} variant="outlined" sx={{ borderColor: '#757575', color: '#757575' }}>
                        Cerrar
                    </Button>
                    <Button
                        onClick={handleDownloadCertificate}
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{ bgcolor: '#ff9800', color: '#000000', '&:hover': { bgcolor: '#f57c00' } }}
                    >
                        Descargar Certificado
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Visor de Imágenes */}
            <Dialog
                open={imageViewerOpen}
                onClose={closeImageViewer}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' } }}
                BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.5)' } }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        minHeight: 400,
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
                        position: 'absolute', bottom: 16, left: '50%',
                        transform: 'translateX(-50%)', zIndex: 10,
                        display: 'flex', alignItems: 'center', gap: 1,
                        bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 4, px: 2, py: 0.5
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
                                maxHeight: '85vh',
                                objectFit: 'contain',
                                borderRadius: 8,
                                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`,
                                transition: isDragging ? 'transform 0.05s linear' : 'transform 0.2s ease',
                                cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
                                willChange: 'transform',        // ✅ le dice al navegador que optimice esta propiedad
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