import React, { useState, useEffect, useRef } from 'react';
import MethodGet, { MethodPost } from "../../config/Service";
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';
import './Lottery.css';

const Lottery = () => {
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);
    const [prizes, setPrizes] = useState([]);
    const [loadingPrizes, setLoadingPrizes] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [raffleResult, setRaffleResult] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [winningIndex, setWinningIndex] = useState(-1);
    const [showResults, setShowResults] = useState(false);
    const [targetRotation, setTargetRotation] = useState(0);
    const [currentWinners, setCurrentWinners] = useState([]);
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [newPrizeName, setNewPrizeName] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [creatingPrize, setCreatingPrize] = useState(false);
    const [historicalWinners, setHistoricalWinners] = useState([]);
    const [loadingHistorical, setLoadingHistorical] = useState(false);
    const [activeTable, setActiveTable] = useState('current');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [exportingExcel, setExportingExcel] = useState(false);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const canvasRef = useRef(null);
    const fullscreenCanvasRef = useRef(null);
    const animationRef = useRef(null);

    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const fetchParticipants = async () => {
        try {
            setLoadingParticipants(true);
            const response = await MethodGet('/admin/user-eligible');
            let participantsData = [];
            if (response && response.data) {
                if (Array.isArray(response.data)) participantsData = response.data;
                else if (response.data.users && Array.isArray(response.data.users)) participantsData = response.data.users;
                else if (typeof response.data === 'object') {
                    const keys = Object.keys(response.data);
                    for (const key of keys) { if (Array.isArray(response.data[key])) { participantsData = response.data[key]; break; } }
                }
            } else if (Array.isArray(response)) participantsData = response;
            setParticipants(participantsData || []);
        } catch (error) { console.error('Error al cargar participantes:', error); setParticipants([]); }
        finally { setLoadingParticipants(false); }
    };

    const fetchPrizes = async () => {
        try {
            setLoadingPrizes(true);
            const response = await MethodGet('/admin/available-prizes');
            let prizesData = [];
            if (response && response.data) {
                if (Array.isArray(response.data)) prizesData = response.data;
                else if (Array.isArray(response)) prizesData = response;
            }
            setPrizes(prizesData.map(prize => ({
                ...prize,
                prize_name: prize.prize_name || prize.name || `Premio ${prize.id}`,
                name: prize.name || prize.prize_name || `Premio ${prize.id}`
            })));
        } catch (error) { console.error('Error al cargar premios:', error); setPrizes([]); }
        finally { setLoadingPrizes(false); }
    };

    const fetchCurrentWinners = async () => {
        try {
            const response = await MethodGet('/admin/user-winners-current-month');
            let winnersData = [];
            if (response && response.data) {
                if (response.data.winners && Array.isArray(response.data.winners)) winnersData = response.data.winners;
                else if (Array.isArray(response.data)) winnersData = response.data;
                else if (Array.isArray(response)) winnersData = response;
            }
            setCurrentWinners(winnersData.map(w => ({
                id: w.user?.id || w.id, name: w.user?.name || w.name || 'N/A',
                email: w.user?.email || w.email || 'N/A', phone: w.user?.phone || w.phone || 'N/A',
                prize: w.prize?.prize_name || w.prize_name || 'N/A', prize_id: w.prize?.id || w.prize_id,
                timestamp: w.createdAt ? new Date(w.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()
            })));
        } catch (error) { console.error('Error al cargar ganadores actuales:', error); setCurrentWinners([]); }
    };

    const fetchHistoricalWinners = async (month = '') => {
        try {
            setLoadingHistorical(true);
            const endpoint = month ? `/admin/user-winners-current-month?month=${month}` : '/admin/user-winners-current-month';
            const response = await MethodGet(endpoint);
            let winnersData = [];
            if (response && response.data) {
                if (response.data.winners && Array.isArray(response.data.winners)) winnersData = response.data.winners;
                else if (Array.isArray(response.data)) winnersData = response.data;
                else if (Array.isArray(response)) winnersData = response;
            }
            setHistoricalWinners(winnersData.map(w => ({
                id: w.id, name: w.user?.name || w.name || 'N/A', email: w.user?.email || w.email || 'N/A',
                phone: w.user?.phone || w.phone || 'N/A', prize_name: w.prize?.prize_name || w.prize_name || 'N/A',
                position: w.position, month: w.raffle_month || month, createdAt: w.createdAt
            })));
        } catch (error) {
            console.error('Error al cargar ganadores:', error); setHistoricalWinners([]);
            Swal.fire({ title: 'Error', text: 'No se pudieron cargar los ganadores', icon: 'error', confirmButtonColor: '#FF69B4' });
        } finally { setLoadingHistorical(false); }
    };

    const fetchAvailableMonths = async () => {
        try {
            const months = [];
            const d = new Date();
            for (let i = 0; i < 12; i++) {
                const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
                months.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
            }
            setAvailableMonths(months);
            if (months.length > 0 && !selectedMonth) setSelectedMonth(months[0]);
        } catch (error) { setAvailableMonths([getCurrentMonth()]); }
    };

    useEffect(() => { fetchParticipants(); fetchPrizes(); fetchAvailableMonths(); }, []);
    useEffect(() => { if (selectedMonth && activeTable === 'historical') fetchHistoricalWinners(selectedMonth); }, [selectedMonth, activeTable]);

    const checkAvailableParticipants = () => {
        const avail = participants.filter(p => !currentWinners.some(w => w.id === p.id));
        return { available: avail.length > 0, count: avail.length, participants: avail };
    };

    useEffect(() => {
        if (prizes.length > 0) {
            if (canvasRef.current) drawWheelOnCanvas(canvasRef.current, false);
            if (isFullscreen && fullscreenCanvasRef.current) drawWheelOnCanvas(fullscreenCanvasRef.current, true);
        }
    }, [prizes, rotation, winningIndex, isFullscreen]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen]);

    const drawWheelOnCanvas = (canvas, fullscreen = false) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const SIZE = fullscreen ? Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.80) : 680;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const centerX = SIZE / 2;
        const centerY = SIZE / 2;
        const petalLength = Math.min(centerX, centerY) - (fullscreen ? 22 : 18);

        ctx.clearRect(0, 0, SIZE, SIZE);
        if (prizes.length === 0) return;

        const sliceAngle = (2 * Math.PI) / prizes.length;

        const pinkColors = [
            '#FF1493', '#FFB6C1', '#C71585', '#FFC0CB',
            '#FF69B4', '#DB7093', '#FF80AB', '#FFB8D1',
            '#FF4081', '#FFA0C8', '#E8569A', '#FF82AB',
            '#D63384'
        ];

        prizes.forEach((prize, index) => {
            const petalAngle = index * sliceAngle + sliceAngle / 2 + rotation;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(petalAngle);
            const pLen = petalLength;
            const visualSliceAngle = prizes.length === 1 ? Math.PI * 0.75 : sliceAngle;
            const pHalfWidth = Math.min(Math.tan(visualSliceAngle / 2) * pLen * 0.68, pLen * 0.44);
            const isWinning = winningIndex === index && selectedPrize?.id === prize.id;

            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.bezierCurveTo(pLen * 0.28, -pHalfWidth * 1.15, pLen * 0.68, -pHalfWidth, pLen, 0);
            ctx.bezierCurveTo(pLen * 0.68, pHalfWidth, pLen * 0.28, pHalfWidth * 1.15, 18, 0);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, -pHalfWidth, pLen, pHalfWidth);
            if (isWinning) {
                gradient.addColorStop(0, '#FFD1DC');
                gradient.addColorStop(0.35, '#FF1493');
                gradient.addColorStop(1, '#C71585');
                ctx.shadowColor = 'rgba(255, 20, 147, 0.95)';
                ctx.shadowBlur = 28;
            } else {
                gradient.addColorStop(0, '#FFE8F2');
                gradient.addColorStop(0.3, pinkColors[index % pinkColors.length]);
                gradient.addColorStop(1, pinkColors[(index + 6) % pinkColors.length]);
                ctx.shadowColor = 'rgba(0,0,0,0.18)';
                ctx.shadowBlur = 10;
            }
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(22, 0);
            ctx.bezierCurveTo(pLen * 0.25, -pHalfWidth * 0.55, pLen * 0.55, -pHalfWidth * 0.5, pLen * 0.72, -pHalfWidth * 0.15);
            ctx.bezierCurveTo(pLen * 0.55, -pHalfWidth * 0.28, pLen * 0.25, -pHalfWidth * 0.28, 22, 0);
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.fill();

            ctx.save();
            ctx.textAlign = 'center'; // ← Cambiado a 'center'
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            const fontSize = fullscreen
                ? Math.max(14, Math.min(22, pLen / 6.5))
                : Math.max(13, Math.min(18, pLen / 7));
            ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
            ctx.shadowColor = 'rgba(0,0,0,0.75)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            const textX = pLen * 0.6; // ← Posición centrada (ajusta este valor según necesites)
            const prizeName = (prize.prize_name || prize.name || '').trim();
            const words = prizeName.split(' ');
            const lineH = fontSize + 4;
            if (words.length <= 2 || prizeName.length <= 12) {
                ctx.fillText(prizeName, textX, 0);
            } else {
                const mid = Math.ceil(words.length / 2);
                ctx.fillText(words.slice(0, mid).join(' '), textX, -lineH / 2);
                ctx.fillText(words.slice(mid).join(' '), textX, lineH / 2);
            }
            ctx.restore();
            ctx.restore();
        });

        const centerRadius = fullscreen ? 42 : 34;
        const centerGrad = ctx.createRadialGradient(centerX - 7, centerY - 7, 3, centerX, centerY, centerRadius);
        centerGrad.addColorStop(0, '#FFF9E6');
        centerGrad.addColorStop(0.45, '#FFD700');
        centerGrad.addColorStop(1, '#FF8C00');
        ctx.beginPath();
        ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = centerGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 10, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.32)';
        ctx.fill();

        const pointerAngle = -Math.PI / 2;
        const pointerX = centerX + Math.cos(pointerAngle) * (petalLength + 16);
        const pointerY = centerY + Math.sin(pointerAngle) * (petalLength + 16);
        ctx.save();
        ctx.translate(pointerX, pointerY);
        ctx.rotate(pointerAngle + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, -24);
        ctx.lineTo(18, -24);
        ctx.closePath();
        const pointerGrad = ctx.createLinearGradient(0, -24, 0, 0);
        pointerGrad.addColorStop(0, '#FF69B4');
        pointerGrad.addColorStop(1, '#FF1493');
        ctx.fillStyle = pointerGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    const calculateWinningRotation = (prizeId) => {
        if (prizes.length === 0) return 0;
        const prizeIndex = prizes.findIndex(p => p.id === prizeId);
        if (prizeIndex === -1) return 0;
        const sliceAngle = (2 * Math.PI) / prizes.length;
        const prizeCenterAngle = prizeIndex * sliceAngle + sliceAngle / 2;
        let target = (-Math.PI / 2) - prizeCenterAngle;
        target = ((target % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        return 5 * (2 * Math.PI) + target;
    };

    const showNoParticipantsAlert = () => {
        Swal.fire({
            title: '🎯 ¡Atención!',
            html: `<div style="text-align:center;"><div style="font-size:4rem;margin-bottom:20px;">👥</div><p style="font-size:1.3rem;margin-bottom:15px;color:#FF1493;"><strong>No hay participantes disponibles para recibir premios.</strong></p><p style="color:#666;font-size:1rem;margin-top:20px;padding:0 20px;"><span style="color:#FF1493;">💡</span> Todos los participantes ya han recibido un premio.<br>Agrega más participantes para continuar.</p></div>`,
            icon: 'warning', iconColor: '#FF1493', confirmButtonText: 'Entendido', confirmButtonColor: '#FF69B4', background: '#fff', showCancelButton: false, width: '600px',
        });
    };

    const runRaffle = async () => {
        const availableCheck = checkAvailableParticipants();
        if (!availableCheck.available) {
            showNoParticipantsAlert();
            return;
        }
        if (spinning || participants.length === 0 || prizes.length === 0) {
            Swal.fire({
                title: '🎯 Información',
                text: 'No hay suficientes participantes o premios para realizar el sorteo.',
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
        setTargetRotation(0);

        try {
            const response = await MethodGet('/admin/run-raffle');

            // Verificar si no hay usuarios disponibles
            if (response?.message?.includes("no quedan usuarios disponibles")) {
                setSpinning(false);
                showNoParticipantsAlert();
                return;
            }

            const data = response?.data || response;
            if (data && data.message && data.prize && data.winner) {
                // Verificar si el ganador ya fue premiado
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
                    setTargetRotation(targetRot);
                    animateWheel(targetRot);
                } else {
                    const randomRot = Math.random() * Math.PI * 10;
                    setTargetRotation(randomRot);
                    animateWheel(randomRot);
                }
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Error en el sorteo:', error);

            // Verificar si el error es por no haber usuarios disponibles
            if (error.response?.data?.message?.includes("no quedan usuarios disponibles")) {
                setSpinning(false);
                showNoParticipantsAlert();
                return;
            }

            setSpinning(false);

            // Mostrar alerta de error de conexión (funciona en todos los modos)
            Swal.fire({
                title: '🌐 Error de conexión',
                html: `<div style="text-align:center;">
                <div style="font-size:3.5rem;margin-bottom:16px;">
                    <span role="img" aria-label="wifi">🛜</span>
                </div>
                <p style="font-size:1.15rem;color:#333;margin-bottom:12px;">
                    <strong>Hubo un error de red.</strong>
                </p>
                <p style="color:#666;font-size:0.95rem;">
                    Por favor, verifica tu conexión a internet e inténtalo de nuevo.
                </p>
            </div>`,
                icon: 'error',
                iconColor: '#FF69B4',
                confirmButtonText: '🔄 Intentarlo de nuevo',
                confirmButtonColor: '#FF69B4',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                cancelButtonColor: '#aaa',
                width: '520px',
                // Asegurar que la alerta se muestre sobre cualquier contenido
                backdrop: true,
                allowOutsideClick: true,
                allowEscapeKey: true,
                allowEnterKey: true,
                // Personalización adicional para mejor visibilidad
                customClass: {
                    container: 'swal-container',
                    popup: 'swal-popup',
                    header: 'swal-header',
                    title: 'swal-title',
                    closeButton: 'swal-close-button',
                    icon: 'swal-icon',
                    image: 'swal-image',
                    content: 'swal-content',
                    input: 'swal-input',
                    actions: 'swal-actions',
                    confirmButton: 'swal-confirm-button',
                    cancelButton: 'swal-cancel-button',
                    footer: 'swal-footer'
                }
            }).then(r => {
                if (r.isConfirmed) {
                    // Asegurar que el estado de spinning se resetee antes de reintentar
                    setSpinning(false);
                    setTimeout(() => runRaffle(), 300);
                } else {
                    // Si cancela, asegurar que spinning sea false
                    setSpinning(false);
                }
            });
        }
    };

    const animateWheel = (targetRotation) => {
        const spinDuration = 5000;
        const startTime = Date.now();
        const startRotation = rotation;
        const finalTarget = targetRotation + Math.floor(Math.random() * 3 + 3) * (2 * Math.PI);
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (finalTarget - startRotation) * easeOut;
            setRotation(currentRotation);
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setSpinning(false);
                setRotation(currentRotation % (2 * Math.PI));
                if (winner && selectedPrize) {
                    setCurrentWinners(prev => [...prev, { ...winner, prize: selectedPrize.name, prize_id: selectedPrize.id, timestamp: new Date().toLocaleTimeString() }]);
                    if (selectedMonth === getCurrentMonth() || !selectedMonth) {
                        setHistoricalWinners(prev => [...prev, { id: winner.id, name: winner.name, email: winner.email, phone: winner.phone || 'N/A', prize_name: selectedPrize.name, position: prev.length + 1, month: getCurrentMonth(), createdAt: new Date().toISOString() }]);
                    }
                }
                setTimeout(() => { setShowResults(true); setTimeout(() => { fetchParticipants(); fetchPrizes(); }, 1000); }, 500);
            }
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => { return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }; }, []);

    const createPrize = async () => {
        if (!newPrizeName.trim()) { Swal.fire({ title: '⚠️ Campo requerido', text: 'Por favor ingresa un nombre para el premio.', icon: 'warning', confirmButtonText: 'Entendido', confirmButtonColor: '#FF69B4' }); return; }
        try {
            setCreatingPrize(true);
            await MethodPost('/admin/create-prize', { prize_name: newPrizeName.trim(), isPremium, });
            setNewPrizeName(''); setIsPremium(false); setShowPrizeModal(false);
            await fetchPrizes();
            Swal.fire({ title: '🎉 ¡Éxito!', text: 'Premio creado exitosamente', icon: 'success', confirmButtonText: 'Continuar', confirmButtonColor: '#FF69B4', timer: 2000, timerProgressBar: true });
        } catch (error) {
            Swal.fire({ title: '❌ Error', text: 'Error al crear el premio. Por favor, intente nuevamente.', icon: 'error', confirmButtonText: 'Entendido', confirmButtonColor: '#FF69B4' });
        } finally { setCreatingPrize(false); }
    };

    const openCreatePrizeModal = () => setShowPrizeModal(true);
    const closeCreatePrizeModal = () => {
        if (!creatingPrize) {
            setShowPrizeModal(false);
            setNewPrizeName('');
            setIsPremium(false);
        }
    };
    const closeResults = () => { setShowResults(false); setWinner(null); setSelectedPrize(null); setRaffleResult(null); setWinningIndex(-1); setTargetRotation(0); };

    const exportToExcel = async () => {
        try {
            setExportingExcel(true);
            let dataToExport = [];
            let sheetTitle = '';
            if (activeTable === 'current') {
                dataToExport = currentWinners.map(w => ({ name: w.name, email: w.email, phone: w.phone, prize_name: w.prize }));
                sheetTitle = 'Ganadores Actuales';
            } else {
                dataToExport = historicalWinners.map(w => ({ name: w.name, email: w.email, phone: w.phone, prize_name: w.prize_name }));
                sheetTitle = `Ganadores - ${selectedMonth}`;
            }
            if (dataToExport.length === 0) { Swal.fire({ title: 'Información', text: 'No hay datos para exportar', icon: 'info', confirmButtonColor: '#FF69B4' }); setExportingExcel(false); return; }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ganadores');
            const titleRow = worksheet.addRow([sheetTitle]);
            titleRow.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFF1493' } };
            titleRow.alignment = { horizontal: 'center' }; worksheet.mergeCells('A1:D1'); titleRow.height = 30;
            const infoRow = worksheet.addRow([`Fecha de exportación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
            worksheet.mergeCells('A2:D2'); infoRow.font = { size: 11, color: { argb: 'FF666666' } }; infoRow.alignment = { horizontal: 'center' };
            const headerRow = worksheet.addRow(['Nombre', 'Email', 'Teléfono', 'Premio']);
            headerRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF69B4' } };
                cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = { top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
            });
            dataToExport.forEach((item, idx) => {
                const row = worksheet.addRow([item.name, item.email, item.phone, item.prize_name]);
                row.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFFFF5F9' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE6E6E6' } }, left: { style: 'thin', color: { argb: 'FFE6E6E6' } }, bottom: { style: 'thin', color: { argb: 'FFE6E6E6' } }, right: { style: 'thin', color: { argb: 'FFE6E6E6' } } };
                    cell.alignment = { vertical: 'middle' };
                });
            });
            worksheet.columns.forEach(col => { let mx = 0; col.eachCell({ includeEmpty: true }, c => { const l = c.value ? c.value.toString().length : 10; if (l > mx) mx = l; }); col.width = Math.min(mx + 5, 50); });
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            const fileName = `ganadores_${activeTable === 'current' ? 'actuales' : selectedMonth}_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.href = URL.createObjectURL(blob); link.download = fileName;
            document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
            Swal.fire({ title: '✅ Exportación Exitosa', html: `<div style="text-align:center;"><p>Archivo <strong>${fileName}</strong> descargado.</p><p style="color:#666;font-size:0.9rem;">${dataToExport.length} registros exportados</p></div>`, icon: 'success', confirmButtonColor: '#FF69B4', timer: 3000 });
        } catch (error) { Swal.fire({ title: '❌ Error', text: 'No se pudo exportar el archivo', icon: 'error', confirmButtonColor: '#FF69B4' }); }
        finally { setExportingExcel(false); }
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'Selecciona una fecha';
        const [year, month] = dateString.split('-');
        return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };
    const handleSearchHistorical = () => {
        if (!selectedMonth) { Swal.fire({ title: '⚠️ Fecha requerida', text: 'Por favor selecciona un mes y año', icon: 'warning', confirmButtonColor: '#FF69B4' }); return; }
        fetchHistoricalWinners(selectedMonth);
    };
    const refreshData = () => { if (activeTable === 'current') fetchParticipants(); else handleSearchHistorical(); };

    const normalCanvasRef = (node) => { canvasRef.current = node; if (node && prizes.length > 0) drawWheelOnCanvas(node, false); };
    const fsCanvasRef = (node) => { fullscreenCanvasRef.current = node; if (node && prizes.length > 0) drawWheelOnCanvas(node, true); };

    return (
        <div className="lottery-container">
            <style>{`
                .wheel-wrapper { position: relative; display: inline-block; }
                .fullscreen-btn {
                    position: absolute; top: 12px; right: 12px;
                    background: rgba(255,20,147,0.15); border: 2px solid rgba(255,105,180,0.50);
                    color: #FF1493; border-radius: 10px; width: 40px; height: 40px; font-size: 1.2rem;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: all 0.22s; backdrop-filter: blur(4px); z-index: 10;
                }
                .fullscreen-btn:hover { background: rgba(255,20,147,0.32); border-color: #FF1493; transform: scale(1.10); box-shadow: 0 4px 14px rgba(255,20,147,0.35); }
                .fs-overlay {
                    position: fixed; inset: 0; z-index: 10000;
                    background: radial-gradient(ellipse at center, #2d0018 0%, #110008 100%);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    animation: fsIn 0.28s ease;
                }
                @keyframes fsIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
                .fs-topbar {
                    position: absolute; top: 0; left: 0; right: 0;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 16px 28px; background: rgba(0,0,0,0.35); backdrop-filter: blur(8px);
                    border-bottom: 1px solid rgba(255,105,180,0.20);
                }
                .fs-topbar h2 { color: #fff; margin: 0; font-size: 1.45rem; font-weight: 700; text-shadow: 0 2px 10px rgba(255,20,147,0.6); }
                .fs-close { background: rgba(255,255,255,0.10); border: 2px solid rgba(255,255,255,0.22); color: #fff; border-radius: 50%; width: 44px; height: 44px; font-size: 1.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.22s; }
                .fs-close:hover { background: rgba(255,20,147,0.45); border-color: #FF69B4; transform: rotate(90deg); }
                .fs-canvas-area { display: flex; align-items: center; justify-content: center; padding-top: 72px; }
                .fs-controls { margin-top: 26px; }
                .fs-spin-btn { background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%); color: #fff; border: none; border-radius: 50px; padding: 15px 50px; font-size: 1.2rem; font-weight: 700; cursor: pointer; box-shadow: 0 6px 22px rgba(255,20,147,0.45); display: flex; align-items: center; gap: 10px; transition: all 0.22s; }
                .fs-spin-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255,20,147,0.55); }
                .fs-spin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .fs-hint { position: absolute; bottom: 18px; color: rgba(255,255,255,0.45); font-size: 0.82rem; }
                kbd { background: rgba(255,255,255,0.14); padding: 2px 7px; border-radius: 4px; color: rgba(255,255,255,0.7); font-size: 0.8rem; }
                @keyframes fsspin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="lottery-header">
                <div className="header-content">
                    <h1 className="lottery-title">🌸 Gana el Salón de tus Sueños 🌸</h1>
                    <div className="header-stats">
                        <div className="stat-card"><span className="stat-icon">👥</span><div className="stat-info"><span className="stat-label">Participantes</span><span className="stat-value">{participants.length}</span></div></div>
                        <div className="stat-card"><span className="stat-icon">🎁</span><div className="stat-info"><span className="stat-label">Premios</span><span className="stat-value">{prizes.length}</span></div></div>
                    </div>
                </div>
            </div>

            <div className="lottery-content">
                <div className="participants-column">
                    <div className="section-header">
                        <div className="section-title">
                            <span className="section-icon">{activeTable === 'current' ? '🎟️' : '🏆'}</span>
                            <h2>{activeTable === 'current' ? 'Lista de Participantes' : 'Ganadores'}</h2>
                        </div>
                        <div className="section-actions">
                            <div className="table-switcher">
                                <button className={`table-btn ${activeTable === 'current' ? 'active' : ''}`} onClick={() => setActiveTable('current')} disabled={spinning}><span className="btn-icon">👥</span>Participantes</button>
                                <button className={`table-btn ${activeTable === 'historical' ? 'active' : ''}`} onClick={() => setActiveTable('historical')} disabled={spinning}><span className="btn-icon">🏆</span>Ganadores</button>
                            </div>
                            {activeTable === 'historical' && availableMonths.length > 0 && (
                                <div className="month-selector">
                                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="month-select" disabled={spinning}>
                                        {availableMonths.map(m => <option key={m} value={m}>{formatDisplayDate(m)}</option>)}
                                    </select>
                                </div>
                            )}
                            <button className="action-btn export-btn" onClick={exportToExcel} disabled={exportingExcel || spinning || (activeTable === 'current' && currentWinners.length === 0) || (activeTable === 'historical' && historicalWinners.length === 0)}>
                                {exportingExcel ? <><span className="btn-icon">⏳</span>Exportando...</> : <><span className="btn-icon">📊</span>Exportar Excel</>}
                            </button>
                            <button className="action-btn refresh-btn" onClick={refreshData} disabled={(activeTable === 'current' ? loadingParticipants : loadingHistorical) || spinning}><span className="btn-icon">🔄</span>Actualizar</button>
                            <button className="action-btn add-prize-btn" onClick={openCreatePrizeModal} disabled={spinning}><span className="btn-icon">➕</span>Nuevo Premio</button>
                        </div>
                    </div>
                    <div className="table-wrapper">
                        {activeTable === 'current' ? (
                            <>
                                {loadingParticipants ? (
                                    <div className="loading-state"><div className="spinner"></div><p>Cargando participantes...</p></div>
                                ) : participants.length === 0 ? (
                                    <div className="empty-state"><span className="empty-icon">👥</span><p>No hay participantes disponibles</p><button className="retry-btn" onClick={fetchParticipants}>Intentar de nuevo</button></div>
                                ) : (
                                    <div className="table-container">
                                        <table className="participants-table">
                                            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Estado</th></tr></thead>
                                            <tbody>
                                                {participants.map(participant => {
                                                    const isWinner = currentWinners.some(w => w.id === participant.id);
                                                    const wInfo = isWinner ? currentWinners.find(w => w.id === participant.id) : null;
                                                    return (
                                                        <tr key={participant.id} className={isWinner ? 'winner-row' : ''}>
                                                            <td className="id-cell">{participant.id}</td>
                                                            <td className="name-cell"><div className="user-info"><span className="user-name">{participant.name}</span>{isWinner && <span className="winner-badge" title={`Premio: ${wInfo.prize}`}>🏆 GANADOR</span>}</div></td>
                                                            <td className="email-cell">{participant.email}</td>
                                                            <td className="phone-cell">{participant.phone || 'N/A'}</td>
                                                            <td className="status-cell"><span className={`status-badge ${isWinner ? 'winner' : participant.subscriptions?.[0]?.status === 'active' ? 'active' : 'inactive'}`}>{isWinner ? 'Premiado' : participant.subscriptions?.[0]?.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
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
                                )}
                            </>
                        ) : (
                            <>
                                {loadingHistorical ? (
                                    <div className="loading-state"><div className="spinner"></div><p>Cargando ganadores...</p></div>
                                ) : historicalWinners.length === 0 ? (
                                    <div className="empty-state"><span className="empty-icon">🏆</span><p>No hay ganadores para el mes seleccionado</p><div className="empty-info"><p>Selecciona otro mes o realiza nuevos sorteos</p></div></div>
                                ) : (
                                    <div className="table-container">
                                        <div className="table-header-info">
                                            <span className="month-info">📅 Mes: <strong>{formatDisplayDate(selectedMonth)}</strong></span>
                                            <span className="count-info">👥 Total ganadores: <strong>{historicalWinners.length}</strong></span>
                                        </div>
                                        <table className="historical-table">
                                            <thead><tr><th>Posición</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Premio</th></tr></thead>
                                            <tbody>
                                                {historicalWinners.map(w => (
                                                    <tr key={w.id}>
                                                        <td className="position-cell"><span className={`position-badge position-${w.position}`}>{w.position}°</span></td>
                                                        <td className="name-cell"><div className="user-info"><span className="user-name">{w.name}</span></div></td>
                                                        <td className="email-cell">{w.email}</td>
                                                        <td className="phone-cell">{w.phone}</td>
                                                        <td className="prize-cell"><span className="prize-badge">🎁 {w.prize_name}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="table-footer"><p className="export-note">💡 Puedes exportar esta tabla a Excel usando el botón "Exportar Excel"</p></div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="wheel-column">
                    <div className="wheel-header">
                        <div className="section-title"><span className="section-icon">🌸</span><h2>Gira la Flor</h2></div>
                        <div className="wheel-stats">
                            <div className="wheel-stat"><span className="stat-label">Premios</span><span className="stat-value">{prizes.length}</span></div>
                            <div className="wheel-stat"><span className="stat-label">Estado</span><span className={`status-indicator ${spinning ? 'spinning' : 'ready'}`}>{spinning ? 'Girando...' : 'Lista'}</span></div>
                        </div>
                    </div>
                    <div className="wheel-section">
                        {prizes.length === 0 ? (
                            <div className="no-prizes-container">
                                <div className="no-prizes-content">
                                    <div className="no-prizes-icon"><span style={{ fontSize: '5rem', display: 'block' }}>🌸</span></div>
                                    <h3 className="no-prizes-title">Sin Premios Disponibles</h3>
                                    <p className="no-prizes-message">No hay premios creados para realizar el sorteo.<br />Crea tu primer premio para comenzar a girar la flor.</p>
                                    <div className="no-prizes-actions">
                                        <button className="create-prize-btn-large" onClick={openCreatePrizeModal} disabled={spinning}>
                                            <span className="btn-icon-large">➕</span>
                                            <div className="btn-text-container"><span className="btn-text-main">Crear Nuevo Premio</span><span className="btn-text-sub">Iniciar la experiencia de sorteos</span></div>
                                        </button>
                                    </div>
                                    <div className="no-prizes-info">
                                        <div className="info-card"><span className="info-icon">💡</span><div className="info-content"><h4>¿Cómo funciona?</h4><p>Crea premios atractivos para motivar la participación.</p></div></div>
                                        <div className="info-card"><span className="info-icon">🎯</span><div className="info-content"><h4>Beneficios</h4><p>Cada pétalo representa un premio diferente.</p></div></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="wheel-container">
                                    <div className="wheel-wrapper">
                                        <canvas ref={normalCanvasRef} width="680" height="680" className="wheel-canvas" />
                                        <button
                                            className="fullscreen-btn"
                                            onClick={() => setIsFullscreen(true)}
                                            title="Ver en pantalla completa"
                                            aria-label="Abrir pantalla completa"
                                        >
                                            ⛶
                                        </button>
                                    </div>
                                    <div className="wheel-instructions">
                                        <p className="instruction-text">Haz click en "Girar Flor" para seleccionar un ganador aleatoriamente</p>
                                        {currentWinners.length > 0 && (
                                            <p className="instruction-info"><span className="info-icon">ℹ️</span>Ganadores de hoy: <strong>{currentWinners.length}</strong> de <strong>{participants.length}</strong> participantes</p>
                                        )}
                                    </div>
                                </div>
                                <div className="spin-controls">
                                    <button className="spin-button" onClick={runRaffle} disabled={spinning}>
                                        {spinning
                                            ? <><span className="button-spinner"></span><span className="button-text">Girando Flor...</span><span className="button-time">⏱️ 5s</span></>
                                            : <><span className="button-icon">🌸</span><span className="button-text">Girar Flor</span></>
                                        }
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isFullscreen && prizes.length > 0 && (
                <div className="fs-overlay">
                    <div className="fs-topbar">
                        <h2>🌸 Gira la Flor 🌸</h2>
                        <button className="fs-close" onClick={() => setIsFullscreen(false)} title="Cerrar (ESC)">✕</button>
                    </div>
                    <div className="fs-canvas-area">
                        <canvas ref={fsCanvasRef} className="wheel-canvas" />
                    </div>
                    <div className="fs-controls">
                        <button className="fs-spin-btn" onClick={runRaffle} disabled={spinning}>
                            {spinning
                                ? <><span style={{ width: 22, height: 22, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'fsspin 0.8s linear infinite' }}></span>Girando... ⏱️ 5s</>
                                : <>🌸 Girar Flor</>
                            }
                        </button>
                    </div>
                    {/* <p className="fs-hint">Presiona <kbd>ESC</kbd> o el botón ✕ para salir</p> */}
                </div>
            )}

            {showResults && winner && selectedPrize && (
                <div className="results-overlay">
                    <div className="results-modal">
                        <div className="results-header">
                            <div className="results-title"><span className="title-icon">🎉</span><h2>¡TENEMOS UN GANADOR!</h2><span className="title-icon">🎉</span></div>
                            <p className="results-subtitle">Felicitaciones al afortunado ganador</p>
                        </div>
                        <div className="results-body">
                            <div className="success-banner"><div className="banner-content"><span className="banner-icon">🌸</span><div className="banner-text"><h3>{raffleResult?.message || '¡Sorteo completado exitosamente!'}</h3></div><span className="banner-icon">🎁</span></div></div>
                            <div className="results-grid">
                                <div className="result-card winner-card">
                                    <div className="card-header"><span className="card-icon">👑</span><h3>GANADOR</h3></div>
                                    <div className="card-body"><div className="winner-profile"><div className="profile-avatar">{winner.name.charAt(0)}</div><div className="profile-info"><h6 className="winner-name">{winner.name}</h6></div></div></div>
                                </div>
                                <div className="result-card prize-card">
                                    <div className="card-header"><span className="card-icon">🎁</span><h3>PREMIO GANADO</h3></div>
                                    <div className="card-body">
                                        <div className="prize-display"><div className="prize-icon">🏆</div><div className="prize-info"><h6 className="prize-name">{selectedPrize.name}</h6></div></div>
                                        <div className="prize-notice"><span className="notice-icon">⚠️</span><p>Este premio ya no está disponible para futuros sorteos</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="results-actions"><button className="action-btn primary-btn" onClick={closeResults}><span className="btn-icon">🌸</span>Realizar Nuevo Sorteo</button></div>
                        </div>
                        <button className="close-results-btn" onClick={closeResults}><span className="close-icon">✕</span></button>
                    </div>
                </div>
            )}

            {showPrizeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ width: '90%', maxWidth: '500px', animation: 'modalSlideIn 0.4s ease-out' }}>
                        <div style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fff5f9 100%)', borderRadius: '20px', boxShadow: '0 25px 50px rgba(255,20,147,0.25)', overflow: 'hidden', border: '2px solid #ff69b4' }}>
                            <div style={{ background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)', padding: '25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '2rem', background: 'rgba(255,255,255,0.2)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌸</span>
                                    <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>Crear Nuevo Premio</h2>
                                </div>
                                <button onClick={closeCreatePrizeModal} disabled={creatingPrize} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', color: 'white', fontSize: '1.2rem' }}>✕</button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600, color: '#333', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>🏷️</span>Nombre del Premio
                                </label>
                                <input type="text" value={newPrizeName} onChange={e => setNewPrizeName(e.target.value)}
                                    placeholder="Kit profesional de uñas, Salón de tus sueños..."
                                    disabled={creatingPrize} onKeyPress={e => e.key === 'Enter' && !creatingPrize && createPrize()} autoFocus
                                    style={{ width: '100%', padding: '16px 20px', border: '2px solid #ffb6c1', borderRadius: '12px', fontSize: '1rem', background: 'white', boxSizing: 'border-box' }}
                                    onFocus={e => { e.target.style.borderColor = '#ff69b4'; e.target.style.boxShadow = '0 0 0 3px rgba(255,105,180,0.2)'; e.target.style.outline = 'none'; }}
                                    onBlur={e => { e.target.style.borderColor = '#ffb6c1'; e.target.style.boxShadow = 'none'; }}
                                />
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', color: '#666', fontSize: '0.9rem', background: '#fff0f6', padding: '12px 15px', borderRadius: '10px', borderLeft: '4px solid #ff69b4', lineHeight: 1.4 }}>
                                    <span>💡</span>Este nombre aparecerá en un pétalo de la flor y será visible para todos los participantes
                                </div>
                                {/* Checkbox Premio Premium */}
                                <div
                                    onClick={() => !creatingPrize && setIsPremium(prev => !prev)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        marginTop: '16px', padding: '14px 18px',
                                        border: `2px solid ${isPremium ? '#ff1493' : '#ffb6c1'}`,
                                        borderRadius: '12px', cursor: creatingPrize ? 'not-allowed' : 'pointer',
                                        background: isPremium ? 'linear-gradient(135deg, #fff0f8, #ffe0f2)' : '#fff',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    <div style={{
                                        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                                        border: `2px solid ${isPremium ? '#ff1493' : '#ccc'}`,
                                        background: isPremium ? 'linear-gradient(135deg, #ff69b4, #ff1493)' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease',
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
                            <div style={{ padding: '20px 30px', background: 'linear-gradient(135deg, #fff8fb 0%, #fff0f6 100%)', borderTop: '1px solid #ffd1dc', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button onClick={closeCreatePrizeModal} disabled={creatingPrize} style={{ padding: '14px 28px', border: '1px solid #ddd', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: creatingPrize ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)', color: '#666' }}>↩️ Cancelar</button>
                                <button onClick={createPrize} disabled={!newPrizeName.trim() || creatingPrize} style={{ padding: '14px 28px', border: '1px solid #ff1493', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: (!newPrizeName.trim() || creatingPrize) ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)', color: 'white', minWidth: '150px', opacity: (!newPrizeName.trim() || creatingPrize) ? 0.5 : 1 }}>
                                    {creatingPrize
                                        ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }}></div>Creando...</>
                                        : <>✅ Crear Premio</>
                                    }
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
            )}
        </div>
    );
};

export default Lottery;