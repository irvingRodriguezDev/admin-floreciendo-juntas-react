import React, { useContext, useEffect, useReducer, useState, useMemo, useRef } from "react";
import {
    Grid,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    InputAdornment,
    Paper,
    IconButton,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    LinearProgress,
    Avatar,
    Tooltip,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Badge,
    Fade,
    Slide,
    Grow,
    Zoom,
} from "@mui/material";
import {
    PlayCircleOutline,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PlayCircleOutline as PlayIcon,
    Close as CloseIcon,
    FilterAlt as FilterAltIcon,
    ClearAll as ClearAllIcon,
    StopCircle as StopCircleIcon,
    VisibilityOutlined as VisibilityIcon,
    ChatBubbleOutline as ChatIcon,
    PersonOutline as PersonIcon,
    Block as BlockIcon,
    LiveTv as LiveTvIcon,
    Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import { makeStyles } from '@mui/styles';
import Swal from "sweetalert2";
import LiveContext from "../../context/LiveContext/LiveContext";
import io from "socket.io-client";
import useLiveComments from "./useLiveComments";
import AuthContext from "../../context/AuthContext/AuthContext";

const useStyles = makeStyles(() => ({
    filterContainer: {
        padding: 24,
        marginBottom: 24,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #FFEEF8 0%, #FFE0F0 100%)',
        border: '1px solid #FFD6EA',
        boxShadow: '0 4px 20px rgba(255, 105, 180, 0.12)',
    },
    filterHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    '@global': {
        '.swal2-container': {
            zIndex: '99999 !important',
        },
    },
}));

const Live = () => {
    const classes = useStyles();
    const history = useHistory();

    const VISIBLE_COMMENTS = 6;
    const SCROLL_COMMENTS = 15;
    const videoContainerRef = useRef(null);
    const commentsContainerRef = useRef(null);
    const fullscreenCommentsRef = useRef(null);
    const previousCommentsLength = useRef(0);

    // CONTEXTO
    const {
        lives,
        obtenerLives,
        cargando,
        eliminarLive
    } = useContext(LiveContext);

    const { usuario } = useContext(AuthContext);

    const roleId = usuario?.roleId;

    // MODAL DE ADMIN LIVE
    const [openAdminModal, setOpenAdminModal] = useState(false);
    const [selectedLive, setSelectedLive] = useState(null);

    // ESTADO DE FULLSCREEN
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showCommentsInFullscreen, setShowCommentsInFullscreen] = useState(true);

    const { comments, sendComment, deleteComment } =
        useLiveComments(selectedLive?.id);

    const [commentText, setCommentText] = useState("");

    const liveStats = useMemo(() => ({
        comments: comments.length,
    }), [comments]);

    // ESTADOS DEL FILTRO
    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { valueStatus: "Todos", searchTerm: "" }
    );

    const [filterItems, setFilterItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // PAGINACIÓN
    const [rowsState, setRowsState] = useState({
        page: 0,
        pageSize: 7,
    });

    // CARGA INICIAL
    useEffect(() => {
        obtenerLives();
    }, []);

    // SCROLL AUTOMÁTICO PARA NUEVOS COMENTARIOS
    useEffect(() => {
        // Para el chat normal (column-reverse): scrollTop = 0 muestra los más nuevos
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = 0;
        }

        // Para fullscreen (column normal): scrollTop = scrollHeight muestra los más nuevos
        if (fullscreenCommentsRef.current && showCommentsInFullscreen) {
            fullscreenCommentsRef.current.scrollTop = fullscreenCommentsRef.current.scrollHeight;
        }

        previousCommentsLength.current = comments.length;
    }, [comments]); // 👈 quita la condición del if, que siempre haga scroll

    // DETECTAR CAMBIOS DE FULLSCREEN
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleFullscreenError = (event) => {
            console.log('Fullscreen error event:', event);
            setIsFullscreen(false);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        document.addEventListener('fullscreenerror', handleFullscreenError);
        document.addEventListener('webkitfullscreenerror', handleFullscreenError);
        document.addEventListener('mozfullscreenerror', handleFullscreenError);
        document.addEventListener('MSFullscreenError', handleFullscreenError);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

            document.removeEventListener('fullscreenerror', handleFullscreenError);
            document.removeEventListener('webkitfullscreenerror', handleFullscreenError);
            document.removeEventListener('mozfullscreenerror', handleFullscreenError);
            document.removeEventListener('MSFullscreenError', handleFullscreenError);
        };
    }, []);

    const filters = [
        { label: 'Título', title: 'title' },
        { label: 'Estado', title: 'status' },
    ];

    // LABELS Y COLORES DE ESTADO
    const statusLabels = {
        scheduled: 'Programado',
        live: 'En vivo',
        ended: 'Finalizado',
    };

    const statusColors = {
        scheduled: { bg: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)', color: '#fff' },
        live: { bg: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: '#fff' },
        ended: { bg: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)', color: '#fff' },
    };

    // ABRIR MODAL DE ADMIN
    const handleOpenAdminModal = (live) => {
        console.log("LIVE ABIERTO:", live.id);
        setSelectedLive(live);
        setOpenAdminModal(true);
        previousCommentsLength.current = 0;
    };

    // CERRAR MODAL
    const handleCloseAdminModal = () => {
        setOpenAdminModal(false);
        setSelectedLive(null);
        previousCommentsLength.current = 0;
    };

    // ELIMINAR COMENTARIO
    const handleDeleteComment = (commentId) => {
        console.log("Deleting message:", commentId);
        deleteComment(commentId);
    };

    const handleSendComment = () => {
        if (!commentText.trim()) return;
        sendComment(commentText);
        setCommentText("");
    };

    // FINALIZAR LIVE
    const handleEndLive = () => {
        Swal.fire({
            title: '¿Finalizar transmisión?',
            text: 'Esta acción terminará el live para todos los espectadores',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5350',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '¡Finalizado!',
                    text: 'La transmisión ha terminado exitosamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                handleCloseAdminModal();
            }
        });
    };

    // THUMBNAIL
    const getImage = (live) => {
        return live.thumbnail_url ? live.thumbnail_url : "/no-image.jpg";
    };

    // FECHA FORMATEADA
    const formatDate = (dateString) => {
        if (!dateString) return "Sin fecha";
        const date = new Date(dateString);
        return date.toLocaleString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // FILTRADO CON BÚSQUEDA
    const displayRows = useMemo(() => {
        let filtered = (lives || []).filter(l => !!l?.title);

        if (state.searchTerm) {
            const search = state.searchTerm.toLowerCase();
            filtered = filtered.filter((row) => {
                const title = row.title?.toLowerCase() || '';
                const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                return title.includes(search) || status.includes(search);
            });
        }

        if (state.valueStatus.toLowerCase() !== "todos") {
            filtered = filtered.filter((l) =>
                l.status?.toLowerCase() === state.valueStatus.toLowerCase()
            );
        }

        if (filterItems.length > 0) {
            filtered = filtered.filter((row) =>
                filterItems.every((filter) => {
                    const field = filter.fields.selectedField;
                    const value = filter.fields.filterValue.toLowerCase();
                    if (field === 'title') {
                        return row.title?.toLowerCase().includes(value);
                    } else if (field === 'status') {
                        const status = statusLabels[row.status]?.toLowerCase() || row.status?.toLowerCase() || '';
                        return status.includes(value);
                    }
                    return false;
                })
            );
        }

        return filtered;
    }, [lives, state.searchTerm, state.valueStatus, filterItems]);

    const handleChange = (id) => (e) => {
        const { name, value } = e.target;
        setFilterItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, fields: { ...item.fields, [name]: value } } : item
            )
        );
    };

    const handleReset = () => {
        setFilterItems([]);
        setShowFilters(false);
        dispatch({ valueStatus: "Todos", searchTerm: "" });
    };

    const addFilter = () => {
        const newItem = {
            id: Date.now(),
            fields: {
                selectedField: filters[0].title,
                filterValue: '',
            },
        };
        setFilterItems([...filterItems, newItem]);
        setShowFilters(true);
    };

    const deleteFilter = (id) => setFilterItems(filterItems.filter((item) => item.id !== id));

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esto",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarLive(id);
            }
        });
    };

    const NoRowsOverlay = () => (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="200px"
            gap={2}
        >
            <SearchIcon sx={{ fontSize: 48, color: '#FFB3DC' }} />
            <Typography variant="body1" color="text.secondary">
                No se encontraron lives
            </Typography>
        </Box>
    );

    // Obtener los últimos comentarios (los más nuevos primero)
    const getLatestComments = () => {
        return [...comments]
            .slice(-SCROLL_COMMENTS)
            .reverse();
    };

    // Obtener los últimos comentarios para pantalla completa
    const getLatestFullscreenComments = () => {
        return [...comments]
            .slice(-SCROLL_COMMENTS);
    };

    return (
        <Box>
            {/* MODAL DE ADMINISTRACIÓN DE LIVE */}
            <Dialog
                open={openAdminModal}
                onClose={handleCloseAdminModal}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        maxHeight: '90vh',
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 2,
                }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <LiveTvIcon sx={{ fontSize: 32 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="700">
                                Panel de Administración - Live
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {selectedLive?.title}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleCloseAdminModal} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    <Grid container sx={{ height: '70vh' }}>
                        {/* COLUMNA IZQUIERDA - VIDEO */}
                        <Grid item xs={12} md={8} sx={{ bgcolor: '#000', position: 'relative' }}>
                            <Box
                                ref={videoContainerRef}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    bgcolor: '#000',
                                }}
                            >
                                {selectedLive?.aws_playback_url ? (
                                    <>
                                        <video
                                            autoPlay
                                            disablePictureInPicture
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                            }}
                                            src={selectedLive.aws_playback_url}
                                        >
                                            Tu navegador no soporta el elemento de video.
                                        </video>

                                        {/* Botón fullscreen - solo visible cuando NO está en fullscreen */}
                                        {!isFullscreen && (
                                            <Tooltip title="Pantalla completa" arrow>
                                                <IconButton
                                                    onClick={async () => {
                                                        if (!videoContainerRef.current) return;
                                                        try {
                                                            if (!document.fullscreenEnabled &&
                                                                !document.webkitFullscreenEnabled &&
                                                                !document.mozFullScreenEnabled &&
                                                                !document.msFullscreenEnabled) {
                                                                alert('Tu navegador no soporta pantalla completa');
                                                                return;
                                                            }
                                                            const element = videoContainerRef.current;
                                                            if (element.requestFullscreen) {
                                                                await element.requestFullscreen();
                                                            } else if (element.webkitRequestFullscreen) {
                                                                await element.webkitRequestFullscreen();
                                                            } else if (element.mozRequestFullScreen) {
                                                                await element.mozRequestFullScreen();
                                                            } else if (element.msRequestFullscreen) {
                                                                await element.msRequestFullscreen();
                                                            }
                                                        } catch (err) {
                                                            console.error('Error al entrar en fullscreen:', err);
                                                        }
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 70,
                                                        right: 16,
                                                        color: '#fff',
                                                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(255, 105, 180, 0.8)',
                                                            borderColor: '#FF69B4',
                                                            transform: 'scale(1.1)',
                                                        },
                                                        transition: 'all 0.2s',
                                                        zIndex: 100,
                                                    }}
                                                >
                                                    <FullscreenIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {/* Botones EN fullscreen */}
                                        {isFullscreen && (
                                            <>
                                                <Tooltip title="Salir de pantalla completa" arrow>
                                                    <IconButton
                                                        onClick={() => {
                                                            try {
                                                                if (document.exitFullscreen) document.exitFullscreen();
                                                                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                                                                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                                                                else if (document.msExitFullscreen) document.msExitFullscreen();
                                                            } catch (err) {
                                                                console.error('Error al salir de fullscreen:', err);
                                                            }
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 16,
                                                            right: 16,
                                                            color: '#fff',
                                                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(239, 83, 80, 0.8)',
                                                                borderColor: '#EF5350',
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: 'all 0.2s',
                                                            zIndex: 10000,
                                                        }}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={showCommentsInFullscreen ? "Ocultar comentarios" : "Mostrar comentarios"} arrow>
                                                    <IconButton
                                                        onClick={() => setShowCommentsInFullscreen(!showCommentsInFullscreen)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 16,
                                                            right: 76,
                                                            color: '#fff',
                                                            bgcolor: showCommentsInFullscreen
                                                                ? 'rgba(255, 105, 180, 0.8)'
                                                                : 'rgba(0, 0, 0, 0.7)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255, 105, 180, 0.9)',
                                                                borderColor: '#FF69B4',
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: 'all 0.2s',
                                                            zIndex: 10000,
                                                        }}
                                                    >
                                                        <ChatIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <Box textAlign="center" color="#fff">
                                        <LiveTvIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                                        <Typography variant="h6">Sin transmisión disponible</Typography>
                                    </Box>
                                )}

                                {/* OVERLAY DE COMENTARIOS EN PANTALLA COMPLETA */}
                                {isFullscreen && showCommentsInFullscreen && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: '500px',
                                            display: 'flex',
                                            flexDirection: 'column',  // 👈 columna para apilar header, scroll e input
                                            pointerEvents: 'none',
                                            zIndex: 9999,
                                            p: 2,
                                            gap: 1,
                                            animation: 'slideInRight 0.3s ease-out',
                                            '@keyframes slideInRight': {
                                                from: { transform: 'translateX(100%)', opacity: 0 },
                                                to: { transform: 'translateX(0)', opacity: 1 },
                                            },
                                        }}
                                    >
                                        {/* Header del chat */}
                                        <Box
                                            sx={{
                                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                backdropFilter: 'blur(10px)',
                                                borderRadius: 2,
                                                p: 1.5,
                                                pointerEvents: 'auto',
                                                flexShrink: 0,  // 👈 no se encoge
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="600"
                                                color="#fff"
                                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                            >
                                                <ChatIcon fontSize="small" />
                                                Chat en vivo
                                                <Chip
                                                    label={comments.length}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#FF69B4',
                                                        color: '#fff',
                                                        fontWeight: '600',
                                                        height: 20,
                                                        ml: 'auto',
                                                    }}
                                                />
                                            </Typography>
                                        </Box>

                                        {/* Área de comentarios scrollable */}
                                        <Box
                                            ref={fullscreenCommentsRef}
                                            sx={{
                                                flexGrow: 1,        // 👈 ocupa todo el espacio disponible
                                                overflowY: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                pointerEvents: 'auto',
                                                '&::-webkit-scrollbar': { width: '6px' },
                                                '&::-webkit-scrollbar-track': {
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: 3,
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    background: 'rgba(255, 105, 180, 0.5)',
                                                    borderRadius: 3,
                                                },
                                            }}
                                        >
                                            {comments.length === 0 ? (
                                                <Box
                                                    sx={{
                                                        textAlign: 'center',
                                                        py: 4,
                                                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <ChatIcon sx={{ fontSize: 64, opacity: 0.5, color: '#fff' }} />
                                                    <Typography variant="h6" color="#fff" sx={{ opacity: 0.7, mt: 1 }}>
                                                        No hay comentarios
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                getLatestFullscreenComments().map((comment, index) => (
                                                    <Grow
                                                        in={true}
                                                        key={comment.id}
                                                        timeout={400}
                                                        style={{
                                                            transformOrigin: '0 0',
                                                            animationDelay: `${index * 50}ms`
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'rgba(0, 0, 0, 0.44)',
                                                                backdropFilter: 'blur(10px)',
                                                                borderRadius: 2,
                                                                p: 1.5,
                                                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                                                transition: 'all 0.3s ease-out',
                                                                '&:hover': {
                                                                    bgcolor: 'rgba(0, 0, 0, 0.85)',
                                                                    borderColor: 'rgba(255, 105, 180, 0.5)',
                                                                },
                                                            }}
                                                        >
                                                            <Box display="flex" alignItems="flex-start" gap={1}>
                                                                <Avatar
                                                                    sx={{
                                                                        bgcolor: '#FF69B4',
                                                                        width: 42,
                                                                        height: 42,
                                                                        fontSize: '1.75rem',
                                                                    }}
                                                                >
                                                                    {comment.user_name?.charAt(0) || "U"}
                                                                </Avatar>
                                                                <Box flexGrow={1}>
                                                                    <Typography
                                                                        variant="caption"
                                                                        fontWeight={700}
                                                                        sx={{ color: '#f27db8', fontSize: '1.6rem' }}
                                                                    >
                                                                        {comment.user_name || "Usuario"}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{
                                                                            color: '#fff',
                                                                            fontSize: '1.6rem',
                                                                            wordBreak: 'break-word',
                                                                        }}
                                                                    >
                                                                        {comment.message}
                                                                    </Typography>
                                                                </Box>
                                                                {/* <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    sx={{
                                                                        color: '#EF5350',
                                                                        width: 24,
                                                                        height: 24,
                                                                        '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.2)' },
                                                                    }}
                                                                >
                                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                                </IconButton> */}
                                                            </Box>
                                                        </Box>
                                                    </Grow>
                                                ))
                                            )}
                                        </Box>

                                        {/* Input FUERA del scroll, siempre visible abajo 👇 */}
                                        <Box
                                            sx={{
                                                flexShrink: 0,      // 👈 no se encoge
                                                pointerEvents: 'auto',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: 2,
                                                    p: 1,
                                                    display: 'flex',
                                                    gap: 1,
                                                }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Comentar..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSendComment();
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                            color: '#fff',
                                                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                            '&:hover fieldset': { borderColor: 'rgba(255, 105, 180, 0.5)' },
                                                            '&.Mui-focused fieldset': { borderColor: '#FF69B4' },
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            color: '#fff',
                                                            '&::placeholder': { color: 'rgba(255, 255, 255, 0.5)' },
                                                        },
                                                    }}
                                                />
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSendComment}
                                                    disabled={!commentText.trim()}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        minWidth: 60,
                                                        '&:hover': { background: 'linear-gradient(135deg, #FF4081 0%, #FF5FA2 100%)' },
                                                        '&:disabled': { background: 'rgba(255, 255, 255, 0.1)' },
                                                    }}
                                                >
                                                    <ChatIcon fontSize="small" />
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            {/* Estado en vivo */}
                            <Box sx={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                display: 'flex',
                                gap: 2,
                                zIndex: isFullscreen ? 9998 : 1,
                            }}>
                                {selectedLive?.status === 'live' && (
                                    <Chip
                                        label="EN VIVO"
                                        sx={{
                                            bgcolor: '#EF5350',
                                            color: '#fff',
                                            fontWeight: '700',
                                            animation: 'pulse 2s infinite',
                                            '@keyframes pulse': {
                                                '0%, 100%': { opacity: 1 },
                                                '50%': { opacity: 0.7 },
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        </Grid>

                        {/* COLUMNA DERECHA - CHAT Y CONTROLES */}
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#FFF5FA' }}>
                            {/* Estadísticas */}
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #FFE6F0' }}>
                                <Typography variant="subtitle2" fontWeight="700" color="#FF69B4" gutterBottom>
                                    📊 Estadísticas del Live
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <Box textAlign="center">
                                            <Typography variant="h6" fontWeight="700" color="#ff66ad">
                                                {liveStats.comments}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Comentarios
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Chat de comentarios */}
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Typography variant="subtitle2" fontWeight="700" color="#FF69B4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ChatIcon fontSize="small" />
                                        Comentarios en vivo
                                    </Typography>
                                </Box>

                                <Box
                                    ref={commentsContainerRef}
                                    sx={{
                                        maxHeight: "332px",
                                        overflowY: "auto",
                                        display: "flex",
                                        flexDirection: "column-reverse",
                                        gap: 1,
                                        p: 1,
                                        '&::-webkit-scrollbar': { width: '6px' },
                                        '&::-webkit-scrollbar-track': { background: '#FFE6F0', borderRadius: 3 },
                                        '&::-webkit-scrollbar-thumb': { background: '#FF69B4', borderRadius: 3 },
                                    }}
                                >
                                    {comments.length === 0 ? (
                                        <Box textAlign="center" py={4}>
                                            <ChatIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                            <Typography variant="body2">
                                                No hay comentarios aún
                                            </Typography>
                                        </Box>
                                    ) : (
                                        getLatestComments().map((comment, index) => (
                                            <Zoom
                                                in={true}
                                                key={comment.id}
                                                timeout={400}
                                                style={{ transitionDelay: `${index * 50}ms` }}
                                            >
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: "#fff",
                                                        borderRadius: 2,
                                                        border: "1px solid #FFE6F0",
                                                        transition: 'all 0.3s ease-out',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 12px rgba(255, 105, 180, 0.15)',
                                                            transform: 'translateY(-2px)',
                                                        },
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                                        <Avatar sx={{ bgcolor: "#FF69B4", width: 40, height: 40 }}>
                                                            {comment.user_name?.charAt(0) || "U"}
                                                        </Avatar>
                                                        <Box flexGrow={1}>
                                                            <Typography fontWeight={600} variant="body2" color="#FF69B4">
                                                                {comment.user_name || "Usuario"}
                                                            </Typography>
                                                            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontSize: '1rem' }}>
                                                                {comment.message}
                                                            </Typography>
                                                        </Box>
                                                        {/* <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            sx={{
                                                                color: "#EF5350",
                                                                alignSelf: 'flex-start',
                                                                transition: 'all 0.2s',
                                                                '&:hover': {
                                                                    transform: 'scale(1.1)',
                                                                    bgcolor: 'rgba(239, 83, 80, 0.1)',
                                                                },
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton> */}
                                                    </Box>
                                                </Paper>
                                            </Zoom>
                                        ))
                                    )}
                                </Box>
                            </Box>

                            {/* Input para enviar comentarios */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderTop: "1px solid #FFE6F0",
                                    bgcolor: "#fff",
                                    display: "flex",
                                    gap: 1,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Escribe un comentario..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSendComment();
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                            transition: 'all 0.3s',
                                            '&:hover': { borderColor: '#FF69B4' },
                                            '&.Mui-focused': {
                                                borderColor: '#FF69B4',
                                                boxShadow: '0 0 0 2px rgba(255, 105, 180, 0.2)',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSendComment}
                                    disabled={!commentText.trim()}
                                    sx={{
                                        background: "linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)",
                                        fontWeight: 700,
                                        borderRadius: 3,
                                        px: 3,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            background: "linear-gradient(135deg, #FF4081 0%, #FF5FA2 100%)",
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 6px 20px rgba(255, 105, 180, 0.4)',
                                        },
                                        '&:active': { transform: 'scale(0.95)' },
                                    }}
                                >
                                    Enviar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    bgcolor: '#FFF5FA',
                    borderTop: '1px solid #FFE6F0',
                    justifyContent: 'space-between',
                }}>
                    <Button
                        onClick={handleCloseAdminModal}
                        sx={{ color: '#757575', fontWeight: '600' }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* FILTROS ADICIONALES */}
            {filterItems.length > 0 && (
                <Paper className={classes.filterContainer}>
                    <Box className={classes.filterHeader}>
                        <FilterAltIcon sx={{ color: '#FF69B4', fontSize: 24 }} />
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#FF69B4' }}>
                            Filtros Activos
                        </Typography>
                    </Box>

                    {filterItems.map((item) => (
                        <Box
                            key={item.id}
                            sx={{
                                backgroundColor: '#fff',
                                borderRadius: 3,
                                p: 2,
                                mb: 2,
                                boxShadow: '0 2px 8px rgba(255, 182, 217, 0.15)',
                            }}
                        >
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Campo</InputLabel>
                                        <Select
                                            label="Campo"
                                            name="selectedField"
                                            value={item.fields.selectedField}
                                            onChange={handleChange(item.id)}
                                            sx={{
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD6EA' },
                                            }}
                                        >
                                            {filters.map((f) => (
                                                <MenuItem key={f.title} value={f.title}>
                                                    {f.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        label="Contiene"
                                        name="filterValue"
                                        size="small"
                                        fullWidth
                                        value={item.fields.filterValue}
                                        onChange={handleChange(item.id)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '& fieldset': { borderColor: '#FFD6EA' },
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={12} md={2}>
                                    <IconButton
                                        onClick={() => deleteFilter(item.id)}
                                        sx={{
                                            color: '#FF6B9D',
                                            backgroundColor: '#FFF0F5',
                                            '&:hover': { backgroundColor: '#FFE1EE' },
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}

                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #FF6B9D 0%, #C969E0 100%)',
                                color: '#fff',
                                fontWeight: '600',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(255, 107, 157, 0.3)',
                            }}
                        >
                            Aplicar
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ClearAllIcon />}
                            onClick={handleReset}
                            sx={{
                                borderColor: '#FF6B9D',
                                color: '#FF6B9D',
                                fontWeight: '600',
                                borderRadius: 2,
                                '&:hover': {
                                    borderColor: '#FF5A8C',
                                    backgroundColor: '#FFF5FA',
                                },
                            }}
                        >
                            Limpiar Todo
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* TABLA PRINCIPAL */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #FFE6F0',
                }}
            >
                {/* ENCABEZADO */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
                        p: 3,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight="700">
                            Gestión de Lives
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                            Administra tus transmisiones en vivo
                        </Typography>
                    </Box>

                    <TextField
                        placeholder="Buscar por título o estado..."
                        value={state.searchTerm}
                        onChange={(e) => {
                            dispatch({ searchTerm: e.target.value });
                            setRowsState((prev) => ({ ...prev, page: 0 }));
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                            minWidth: 300,
                            maxWidth: 400,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '& fieldset': { borderColor: '#FFD6EA' },
                                '&:hover fieldset': { borderColor: '#FF69B4' },
                                '&.Mui-focused fieldset': { borderColor: '#FF69B4' },
                            },
                        }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: '#FF69B4', mr: 1 }} />,
                            endAdornment: state.searchTerm && (
                                <IconButton
                                    size="small"
                                    onClick={() => dispatch({ searchTerm: '' })}
                                    sx={{ color: '#FF6B9D' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>

                {/* FILTROS EN LÍNEA */}
                <Box sx={{
                    bgcolor: '#FFF5FA',
                    borderBottom: '1px solid #FFE6F0',
                    p: 2,
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={state.valueStatus}
                            onChange={(e) => {
                                dispatch({ valueStatus: e.target.value });
                                setRowsState((prev) => ({ ...prev, page: 0 }));
                            }}
                            label="Estado"
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        >
                            <MenuItem value="Todos">Todos</MenuItem>
                            <MenuItem value="scheduled">Programado</MenuItem>
                            <MenuItem value="live">En vivo</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* CONTADOR DE RESULTADOS */}
                {state.searchTerm && (
                    <Box sx={{ px: 3, py: 1.5, bgcolor: '#FFF5FA', borderBottom: '1px solid #FFE6F0' }}>
                        <Typography variant="caption" color="text.secondary">
                            🔍 Mostrando {displayRows.length} resultado{displayRows.length !== 1 ? 's' : ''} para "{state.searchTerm}"
                        </Typography>
                    </Box>
                )}

                {/* CONTENIDO DE LA TABLA */}
                {cargando ? (
                    <Box sx={{ p: 4 }}>
                        <LinearProgress sx={{
                            backgroundColor: '#FFE6F0',
                            '& .MuiLinearProgress-bar': { backgroundColor: '#FF69B4' }
                        }} />
                    </Box>
                ) : displayRows.length === 0 ? (
                    <NoRowsOverlay />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#FFF5FA' }}>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>Título</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>Fecha</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>Estado</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#FF69B4' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayRows
                                    .slice(
                                        rowsState.page * rowsState.pageSize,
                                        rowsState.page * rowsState.pageSize + rowsState.pageSize
                                    )
                                    .map((l) => (
                                        <TableRow
                                            key={l.id}
                                            sx={{
                                                '&:hover': { bgcolor: '#FFF5FA', transition: 'all 0.2s' },
                                            }}
                                        >
                                            <TableCell>
                                                <Box display="flex" flexDirection="column" alignItems="center">
                                                    <Typography variant="body2" fontWeight="600">{l.title}</Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(l.start_time)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Chip
                                                    label={statusLabels[l.status] || l.status || "Sin estado"}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: '600',
                                                        color: statusColors[l.status]?.color || '#fff',
                                                        background: statusColors[l.status]?.bg || '#FF5C92',
                                                        boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                                        minWidth: 100,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                <Box display="flex" justifyContent="center" gap={1}>
                                                    <Tooltip title="Ver live (Admin)" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenAdminModal(l)}
                                                            sx={{
                                                                color: '#4CAF50',
                                                                backgroundColor: '#E8F5E9',
                                                                '&:hover': { backgroundColor: '#C8E6C9', transform: 'scale(1.05)' },
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            <PlayIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {/* Editar y eliminar (solo rol 1) */}
                                                    {roleId === 1 && (
                                                        <>
                                                            <Tooltip title="Editar" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => history.push(`/lives/editlive/${l.id}`)}
                                                                    sx={{
                                                                        color: '#FF69B4',
                                                                        backgroundColor: '#FFF0F5',
                                                                        '&:hover': {
                                                                            backgroundColor: '#FFE1EE',
                                                                            transform: 'scale(1.05)',
                                                                        },
                                                                        transition: 'all 0.2s',
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Tooltip title="Eliminar" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(l.id)}
                                                                    sx={{
                                                                        color: '#EF5350',
                                                                        backgroundColor: '#FFEBEE',
                                                                        '&:hover': {
                                                                            backgroundColor: '#FFCDD2',
                                                                            transform: 'scale(1.05)',
                                                                        },
                                                                        transition: 'all 0.2s',
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* PAGINACIÓN */}
                {!cargando && displayRows.length > 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: '#FFF5FA',
                            borderTop: '1px solid #FFE6F0',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Mostrando {rowsState.page * rowsState.pageSize + 1} -{' '}
                            {Math.min((rowsState.page + 1) * rowsState.pageSize, displayRows.length)}{' '}
                            de {displayRows.length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                size="small"
                                disabled={rowsState.page === 0}
                                onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page - 1 }))}
                                sx={{ color: '#FF69B4', '&:disabled': { color: '#ccc' } }}
                            >
                                Anterior
                            </Button>
                            <Button
                                size="small"
                                disabled={(rowsState.page + 1) * rowsState.pageSize >= displayRows.length}
                                onClick={() => setRowsState((prev) => ({ ...prev, page: prev.page + 1 }))}
                                sx={{ color: '#FF69B4', '&:disabled': { color: '#ccc' } }}
                            >
                                Siguiente
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Live;