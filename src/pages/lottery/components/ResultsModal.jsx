import React, { useEffect } from 'react';
import TiktokIcon from '../TiktokIcon';
import { launchSuccessConfetti } from '../launchSuccessConfetti';

const ResultsModal = ({ winner, selectedPrize, raffleResult, onClose }) => {

    useEffect(() => {
        launchSuccessConfetti();
    }, []);

    return (
        <div className="rm-overlay">
            <div className="results-modal">
                <button className="rm-close" onClick={onClose} title="Cerrar">✕</button>

                <div className="rm-stage">
                    <div className="rm-glow"></div>
                    <div className="rm-confetti" aria-hidden="true">
                        <span></span><span></span><span></span><span></span>
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <div className="rm-trophy">🏆</div>
                    <h2 className="rm-heading">¡Felicidades!</h2>
                    {raffleResult?.message && (
                        <p className="rm-message">{raffleResult.message}</p>
                    )}
                </div>

                <div className="rm-content">
                    <div className="rm-row">
                        <div className="rm-row-main">
                            <div className="rm-avatar">{winner.name.charAt(0)}</div>
                            <div className="rm-row-info">
                                <span className="rm-row-label">Ganador</span>
                                <strong className="rm-row-value">{winner.name}</strong>
                                {winner.tiktokUsername !== null && (
                                    <span className="rm-tiktok-badge">
                                        <TiktokIcon width="16" />
                                        <span className="rm-tiktok-divider"></span>
                                        @{winner.tiktokUsername}
                                        {/* <span className="rm-tiktok-sparkle">✨</span> */}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rm-row">
                        <div className="rm-row-main">
                            <div className="rm-avatar rm-avatar-prize">🎁</div>
                            <div className="rm-row-info">
                                <span className="rm-row-label">Premio</span>
                                <strong className="rm-row-value">{selectedPrize.name}</strong>
                                <span className="rm-row-sub rm-row-warning">
                                    ⚠️ Ya no está disponible para futuros sorteos
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className="rm-cta" onClick={onClose}>
                        🌸 Realizar nuevo sorteo
                    </button>
                </div>
            </div>

            <style>{`
                .rm-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    box-sizing: border-box;
                    background: rgba(60, 4, 36, 0.55);
                    backdrop-filter: blur(4px);
                    animation: rmFadeIn 0.25s ease;
                }

                @keyframes rmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .results-modal {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    background: #fff;
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 28px 70px rgba(180, 30, 100, 0.28);
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .rm-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    z-index: 3;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.3);
                    color: #fff;
                    font-size: 0.85rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                    transition: background 0.2s ease, transform 0.2s ease;
                }
                .rm-close:hover {
                    background: rgba(255,255,255,0.5);
                    transform: rotate(90deg);
                }

                .rm-stage {
                    position: relative;
                    overflow: hidden;
                    padding: 52px 34px 42px;
                    text-align: center;
                    background: linear-gradient(150deg, #ff85b3, #e0468f 55%, #b5306f);
                }

                .rm-glow {
                    position: absolute;
                    top: -40%;
                    left: 50%;
                    width: 320px;
                    height: 320px;
                    transform: translateX(-50%);
                    background: radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%);
                    border-radius: 50%;
                }

                .rm-confetti {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .rm-confetti span {
                    position: absolute;
                    width: 7px;
                    height: 7px;
                    border-radius: 2px;
                    background: #fff;
                    opacity: 0.8;
                }
                .rm-confetti span:nth-child(1) { top: 18%; left: 12%; background: #ffe066; transform: rotate(20deg); }
                .rm-confetti span:nth-child(2) { top: 30%; left: 85%; background: #fff; transform: rotate(-15deg); }
                .rm-confetti span:nth-child(3) { top: 65%; left: 8%;  background: #fff; border-radius: 50%; }
                .rm-confetti span:nth-child(4) { top: 75%; left: 90%; background: #ffe066; transform: rotate(45deg); }
                .rm-confetti span:nth-child(5) { top: 10%; left: 45%; background: #fff; border-radius: 50%; }
                .rm-confetti span:nth-child(6) { top: 50%; left: 95%; background: #fff; transform: rotate(30deg); }
                .rm-confetti span:nth-child(7) { top: 85%; left: 45%; background: #ffe066; border-radius: 50%; }
                .rm-confetti span:nth-child(8) { top: 8%;  left: 75%; background: #fff; transform: rotate(-30deg); }

                .rm-trophy {
                    position: relative;
                    z-index: 1;
                    width: 84px;
                    height: 84px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(2px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.4rem;
                    animation: rmPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }

                @keyframes rmPop {
                    from { transform: scale(0); }
                    to   { transform: scale(1); }
                }

                .rm-heading {
                    position: relative;
                    z-index: 1;
                    margin: 0 0 8px;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #fff;
                }

                .rm-message {
                    position: relative;
                    z-index: 1;
                    margin: 0;
                    font-size: 0.98rem;
                    color: rgba(255,255,255,0.92);
                    line-height: 1.45;
                }

                .rm-content {
                    padding: 30px 30px 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .rm-row {
                    border-radius: 18px;
                    background: #fff3f8;
                }

                .rm-row-main {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 15px 17px;
                }

                .rm-tiktok-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    width: fit-content;
                    margin-top: 7px;
                    padding: 5px 12px 5px 8px;
                    border-radius: 999px;
                    background: #010101;
                    border: 1.5px solid #ff5fa2;
                    box-shadow: 0 0 10px rgba(255, 95, 162, 0.55), 0 0 3px rgba(255, 95, 162, 0.7);
                    color: #fff;
                    font-size: 0.8rem;
                    font-weight: 700;
                    line-height: 1;
                }

                .rm-tiktok-divider {
                    width: 1px;
                    height: 14px;
                    background: rgba(255, 255, 255, 0.25);
                }

                .rm-tiktok-sparkle {
                    font-size: 0.75rem;
                    margin-left: 1px;
                }

                .rm-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1.3rem;
                    color: #fff;
                    background: linear-gradient(135deg, #e0468f, #b5306f);
                }

                .rm-avatar-prize {
                    background: linear-gradient(135deg, #ffb84d, #f5871f);
                    font-size: 1.4rem;
                }

                .rm-row-info {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                    min-width: 0;
                }

                .rm-row-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.6px;
                    text-transform: uppercase;
                    color: #cc6a9c;
                }

                .rm-row-value {
                    font-size: 1.12rem;
                    color: #3f0f2c;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .rm-row-sub {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 3px;
                    font-size: 0.8rem;
                    color: #b5306f;
                }

                .rm-row-warning {
                    color: #c47a1f;
                }

                .rm-cta {
                    margin-top: 6px;
                    border: none;
                    border-radius: 16px;
                    padding: 17px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #fff;
                    cursor: pointer;
                    background: linear-gradient(135deg, #ff6fa5, #d6478f);
                    box-shadow: 0 10px 24px rgba(214, 71, 143, 0.4);
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .rm-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(214, 71, 143, 0.5);
                }
                .rm-cta:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default ResultsModal;