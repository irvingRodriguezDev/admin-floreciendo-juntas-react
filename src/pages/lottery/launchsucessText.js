import confetti from "canvas-confetti";

export const launchRoseConfetti = () => {
    // Creamos la forma personalizada a partir del emoji
    const roseShape = confetti.shapeFromText({ text: "🌹", scalar: 2 });

    const duration = 5 * 1000; // 5 segundos de duración
    const end = Date.now() + duration;

    const frame = () => {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            shapes: [roseShape],
            scalar: 2, // Controla el tamaño del emoji
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            shapes: [roseShape],
            scalar: 2,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    };
    frame();
};