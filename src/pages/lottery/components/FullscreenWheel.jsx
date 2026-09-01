import React from 'react';
import WheelCanvas from './WheelCanvas';

const PETALS = ['🌸', '🌷', '🌺', '🌸', '🌷'];

const FullscreenWheel = ({ prizes, rotation, winningIndex, selectedPrize, spinning, onClose, onSpin }) => {
    return (
        <div className="fs-overlay">
            {/* pétalos flotando de fondo */}
            <div className="fs-petals" aria-hidden="true">
                {PETALS.map((p, i) => (
                    <span key={i} className={`fs-petal fs-petal-${i}`}>{p}</span>
                ))}
            </div>

            <div className="fs-topbar">
                <h1 className="fs-title">
                    <span className="fs-title-glow">Gira la Flor</span>
                </h1>
                <button className="fs-close" onClick={onClose} title="Cerrar (ESC)">
                    ✕
                </button>
            </div>

            <div className="fs-canvas-area">
                <div className="fs-wheel-frame">
                    <div className="fs-halo" aria-hidden="true"></div>
                    <WheelCanvas
                        prizes={prizes}
                        rotation={rotation}
                        winningIndex={winningIndex}
                        selectedPrize={selectedPrize}
                        isFullscreen={true}
                    />
                </div>
            </div>

            <div className="fs-controls">
                <button className="fs-spin-btn" onClick={onSpin} disabled={spinning || prizes.length === 0}>
                    <span className="fs-spin-shine"></span>
                    {spinning ? (
                        <>
                            <span className="fs-loader"></span>
                            Girando... ⏱️ 5s
                        </>
                    ) : (
                        <>🌸 Girar Flor</>
                    )}
                </button>
            </div>

            <style>{`
                .fs-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow: hidden;
                    background:
                        radial-gradient(circle at 20% 15%, rgba(255,182,213,0.55), transparent 55%),
                        radial-gradient(circle at 85% 80%, rgba(255,140,190,0.45), transparent 50%),
                        linear-gradient(160deg, #fff0f6 0%, #ffd6e8 40%, #ff9fc4 100%);
                }

                .fs-petals {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                .fs-petal {
                    position: absolute;
                    top: -10%;
                    font-size: 28px;
                    opacity: 0.55;
                    animation: fsFall linear infinite;
                    filter: drop-shadow(0 2px 4px rgba(214,71,143,0.25));
                }
                .fs-petal-0 { left: 6%;  animation-duration: 14s; animation-delay: 0s;  font-size: 22px; }
                .fs-petal-1 { left: 20%; animation-duration: 19s; animation-delay: 2s;  font-size: 34px; }
                .fs-petal-2 { left: 42%; animation-duration: 16s; animation-delay: 5s;  font-size: 18px; }
                .fs-petal-3 { left: 63%; animation-duration: 21s; animation-delay: 1s;  font-size: 30px; }
                .fs-petal-4 { left: 80%; animation-duration: 17s; animation-delay: 4s;  font-size: 24px; }
                .fs-petal-5 { left: 92%; animation-duration: 23s; animation-delay: 7s;  font-size: 20px; }

                @keyframes fsFall {
                    0%   { transform: translateY(-10vh) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(360deg); }
                }

                .fs-topbar {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 22px 20px 10px;
                    flex-shrink: 0;
                }

                .fs-title {
                    margin: 0;
                    font-size: 1.7rem;
                    font-weight: 800;
                    letter-spacing: 0.3px;
                    color: #8a1f5c;
                }

                .fs-title-glow {
                    background: linear-gradient(90deg, #ef55a2, #ff6fa5 45%, #e34695);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    animation: fsShimmerText 4s ease-in-out infinite;
                    text-shadow: 0 2px 18px rgba(214, 71, 143, 0.25);
                }

                @keyframes fsShimmerText {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }

                .fs-close {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.6);
                    background: rgba(255,255,255,0.35);
                    backdrop-filter: blur(6px);
                    color: #8a1f5c;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease;
                }
                .fs-close:hover {
                    background: rgba(255,255,255,0.6);
                    transform: rotate(90deg) scale(1.05);
                }

                .fs-canvas-area {
                    position: relative;
                    z-index: 2;
                    flex: 1;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 0;
                    padding: 10px;
                    box-sizing: border-box;
                }

                .fs-wheel-frame {
                    position: relative;
                    width: min(78vmin, 620px);
                    height: min(78vmin, 620px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .fs-wheel-frame canvas {
                    max-width: 100%;
                    max-height: 100%;
                }

                .fs-halo {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,182,213,0.35) 55%, transparent 75%);
                    filter: blur(4px);
                    animation: fsPulse 3.2s ease-in-out infinite;
                    z-index: -1;
                }

                @keyframes fsPulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.06); opacity: 1; }
                }

                .fs-controls {
                    position: relative;
                    z-index: 2;
                    padding: 18px 20px 34px;
                    display: flex;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .fs-spin-btn {
                    position: relative;
                    overflow: hidden;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 16px 38px;
                    border: none;
                    border-radius: 999px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    background: linear-gradient(135deg, #ff6fa5, #d6478f 60%, #b5306f);
                    box-shadow: 0 10px 25px rgba(214, 71, 143, 0.45), inset 0 1px 0 rgba(255,255,255,0.4);
                    cursor: pointer;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .fs-spin-btn:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.03);
                    box-shadow: 0 14px 30px rgba(214, 71, 143, 0.55), inset 0 1px 0 rgba(255,255,255,0.5);
                }
                .fs-spin-btn:active:not(:disabled) {
                    transform: translateY(0) scale(0.98);
                }
                .fs-spin-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .fs-spin-shine {
                    position: absolute;
                    top: 0;
                    left: -60%;
                    width: 40%;
                    height: 100%;
                    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
                    transform: skewX(-20deg);
                    animation: fsShine 2.6s ease-in-out infinite;
                }

                @keyframes fsShine {
                    0%   { left: -60%; }
                    60%  { left: 130%; }
                    100% { left: 130%; }
                }

                .fs-loader {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.35);
                    border-top-color: #fff;
                    border-radius: 50%;
                    display: inline-block;
                    animation: fsspin 0.8s linear infinite;
                }

                @keyframes fsspin { to { transform: rotate(360deg); } }

                @media (max-width: 480px) {
                    .fs-title { font-size: 1.3rem; }
                    .fs-spin-btn { padding: 14px 28px; font-size: 1rem; }
                }
            `}</style>
        </div>
    );
};

export default FullscreenWheel;