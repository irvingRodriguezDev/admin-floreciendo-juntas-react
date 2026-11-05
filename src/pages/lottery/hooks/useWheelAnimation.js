import { useState, useRef, useEffect, useCallback } from 'react';

export const useWheelAnimation = (prizes, setCurrentWinners, setHistoricalWinners, getCurrentMonth) => {
    const [spinning, setSpinning] = useState(false);
    const [winningIndex, setWinningIndex] = useState(-1);
    const [targetRotation, setTargetRotation] = useState(0);

    // 🔥 LA CLAVE: Usamos un Ref en lugar de State
    const rotationRef = useRef(0);
    const animationRef = useRef(null);

    const MIN_PETALS = 5;
    const TAU = Math.PI * 2;

    const calculateWinningRotation = useCallback((prizeId) => {
        const totalPetals = Math.max(MIN_PETALS, prizes.length);
        if (totalPetals === 0) return 0;
        const prizeIndex = prizes.findIndex(p => p.id === prizeId);
        if (prizeIndex === -1) return 0;

        const sliceAngle = TAU / totalPetals;
        const prizeCenterAngle = prizeIndex * sliceAngle + sliceAngle / 2;

        let target = -Math.PI / 2 - prizeCenterAngle;
        target = ((target % TAU) + TAU) % TAU;
        return 5 * TAU + target;
    }, [prizes]);

    const animateWheel = useCallback((targetRot, winner, selectedPrize, onComplete) => {
        const spinDuration = 5200;
        const startTime = performance.now();
        const startRotation = rotationRef.current;

        const extraSpins = (3 + Math.floor(Math.random() * 3)) * TAU;
        const finalTarget = targetRot + extraSpins;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);

            // Actualizamos el ref (NO hace re-render en React)
            rotationRef.current = startRotation + (finalTarget - startRotation) * easeOut;

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                rotationRef.current = ((rotationRef.current % TAU) + TAU) % TAU;
                setSpinning(false);

                if (winner && selectedPrize) {
                    setCurrentWinners(prev => [...prev, {
                        ...winner,
                        prize: selectedPrize.name,
                        prize_id: selectedPrize.id,
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    setHistoricalWinners(prev => [...prev, {
                        id: winner.id,
                        name: winner.name,
                        email: winner.email,
                        phone: winner.phone || 'N/A',
                        prize_name: selectedPrize.name,
                        position: prev.length + 1,
                        month: getCurrentMonth(),
                        createdAt: new Date().toISOString()
                    }]);
                }
                onComplete?.();
            }
        };
        animationRef.current = requestAnimationFrame(animate);
    }, [getCurrentMonth, setCurrentWinners, setHistoricalWinners]);

    const stopAnimation = useCallback(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }, []);

    useEffect(() => stopAnimation, [stopAnimation]);

    return {
        spinning,
        setSpinning,
        rotationRef, // 🔥 Exportamos el Ref
        winningIndex,
        setWinningIndex,
        targetRotation,
        setTargetRotation,
        calculateWinningRotation,
        animateWheel,
        stopAnimation
    };
};