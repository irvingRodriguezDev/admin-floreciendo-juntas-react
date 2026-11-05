import { useState, useCallback, useRef } from 'react';
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
    // ⭐ Refs para acceder siempre a los valores más recientes SIN recrear callbacks
    const stateRef = useRef({});
    stateRef.current = {
        participants,
        currentWinners,
        prizes,
        spinning,
        selectedMonth,
        activeTable
    };

    // ⭐ Refs para los callbacks de animación (evita deps cambiantes)
    const animRef = useRef({ calculateWinningRotation, animateWheel });
    animRef.current = { calculateWinningRotation, animateWheel };

    // ⭐ Ref para evitar doble-click / doble ejecución
    const runningRef = useRef(false);

    const checkAvailableParticipants = useCallback(() => {
        const { participants, currentWinners } = stateRef.current;
        const avail = participants.filter(
            (p) => !currentWinners.some((w) => w.id === p.id)
        );
        return {
            available: avail.length > 0,
            count: avail.length,
            participants: avail
        };
    }, []);

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
            width: '600px'
        });
    }, []);

    // ⭐ runRaffle SIN dependencias (usa refs internamente)
    const runRaffle = useCallback(async () => {
        if (runningRef.current) return; // guard anti doble-ejecución

        const { participants, currentWinners, prizes } = stateRef.current;

        const availableCheck = checkAvailableParticipants();
        if (!availableCheck.available) {
            showNoParticipantsAlert();
            return;
        }

        if (participants.length === 0 || prizes.length === 0) {
            Swal.fire({
                title: '🎯 Información',
                text:
                    prizes.length === 0
                        ? 'No hay premios disponibles. Crea un premio para comenzar el sorteo.'
                        : 'No hay suficientes participantes o premios para realizar el sorteo.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF69B4'
            });
            return;
        }

        runningRef.current = true;

        // Reset de estado en un solo tick (React los agrupa)
        setWinner(null);
        setSelectedPrize(null);
        setRaffleResult(null);
        setWinningIndex(-1);
        setShowResults(false);
        setSpinning(true);

        try {
            const response = await MethodGet('/admin/run-raffle-personalize');

            if (response?.message?.includes('no quedan usuarios disponibles')) {
                runningRef.current = false;
                setSpinning(false);
                showNoParticipantsAlert();
                return;
            }

            const data = response?.data || response;

            if (!(data?.message && data?.prize && data?.winner)) {
                throw new Error('Respuesta inválida del servidor');
            }

            // Verificación de duplicado
            if (currentWinners.some((w) => w.id === data.winner.id)) {
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
                    runningRef.current = false;
                    setSpinning(false);
                    setTimeout(() => runRaffle(), 800);
                });
                return;
            }

            setRaffleResult(data);
            setWinner(data.winner);

            const normalizedPrize = {
                ...data.prize,
                prize_name: data.prize.name || data.prize.prize_name
            };
            setSelectedPrize(normalizedPrize);

            const prizeIndex = prizes.findIndex((p) => p.id === data.prize.id);
            if (prizeIndex === -1) {
                throw new Error('Premio no encontrado en la rueda');
            }
            setWinningIndex(prizeIndex);

            // ⭐ Usar refs: siempre la versión más reciente de las funciones
            const targetRot =
                animRef.current.calculateWinningRotation(data.prize.id);

            animRef.current.animateWheel(
                targetRot,
                data.winner,
                normalizedPrize,
                () => {
                    runningRef.current = false;
                    setShowResults(true);

                    // Refrescos en paralelo, después de que la animación termine
                    Promise.allSettled([
                        fetchParticipants?.(),
                        fetchPrizes?.(),
                        activeTable === 'historical' && selectedMonth
                            ? loadWinnersByMonth?.(selectedMonth)
                            : loadWinnersByMonth?.()
                    ]);
                }
            );
        } catch (error) {
            console.error('❌ Error en el sorteo:', error);
            runningRef.current = false;
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
                width: '520px'
            }).then((result) => {
                if (result.isConfirmed) {
                    setTimeout(() => runRaffle(), 300);
                }
            });
        }
    }, [
        // ⭐ Solo deps ESTABLES (no incluyen rotation ni animateWheel)
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
        loadWinnersByMonth
    ]);

    return { runRaffle };
};