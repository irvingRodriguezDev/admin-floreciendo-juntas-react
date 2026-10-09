import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import OpenInFullRounded from '@mui/icons-material/OpenInFullRounded';
import { keyframes } from '@mui/system';

const glow = keyframes`
    from { filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.2)); }
    to   { filter: drop-shadow(0 10px 30px rgba(255, 20, 147, 0.4)); }
`;

const MIN_PETALS = 5;

const pinkColors = [
    '#FF1493', '#FFB6C1', '#C71585', '#FFC0CB',
    '#FF69B4', '#DB7093', '#FF80AB', '#FFB8D1',
    '#FF4081', '#FFA0C8', '#E8569A', '#FF82AB',
    '#D63384'
];

const emptyPetalColors = [
    '#FFCFE6', '#FFD9EE', '#FFCFE6', '#FFD9EE', '#FFD2E8'
];

// Dibuja un pétalo de flor (versión redondeada, sin punta afilada)
const drawFlowerPetal = (ctx, petalLength, pHalfWidth, baseR) => {
    ctx.beginPath();
    ctx.moveTo(baseR * 0.4, -baseR * 0.9);

    ctx.bezierCurveTo(
        petalLength * 0.22, -pHalfWidth * 1.0,
        petalLength * 0.55, -pHalfWidth * 1.05,
        petalLength * 0.82, -pHalfWidth * 0.55
    );

    ctx.bezierCurveTo(
        petalLength * 0.98, -pHalfWidth * 0.28,
        petalLength * 0.98, pHalfWidth * 0.28,
        petalLength * 0.82, pHalfWidth * 0.55
    );

    ctx.bezierCurveTo(
        petalLength * 0.55, pHalfWidth * 1.05,
        petalLength * 0.22, pHalfWidth * 1.0,
        baseR * 0.4, baseR * 0.9
    );

    ctx.quadraticCurveTo(-baseR * 0.35, 0, baseR * 0.4, -baseR * 0.9);
    ctx.closePath();
};

const WheelCanvas = ({
    prizes,
    rotation,
    winningIndex,
    selectedPrize,
    isFullscreen = false,
    onFullscreen
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const SIZE = isFullscreen
            ? Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.80)
            : 680;
        canvas.width = SIZE;
        canvas.height = SIZE;

        const centerX = SIZE / 2;
        const centerY = SIZE / 2;
        const petalLength = Math.min(centerX, centerY) - (isFullscreen ? 22 : 18);
        const totalPetals = Math.max(MIN_PETALS, prizes.length);
        const sliceAngle = (2 * Math.PI) / totalPetals;

        const gap = 0.86;
        const maxHalfWidthByAngle = Math.tan((sliceAngle * gap) / 2) * petalLength;
        const pHalfWidth = Math.min(maxHalfWidthByAngle, petalLength * 0.34);
        const baseR = Math.max(12, petalLength * 0.05);

        ctx.clearRect(0, 0, SIZE, SIZE);

        /* ------------------------------ Pétalos ------------------------------ */
        for (let index = 0; index < totalPetals; index++) {
            const hasPrize = index < prizes.length;
            const prize = hasPrize ? prizes[index] : null;
            const petalAngle = index * sliceAngle + sliceAngle / 2 + rotation;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(petalAngle);

            const isWinning =
                hasPrize && winningIndex === index && selectedPrize?.id === prize.id;

            drawFlowerPetal(ctx, petalLength, pHalfWidth, baseR);

            const gradient = ctx.createLinearGradient(0, -pHalfWidth, petalLength, pHalfWidth);

            if (isWinning) {
                gradient.addColorStop(0, '#FFD1DC');
                gradient.addColorStop(0.35, '#FF1493');
                gradient.addColorStop(1, '#C71585');
                ctx.shadowColor = 'rgba(255, 20, 147, 0.95)';
                ctx.shadowBlur = 28;
            } else if (hasPrize) {
                gradient.addColorStop(0, '#FFE8F2');
                gradient.addColorStop(0.3, pinkColors[index % pinkColors.length]);
                gradient.addColorStop(1, pinkColors[(index + 6) % pinkColors.length]);
                ctx.shadowColor = 'rgba(0,0,0,0.18)';
                ctx.shadowBlur = 10;
            } else {
                gradient.addColorStop(0, '#FFF0F8');
                gradient.addColorStop(0.3, emptyPetalColors[index % emptyPetalColors.length]);
                gradient.addColorStop(1, '#FFBEDD');
                ctx.shadowColor = 'rgba(0,0,0,0.08)';
                ctx.shadowBlur = 6;
            }

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = hasPrize ? 2.5 : 1.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Nervadura central
            ctx.beginPath();
            ctx.moveTo(baseR * 0.6, 0);
            ctx.lineTo(petalLength * 0.82, 0);
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Brillo interno
            if (hasPrize) {
                ctx.beginPath();
                ctx.moveTo(baseR * 0.8, 0);
                ctx.bezierCurveTo(
                    petalLength * 0.25, -pHalfWidth * 0.55,
                    petalLength * 0.55, -pHalfWidth * 0.5,
                    petalLength * 0.72, -pHalfWidth * 0.15
                );
                ctx.bezierCurveTo(
                    petalLength * 0.55, -pHalfWidth * 0.28,
                    petalLength * 0.25, -pHalfWidth * 0.28,
                    baseR * 0.8, 0
                );
                ctx.fillStyle = 'rgba(255,255,255,0.22)';
                ctx.fill();
            }

            // Adorno en pétalos vacíos
            if (!hasPrize) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,100,170,0.35)';
                ctx.font = `${isFullscreen ? 18 : 14}px Arial`;
                ctx.fillText('✦', petalLength * 0.58, 0);
                ctx.restore();
            }

            ctx.restore();
        }

        /* ------------------------------ Textos ------------------------------- */
        for (let index = 0; index < prizes.length; index++) {
            const prize = prizes[index];
            const petalAngle = index * sliceAngle + sliceAngle / 2 + rotation;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(petalAngle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';

            const fontSize = isFullscreen
                ? Math.max(13, Math.min(20, pHalfWidth * 0.85))
                : Math.max(11, Math.min(16, pHalfWidth * 0.8));
            ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.75)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            const textX = petalLength * 0.7;
            const prizeName = (prize.prize_name || prize.name || '').trim();
            const words = prizeName.split(' ');
            const lineH = fontSize + 4;

            if (words.length <= 2 || prizeName.length <= 12) {
                ctx.fillText(prizeName, textX, 0);
            } else {
                const mid = Math.ceil(words.length / 2);
                ctx.fillText(words.slice(0, mid).join(' '), textX, -lineH / 2);
                ctx.fillText(words.slice(mid).join(' '), textX, lineH / 2);
            }
            ctx.restore();
        }

        /* ---------------------------- Centro dorado -------------------------- */
        const centerRadius = isFullscreen ? 42 : 34;
        const centerGrad = ctx.createRadialGradient(
            centerX - 7, centerY - 7, 3,
            centerX, centerY, centerRadius
        );
        centerGrad.addColorStop(0, '#FFF9E6');
        centerGrad.addColorStop(0.45, '#FFD700');
        centerGrad.addColorStop(1, '#FF8C00');

        ctx.beginPath();
        ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = centerGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const pollenCount = 8;
        for (let p = 0; p < pollenCount; p++) {
            const a = (p / pollenCount) * Math.PI * 2;
            const px = centerX + Math.cos(a) * (centerRadius * 0.55);
            const py = centerY + Math.sin(a) * (centerRadius * 0.55);
            ctx.beginPath();
            ctx.arc(px, py, centerRadius * 0.06, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 10, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.32)';
        ctx.fill();

        /* ------------------------------- Puntero ----------------------------- */
        const pointerAngle = -Math.PI / 2;
        const pointerX = centerX + Math.cos(pointerAngle) * (petalLength + 16);
        const pointerY = centerY + Math.sin(pointerAngle) * (petalLength + 16);

        ctx.save();
        ctx.translate(pointerX, pointerY);
        ctx.rotate(pointerAngle + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, -24);
        ctx.lineTo(18, -24);
        ctx.closePath();

        const pointerGrad = ctx.createLinearGradient(0, -24, 0, 0);
        pointerGrad.addColorStop(0, '#FF69B4');
        pointerGrad.addColorStop(1, '#FF1493');
        ctx.fillStyle = pointerGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }, [prizes, rotation, winningIndex, selectedPrize, isFullscreen]);

    const canvas = (
        <Box
            component="canvas"
            ref={canvasRef}
            sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.2))',
                animation: `${glow} 2s ease-in-out infinite alternate`
            }}
        />
    );

    // En pantalla completa, FullscreenWheel ya aporta el contenedor
    if (isFullscreen) return canvas;

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { xs: 310, sm: 390, md: 450, lg: 500 },
                aspectRatio: '1 / 1'
            }}
        >
            {canvas}

            {onFullscreen && (
                <Tooltip title="Pantalla completa">
                    <IconButton
                        onClick={onFullscreen}
                        aria-label="Ver la rueda en pantalla completa"
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 10,
                            width: 42,
                            height: 42,
                            color: 'primary.main',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            border: '1px solid rgba(255,105,180,0.3)',
                            boxShadow: '0 4px 15px rgba(255,105,180,0.18)',
                            '&:hover': {
                                bgcolor: '#fff',
                                transform: 'scale(1.08)',
                                boxShadow: '0 7px 20px rgba(255,105,180,0.28)'
                            }
                        }}
                    >
                        <OpenInFullRounded />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default WheelCanvas;