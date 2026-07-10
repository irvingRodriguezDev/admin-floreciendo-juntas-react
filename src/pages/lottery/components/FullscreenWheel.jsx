import React from 'react';
import WheelCanvas from './WheelCanvas';

const FullscreenWheel = ({ prizes, rotation, winningIndex, selectedPrize, spinning, onClose, onSpin }) => {
    return (
        <div className="fs-overlay">
            <div className="fs-topbar">
                <h2>🌸 Gira la Flor 🌸</h2>
                <button className="fs-close" onClick={onClose} title="Cerrar (ESC)">
                    ✕
                </button>
            </div>
            <div className="fs-canvas-area">
                <WheelCanvas
                    prizes={prizes}
                    rotation={rotation}
                    winningIndex={winningIndex}
                    selectedPrize={selectedPrize}
                    isFullscreen={true}
                />
            </div>
            <div className="fs-controls">
                <button className="fs-spin-btn" onClick={onSpin} disabled={spinning || prizes.length === 0}>
                    {spinning ? (
                        <>
                            <span style={{
                                width: 22,
                                height: 22,
                                border: '3px solid rgba(255,255,255,0.3)',
                                borderTopColor: '#fff',
                                borderRadius: '50%',
                                display: 'inline-block',
                                animation: 'fsspin 0.8s linear infinite'
                            }}></span>
                            Girando... ⏱️ 5s
                        </>
                    ) : (
                        <>🌸 Girar Flor</>
                    )}
                </button>
            </div>
            {/* <div className="fs-hint">
                Presiona <kbd>ESC</kbd> para salir
            </div> */}
            <style>{`
                @keyframes fsspin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default FullscreenWheel;