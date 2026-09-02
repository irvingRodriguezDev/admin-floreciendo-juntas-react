import React, { useMemo } from 'react';
import WheelCanvas from './WheelCanvas';

const FullscreenWheel = ({
    prizes,
    rotation,
    winningIndex,
    selectedPrize,
    spinning,
    onClose,
    onSpin
}) => {

    // Generamos los pétalos UNA SOLA VEZ.
    // Así no cambian de posición cuando cambia "rotation".
    const petals = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            emoji: ['🌸', '🌷', '🌺'][i % 3],
            left: Math.random() * 100,
            delay: Math.random() * -20,
            duration: 12 + Math.random() * 14,
            size: 16 + Math.random() * 18
        }));
    }, []);

    return (
        <div className="fs-overlay">

            {/* =====================================================
                PÉTALOS DE FONDO
                ===================================================== */}
            <div className="fs-petals" aria-hidden="true">
                {petals.map((petal, i) => (
                    <span
                        key={i}
                        className="fs-petal"
                        style={{
                            left: `${petal.left}%`,
                            animationDelay: `${petal.delay}s`,
                            animationDuration: `${petal.duration}s`,
                            fontSize: `${petal.size}px`
                        }}
                    >
                        {petal.emoji}
                    </span>
                ))}
            </div>


            {/* =====================================================
                TOP BAR
                ===================================================== */}
            <div className="fs-topbar">
                <h1 className="fs-title">
                    <span className="fs-title-glow">
                        Gira la Flor
                    </span>
                </h1>

                <button
                    className="fs-close"
                    onClick={onClose}
                    title="Cerrar (ESC)"
                >
                    ✕
                </button>
            </div>


            {/* =====================================================
                RUEDA
                ===================================================== */}
            <div className="fs-canvas-area">
                <div className="fs-wheel-frame">

                    <div
                        className="fs-halo"
                        aria-hidden="true"
                    />

                    <WheelCanvas
                        prizes={prizes}
                        rotation={rotation}
                        winningIndex={winningIndex}
                        selectedPrize={selectedPrize}
                        isFullscreen={true}
                    />

                </div>
            </div>


            {/* =====================================================
                CONTROLES
                ===================================================== */}
            <div className="fs-controls">

                <button
                    className="fs-spin-btn"
                    onClick={onSpin}
                    disabled={
                        spinning ||
                        prizes.length === 0
                    }
                >
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

                /* =====================================================
                   FONDO
                   ===================================================== */

                .fs-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;

                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    overflow: hidden;

                    background:
                        radial-gradient(
                            circle at 20% 15%,
                            rgba(255,182,213,0.55),
                            transparent 55%
                        ),
                        radial-gradient(
                            circle at 85% 80%,
                            rgba(255,140,190,0.45),
                            transparent 50%
                        ),
                        linear-gradient(
                            160deg,
                            #fff0f6 0%,
                            #ffd6e8 40%,
                            #ff9fc4 100%
                        );
                }


                /* =====================================================
                   PÉTALOS
                   ===================================================== */

                .fs-petals {
                    position: fixed;
                    inset: 0;

                    width: 100vw;
                    height: 100vh;

                    pointer-events: none;

                    overflow: hidden;

                    z-index: 1;

                    /* Nunca debe rotarse */
                    transform: none !important;
                }

                .fs-petal {
                    position: absolute;

                    top: -10%;

                    display: block;

                    opacity: 0.55;

                    pointer-events: none;

                    animation-name: fsFall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;

                    filter:
                        drop-shadow(
                            0 2px 4px
                            rgba(214,71,143,0.25)
                        );

                    will-change: transform;
                }


                /* =====================================================
                   CAÍDA DE PÉTALOS
                   ===================================================== */

                @keyframes fsFall {

                    0% {
                        transform:
                            translate3d(
                                0,
                                -10vh,
                                0
                            )
                            rotate(0deg);
                    }

                    20% {
                        transform:
                            translate3d(
                                35px,
                                20vh,
                                0
                            )
                            rotate(70deg);
                    }

                    40% {
                        transform:
                            translate3d(
                                -25px,
                                40vh,
                                0
                            )
                            rotate(150deg);
                    }

                    60% {
                        transform:
                            translate3d(
                                30px,
                                60vh,
                                0
                            )
                            rotate(230deg);
                    }

                    80% {
                        transform:
                            translate3d(
                                -35px,
                                80vh,
                                0
                            )
                            rotate(300deg);
                    }

                    100% {
                        transform:
                            translate3d(
                                20px,
                                110vh,
                                0
                            )
                            rotate(360deg);
                    }
                }


                /* =====================================================
                   TOP BAR
                   ===================================================== */

                .fs-topbar {
                    position: relative;

                    z-index: 3;

                    width: 100%;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    padding:
                        22px
                        20px
                        10px;

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
                    background:
                        linear-gradient(
                            90deg,
                            #ef55a2,
                            #ff6fa5 45%,
                            #e34695
                        );

                    background-size: 200% auto;

                    -webkit-background-clip: text;
                    background-clip: text;

                    color: transparent;

                    animation:
                        fsShimmerText
                        4s ease-in-out
                        infinite;

                    text-shadow:
                        0 2px 18px
                        rgba(214,71,143,0.25);
                }

                @keyframes fsShimmerText {

                    0%,
                    100% {
                        background-position:
                            0% center;
                    }

                    50% {
                        background-position:
                            100% center;
                    }
                }


                /* =====================================================
                   BOTÓN CERRAR
                   ===================================================== */

                .fs-close {
                    position: absolute;

                    right: 20px;
                    top: 20px;

                    width: 42px;
                    height: 42px;

                    border-radius: 50%;

                    border:
                        1px solid
                        rgba(255,255,255,0.6);

                    background:
                        rgba(255,255,255,0.35);

                    backdrop-filter:
                        blur(6px);

                    color: #8a1f5c;

                    font-size: 1.1rem;

                    cursor: pointer;

                    transition:
                        transform 0.2s ease,
                        background 0.2s ease;
                }

                .fs-close:hover {
                    background:
                        rgba(255,255,255,0.6);

                    transform:
                        rotate(90deg)
                        scale(1.05);
                }


                /* =====================================================
                   ÁREA DE LA RUEDA
                   ===================================================== */

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

                    width:
                        min(78vmin, 620px);

                    height:
                        min(78vmin, 620px);

                    display: flex;

                    align-items: center;

                    justify-content: center;
                }

                .fs-wheel-frame canvas {
                    max-width: 100%;
                    max-height: 100%;
                }


                /* =====================================================
                   HALO
                   ===================================================== */

                .fs-halo {
                    position: absolute;

                    width: 100%;
                    height: 100%;

                    border-radius: 50%;

                    background:
                        radial-gradient(
                            circle,
                            rgba(255,255,255,0.85) 0%,
                            rgba(255,182,213,0.35) 55%,
                            transparent 75%
                        );

                    filter: blur(4px);

                    animation:
                        fsPulse
                        3.2s ease-in-out
                        infinite;

                    z-index: -1;
                }

                @keyframes fsPulse {

                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.9;
                    }

                    50% {
                        transform: scale(1.06);
                        opacity: 1;
                    }
                }


                /* =====================================================
                   CONTROLES
                   ===================================================== */

                .fs-controls {
                    position: relative;

                    z-index: 3;

                    padding:
                        18px
                        20px
                        34px;

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

                    padding:
                        16px
                        38px;

                    border: none;

                    border-radius: 999px;

                    font-size: 1.1rem;

                    font-weight: 700;

                    color: #fff;

                    background:
                        linear-gradient(
                            135deg,
                            #ff6fa5,
                            #d6478f 60%,
                            #b5306f
                        );

                    box-shadow:
                        0 10px 25px
                        rgba(214,71,143,0.45),

                        inset 0 1px 0
                        rgba(255,255,255,0.4);

                    cursor: pointer;

                    transition:
                        transform 0.15s ease,
                        box-shadow 0.15s ease;
                }

                .fs-spin-btn:hover:not(:disabled) {
                    transform:
                        translateY(-2px)
                        scale(1.03);

                    box-shadow:
                        0 14px 30px
                        rgba(214,71,143,0.55),

                        inset 0 1px 0
                        rgba(255,255,255,0.5);
                }

                .fs-spin-btn:active:not(:disabled) {
                    transform:
                        translateY(0)
                        scale(0.98);
                }

                .fs-spin-btn:disabled {
                    opacity: 0.7;

                    cursor: not-allowed;
                }


                /* =====================================================
                   BRILLO DEL BOTÓN
                   ===================================================== */

                .fs-spin-shine {
                    position: absolute;

                    top: 0;
                    left: -60%;

                    width: 40%;
                    height: 100%;

                    background:
                        linear-gradient(
                            120deg,
                            transparent,
                            rgba(255,255,255,0.55),
                            transparent
                        );

                    transform:
                        skewX(-20deg);

                    animation:
                        fsShine
                        2.6s ease-in-out
                        infinite;
                }

                @keyframes fsShine {

                    0% {
                        left: -60%;
                    }

                    60% {
                        left: 130%;
                    }

                    100% {
                        left: 130%;
                    }
                }


                /* =====================================================
                   LOADER
                   ===================================================== */

                .fs-loader {
                    width: 20px;
                    height: 20px;

                    border:
                        3px solid
                        rgba(255,255,255,0.35);

                    border-top-color: #fff;

                    border-radius: 50%;

                    display: inline-block;

                    animation:
                        fsspin
                        0.8s linear
                        infinite;
                }

                @keyframes fsspin {
                    to {
                        transform: rotate(360deg);
                    }
                }


                /* =====================================================
                   MOBILE
                   ===================================================== */

                @media (max-width: 480px) {

                    .fs-title {
                        font-size: 1.3rem;
                    }

                    .fs-spin-btn {
                        padding:
                            14px
                            28px;

                        font-size: 1rem;
                    }

                    .fs-petal {
                        opacity: 0.45;
                    }
                }

            `}</style>
        </div>
    );
};

export default FullscreenWheel;
