import confetti from "canvas-confetti";


export const launchEmojiRain = () => {
    const duration = 6 * 1000;
    const end = Date.now() + duration;
    const roseShape = confetti.shapeFromText({ text: "🌹", scalar: 1.8 });
    const heartShape = confetti.shapeFromText({ text: "💖", scalar: 1.8 });

    (function frame() {
        confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: 200,
            origin: {
                x: Math.random(),
                // cae desde la parte superior
                y: Math.random() * 0.2,
            },
            colors: ["#DA327C"],
            shapes: [roseShape, heartShape],
            gravity: 0.6,
            scalar: 1.8,
            drift: Math.random() - 0.5, // Le da un movimiento suave horizontal
            zIndex: 2147483647
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
};