// src/components/Live/LiveAdminModal.js

import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Box,
    IconButton,
    Typography,
    Chip,
    Button,
    Tooltip,
    Avatar,
    Paper,
    TextField,
    Zoom,
} from '@mui/material';
import {
    LiveTv as LiveTvIcon,
    Close as CloseIcon,
    Fullscreen as FullscreenIcon,
    Chat as ChatIcon,
    Delete as DeleteIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import { SCROLL_COMMENTS } from './constants';
import FullscreenChat from './FullscreenChat';

// Estilos reutilizables para botones de control
const controlButtonStyles = {
    color: '#fff',
    bgcolor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.2s',
    '&:hover': {
        transform: 'scale(1.1)',
    }
};

const LiveAdminModal = ({
    open,
    selectedLive,
    comments,
    commentText,
    setCommentText,
    handleSendComment,
    handleDeleteComment,
    handleCloseAdminModal,
    isFullscreen,
    showCommentsInFullscreen,
    toggleFullscreen,
    exitFullscreen,
    toggleCommentsVisibility,
    closeComments,
    videoContainerRef,
    commentsContainerRef,
    fullscreenCommentsRef,
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef(null);

    const toggleVolume = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const getLatestComments = () => [...comments].slice(-SCROLL_COMMENTS).reverse();

    // Botón de volumen reutilizable
    const VolumeButton = ({ position = 'static' }) => (
        <Tooltip title={isMuted ? "Activar sonido" : "Silenciar"} arrow>
            <IconButton
                onClick={toggleVolume}
                sx={{
                    ...controlButtonStyles,
                    ...(position === 'fullscreen' && {
                        position: 'absolute',
                        top: 16,
                        right: 136,
                        zIndex: 10000,
                    }),
                    bgcolor: isMuted ? 'rgba(239, 83, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                    '&:hover': {
                        ...controlButtonStyles['&:hover'],
                        bgcolor: isMuted ? 'rgba(239, 83, 80, 0.9)' : 'rgba(255, 105, 180, 0.8)',
                        borderColor: isMuted ? '#EF5350' : '#FF69B4',
                    }
                }}
            >
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
        </Tooltip>
    );

    // Controles en modo normal
    const NormalControls = () => (
        <Box sx={{
            position: 'absolute',
            bottom: 70,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 100,
        }}>
            <VolumeButton />
            <Tooltip title="Pantalla completa" arrow>
                <IconButton
                    onClick={() => toggleFullscreen(videoContainerRef.current)}
                    sx={controlButtonStyles}
                >
                    <FullscreenIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

    // Controles en modo fullscreen
    const FullscreenControls = () => (
        <>
            <VolumeButton position="fullscreen" />
            <Tooltip title="Salir de pantalla completa" arrow>
                <IconButton
                    onClick={exitFullscreen}
                    sx={{
                        ...controlButtonStyles,
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 10000,
                        '&:hover': {
                            ...controlButtonStyles['&:hover'],
                            bgcolor: 'rgba(239, 83, 80, 0.8)',
                            borderColor: '#EF5350',
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={showCommentsInFullscreen ? "Ocultar comentarios" : "Mostrar comentarios"} arrow>
                <IconButton
                    onClick={toggleCommentsVisibility}
                    sx={{
                        ...controlButtonStyles,
                        position: 'absolute',
                        top: 16,
                        right: 76,
                        zIndex: 10000,
                        bgcolor: showCommentsInFullscreen ? 'rgba(255, 105, 180, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                        '&:hover': {
                            ...controlButtonStyles['&:hover'],
                            bgcolor: 'rgba(255, 105, 180, 0.9)',
                            borderColor: '#FF69B4',
                        }
                    }}
                >
                    <ChatIcon />
                </IconButton>
            </Tooltip>
        </>
    );

    return (
        <Dialog
            open={open}
            onClose={handleCloseAdminModal}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    maxHeight: '90vh',
                    overflow: 'hidden',
                }
            }}
        >
            {/* HEADER */}
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
                px: 3,
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <LiveTvIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h6" fontWeight="700">
                            Panel de Administración - Live
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {selectedLive?.title || 'Transmisión en vivo'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleCloseAdminModal} sx={{ color: '#fff' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Grid container sx={{ height: '70vh' }}>
                    {/* COLUMNA VIDEO */}
                    <Grid item xs={12} md={8} sx={{
                        bgcolor: '#000',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
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
                                        ref={videoRef}
                                        autoPlay
                                        muted={isMuted}
                                        playsInline
                                        disablePictureInPicture
                                        controls={false}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                        src={selectedLive.aws_playback_url}
                                    />

                                    {!isFullscreen && <NormalControls />}
                                    {isFullscreen && <FullscreenControls />}

                                    {isFullscreen && showCommentsInFullscreen && (
                                        <FullscreenChat
                                            ref={fullscreenCommentsRef}
                                            comments={comments}
                                            commentText={commentText}
                                            setCommentText={setCommentText}
                                            handleSendComment={handleSendComment}
                                            handleDeleteComment={handleDeleteComment}
                                            showComments={showCommentsInFullscreen}
                                            onClose={closeComments}
                                        />
                                    )}
                                </>
                            ) : (
                                <Box textAlign="center" color="#fff">
                                    <LiveTvIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                                    <Typography variant="h6">Sin transmisión disponible</Typography>
                                </Box>
                            )}

                            {/* OVERLAY EN VIVO */}
                            {selectedLive?.status === 'live' && (
                                <Chip
                                    label="EN VIVO"
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        left: 16,
                                        bgcolor: '#EF5350',
                                        color: '#fff',
                                        fontWeight: '700',
                                        zIndex: isFullscreen ? 9998 : 1,
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': { opacity: 1 },
                                            '50%': { opacity: 0.5 },
                                        },
                                    }}
                                />
                            )}
                        </Box>
                    </Grid>

                    {/* COLUMNA CHAT */}
                    <Grid item xs={12} md={4} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: '#FFF5FA',
                        height: '100%',
                    }}>
                        {/* ESTADÍSTICAS */}
                        <Box sx={{
                            p: 2,
                            bgcolor: '#fff',
                            borderBottom: '1px solid #FFE6F0',
                            flexShrink: 0,
                        }}>
                            <Typography variant="subtitle2" fontWeight="700" color="#FF69B4" gutterBottom>
                                📊 Estadísticas del Live
                            </Typography>
                            <Box textAlign="center" mt={1}>
                                <Typography variant="h6" fontWeight="700" color="#ff66ad">
                                    {comments.length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Comentarios
                                </Typography>
                            </Box>
                        </Box>

                        {/* CHAT */}
                        <Box sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2,
                                py: 1.5,
                                borderBottom: '1px solid #FFE6F0',
                                flexShrink: 0,
                            }}>
                                <Typography variant="subtitle2" fontWeight="700" color="#FF69B4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ChatIcon fontSize="small" />
                                    Comentarios en vivo
                                </Typography>
                                <Chip
                                    label={comments.length}
                                    size="small"
                                    sx={{
                                        bgcolor: '#FF69B4',
                                        color: '#fff',
                                        fontWeight: '600',
                                        height: 20,
                                    }}
                                />
                            </Box>

                            <Box
                                ref={commentsContainerRef}
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column-reverse',
                                    gap: 1.5,
                                    '&::-webkit-scrollbar': { width: '6px' },
                                    '&::-webkit-scrollbar-track': { background: '#FFE6F0', borderRadius: 3 },
                                    '&::-webkit-scrollbar-thumb': { background: '#FF69B4', borderRadius: 3 },
                                }}
                            >
                                {comments.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <ChatIcon sx={{ fontSize: 48, opacity: 0.3, color: '#FF69B4' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No hay comentarios aún
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Los comentarios aparecerán aquí
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
                                                    p: 1.5,
                                                    bgcolor: '#fff',
                                                    borderRadius: 2,
                                                    border: '1px solid #FFE6F0',
                                                    transition: 'all 0.3s ease-out',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(255, 105, 180, 0.15)',
                                                        transform: 'translateY(-2px)',
                                                    },
                                                }}
                                            >
                                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: '#FF69B4',
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: '0.875rem',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {comment.user_name?.charAt(0).toUpperCase() || "U"}
                                                    </Avatar>
                                                    <Box flexGrow={1}>
                                                        <Typography
                                                            fontWeight={600}
                                                            variant="body2"
                                                            color="#FF69B4"
                                                            sx={{ fontSize: '0.8rem' }}
                                                        >
                                                            {comment.user_name || "Usuario"}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.primary"
                                                            sx={{
                                                                mt: 0.25,
                                                                fontSize: '0.9rem',
                                                                wordBreak: 'break-word',
                                                            }}
                                                        >
                                                            {comment.message}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        sx={{
                                                            color: '#EF5350',
                                                            padding: 0.5,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                bgcolor: 'rgba(239, 83, 80, 0.1)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        </Zoom>
                                    ))
                                )}
                            </Box>

                            {/* INPUT */}
                            <Box sx={{
                                p: 2,
                                borderTop: '1px solid #FFE6F0',
                                bgcolor: '#fff',
                                display: 'flex',
                                gap: 1,
                                flexShrink: 0,
                            }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Escribe un comentario..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            transition: 'all 0.3s',
                                            '&:hover': { '& fieldset': { borderColor: '#FF69B4' } },
                                            '&.Mui-focused': {
                                                '& fieldset': {
                                                    borderColor: '#FF69B4',
                                                    boxShadow: '0 0 0 2px rgba(255, 105, 180, 0.2)',
                                                },
                                            },
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
                                        borderRadius: 3,
                                        px: 3,
                                        minWidth: 80,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #FF4081 0%, #FF5FA2 100%)',
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 6px 20px rgba(255, 105, 180, 0.4)',
                                        },
                                        '&:active': { transform: 'scale(0.95)' },
                                        '&:disabled': {
                                            background: '#E0E0E0',
                                            transform: 'scale(1)',
                                        },
                                    }}
                                >
                                    Enviar
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            {/* FOOTER */}
            <DialogActions sx={{
                p: 2,
                bgcolor: '#FFF5FA',
                borderTop: '1px solid #FFE6F0',
                justifyContent: 'space-between',
            }}>
                <Button
                    onClick={handleCloseAdminModal}
                    sx={{
                        color: '#757575',
                        fontWeight: '600',
                        '&:hover': { bgcolor: '#F5F5F5' }
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LiveAdminModal;