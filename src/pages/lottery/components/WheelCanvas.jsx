import React, { useEffect, useRef } from 'react';

const WheelCanvas = ({
    prizes,
    rotation,
    winningIndex,
    selectedPrize,
    isFullscreen = false
}) => {
    const canvasRef = useRef(null);

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

    useEffect(() => {
        drawWheel();
    }, [prizes, rotation, winningIndex, selectedPrize, isFullscreen]);

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const SIZE = isFullscreen ? Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.80) : 680;
        canvas.width = SIZE;
        canvas.height = SIZE;

        const centerX = SIZE / 2;
        const centerY = SIZE / 2;
        const petalLength = Math.min(centerX, centerY) - (isFullscreen ? 22 : 18);
        const totalPetals = Math.max(MIN_PETALS, prizes.length);
        const sliceAngle = (2 * Math.PI) / totalPetals;

        ctx.clearRect(0, 0, SIZE, SIZE);

        for (let index = 0; index < totalPetals; index++) {
            const hasPrize = index < prizes.length;
            const prize = hasPrize ? prizes[index] : null;
            const petalAngle = index * sliceAngle + sliceAngle / 2 + rotation;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(petalAngle);

            const visualSliceAngle = totalPetals === 1 ? Math.PI * 0.75 : sliceAngle;
            const pHalfWidth = Math.min(Math.tan(visualSliceAngle / 2) * petalLength * 0.68, petalLength * 0.44);
            const isWinning = hasPrize && winningIndex === index && selectedPrize?.id === prize.id;

            // Dibujar pétalo
            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.bezierCurveTo(
                petalLength * 0.28, -pHalfWidth * 1.15,
                petalLength * 0.68, -pHalfWidth,
                petalLength, 0
            );
            ctx.bezierCurveTo(
                petalLength * 0.68, pHalfWidth,
                petalLength * 0.28, pHalfWidth * 1.15,
                18, 0
            );
            ctx.closePath();

            // Gradiente
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

            // Brillo interno
            if (hasPrize) {
                ctx.beginPath();
                ctx.moveTo(22, 0);
                ctx.bezierCurveTo(
                    petalLength * 0.25, -pHalfWidth * 0.55,
                    petalLength * 0.55, -pHalfWidth * 0.5,
                    petalLength * 0.72, -pHalfWidth * 0.15
                );
                ctx.bezierCurveTo(
                    petalLength * 0.55, -pHalfWidth * 0.28,
                    petalLength * 0.25, -pHalfWidth * 0.28,
                    22, 0
                );
                ctx.fillStyle = 'rgba(255,255,255,0.22)';
                ctx.fill();
            }

            // Texto del premio
            if (hasPrize) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                const fontSize = isFullscreen
                    ? Math.max(14, Math.min(22, petalLength / 6.5))
                    : Math.max(13, Math.min(18, petalLength / 7));
                ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
                ctx.shadowColor = 'rgba(0,0,0,0.75)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                const textX = petalLength * 0.6;
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
            } else {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,100,170,0.35)';
                const decorFontSize = isFullscreen ? 18 : 14;
                ctx.font = `${decorFontSize}px Arial`;
                ctx.fillText('✦', petalLength * 0.58, 0);
                ctx.restore();
            }

            ctx.restore();
        }

        // Centro dorado
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

        // Brillo central
        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 10, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.32)';
        ctx.fill();

        // Puntero
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
    };

    return <canvas ref={canvasRef} className="wheel-canvas" />;
};

export default WheelCanvas;