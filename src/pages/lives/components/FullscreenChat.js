// src/components/Live/FullscreenChat.js

import React, { forwardRef } from 'react';
import {
    Box,
    Avatar,
    Typography,
    IconButton,
    TextField,
    Paper,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Send as SendIcon,
} from '@mui/icons-material';

const FullscreenChat = forwardRef(({
    comments,
    commentText,
    setCommentText,
    handleSendComment,
    handleDeleteComment,
    showComments,
    onClose,
}, ref) => {
    if (!showComments) return null;

    const getLatestComments = () => {
        return [...comments].slice(-15);
    };

    const latestComments = getLatestComments();

    return (
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
                    bgcolor: 'rgba(70, 70, 70, 0.79)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 1.5,
                    pointerEvents: 'auto',
                    flexShrink: 0,  // 👈 no se encoge
                }}
            >
                <Typography
                    variant="subtitle1"
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

            {/* Área de comentarios */}
            <Box
                ref={ref}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    pointerEvents: 'auto',
                    px: 1,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 3,
                    },
                }}
            >
                {comments.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 2,
                        }}
                    >
                        <ChatIcon
                            sx={{
                                fontSize: 48,
                                color: 'rgba(255, 255, 255, 0.2)',
                            }}
                        />
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontSize: '1rem',
                            }}
                        >
                            No hay comentarios
                        </Typography>
                    </Box>
                ) : (
                    latestComments.map((comment) => (
                        <Paper
                            key={comment.id}
                            elevation={0}
                            sx={{
                                bgcolor: 'rgba(39, 38, 38, 0.7)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 1.5,
                                p: 1.5,
                                border: '1px solid rgba(86, 84, 84, 0.76)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(17, 17, 17, 0.75)',
                                },
                            }}
                        >
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <Avatar
                                    sx={{
                                        bgcolor: '#FF69B4',
                                        width: 40,
                                        height: 40,
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {comment.user_name?.charAt(0).toUpperCase() || "U"}
                                </Avatar>
                                <Box flexGrow={1}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '1.12rem',
                                            display: 'block',
                                            mb: 0.25,
                                        }}
                                    >
                                        {comment.user_name || "Usuario"}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#fff',
                                            fontSize: '1.1rem',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {comment.message}
                                    </Typography>
                                </Box>
                                <Tooltip title="Eliminar comentario">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        sx={{
                                            color: '#EF5350',
                                            padding: 0.3,
                                            '&:hover': {
                                                color: '#EF5350',
                                                bgcolor: 'rgba(239, 83, 80, 0.15)',
                                            },
                                        }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>

                            </Box>
                        </Paper>
                    ))
                )}
            </Box>

            {/* Input para comentarios */}
            <Box
                sx={{
                    flexShrink: 0,
                    pointerEvents: 'auto',
                    px: 1,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        bgcolor: 'rgba(86, 84, 84, 0.76)',
                        borderRadius: 2,
                        p: 0.5,
                        border: '1px solid rgba(86, 84, 84, 0.76)',
                        transition: 'all 0.2s ease',
                        '&:focus-within': {
                            bgcolor: 'rgba(51, 50, 50, 0.81)',
                            borderColor: 'rgba(255, 105, 180, 0.5)',
                        },
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
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                color: '#fff',
                                fontSize: '0.9rem',
                                py: 0.5,
                                px: 1,
                                '&::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.4)',
                                },
                            },
                        }}
                        sx={{
                            '& .MuiInputBase-root': {
                                borderRadius: 0,
                            },
                        }}
                    />
                    <IconButton
                        onClick={handleSendComment}
                        disabled={!commentText.trim()}
                        sx={{
                            color: commentText.trim() ? '#FF69B4' : 'rgba(255, 255, 255, 0.2)',
                            padding: '4px 8px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: commentText.trim() ? 'rgba(255, 105, 180, 0.15)' : 'transparent',
                            },
                        }}
                    >
                        <SendIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
});

FullscreenChat.displayName = 'FullscreenChat';

export default FullscreenChat;