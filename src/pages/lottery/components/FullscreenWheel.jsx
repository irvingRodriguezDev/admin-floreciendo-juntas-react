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
  0%   { transform: translate3d(0, -12vh, 0) rotate(0deg); }
  25%  { transform: translate3d(35px, 22vh, 0) rotate(90deg); }
  50%  { transform: translate3d(-28px, 45vh, 0) rotate(180deg); }
  75%  { transform: translate3d(32px, 70vh, 0) rotate(270deg); }
  100% { transform: translate3d(-18px, 115vh, 0) rotate(360deg); }
`;

const shimmerText = keyframes`
  0%, 100% { background-position: 0% center; }
  50%      { background-position: 100% center; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50%      { transform: scale(1.06); opacity: 1; }
`;

const bgShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
`;

const FullscreenWheel = ({
    prizes,
    rotationRef, // 🔥 Recibe el Ref
    winningIndex,
    selectedPrize,
    spinning,
    onClose,
    onSpin
}) => {
    const petals = useMemo(
        () =>
            Array.from({ length: 28 }, (_, i) => ({
                emoji: ['🌸', '🌷', '🌺'][i % 3],
                left: Math.random() * 100,
                delay: Math.random() * -20,
                duration: 14 + Math.random() * 14,
                size: 16 + Math.random() * 20
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
                    `,
                    backgroundSize: '200% 200%',
                    animation: `${bgShift} 18s ease-in-out infinite`
                }}
            >
                {/* Pétalos de fondo */}
                <Box
                    aria-hidden="true"
                    sx={{
                        position: 'fixed',
                        inset: 0,
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
                                top: '-12%',
                                left: `${petal.left}%`,
                                display: 'block',
                                fontSize: `${petal.size}px`,
                                opacity: { xs: 0.45, sm: 0.6 },
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
                        pt: 2.5,
                        pb: 1,
                        flexShrink: 0
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            m: 0,
                            fontSize: { xs: '1.35rem', sm: '1.75rem' },
                            fontWeight: 900,
                            letterSpacing: '0.4px',
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
                            width: 44,
                            height: 44,
                            color: '#8a1f5c',
                            fontSize: '1.05rem',
                            border: '1px solid rgba(255,255,255,0.6)',
                            bgcolor: 'rgba(255,255,255,0.4)',
                            backdropFilter: 'blur(8px)',
                            transition: 'transform 0.25s ease, background 0.2s ease',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.65)',
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
                            width: 'min(80vmin, 640px)',
                            height: 'min(80vmin, 640px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            aria-hidden="true"
                            sx={{
                                position: 'absolute',
                                inset: '-6%',
                                borderRadius: '50%',
                                zIndex: -1,
                                filter: 'blur(8px)',
                                background:
                                    'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,182,213,0.35) 55%, transparent 78%)',
                                animation: `${pulse} 3.2s ease-in-out infinite`,
                                willChange: 'transform, opacity'
                            }}
                        />
                        {/* 🔥 Aquí pasamos rotationRef */}
                        <WheelCanvas
                            prizes={prizes}
                            rotationRef={rotationRef}
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
                        pt: 2,
                        pb: 4
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        onClick={onSpin}
                        disabled={spinning || prizes.length === 0}
                        startIcon={
                            spinning ? (
                                <CircularProgress size={20} thickness={5} color="inherit" />
                            ) : (
                                <span style={{ fontSize: '1.1em' }}>🌸</span>
                            )
                        }
                        sx={{
                            px: 4,
                            py: 1.3,
                            borderRadius: 999,
                            fontWeight: 800,
                            textTransform: 'none',
                            fontSize: '1rem',
                            letterSpacing: '0.3px',
                            color: '#fff',
                            background: 'linear-gradient(135deg, #ff4d94 0%, #e0247a 100%)',
                            boxShadow: '0 10px 28px rgba(224, 36, 122, 0.45)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #ff5fa2 0%, #e82b85 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 14px 32px rgba(224, 36, 122, 0.55)'
                            },
                            '&:active': {
                                transform: 'translateY(0)'
                            },
                            '&.Mui-disabled': {
                                color: 'rgba(255,255,255,0.85)',
                                background: 'linear-gradient(135deg, #ffa8c9 0%, #e88ab0 100%)',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {spinning ? 'Girando...' : 'Girar Flor'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default FullscreenWheel;