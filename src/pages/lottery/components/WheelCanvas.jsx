import React, { useEffect, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import OpenInFullRounded from '@mui/icons-material/OpenInFullRounded';
import { keyframes } from '@mui/system';

const glow = keyframes`
  from { filter: drop-shadow(0 8px 22px rgba(214, 71, 143, 0.22)); }
  to   { filter: drop-shadow(0 10px 32px rgba(255, 20, 147, 0.42)); }
`;

const MIN_PETALS = 5;

const PRIZE_PALETTES = [
    ['#FFE0EE', '#FF5FA2', '#C71585'],
    ['#FFE9F3', '#FF80AB', '#D63384'],
    ['#FFF0F6', '#FF4D94', '#A60E5A'],
    ['#FFDDEB', '#FF69B4', '#E0429A'],
    ['#FFEAF3', '#FF3D8B', '#B01067'],
    ['#FFE4EF', '#FF91B9', '#C42A78']
];

const EMPTY_PALETTE = ['#FFF3F9', '#FFD3E6', '#FFB8D6'];

const drawPetal = (ctx, length, halfWidth, baseR) => {
    ctx.beginPath();
    ctx.moveTo(baseR * 0.35, 0);
    ctx.bezierCurveTo(length * 0.18, -halfWidth * 1.0, length * 0.55, -halfWidth * 1.08, length * 0.86, -halfWidth * 0.42);
    ctx.bezierCurveTo(length * 1.0, -halfWidth * 0.18, length * 1.0, halfWidth * 0.18, length * 0.86, halfWidth * 0.42);
    ctx.bezierCurveTo(length * 0.55, halfWidth * 1.08, length * 0.18, halfWidth * 1.0, baseR * 0.35, 0);
    ctx.closePath();
};

const WheelCanvas = ({ prizes, rotationRef, winningIndex, selectedPrize, isFullscreen = false, onFullscreen }) => {
    const canvasRef = useRef(null);
    const dpr = useMemo(() => Math.min(window.devicePixelRatio || 1, 2.5), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            // 🔥 Si por alguna razón rotationRef no llega, usamos 0 para que no rompa
            const currentRotation = rotationRef?.current || 0;

            const cssSize = isFullscreen
                ? Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.78)
                : 680;

            if (canvas.width !== Math.floor(cssSize * dpr)) {
                canvas.width = Math.floor(cssSize * dpr);
                canvas.height = Math.floor(cssSize * dpr);
                canvas.style.width = `${cssSize}px`;
                canvas.style.height = `${cssSize}px`;
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cssSize, cssSize);

            const centerX = cssSize / 2;
            const centerY = cssSize / 2;
            const outerPad = isFullscreen ? 24 : 18;
            const petalLength = Math.min(centerX, centerY) - outerPad;
            const totalPetals = Math.max(MIN_PETALS, prizes.length);
            const sliceAngle = (Math.PI * 2) / totalPetals;

            const gap = 0.9;
            const maxHalfWidthByAngle = Math.tan((sliceAngle * gap) / 2) * petalLength;
            const petalHalfWidth = Math.min(maxHalfWidthByAngle, petalLength * 0.32);
            const baseR = Math.max(10, petalLength * 0.045);

            /* Pétalos */
            for (let index = 0; index < totalPetals; index++) {
                const hasPrize = index < prizes.length;
                const prize = hasPrize ? prizes[index] : null;
                const petalAngle = index * sliceAngle + sliceAngle / 2 + currentRotation;
                const isWinning = hasPrize && winningIndex === index && selectedPrize?.id === prize.id;

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(petalAngle);
                drawPetal(ctx, petalLength, petalHalfWidth, baseR);

                const gradient = ctx.createLinearGradient(0, 0, petalLength, 0);

                if (isWinning) {
                    gradient.addColorStop(0, '#FFE0F0');
                    gradient.addColorStop(0.45, '#FF2D87');
                    gradient.addColorStop(1, '#B0095C');
                    ctx.shadowColor = 'rgba(255, 20, 147, 0.9)';
                    ctx.shadowBlur = 26;
                } else if (hasPrize) {
                    const palette = PRIZE_PALETTES[index % PRIZE_PALETTES.length];
                    gradient.addColorStop(0, palette[0]);
                    gradient.addColorStop(0.45, palette[1]);
                    gradient.addColorStop(1, palette[2]);
                    ctx.shadowColor = 'rgba(200, 40, 120, 0.28)';
                    ctx.shadowBlur = 12;
                } else {
                    gradient.addColorStop(0, EMPTY_PALETTE[0]);
                    gradient.addColorStop(0.5, EMPTY_PALETTE[1]);
                    gradient.addColorStop(1, EMPTY_PALETTE[2]);
                    ctx.shadowColor = 'rgba(200, 40, 120, 0.12)';
                    ctx.shadowBlur = 6;
                }

                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isWinning ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)';
                ctx.lineWidth = isWinning ? 3 : 1.8;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(baseR * 0.9, 0);
                ctx.lineTo(petalLength * 0.78, 0);
                ctx.strokeStyle = 'rgba(255,255,255,0.35)';
                ctx.lineWidth = 1;
                ctx.stroke();

                if (hasPrize) {
                    ctx.beginPath();
                    ctx.moveTo(baseR * 1.1, -petalHalfWidth * 0.05);
                    ctx.bezierCurveTo(petalLength * 0.3, -petalHalfWidth * 0.55, petalLength * 0.6, -petalHalfWidth * 0.45, petalLength * 0.82, -petalHalfWidth * 0.12);
                    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
                    ctx.lineWidth = Math.max(1.5, petalHalfWidth * 0.12);
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }

                if (!hasPrize) {
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'rgba(200, 40, 120, 0.28)';
                    ctx.font = `${isFullscreen ? 18 : 14}px 'Segoe UI', Arial`;
                    ctx.fillText('✦', petalLength * 0.6, 0);
                    ctx.restore();
                }
                ctx.restore();
            }

            /* Textos */
            for (let index = 0; index < prizes.length; index++) {
                const prize = prizes[index];
                const petalAngle = index * sliceAngle + sliceAngle / 2 + currentRotation;

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(petalAngle);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const fontSize = isFullscreen ? Math.max(12, Math.min(19, petalHalfWidth * 0.85)) : Math.max(11, Math.min(16, petalHalfWidth * 0.8));
                ctx.font = `700 ${fontSize}px 'Segoe UI', system-ui, Arial, sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                ctx.shadowColor = 'rgba(120, 0, 60, 0.9)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 1;

                const textX = petalLength * 0.68;
                const rawName = (prize.prize_name || prize.name || '').trim();
                const words = rawName.split(' ');
                const lineH = fontSize + 3;

                if (words.length <= 2 || rawName.length <= 12) {
                    ctx.fillText(rawName, textX, 0);
                } else {
                    const mid = Math.ceil(words.length / 2);
                    ctx.fillText(words.slice(0, mid).join(' '), textX, -lineH / 2);
                    ctx.fillText(words.slice(mid).join(' '), textX, lineH / 2);
                }
                ctx.restore();
            }

            /* Centro */
            const centerRadius = isFullscreen ? 46 : 38;
            const centerGrad = ctx.createRadialGradient(centerX - centerRadius * 0.35, centerY - centerRadius * 0.35, centerRadius * 0.1, centerX, centerY, centerRadius);
            centerGrad.addColorStop(0, '#FFFDF2');
            centerGrad.addColorStop(0.45, '#FFD84D');
            centerGrad.addColorStop(1, '#E08A00');

            ctx.beginPath();
            ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
            ctx.fillStyle = centerGrad;
            ctx.shadowColor = 'rgba(180, 80, 0, 0.35)';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.95)';
            ctx.lineWidth = 3;
            ctx.stroke();

            /* Puntero */
            const pointerAngle = -Math.PI / 2;
            const pointerR = petalLength + (isFullscreen ? 12 : 8);
            const pointerX = centerX + Math.cos(pointerAngle) * pointerR;
            const pointerY = centerY + Math.sin(pointerAngle) * pointerR;

            ctx.save();
            ctx.translate(pointerX, pointerY);
            ctx.rotate(pointerAngle + Math.PI / 2);
            const pW = isFullscreen ? 22 : 18;
            const pH = isFullscreen ? 32 : 26;
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(-pW, -pH);
            ctx.quadraticCurveTo(0, -pH * 1.15, pW, -pH);
            ctx.closePath();
            const pointerGrad = ctx.createLinearGradient(0, -pH, 0, 4);
            pointerGrad.addColorStop(0, '#FF8FC0');
            pointerGrad.addColorStop(1, '#E0247A');
            ctx.fillStyle = pointerGrad;
            ctx.shadowColor = 'rgba(160, 0, 80, 0.4)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.95)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            // Bucle a 60fps
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [prizes, winningIndex, selectedPrize, isFullscreen, dpr, rotationRef]);

    const canvasEl = (
        <Box component="canvas" ref={canvasRef} sx={{ display: 'block', maxWidth: '100%', maxHeight: '100%', borderRadius: '50%', filter: 'drop-shadow(0 10px 28px rgba(214, 71, 143, 0.25))', animation: `${glow} 2.4s ease-in-out infinite alternate` }} />
    );

    if (isFullscreen) return <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{canvasEl}</Box>;

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: { xs: 310, sm: 390, md: 460, lg: 520 }, aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {canvasEl}
            {onFullscreen && (
                <Tooltip title="Pantalla completa">
                    <IconButton onClick={onFullscreen} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10, width: 44, height: 44, color: 'primary.main', bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,105,180,0.35)', boxShadow: '0 6px 18px rgba(214,71,143,0.22)' }}>
                        <OpenInFullRounded />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default WheelCanvas;