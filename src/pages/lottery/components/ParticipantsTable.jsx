import React from 'react';

const ParticipantsTable = ({ participants, loading, currentWinners, onRefresh }) => {
    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando participantes...</p>
            </div>
        );
    }

    if (participants.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No hay participantes disponibles</p>
                <button className="retry-btn" onClick={onRefresh}>Intentar de nuevo</button>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="participants-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map(participant => {
                        const isWinner = currentWinners.some(w => w.id === participant.id);
                        const wInfo = isWinner ? currentWinners.find(w => w.id === participant.id) : null;
                        const status = participant["subscriptions.status"];

                        return (
                            <tr key={participant.id} className={isWinner ? 'winner-row' : ''}>
                                <td className="id-cell">{participant.id}</td>
                                <td className="name-cell">
                                    <div className="user-info">
                                        <span className="user-name">{participant.name}</span>
                                        {isWinner && (
                                            <span className="winner-badge" title={`Premio: ${wInfo.prize}`}>
                                                🏆 GANADOR
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="email-cell">{participant.email}</td>
                                <td className="phone-cell">{participant.phone || 'N/A'}</td>
                                <td className="status-cell">
                                    <span className={`status-badge ${isWinner ? 'winner' : status === 'past_due' ? 'past-due' : 'active'}`}>
                                        {isWinner ? 'Premiado' : status === 'past_due' ? 'Vencido' : 'Activo'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {currentWinners.length > 0 && (
                <div className="winners-section">
                    <h3 className="winners-title">🏆 Ganadores de Hoy</h3>
                    <div className="winners-list">
                        {currentWinners.map((w, idx) => (
                            <div key={idx} className="winner-item">
                                <span className="winner-name">{w.name}</span>
                                <span className="winner-prize">🎁 {w.prize}</span>
                                <span className="winner-time">{w.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantsTable;