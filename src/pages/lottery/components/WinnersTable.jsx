import React from 'react';

const WinnersTable = ({ winners, loading, selectedMonth, formatDisplayDate }) => {
    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando ganadores...</p>
            </div>
        );
    }

    if (winners.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">🏆</span>
                <p>No hay ganadores para el mes seleccionado</p>
                <div className="empty-info">
                    <p>Selecciona otro mes o realiza nuevos sorteos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-header-info">
                <span className="month-info">
                    📅 Mes: <strong>{formatDisplayDate(selectedMonth)}</strong>
                </span>
                <span className="count-info">
                    👥 Total ganadores: <strong>{winners.length}</strong>
                </span>
            </div>
            <table className="historical-table">
                <thead>
                    <tr>
                        <th>Posición</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Premio</th>
                    </tr>
                </thead>
                <tbody>
                    {winners.map(w => (
                        <tr key={w.id}>
                            <td className="position-cell">
                                <span className={`position-badge position-${w.position}`}>
                                    {w.position}°
                                </span>
                            </td>
                            <td className="name-cell">
                                <div className="user-info">
                                    <span className="user-name">{w.name}</span>
                                </div>
                            </td>
                            <td className="email-cell">{w.email}</td>
                            <td className="phone-cell">{w.phone}</td>
                            <td className="prize-cell">
                                <span className="prize-badge">🎁 {w.prize_name}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="table-footer">
                <p className="export-note">
                    💡 Puedes exportar esta tabla a Excel usando el botón "Exportar Excel"
                </p>
            </div>
        </div>
    );
};

export default WinnersTable;