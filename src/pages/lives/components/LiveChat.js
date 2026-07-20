// src/components/Live/LiveChat.js

import React, { forwardRef } from 'react';
import {
    Box,
    Paper,
    Avatar,
    Typography,
    IconButton,
    Zoom,
    TextField,
    Button,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SCROLL_COMMENTS } from './constants';

const LiveChat = forwardRef(({
    comments,
    commentText,
    setCommentText,
    handleSendComment,
    handleDeleteComment,
    getLatestComments = (comments) => [...comments].slice(-SCROLL_COMMENTS).reverse()
}, ref) => {
    const latestComments = getLatestComments(comments);

    return (
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
                ref={ref}
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
                    latestComments.map((comment, index) => (
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
                                    <IconButton
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
                                    </IconButton>
                                </Box>
                            </Paper>
                        </Zoom>
                    ))
                )}
            </Box>

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
        </Box>
    );
});

LiveChat.displayName = 'LiveChat';

export default LiveChat;    