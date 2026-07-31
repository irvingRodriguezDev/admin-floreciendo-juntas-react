import React, {useEffect} from 'react';
import TiktokIcon from '../TiktokIcon';
import { launchSuccessConfetti } from '../launchSuccessConfetti';

const ResultsModal = ({ winner, selectedPrize, raffleResult, onClose }) => {

    useEffect(() => {
        launchSuccessConfetti();
    }, []);

    return (
        <div className="results-overlay">
            <div className="results-modal">
                <div className="results-header">
                    <div className="results-title">
                        <span className="title-icon">🎉</span>
                        <h2>¡TENEMOS UN GANADOR!</h2>
                        <span className="title-icon">🎉</span>
                    </div>
                    <p className="results-subtitle">Felicitaciones al afortunado ganador</p>
                </div>

                <div className="results-body">
                    <div className="success-banner">
                        <div className="banner-content">
                            <span className="banner-icon">🌸</span>
                            <div className="banner-text">
                                <h3>{raffleResult?.message || '¡Sorteo completado exitosamente!'}</h3>
                            </div>
                            <span className="banner-icon">🎁</span>
                        </div>
                    </div>

                    <div className="results-grid">
                        <div className="result-card winner-card">
                            <div className="card-header">
                                <span className="card-icon">👑</span>
                                <h3>GANADOR</h3>
                            </div>
                            <div className="card-body">
                                <div className="winner-profile">
                                    <div className="profile-avatar">{winner.name.charAt(0)}</div>
                                    <div className="profile-info">
                                        <h6 className="winner-name">{winner.name}</h6>
                                    </div>
                                </div>
                            </div>
                            {winner.tiktokUsername !== null && (
                                <div className="card-footer">
                                    <span className="footer-text">
                                        <TiktokIcon width="24" />
                                        @{winner.tiktokUsername}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="result-card prize-card">
                            <div className="card-header">
                                <span className="card-icon">🎁</span>
                                <h3>PREMIO GANADO</h3>
                            </div>
                            <div className="card-body">
                                <div className="prize-display">
                                    <div className="prize-icon">🏆</div>
                                    <div className="prize-info">
                                        <h6 className="prize-name">{selectedPrize.name}</h6>
                                    </div>
                                </div>
                                <div className="prize-notice">
                                    <span className="notice-icon">⚠️</span>
                                    <p>Este premio ya no está disponible para futuros sorteos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="results-actions">
                        <button className="action-btn primary-btn" onClick={onClose}>
                            <span className="btn-icon">🌸</span>
                            Realizar Nuevo Sorteo
                        </button>
                    </div>
                </div>

                <button className="close-results-btn" onClick={onClose}>
                    <span className="close-icon">✕</span>
                </button>
            </div>
        </div>
    );
};

export default ResultsModal;