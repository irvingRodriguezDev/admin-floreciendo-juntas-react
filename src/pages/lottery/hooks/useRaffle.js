import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import MethodGet from "../../../config/Service";

export const useRaffle = ({
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
}) => {
    const checkAvailableParticipants = useCallback(() => {
        const avail = participants.filter(p => !currentWinners.some(w => w.id === p.id));
        return { available: avail.length > 0, count: avail.length, participants: avail };
    }, [participants, currentWinners]);

    const showNoParticipantsAlert = useCallback(() => {
        Swal.fire({
            title: '🎯 ¡Atención!',
            html: `<div style="text-align:center;">
                <div style="font-size:4rem;margin-bottom:20px;">👥</div>
                <p style="font-size:1.3rem;margin-bottom:15px;color:#FF1493;">
                    <strong>No hay participantes disponibles para recibir premios.</strong>
                </p>
                <p style="color:#666;font-size:1rem;margin-top:20px;padding:0 20px;">
                    <span style="color:#FF1493;">💡</span> Todos los participantes ya han recibido un premio.
                    <br>Agrega más participantes para continuar.
                </p>
            </div>`,
            icon: 'warning',
            iconColor: '#FF1493',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#FF69B4',
            background: '#fff',
            width: '600px',
        });
    }, []);

    const runRaffle = useCallback(async () => {
        const availableCheck = checkAvailableParticipants();
        if (!availableCheck.available) {
            showNoParticipantsAlert();
            return;
        }

        if (spinning || participants.length === 0 || prizes.length === 0) {
            Swal.fire({
                title: '🎯 Información',
                text: prizes.length === 0
                    ? 'No hay premios disponibles. Crea un premio para comenzar el sorteo.'
                    : 'No hay suficientes participantes o premios para realizar el sorteo.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF69B4'
            });
            return;
        }

        setSpinning(true);
        setWinner(null);
        setSelectedPrize(null);
        setRaffleResult(null);
        setWinningIndex(-1);
        setShowResults(false);

        try {
            const response = await MethodGet('/admin/run-raffle');

            if (response?.message?.includes("no quedan usuarios disponibles")) {
                setSpinning(false);
                showNoParticipantsAlert();
                return;
            }

            const data = response?.data || response;
            if (data?.message && data?.prize && data?.winner) {
                if (currentWinners.some(w => w.id === data.winner.id)) {
                    Swal.fire({
                        title: '⚠️ Participante ya premiado',
                        html: `<div style="text-align:center;">
                            <p>El participante <strong>${data.winner.name}</strong> ya recibió un premio anteriormente.</p>
                            <p style="color:#666;font-size:0.9rem;margin-top:10px;">Se intentará seleccionar otro ganador.</p>
                        </div>`,
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#FF69B4'
                    }).then(() => {
                        setSpinning(false);
                        setTimeout(() => runRaffle(), 1000);
                    });
                    return;
                }

                setRaffleResult(data);
                setWinner(data.winner);
                setSelectedPrize({ ...data.prize, prize_name: data.prize.name || data.prize.prize_name });

                const prizeIndex = prizes.findIndex(p => p.id === data.prize.id);
                if (prizeIndex !== -1) {
                    setWinningIndex(prizeIndex);
                    const targetRot = calculateWinningRotation(data.prize.id);
                    animateWheel(targetRot, data.winner, { ...data.prize, name: data.prize.name || data.prize.prize_name }, () => {
                        setShowResults(true);
                        setTimeout(() => {
                            fetchParticipants();
                            fetchPrizes();
                            // ⭐ Después del sorteo, recargar ganadores del mes actual
                            if (activeTable === 'historical' && selectedMonth) {
                                loadWinnersByMonth(selectedMonth);
                            } else {
                                // Si estamos en participantes, cargar el mes actual para la rueda
                                loadWinnersByMonth();
                            }
                        }, 1000);
                    });
                }
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Error en el sorteo:', error);
            setSpinning(false);
            Swal.fire({
                title: '🌐 Error de conexión',
                html: `<div style="text-align:center;">
                    <div style="font-size:3.5rem;margin-bottom:16px;">🛜</div>
                    <p style="font-size:1.15rem;color:#333;margin-bottom:12px;">
                        <strong>Hubo un error de red.</strong>
                    </p>
                    <p style="color:#666;font-size:0.95rem;">Por favor, verifica tu conexión a internet e inténtalo de nuevo.</p>
                </div>`,
                icon: 'error',
                iconColor: '#FF69B4',
                confirmButtonText: '🔄 Intentarlo de nuevo',
                confirmButtonColor: '#FF69B4',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                cancelButtonColor: '#aaa',
                width: '520px',
            }).then(result => {
                if (result.isConfirmed) {
                    setSpinning(false);
                    setTimeout(() => runRaffle(), 300);
                } else {
                    setSpinning(false);
                }
            });
        }
    }, [
        participants,
        currentWinners,
        prizes,
        spinning,
        activeTable,
        selectedMonth,
        checkAvailableParticipants,
        showNoParticipantsAlert,
        setSpinning,
        setWinner,
        setSelectedPrize,
        setRaffleResult,
        setWinningIndex,
        setShowResults,
        fetchParticipants,
        fetchPrizes,
        loadWinnersByMonth,
        calculateWinningRotation,
        animateWheel
    ]);

    return { runRaffle };
};