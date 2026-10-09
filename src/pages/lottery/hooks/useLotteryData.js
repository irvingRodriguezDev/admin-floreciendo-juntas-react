import { useState, useEffect, useCallback, useRef } from 'react';
import MethodGet, { MethodPost } from '../../../config/Service';
import Swal from 'sweetalert2';

export const useLotteryData = () => {
    /* ------------------------------------------------------------------ */
    /* Estado                                                             */
    /* ------------------------------------------------------------------ */

    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const [prizes, setPrizes] = useState([]);
    const [loadingPrizes, setLoadingPrizes] = useState(true);
    const [currentWinners, setCurrentWinners] = useState([]);
    const [historicalWinners, setHistoricalWinners] = useState([]);
    const [loadingHistorical, setLoadingHistorical] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [activeTable, setActiveTable] = useState('current');

    const hasLoadedRef = useRef(false);
    const loadedMonthRef = useRef(null);

    /* ------------------------------------------------------------------ */
    /* Helpers                                                            */
    /* ------------------------------------------------------------------ */

    const getCurrentMonth = useCallback(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }, []);

    const formatDisplayDate = useCallback((dateString) => {
        if (!dateString) return 'Selecciona una fecha';

        const [year, month] = dateString.split('-');

        return new Date(year, month - 1, 1).toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric'
        });
    }, []);

    /* ------------------------------------------------------------------ */
    /* Fetchers                                                           */
    /* ------------------------------------------------------------------ */

    const fetchParticipants = useCallback(async () => {
        try {
            setLoadingParticipants(true);
            const response = await MethodGet('/admin/user-eligible');

            let data = [];
            if (response?.data) {
                data = Array.isArray(response.data)
                    ? response.data
                    : response.data.users || [];
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

            const formattedPrizes = data.map((p) => ({
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

    const fetchHistoricalWinners = useCallback(async (month) => {
        if (!month) {
            console.warn('No se proporcionó mes para cargar ganadores históricos');
            return [];
        }

        // Marca el mes como cargado para que el efecto de "Ganadores" no repita la petición
        loadedMonthRef.current = month;

        try {
            setLoadingHistorical(true);

            const response = await MethodGet(`/admin/user-winners-current-month?month=${month}`);
            const data = response?.data?.winners || response?.data || response || [];

            const formattedWinners = data.map((w) => ({
                id: w.id,
                name: w.user?.name || w.name || 'N/A',
                email: w.user?.email || w.email || 'N/A',
                phone: w.user?.phone || w.phone || 'N/A',
                prize_name: w.prize?.name || 'N/A',
                position: w.position,
                month: w.raffle_month || month,
                createdAt: w.createdAt
            }));

            setHistoricalWinners(formattedWinners);

            // También actualiza currentWinners para la rueda
            setCurrentWinners(
                formattedWinners.map((w) => ({
                    id: w.id,
                    name: w.name,
                    email: w.email,
                    phone: w.phone,
                    prize: w.prize_name,
                    prize_id: w.id,
                    timestamp: w.createdAt
                        ? new Date(w.createdAt).toLocaleTimeString()
                        : new Date().toLocaleTimeString()
                }))
            );

            return formattedWinners;
        } catch (error) {
            console.error('Error cargando ganadores:', error);
            loadedMonthRef.current = null; // permite reintentar
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

    // Carga ganadores de un mes (si no se pasa mes, usa el actual)
    const loadWinnersByMonth = useCallback(
        (month) => fetchHistoricalWinners(month || getCurrentMonth()),
        [fetchHistoricalWinners, getCurrentMonth]
    );

    const fetchAvailableMonths = useCallback(async () => {
        const months = [];
        const d = new Date();

        for (let i = 0; i < 12; i++) {
            const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
            months.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
        }

        setAvailableMonths(months);
        setSelectedMonth((prev) => prev || getCurrentMonth());
        return months;
    }, [getCurrentMonth]);

    /* ------------------------------------------------------------------ */
    /* Premios                                                            */
    /* ------------------------------------------------------------------ */

    const createPrize = useCallback(
        async (prizeName, isPremium) => {
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
        },
        [fetchPrizes]
    );

    /* ------------------------------------------------------------------ */
    /* Handlers de la UI                                                  */
    /* ------------------------------------------------------------------ */

    const handleTableChange = useCallback((_, table) => {
        if (table) setActiveTable(table);
    }, []);

    const handleMonthChange = useCallback((month) => {
        if (month) setSelectedMonth(month);
    }, []);

    const refreshHistorical = useCallback(
        () => loadWinnersByMonth(selectedMonth || getCurrentMonth()),
        [loadWinnersByMonth, selectedMonth, getCurrentMonth]
    );

    /* ------------------------------------------------------------------ */
    /* Efectos                                                            */
    /* ------------------------------------------------------------------ */

    // Carga inicial: solo participantes, premios y meses
    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        const loadInitialData = async () => {
            try {
                await Promise.all([fetchParticipants(), fetchPrizes(), fetchAvailableMonths()]);
            } catch (error) {
                console.error(error);
                hasLoadedRef.current = false; // permite reintento
            }
        };

        loadInitialData();
    }, [fetchParticipants, fetchPrizes, fetchAvailableMonths]);

    // Al entrar a "Ganadores" o cambiar de mes, carga los ganadores correspondientes
    useEffect(() => {
        if (activeTable !== 'historical') return;

        const month = selectedMonth || getCurrentMonth();

        if (loadedMonthRef.current !== month) {
            loadWinnersByMonth(month);
        }
    }, [activeTable, selectedMonth, loadWinnersByMonth, getCurrentMonth]);

    /* ------------------------------------------------------------------ */
    /* API pública                                                        */
    /* ------------------------------------------------------------------ */

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
        activeTable,
        handleTableChange,
        handleMonthChange,
        refreshHistorical,
        formatDisplayDate,
        fetchParticipants,
        fetchPrizes,
        loadWinnersByMonth,
        createPrize,
        getCurrentMonth
    };
};