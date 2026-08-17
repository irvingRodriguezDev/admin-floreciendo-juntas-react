import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, Divider, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageViewer = ({ open, onClose, selectedImage, isMobile }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 });

    // ✅ RESETEAR ZOOM Y POSICIÓN CUANDO SE ABRE UNA NUEVA IMAGEN
    useEffect(() => {
        if (open && selectedImage) {
            // Resetear zoom y posición cuando se abre una nueva imagen
            setZoomLevel(1);
            setImagePos({ x: 0, y: 0 });
            setIsDragging(false);
        }
    }, [open, selectedImage]);

    const resetView = () => {
        setZoomLevel(1);
        setImagePos({ x: 0, y: 0 });
    };

    // Manejar zoom con rueda del mouse
    const handleWheel = (e) => {
        e.preventDefault();
        setZoomLevel(prev => {
            const delta = e.deltaY > 0 ? -0.15 : 0.15;
            return Math.min(Math.max(prev + delta, 0.5), 4);
        });
    };

    // Manejar arrastre con mouse
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ 
                x: e.clientX - imagePos.x, 
                y: e.clientY - imagePos.y 
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setImagePos({ 
                x: e.clientX - dragStart.x, 
                y: e.clientY - dragStart.y 
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Manejar arrastre con touch
    const handleTouchStart = (e) => {
        if (e.touches.length === 1 && zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ 
                x: e.touches[0].clientX - imagePos.x, 
                y: e.touches[0].clientY - imagePos.y 
            });
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
            setImagePos({ 
                x: e.touches[0].clientX - dragStart.x, 
                y: e.touches[0].clientY - dragStart.y 
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // ✅ Cerrar con tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth 
            fullScreen={isMobile}
            PaperProps={{ 
                sx: { 
                    bgcolor: 'transparent', 
                    boxShadow: 'none', 
                    overflow: 'hidden', 
                    m: isMobile ? 0 : 2 
                } 
            }}
            BackdropProps={{ 
                sx: { bgcolor: 'rgba(0,0,0,0.85)' } 
            }}
        >
            <Box 
                sx={{ 
                    position: 'relative', 
                    minHeight: isMobile ? '100vh' : '80vh',
                    height: isMobile ? '100vh' : '80vh',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    userSelect: 'none',
                    touchAction: 'none'
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Botón cerrar */}
                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        right: 16, 
                        zIndex: 10, 
                        bgcolor: 'rgba(0,0,0,0.5)', 
                        color: '#fff', 
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        width: 40,
                        height: 40
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Controles de zoom */}
                <Box sx={{ 
                    position: 'absolute', 
                    bottom: { xs: 24, sm: 32 }, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    zIndex: 10, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    borderRadius: 4, 
                    px: 2, 
                    py: 1,
                    backdropFilter: 'blur(8px)'
                }}>
                    <IconButton 
                        size="small" 
                        onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))} 
                        sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <Typography sx={{ fontSize: 24, lineHeight: 1, fontWeight: 300 }}>−</Typography>
                    </IconButton>
                    
                    <Typography sx={{ 
                        color: '#fff', 
                        minWidth: 50, 
                        textAlign: 'center', 
                        fontSize: 14,
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {Math.round(zoomLevel * 100)}%
                    </Typography>
                    
                    <IconButton 
                        size="small" 
                        onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 4))} 
                        sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <Typography sx={{ fontSize: 24, lineHeight: 1, fontWeight: 300 }}>+</Typography>
                    </IconButton>
                    
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 0.5 }} />
                    
                    <Button 
                        size="small" 
                        onClick={resetView}
                        sx={{ 
                            color: '#fff', 
                            fontSize: 12,
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        Reset
                    </Button>
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
                            transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${zoomLevel})`,
                            transition: isDragging ? 'transform 0.05s linear' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            willChange: 'transform',
                            transformOrigin: 'center center',
                            pointerEvents: zoomLevel > 1 ? 'auto' : 'none',
                        }} 
                    />
                )}
            </Box>
        </Dialog>
    );
};

export default ImageViewer;