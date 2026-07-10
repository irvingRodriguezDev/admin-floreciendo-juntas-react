import React, { useState } from 'react';

const PrizeModal = ({ onClose, onCreate }) => {
    const [newPrizeName, setNewPrizeName] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!newPrizeName.trim()) return;
        setCreating(true);
        const success = await onCreate(newPrizeName, isPremium);
        setCreating(false);
        if (success) onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease'
        }}>
            <div style={{
                width: '90%',
                maxWidth: '500px',
                animation: 'modalSlideIn 0.4s ease-out'
            }}>
                <div style={{
                    background: 'linear-gradient(145deg, #ffffff 0%, #fff5f9 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px rgba(255,20,147,0.25)',
                    overflow: 'hidden',
                    border: '2px solid #ff69b4'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
                        padding: '25px 30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{
                                fontSize: '2rem',
                                background: 'rgba(255,255,255,0.2)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>🌸</span>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>
                                Crear Nuevo Premio
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={creating}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                cursor: creating ? 'not-allowed' : 'pointer',
                                color: 'white',
                                fontSize: '1.2rem'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ padding: '30px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: '#333',
                            marginBottom: '10px'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>🏷️</span>
                            Nombre del Premio
                        </label>
                        <input
                            type="text"
                            value={newPrizeName}
                            onChange={e => setNewPrizeName(e.target.value)}
                            placeholder="Kit profesional de uñas, Salón de tus sueños..."
                            disabled={creating}
                            onKeyPress={e => e.key === 'Enter' && !creating && handleCreate()}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '16px 20px',
                                border: '2px solid #ffb6c1',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                background: 'white',
                                boxSizing: 'border-box'
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = '#ff69b4';
                                e.target.style.boxShadow = '0 0 0 3px rgba(255,105,180,0.2)';
                                e.target.style.outline = 'none';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = '#ffb6c1';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            marginTop: '10px',
                            color: '#666',
                            fontSize: '0.9rem',
                            background: '#fff0f6',
                            padding: '12px 15px',
                            borderRadius: '10px',
                            borderLeft: '4px solid #ff69b4',
                            lineHeight: 1.4
                        }}>
                            <span>💡</span>
                            Este nombre aparecerá en un pétalo de la flor y será visible para todos los participantes
                        </div>

                        <div
                            onClick={() => !creating && setIsPremium(prev => !prev)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '16px',
                                padding: '14px 18px',
                                border: `2px solid ${isPremium ? '#ff1493' : '#ffb6c1'}`,
                                borderRadius: '12px',
                                cursor: creating ? 'not-allowed' : 'pointer',
                                background: isPremium ? 'linear-gradient(135deg, #fff0f8, #ffe0f2)' : '#fff',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                            }}
                        >
                            <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                flexShrink: 0,
                                border: `2px solid ${isPremium ? '#ff1493' : '#ccc'}`,
                                background: isPremium ? 'linear-gradient(135deg, #ff69b4, #ff1493)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}>
                                {isPremium && <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>✓</span>}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '1.1rem' }}>⭐</span>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: isPremium ? '#ff1493' : '#333' }}>
                                        Premio Premium
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.82rem', color: '#888' }}>
                                    Marca si este premio es de categoría premium
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '20px 30px',
                        background: 'linear-gradient(135deg, #fff8fb 0%, #fff0f6 100%)',
                        borderTop: '1px solid #ffd1dc',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '15px'
                    }}>
                        <button
                            onClick={onClose}
                            disabled={creating}
                            style={{
                                padding: '14px 28px',
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: creating ? 'not-allowed' : 'pointer',
                                background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                color: '#666'
                            }}
                        >
                            ↩️ Cancelar
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!newPrizeName.trim() || creating}
                            style={{
                                padding: '14px 28px',
                                border: '1px solid #ff1493',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: (!newPrizeName.trim() || creating) ? 'not-allowed' : 'pointer',
                                background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
                                color: 'white',
                                minWidth: '150px',
                                opacity: (!newPrizeName.trim() || creating) ? 0.5 : 1
                            }}
                        >
                            {creating ? (
                                <>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderRadius: '50%',
                                        borderTopColor: 'white',
                                        animation: 'spin 1s linear infinite',
                                        display: 'inline-block',
                                        marginRight: '8px',
                                        verticalAlign: 'middle'
                                    }}></div>
                                    Creando...
                                </>
                            ) : (
                                <>✅ Crear Premio</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes modalSlideIn { from { opacity:0; transform:translateY(-30px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PrizeModal;