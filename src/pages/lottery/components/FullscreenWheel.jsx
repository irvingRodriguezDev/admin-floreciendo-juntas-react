import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { keyframes } from '@mui/system';
import WheelCanvas from './WheelCanvas';

const fsFall = keyframes`
    0%   { transform: translate3d(0, -10vh, 0) rotate(0deg); }
    20%  { transform: translate3d(35px, 20vh, 0) rotate(70deg); }
    40%  { transform: translate3d(-25px, 40vh, 0) rotate(150deg); }
    60%  { transform: translate3d(30px, 60vh, 0) rotate(230deg); }
    80%  { transform: translate3d(-35px, 80vh, 0) rotate(300deg); }
    100% { transform: translate3d(20px, 110vh, 0) rotate(360deg); }
`;

const shimmerText = keyframes`
    0%, 100% { background-position: 0% center; }
    50%      { background-position: 100% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50%      { transform: scale(1.06); opacity: 1; }
`;

const FullscreenWheel = ({
    prizes,
    rotation,
    winningIndex,
    selectedPrize,
    spinning,
    onClose,
    onSpin
}) => {
    // Los pétalos se generan UNA SOLA VEZ para que no cambien con "rotation"
    const petals = useMemo(
        () =>
            Array.from({ length: 30 }, (_, i) => ({
                emoji: ['🌸', '🌷', '🌺'][i % 3],
                left: Math.random() * 100,
                delay: Math.random() * -20,
                duration: 12 + Math.random() * 14,
                size: 16 + Math.random() * 18
            })),
        []
    );

    return (
        <Modal open onClose={onClose} keepMounted={false}>
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    outline: 'none',
                    background: `
                        radial-gradient(circle at 20% 15%, rgba(255,182,213,0.55), transparent 55%),
                        radial-gradient(circle at 85% 80%, rgba(255,140,190,0.45), transparent 50%),
                        linear-gradient(160deg, #fff0f6 0%, #ffd6e8 40%, #ff9fc4 100%)
                    `
                }}
            >
                {/* Pétalos de fondo */}
                <Box
                    aria-hidden="true"
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        width: '100vw',
                        height: '100vh',
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        zIndex: 1
                    }}
                >
                    {petals.map((petal, i) => (
                        <Box
                            key={i}
                            component="span"
                            sx={{
                                position: 'absolute',
                                top: '-10%',
                                display: 'block',
                                left: `${petal.left}%`,
                                fontSize: `${petal.size}px`,
                                opacity: { xs: 0.45, sm: 0.55 },
                                pointerEvents: 'none',
                                filter: 'drop-shadow(0 2px 4px rgba(214,71,143,0.25))',
                                willChange: 'transform',
                                animation: `${fsFall} ${petal.duration}s linear ${petal.delay}s infinite`
                            }}
                        >
                            {petal.emoji}
                        </Box>
                    ))}
                </Box>

                {/* Barra superior */}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 3,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 2.5,
                        pt: 2.75,
                        pb: 1.25,
                        flexShrink: 0
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            m: 0,
                            fontSize: { xs: '1.3rem', sm: '1.7rem' },
                            fontWeight: 800,
                            letterSpacing: '0.3px',
                            background: 'linear-gradient(90deg, #ef55a2, #ff6fa5 45%, #e34695)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            animation: `${shimmerText} 4s ease-in-out infinite`
                        }}
                    >
                        Gira la Flor
                    </Typography>

                    <IconButton
                        onClick={onClose}
                        title="Cerrar (ESC)"
                        aria-label="Cerrar pantalla completa"
                        sx={{
                            position: 'absolute',
                            right: 20,
                            top: 20,
                            width: 42,
                            height: 42,
                            color: '#8a1f5c',
                            fontSize: '1.1rem',
                            border: '1px solid rgba(255,255,255,0.6)',
                            bgcolor: 'rgba(255,255,255,0.35)',
                            backdropFilter: 'blur(6px)',
                            transition: 'transform 0.2s ease, background 0.2s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.6)',
                                transform: 'rotate(90deg) scale(1.05)'
                            }
                        }}
                    >
                        ✕
                    </IconButton>
                </Box>

                {/* Rueda */}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        flex: 1,
                        width: '100%',
                        minHeight: 0,
                        p: 1.25,
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            width: 'min(78vmin, 620px)',
                            height: 'min(78vmin, 620px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            aria-hidden="true"
                            sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                zIndex: -1,
                                filter: 'blur(4px)',
                                background:
                                    'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,182,213,0.35) 55%, transparent 75%)',
                                animation: `${pulse} 3.2s ease-in-out infinite`
                            }}
                        />
                        <WheelCanvas
                            prizes={prizes}
                            rotation={rotation}
                            winningIndex={winningIndex}
                            selectedPrize={selectedPrize}
                            isFullscreen
                        />
                    </Box>
                </Box>

                {/* Controles */}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        flexShrink: 0,
                        px: 2.5,
                        pt: 2.25,
                        pb: 4.25
                    }}
                >
                    <Button
                        variant="pill"
                        onClick={onSpin}
                        disabled={spinning || prizes.length === 0}
                        startIcon={
                            spinning ? (
                                <CircularProgress size={20} thickness={5} color="inherit" />
                            ) : (
                                '🌸'
                            )
                        }
                    >
                        {spinning ? 'Girando...' : 'Girar Flor'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default FullscreenWheel;