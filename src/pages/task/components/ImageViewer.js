import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Dialog, Divider, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const btnHover = { '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } };

const ImageViewer = ({ open, onClose, selectedImage, isMobile }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });

    const changeZoom = (delta) =>
        setZoomLevel(prev => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));

    const resetView = () => {
        setZoomLevel(1);
        setImagePos({ x: 0, y: 0 });
    };

    // Resetear zoom y posición cuando se abre una nueva imagen
    useEffect(() => {
        if (open && selectedImage) {
            resetView();
            setIsDragging(false);
        }
    }, [open, selectedImage]);

    // Mouse + touch con pointer events (un solo juego de handlers)
    const handlePointerDown = (e) => {
        if (zoomLevel <= 1) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragStart.current = { x: e.clientX - imagePos.x, y: e.clientY - imagePos.y };
        setIsDragging(true);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        setImagePos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };

    const stopDragging = () => setIsDragging(false);

    // Evita que los botones inicien un arrastre
    const stop = (e) => e.stopPropagation();

    return (
        <Dialog
            open={open}
            onClose={onClose} // MUI ya cierra con ESC, no hace falta un listener aparte
            maxWidth="lg"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden', m: isMobile ? 0 : 2 },
            }}
            BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.85)' } }}
        >
            <Box
                onWheel={(e) => changeZoom(e.deltaY > 0 ? -0.15 : 0.15)}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                sx={{
                    position: 'relative',
                    height: isMobile ? '100vh' : '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    userSelect: 'none',
                    touchAction: 'none',
                    cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                }}
            >
                {/* Botón cerrar */}
                <IconButton
                    onClick={onClose}
                    onPointerDown={stop}
                    sx={{
                        position: 'absolute', top: 16, right: 16, zIndex: 10, width: 40, height: 40,
                        bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Controles de zoom */}
                <Box
                    onPointerDown={stop}
                    sx={{
                        position: 'absolute', bottom: { xs: 24, sm: 32 }, left: '50%', transform: 'translateX(-50%)',
                        zIndex: 10, display: 'flex', alignItems: 'center', gap: 1.5,
                        bgcolor: 'rgba(0,0,0,0.6)', borderRadius: 4, px: 2, py: 1, backdropFilter: 'blur(8px)',
                    }}
                >
                    <IconButton size="small" onClick={() => changeZoom(-0.25)} sx={{ color: '#fff', ...btnHover }}>
                        <Typography sx={{ fontSize: 24, lineHeight: 1, fontWeight: 300 }}>−</Typography>
                    </IconButton>

                    <Typography sx={{ color: '#fff', minWidth: 50, textAlign: 'center', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                        {Math.round(zoomLevel * 100)}%
                    </Typography>

                    <IconButton size="small" onClick={() => changeZoom(0.25)} sx={{ color: '#fff', ...btnHover }}>
                        <Typography sx={{ fontSize: 24, lineHeight: 1, fontWeight: 300 }}>+</Typography>
                    </IconButton>

                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />

                    <Button size="small" onClick={resetView} sx={{ color: '#fff', fontSize: 12, textTransform: 'none', ...btnHover }}>
                        Reset
                    </Button>
                </Box>

                {/* Imagen: Box component="img" para que sx (transform, cursor, etc.) sí se aplique */}
                {selectedImage && (
                    <Box
                        component="img"
                        src={selectedImage}
                        alt="Vista ampliada"
                        draggable={false}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: isMobile ? '80vh' : '85vh',
                            objectFit: 'contain',
                            borderRadius: 1,
                            transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${zoomLevel})`,
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            willChange: 'transform',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </Box>
        </Dialog>
    );
};

export default ImageViewer;