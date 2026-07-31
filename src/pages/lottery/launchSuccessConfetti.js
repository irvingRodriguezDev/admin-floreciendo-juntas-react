import React from "react";
import confetti from "canvas-confetti";
export const launchSuccessConfetti = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#DA327C", "#FADADD", "#FFFFFF"],
      zIndex: 2147483647
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#DA327C", "#FADADD", "#FFFFFF"],
      zIndex: 2147483647
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};