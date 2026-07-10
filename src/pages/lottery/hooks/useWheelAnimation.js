import { useState, useRef, useEffect, useCallback } from 'react';

export const useWheelAnimation = (prizes, setCurrentWinners, setHistoricalWinners, getCurrentMonth) => {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winningIndex, setWinningIndex] = useState(-1);
    const [targetRotation, setTargetRotation] = useState(0);
    const animationRef = useRef(null);

    const MIN_PETALS = 5;

    const calculateWinningRotation = useCallback((prizeId) => {
        const totalPetals = Math.max(MIN_PETALS, prizes.length);
        if (totalPetals === 0) return 0;
        const prizeIndex = prizes.findIndex(p => p.id === prizeId);
        if (prizeIndex === -1) return 0;
        const sliceAngle = (2 * Math.PI) / totalPetals;
        const prizeCenterAngle = prizeIndex * sliceAngle + sliceAngle / 2;
        let target = (-Math.PI / 2) - prizeCenterAngle;
        target = ((target % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        return 5 * (2 * Math.PI) + target;
    }, [prizes]);

    const animateWheel = useCallback((targetRotation, winner, selectedPrize, onComplete) => {
        const spinDuration = 5000;
        const startTime = Date.now();
        const startRotation = rotation;
        const finalTarget = targetRotation + Math.floor(Math.random() * 3 + 3) * (2 * Math.PI);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (finalTarget - startRotation) * easeOut;
            setRotation(currentRotation);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setSpinning(false);
                setRotation(currentRotation % (2 * Math.PI));
                if (winner && selectedPrize) {
                    setCurrentWinners(prev => [...prev, {
                        ...winner,
                        prize: selectedPrize.name,
                        prize_id: selectedPrize.id,
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    const currentMonth = getCurrentMonth();
                    setHistoricalWinners(prev => [...prev, {
                        id: winner.id,
                        name: winner.name,
                        email: winner.email,
                        phone: winner.phone || 'N/A',
                        prize_name: selectedPrize.name,
                        position: prev.length + 1,
                        month: currentMonth,
                        createdAt: new Date().toISOString()
                    }]);
                }
                onComplete?.();
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [rotation, getCurrentMonth, setCurrentWinners, setHistoricalWinners]);

    const stopAnimation = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    useEffect(() => stopAnimation, [stopAnimation]);

    return {
        spinning,
        setSpinning,
        rotation,
        setRotation,
        winningIndex,
        setWinningIndex,
        targetRotation,
        setTargetRotation,
        calculateWinningRotation,
        animateWheel,
        stopAnimation
    };
};