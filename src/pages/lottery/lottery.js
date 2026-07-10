import React, { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import './Lottery.css';

// Hooks
import { useLotteryData } from './hooks/useLotteryData';
import { useWheelAnimation } from './hooks/useWheelAnimation';
import { useRaffle } from './hooks/useRaffle';
import { useExcelExport } from './hooks/useExcelExport';

// Componentes
import WheelCanvas from './components/WheelCanvas';
import ParticipantsTable from './components/ParticipantsTable';
import WinnersTable from './components/WinnersTable';
import PrizeModal from './components/PrizeModal';
import ResultsModal from './components/ResultsModal';
import FullscreenWheel from './components/FullscreenWheel';

const Lottery = () => {
    // ─── Datos ──────────────────────────────────────────────
    const {
        participants,
        loadingParticipants,
        prizes,
        loadingPrizes,
        currentWinners,
        setCurrentWinners,
        historicalWinners,
        setHistoricalWinners,
        loadingHistorical,
        availableMonths,
        selectedMonth,
        setSelectedMonth,
        fetchParticipants,
        fetchPrizes,
        loadWinnersByMonth,
        createPrize,
        getCurrentMonth
    } = useLotteryData();

    // ─── Estado UI ──────────────────────────────────────────
    const [activeTable, setActiveTable] = useState('current');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [winner, setWinner] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [raffleResult, setRaffleResult] = useState(null);

    // ⭐ Control para evitar doble carga
    const isLoadingRef = useRef(false);
    // ⭐ Guardar el mes que ya se cargó para no repetir
    const loadedMonthRef = useRef(null);

    // ─── Animación de la rueda ─────────────────────────────
    const {
        spinning,
        setSpinning,
        rotation,
        winningIndex,
        setWinningIndex,
        calculateWinningRotation,
        animateWheel,
        stopAnimation
    } = useWheelAnimation(prizes, setCurrentWinners, setHistoricalWinners, getCurrentMonth);

    // ─── Sorteo ─────────────────────────────────────────────
    const { runRaffle } = useRaffle({
        participants,
        currentWinners,
        prizes,
        spinning,
        setSpinning,
        setWinner,
        setSelectedPrize,
        setRaffleResult,
        setWinningIndex,
        setShowResults,
        fetchParticipants,
        fetchPrizes,
        loadWinnersByMonth,
        selectedMonth,
        activeTable,
        calculateWinningRotation,
        animateWheel
    });

    // ─── Exportar Excel ─────────────────────────────────────
    const { exportingExcel, exportToExcel } = useExcelExport();

    // ─── Handlers ───────────────────────────────────────────

    // ⭐ Función unificada para cargar ganadores (con control de doble carga)
    const loadWinnersForMonth = useCallback((month) => {
        // Evitar doble carga
        if (isLoadingRef.current) {
            console.log('⏭️ Carga en progreso, saltando...');
            return;
        }

        const monthToLoad = month || selectedMonth || getCurrentMonth();

        // ⭐ Si ya cargamos este mes, no volver a cargar (a menos que sea refresh)
        if (loadedMonthRef.current === monthToLoad && !isLoadingRef.current) {
            console.log(`⏭️ Mes ${monthToLoad} ya cargado anteriormente, saltando...`);
            return;
        }

        isLoadingRef.current = true;
        console.log(`📊 Cargando ganadores del mes: ${monthToLoad}`);

        loadWinnersByMonth(monthToLoad).finally(() => {
            isLoadingRef.current = false;
            // ⭐ Guardar el mes que se cargó (incluso si no tiene ganadores)
            loadedMonthRef.current = monthToLoad;
        });

        if (!selectedMonth) {
            setSelectedMonth(monthToLoad);
        }
    }, [selectedMonth, loadWinnersByMonth, getCurrentMonth, setSelectedMonth]);

    // ⭐ Cambio de pestaña - SOLO carga en Ganadores, NUNCA en Participantes
    const handleTableChange = useCallback((table) => {
        setActiveTable(table);

        // ⭐ En "Participantes" NO se carga NADA de winners
        if (table === 'current') {
            console.log('👥 Pestaña Participantes - No se cargan ganadores');
            return;
        }

        // ⭐ En "Ganadores" se cargan los ganadores del mes
        if (table === 'historical') {
            const monthToLoad = selectedMonth || getCurrentMonth();
            // ⭐ Forzar recarga si cambiamos de mes o es la primera vez
            if (loadedMonthRef.current !== monthToLoad) {
                loadWinnersForMonth(monthToLoad);
            } else {
                console.log(`⏭️ Mes ${monthToLoad} ya cargado, mostrando datos...`);
            }
        }
    }, [selectedMonth, loadWinnersForMonth, getCurrentMonth]);

    // ⭐ Cambio de mes - Recarga los ganadores del mes seleccionado
    const handleMonthChange = useCallback((month) => {
        setSelectedMonth(month);
        if (month && activeTable === 'historical') {
            // ⭐ Forzar recarga aunque sea el mismo mes (el usuario quiere ver ese mes)
            loadedMonthRef.current = null; // Resetear para forzar carga
            loadWinnersForMonth(month);
        }
    }, [activeTable, loadWinnersForMonth]);

    // ⭐ Refrescar históricos (recarga el mes actual forzadamente)
    const refreshHistorical = useCallback(() => {
        if (activeTable === 'historical' && selectedMonth) {
            // ⭐ Forzar recarga
            loadedMonthRef.current = null;
            loadWinnersForMonth(selectedMonth);
        }
    }, [activeTable, selectedMonth, loadWinnersForMonth]);

    const closeResults = useCallback(() => {
        setShowResults(false);
        setWinner(null);
        setSelectedPrize(null);
        setRaffleResult(null);
        setWinningIndex(-1);
        stopAnimation();
    }, [stopAnimation, setWinningIndex]);

    const handleExport = useCallback(() => {
        const isCurrent = activeTable === 'current';
        const data = isCurrent
            ? currentWinners.map(w => ({ name: w.name, email: w.email, phone: w.phone, prize_name: w.prize }))
            : historicalWinners.map(w => ({ name: w.name, email: w.email, phone: w.phone, prize_name: w.prize_name }));

        const title = isCurrent ? 'Ganadores Actuales' : `Ganadores - ${selectedMonth}`;
        const fileName = `ganadores_${isCurrent ? 'actuales' : selectedMonth}_${new Date().toISOString().split('T')[0]}.xlsx`;

        exportToExcel({ data, title, fileName });
    }, [activeTable, currentWinners, historicalWinners, selectedMonth, exportToExcel]);

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'Selecciona una fecha';
        const [year, month] = dateString.split('-');
        return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    // ⭐ Efecto para cargar ganadores la PRIMERA vez que se cambia a Ganadores
    useEffect(() => {
        if (activeTable === 'historical') {
            const monthToLoad = selectedMonth || getCurrentMonth();
            // ⭐ Solo cargar si es la primera vez que entramos a este mes
            if (loadedMonthRef.current !== monthToLoad && !isLoadingRef.current) {
                console.log(`📊 Primera carga - Ganadores del mes: ${monthToLoad}`);
                loadWinnersForMonth(monthToLoad);
            }
        }
    }, [activeTable, selectedMonth, loadWinnersForMonth, getCurrentMonth]);

    // ─── Efectos ────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen]);

    // ─── Render ─────────────────────────────────────────────
    return (
        <div className="lottery-container">
            {/* Header */}
            <div className="lottery-header">
                <div className="header-content">
                    <h1 className="lottery-title">🌸 Gana el Salón de tus Sueños 🌸</h1>
                    <div className="header-stats">
                        <StatCard icon="👥" label="Participantes" value={participants.length} />
                        <StatCard icon="🎁" label="Premios" value={prizes.length} />
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="lottery-content">
                {/* Columna Izquierda - Tablas */}
                <div className="participants-column">
                    <div className="section-header">
                        <div className="section-title">
                            <span className="section-icon">{activeTable === 'current' ? '🎟️' : '🏆'}</span>
                            <h2>{activeTable === 'current' ? 'Lista de Participantes' : 'Ganadores'}</h2>
                        </div>
                        <div className="section-actions">
                            <TableSwitcher
                                active={activeTable}
                                onChange={handleTableChange}
                                disabled={spinning}
                            />
                            {activeTable === 'historical' && (
                                <MonthSelector
                                    months={availableMonths}
                                    selected={selectedMonth}
                                    onChange={handleMonthChange}
                                    disabled={spinning}
                                    formatDate={formatDisplayDate}
                                />
                            )}
                            <ActionButton
                                onClick={handleExport}
                                disabled={exportingExcel || spinning ||
                                    (activeTable === 'current' && currentWinners.length === 0) ||
                                    (activeTable === 'historical' && historicalWinners.length === 0)}
                                icon={exportingExcel ? '⏳' : '📊'}
                                text={exportingExcel ? 'Exportando...' : 'Exportar Excel'}
                                className="export-btn"
                            />
                            {activeTable === 'historical' && (
                                <ActionButton
                                    onClick={refreshHistorical}
                                    disabled={loadingHistorical || spinning}
                                    icon="🔄"
                                    text="Actualizar"
                                    className="refresh-btn"
                                />
                            )}
                            <ActionButton
                                onClick={() => setShowPrizeModal(true)}
                                disabled={spinning}
                                icon="➕"
                                text="Nuevo Premio"
                                className="add-prize-btn"
                            />
                        </div>
                    </div>

                    <div className="table-wrapper">
                        {activeTable === 'current' ? (
                            <ParticipantsTable
                                participants={participants}
                                loading={loadingParticipants}
                                currentWinners={currentWinners}
                                onRefresh={fetchParticipants}
                            />
                        ) : (
                            <WinnersTable
                                winners={historicalWinners}
                                loading={loadingHistorical}
                                selectedMonth={selectedMonth}
                                formatDisplayDate={formatDisplayDate}
                                onRefresh={refreshHistorical}
                            />
                        )}
                    </div>
                </div>

                {/* Columna Derecha - Rueda */}
                <div className="wheel-column">
                    <div className="wheel-header">
                        <div className="section-title">
                            <span className="section-icon">🌸</span>
                            <h2>Gira la Flor</h2>
                        </div>
                        <div className="wheel-stats">
                            <WheelStat label="Premios" value={prizes.length} />
                            <WheelStat
                                label="Estado"
                                value={spinning ? 'Girando...' : 'Lista'}
                                className={`status-indicator ${spinning ? 'spinning' : 'ready'}`}
                            />
                        </div>
                    </div>

                    <div className="wheel-section">
                        <div className="wheel-container">
                            <div className="wheel-wrapper">
                                <WheelCanvas
                                    prizes={prizes}
                                    rotation={rotation}
                                    winningIndex={winningIndex}
                                    selectedPrize={selectedPrize}
                                    isFullscreen={false}
                                />
                                <button
                                    className="fullscreen-btn"
                                    onClick={() => setIsFullscreen(true)}
                                    title="Ver en pantalla completa"
                                >
                                    ⛶
                                </button>
                            </div>

                            <div className="wheel-instructions">
                                {prizes.length === 0 ? (
                                    <p className="empty-petals-hint">
                                        🌸 Crea un premio para activar los pétalos y comenzar el sorteo
                                    </p>
                                ) : (
                                    <>
                                        <p className="instruction-text">
                                            Haz click en "Girar Flor" para seleccionar un ganador aleatoriamente
                                        </p>
                                        {currentWinners.length > 0 && (
                                            <p className="instruction-info">
                                                <span className="info-icon">ℹ️</span>
                                                Ganadores de hoy: <strong>{currentWinners.length}</strong> de <strong>{participants.length}</strong> participantes
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="spin-controls">
                            {prizes.length === 0 && (
                                <button
                                    className="action-btn add-prize-btn"
                                    onClick={() => setShowPrizeModal(true)}
                                    disabled={spinning}
                                    style={{ marginBottom: '10px', padding: '12px 28px', fontSize: '1rem' }}
                                >
                                    <span className="btn-icon">➕</span> Crear Primer Premio
                                </button>
                            )}
                            <button
                                className="spin-button"
                                onClick={runRaffle}
                                disabled={spinning || prizes.length === 0}
                            >
                                {spinning ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        <span className="button-text">Girando Flor...</span>
                                        <span className="button-time">⏱️ 5s</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="button-icon">🌸</span>
                                        <span className="button-text">Girar Flor</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            {isFullscreen && (
                <FullscreenWheel
                    prizes={prizes}
                    rotation={rotation}
                    winningIndex={winningIndex}
                    selectedPrize={selectedPrize}
                    spinning={spinning}
                    onClose={() => setIsFullscreen(false)}
                    onSpin={runRaffle}
                />
            )}

            {showResults && winner && selectedPrize && (
                <ResultsModal
                    winner={winner}
                    selectedPrize={selectedPrize}
                    raffleResult={raffleResult}
                    onClose={closeResults}
                />
            )}

            {showPrizeModal && (
                <PrizeModal
                    onClose={() => setShowPrizeModal(false)}
                    onCreate={createPrize}
                />
            )}
        </div>
    );
};

// ─── Subcomponentes ──────────────────────────────────────

const StatCard = ({ icon, label, value }) => (
    <div className="stat-card">
        <span className="stat-icon">{icon}</span>
        <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    </div>
);

const WheelStat = ({ label, value, className }) => (
    <div className="wheel-stat">
        <span className="stat-label">{label}</span>
        <span className={className || "stat-value"}>{value}</span>
    </div>
);

const TableSwitcher = ({ active, onChange, disabled }) => (
    <div className="table-switcher">
        <button
            className={`table-btn ${active === 'current' ? 'active' : ''}`}
            onClick={() => onChange('current')}
            disabled={disabled}
        >
            <span className="btn-icon">👥</span>Participantes
        </button>
        <button
            className={`table-btn ${active === 'historical' ? 'active' : ''}`}
            onClick={() => onChange('historical')}
            disabled={disabled}
        >
            <span className="btn-icon">🏆</span>Ganadores
        </button>
    </div>
);

const MonthSelector = ({ months, selected, onChange, disabled, formatDate }) => (
    <div className="month-selector">
        <select
            value={selected}
            onChange={(e) => onChange(e.target.value)}
            className="month-select"
            disabled={disabled}
        >
            {months.map(m => (
                <option key={m} value={m}>{formatDate(m)}</option>
            ))}
        </select>
    </div>
);

const ActionButton = ({ onClick, disabled, icon, text, className }) => (
    <button
        className={`action-btn ${className}`}
        onClick={onClick}
        disabled={disabled}
    >
        <span className="btn-icon">{icon}</span>
        {text}
    </button>
);

export default Lottery;