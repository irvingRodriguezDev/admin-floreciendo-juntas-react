import { useState, useEffect, useCallback, useRef } from 'react';
import MethodGet, { MethodPost } from "../../../config/Service";
import Swal from 'sweetalert2';

export const useLotteryData = () => {
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const [prizes, setPrizes] = useState([]);
    const [loadingPrizes, setLoadingPrizes] = useState(true);
    const [currentWinners, setCurrentWinners] = useState([]);
    const [historicalWinners, setHistoricalWinners] = useState([]);
    const [loadingHistorical, setLoadingHistorical] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');

    const hasLoadedRef = useRef(false);

    const getCurrentMonth = useCallback(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const fetchParticipants = useCallback(async () => {
        try {
            setLoadingParticipants(true);
            const response = await MethodGet('/admin/user-eligible');
            let data = [];
            if (response?.data) {
                data = Array.isArray(response.data) ? response.data :
                    response.data.users || [];
            }
            setParticipants(data);
            return data;
        } catch (error) {
            console.error('Error cargando participantes:', error);
            setParticipants([]);
            return [];
        } finally {
            setLoadingParticipants(false);
        }
    }, []);

    const fetchPrizes = useCallback(async () => {
        try {
            setLoadingPrizes(true);
            const response = await MethodGet('/admin/available-prizes');
            const data = response?.data || response || [];
            const formattedPrizes = data.map(p => ({
                ...p,
                prize_name: p.prize_name || p.name || `Premio ${p.id}`,
                name: p.name || p.prize_name || `Premio ${p.id}`
            }));
            setPrizes(formattedPrizes);
            return formattedPrizes;
        } catch (error) {
            console.error('Error cargando premios:', error);
            setPrizes([]);
            return [];
        } finally {
            setLoadingPrizes(false);
        }
    }, []);

    // ⭐ FUNCIÓN PARA CARGAR GANADORES POR MES (SOLO en Ganadores)
    const fetchHistoricalWinners = useCallback(async (month) => {
        if (!month) {
            console.warn('⚠️ No se proporcionó mes para cargar ganadores históricos');
            return [];
        }

        try {
            setLoadingHistorical(true);
            const endpoint = `/admin/user-winners-current-month?month=${month}`;
            console.log('📊 Cargando ganadores para el mes:', month);

            const response = await MethodGet(endpoint);
            const data = response?.data?.winners || response?.data || response || [];

            const formattedWinners = data.map(w => ({
                id: w.id,
                name: w.user?.name || w.name || 'N/A',
                email: w.user?.email || w.email || 'N/A',
                phone: w.user?.phone || w.phone || 'N/A',
                prize_name: w.prize?.prize_name || w.prize_name || 'N/A',
                position: w.position,
                month: w.raffle_month || month,
                createdAt: w.createdAt
            }));

            setHistoricalWinners(formattedWinners);
            // ⭐ También actualizar currentWinners para la rueda
            setCurrentWinners(formattedWinners.map(w => ({
                id: w.id,
                name: w.name,
                email: w.email,
                phone: w.phone,
                prize: w.prize_name,
                prize_id: w.id,
                timestamp: w.createdAt ? new Date(w.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()
            })));
            return formattedWinners;
        } catch (error) {
            console.error('Error cargando ganadores:', error);
            setHistoricalWinners([]);
            setCurrentWinners([]);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los ganadores del mes seleccionado',
                icon: 'error',
                confirmButtonColor: '#FF69B4'
            });
            return [];
        } finally {
            setLoadingHistorical(false);
        }
    }, []);

    const fetchAvailableMonths = useCallback(async () => {
        try {
            const months = [];
            const d = new Date();
            for (let i = 0; i < 12; i++) {
                const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
                months.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
            }
            setAvailableMonths(months);
            if (months.length > 0 && !selectedMonth) {
                const currentMonth = getCurrentMonth();
                setSelectedMonth(currentMonth);
            }
            return months;
        } catch (error) {
            const fallback = [getCurrentMonth()];
            setAvailableMonths(fallback);
            return fallback;
        }
    }, [getCurrentMonth, selectedMonth]);

    const createPrize = useCallback(async (prizeName, isPremium) => {
        try {
            await MethodPost('/admin/create-prize', {
                prize_name: prizeName.trim(),
                isPremium
            });
            await fetchPrizes();
            Swal.fire({
                title: '🎉 ¡Éxito!',
                text: 'Premio creado exitosamente',
                icon: 'success',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#FF69B4',
                timer: 2000,
                timerProgressBar: true
            });
            return true;
        } catch (error) {
            Swal.fire({
                title: '❌ Error',
                text: 'Error al crear el premio',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF69B4'
            });
            return false;
        }
    }, [fetchPrizes]);

    // ⭐ CARGA INICIAL - SOLO participantes y premios
    useEffect(() => {
        if (hasLoadedRef.current) {
            return;
        }

        console.log('🔄 Cargando datos iniciales...');
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    fetchParticipants(),
                    fetchPrizes(),
                    fetchAvailableMonths()
                ]);
                hasLoadedRef.current = true;
                console.log('✅ Datos iniciales cargados correctamente');
            } catch (error) {
                console.error('❌ Error cargando datos iniciales:', error);
            }
        };

        loadInitialData();
    }, [fetchParticipants, fetchPrizes, fetchAvailableMonths]);

    // ⭐ Función para cargar ganadores de un mes (SIEMPRE al entrar a Ganadores)
    const loadWinnersByMonth = useCallback(async (month) => {
        if (!month) {
            const currentMonth = getCurrentMonth();
            console.log(`📊 Cargando ganadores del mes actual: ${currentMonth}`);
            return fetchHistoricalWinners(currentMonth);
        }
        console.log(`📊 Cargando ganadores del mes: ${month}`);
        return fetchHistoricalWinners(month);
    }, [fetchHistoricalWinners, getCurrentMonth]);

    return {
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
        loadWinnersByMonth, // ⭐ Función unificada para cargar ganadores por mes
        createPrize,
        getCurrentMonth
    };
};