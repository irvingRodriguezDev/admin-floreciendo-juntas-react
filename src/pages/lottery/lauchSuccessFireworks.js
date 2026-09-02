import confetti from "canvas-confetti";

export const launchFireworks = () => {
    const duration = 10 * 1000; // Duración total
    const animationEnd = Date.now() + duration;

    // Función helper para números aleatorios en un rango
    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Explosión 1 (posición aleatoria izquierda)
        confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
            colors: ["#DA327C", "#FADADD", "#FFFFFF", "#DA327C"],
            zIndex: 2147483647
        });

        // Explosión 2 (posición aleatoria derecha)
        confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
            colors: ["#DA327C", "#FADADD", "#FFFFFF", "#DA327C"],
            zIndex: 2147483647
        });
    }, 250); // Lanza un cohete cada 250ms
};