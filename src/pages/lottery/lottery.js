import React, { useState, useEffect, useRef } from 'react';
import MethodGet, { MethodPost } from "../../config/Service";
import Swal from 'sweetalert2';
import './Lottery.css';

const Lottery = () => {
    // Estados para los participantes
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(true);

    // Estados para los premios
    const [prizes, setPrizes] = useState([]);
    const [loadingPrizes, setLoadingPrizes] = useState(true);

    // Estados para la ruleta y sorteo
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [raffleResult, setRaffleResult] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [winningIndex, setWinningIndex] = useState(-1);
    const [showResults, setShowResults] = useState(false);
    const [targetRotation, setTargetRotation] = useState(0);
    const [currentWinners, setCurrentWinners] = useState([]); // Para mostrar ganadores en la tabla

    // Estados para el modal de creación de premios
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [newPrizeName, setNewPrizeName] = useState('');
    const [creatingPrize, setCreatingPrize] = useState(false);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // Cargar participantes con manejo robusto de errores
    const fetchParticipants = async () => {
        try {
            setLoadingParticipants(true);
            const response = await MethodGet('/admin/user-eligible');

            let participantsData = [];

            // Manejar diferentes estructuras de respuesta
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    participantsData = response.data;
                } else if (response.data.users && Array.isArray(response.data.users)) {
                    participantsData = response.data.users;
                } else if (typeof response.data === 'object') {
                    // Intentar extraer array de cualquier propiedad que sea array
                    const keys = Object.keys(response.data);
                    for (const key of keys) {
                        if (Array.isArray(response.data[key])) {
                            participantsData = response.data[key];
                            break;
                        }
                    }
                }
            } else if (Array.isArray(response)) {
                participantsData = response;
            }

            setParticipants(participantsData || []);

        } catch (error) {
            console.error('Error al cargar participantes:', error);
            setParticipants([]);
        } finally {
            setLoadingParticipants(false);
        }
    };

    // Cargar premios disponibles
    const fetchPrizes = async () => {
        try {
            setLoadingPrizes(true);
            const response = await MethodGet('/admin/available-prizes');

            let prizesData = [];

            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    prizesData = response.data;
                } else if (Array.isArray(response)) {
                    prizesData = response;
                }
            }

            // Mapear los premios para asegurar que tengan la estructura correcta
            const formattedPrizes = prizesData.map(prize => ({
                ...prize,
                prize_name: prize.prize_name || prize.name || `Premio ${prize.id}`,
                name: prize.name || prize.prize_name || `Premio ${prize.id}`
            }));

            setPrizes(formattedPrizes);

        } catch (error) {
            console.error('Error al cargar premios:', error);
            setPrizes([]);
        } finally {
            setLoadingPrizes(false);
        }
    };

    // Efecto para cargar datos iniciales
    useEffect(() => {
        fetchParticipants();
        fetchPrizes();
    }, []);

    // Función para verificar si hay participantes disponibles para premios
    const checkAvailableParticipants = () => {
        // Filtrar participantes que aún no han ganado
        const availableParticipants = participants.filter(participant =>
            !currentWinners.some(winner => winner.id === participant.id)
        );

        return {
            available: availableParticipants.length > 0,
            count: availableParticipants.length,
            participants: availableParticipants
        };
    };

    // Efecto para dibujar la ruleta
    useEffect(() => {
        if (canvasRef.current && prizes.length > 0) {
            drawWheel();
        }
    }, [prizes, rotation, winningIndex]);

    // Función para dibujar la ruleta
    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 25;

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (prizes.length === 0) return;

        const sliceAngle = (2 * Math.PI) / prizes.length;

        // Paleta de colores rosas mejorada
        const pinkColors = [
            '#FFB6C1', '#FF69B4', '#FF1493', '#DB7093',
            '#C71585', '#FFC0CB', '#FFB8D1', '#FFA6C9',
            '#FF80AB', '#FF4081', '#F50057', '#C51162'
        ];

        // Dibujar sectores
        prizes.forEach((prize, index) => {
            const startAngle = index * sliceAngle + rotation;
            const endAngle = (index + 1) * sliceAngle + rotation;

            // Dibujar sector con gradiente
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );

            // Resaltar el premio ganado
            if (winningIndex === index && selectedPrize && selectedPrize.id === prize.id) {
                gradient.addColorStop(0, '#FF1493');
                gradient.addColorStop(1, '#C71585');
                ctx.shadowColor = 'rgba(255, 20, 147, 0.8)';
                ctx.shadowBlur = 20;
            } else {
                gradient.addColorStop(0, pinkColors[index % pinkColors.length]);
                gradient.addColorStop(1, pinkColors[(index + 3) % pinkColors.length]);
                ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                ctx.shadowBlur = 10;
            }

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();

            // Borde del sector
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Restablecer sombra
            ctx.shadowBlur = 0;

            // Dibujar texto mejorado
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);

            // Nombre del premio
            ctx.textAlign = "right";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 16px 'Segoe UI', Arial, sans-serif";
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Función para texto multilínea mejorada
            function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
                const words = text.split(" ");
                let line = "";
                let lines = [];

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + " ";
                    const testWidth = ctx.measureText(testLine).width;

                    if (testWidth > maxWidth && line !== "") {
                        lines.push(line);
                        line = words[i] + " ";
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                const totalHeight = lines.length * lineHeight;
                let startY = y - totalHeight / 2 + lineHeight / 2;

                lines.forEach((l, idx) => {
                    ctx.fillText(l.trim(), x, startY + idx * lineHeight);
                });
            }

            wrapText(ctx, prize.prize_name, radius - 30, 0, radius - 60, 18);
            ctx.restore();
        });

        // Dibujar centro de la ruleta con efecto 3D
        const centerGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 25
        );
        centerGradient.addColorStop(0, '#FF69B4');
        centerGradient.addColorStop(1, '#FF1493');

        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fillStyle = centerGradient;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Agregar efecto de brillo al centro
        ctx.beginPath();
        ctx.arc(centerX - 8, centerY - 8, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // Dibujar puntero mejorado (posición fija en 90 grados - lado derecho)
        const pointerAngle = -Math.PI / 2; // 270 grados (apuntando hacia abajo)
        const pointerX = centerX + Math.cos(pointerAngle) * radius;
        const pointerY = centerY + Math.sin(pointerAngle) * radius;

        ctx.save();
        ctx.translate(pointerX, pointerY);
        ctx.rotate(pointerAngle + Math.PI / 2);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-20, -15);
        ctx.lineTo(-20, 15);
        ctx.closePath();

        const pointerGradient = ctx.createLinearGradient(0, -15, 0, 15);
        pointerGradient.addColorStop(0, '#FF1493');
        pointerGradient.addColorStop(1, '#FF69B4');

        ctx.fillStyle = pointerGradient;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    };

    // Calcular la rotación para que el premio ganado quede exactamente en el puntero
    const calculateWinningRotation = (prizeId) => {
        if (prizes.length === 0) return 0;

        const prizeIndex = prizes.findIndex(p => p.id === prizeId);
        if (prizeIndex === -1) {
            console.warn('Premio no encontrado en la ruleta');
            return 0;
        }

        const totalPrizes = prizes.length;
        const sliceAngle = (2 * Math.PI) / totalPrizes;

        // El puntero está en -90 grados (270 grados) - posición fija
        const pointerAngle = -Math.PI / 2;

        // Queremos que el centro del sector del premio ganado quede en el puntero
        // El centro del sector está en: prizeIndex * sliceAngle + sliceAngle/2
        const prizeCenterAngle = prizeIndex * sliceAngle + sliceAngle / 2;

        // Calcular la rotación necesaria para alinear el premio con el puntero
        // La rotación debe ser: pointerAngle - prizeCenterAngle
        let targetRotation = pointerAngle - prizeCenterAngle;

        // Normalizar entre 0 y 2π
        targetRotation = ((targetRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        // Añadir múltiples vueltas completas para efecto de giro (5 vueltas base)
        const baseRotations = 5 * (2 * Math.PI);

        return baseRotations + targetRotation;
    };

    // Función para mostrar alerta de no participantes
    // Función para mostrar alerta de no participantes
    const showNoParticipantsAlert = () => {
        Swal.fire({
            title: '🎯 ¡Atención!',
            html: `
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">👥</div>
                <p style="font-size: 1.3rem; margin-bottom: 15px; color: #FF1493;">
                    <strong>No hay participantes disponibles para recibir premios.</strong>
                </p>
                <div style="background: linear-gradient(135deg, #fff5f9 0%, #ffe6f2 100%); 
                         padding: 20px; border-radius: 12px; margin: 20px 0; 
                         border-left: 4px solid #FF69B4;">
                    <p style="font-weight: 600; color: #333; margin-bottom: 15px;">📊 Estadísticas:</p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; color: #FF1493;">${participants.length}</div>
                            <div style="font-size: 0.9rem; color: #666;">Participantes totales</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; color: #FF1493;">${currentWinners.length}</div>
                            <div style="font-size: 0.9rem; color: #666;">Ganadores registrados</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; color: #FF1493;">${prizes.length}</div>
                            <div style="font-size: 0.9rem; color: #666;">Premios disponibles</div>
                        </div>
                    </div>
                </div>
                <p style="color: #666; font-size: 1rem; margin-top: 20px; padding: 0 20px;">
                    <span style="color: #FF1493;">💡</span> 
                    Todos los participantes ya han recibido un premio. 
                    <br>
                    Agrega más participantes o crea nuevos sorteos para continuar.
                </p>
            </div>
        `,
            icon: 'warning',
            iconColor: '#FF1493',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#FF69B4',
            background: '#fff',
            showCancelButton: false,
            width: '600px',
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                confirmButton: 'custom-swal-confirm'
            }
        });
    };

    // Función para ejecutar el sorteo
    // Función para ejecutar el sorteo
    const runRaffle = async () => {
        // Verificar si hay participantes disponibles ANTES de hacer la petición
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

        // Resetear estados para nuevo giro
        setSpinning(true);
        setWinner(null);
        setSelectedPrize(null);
        setRaffleResult(null);
        setWinningIndex(-1);
        setShowResults(false);
        setTargetRotation(0);

        try {
            // Ejecutar el sorteo en el backend
            const response = await MethodGet('/admin/run-raffle');
            console.log('🎰 RESPUESTA DEL SORTEO:', response);

            // Verificar si la respuesta contiene el error de no participantes disponibles
            if (response && response.message && response.message.includes("no quedan usuarios disponibles")) {
                setSpinning(false);
                showNoParticipantsAlert();
                return;
            }

            // Acceder a los datos reales de la respuesta
            const data = response?.data || response;
            console.log('📊 DATOS PROCESADOS:', data);

            // Verificar si la respuesta tiene la estructura correcta
            if (data && data.message && data.prize && data.winner) {
                // Verificar si el ganador ya tiene premio
                const winnerAlreadyHasPrize = currentWinners.some(w => w.id === data.winner.id);

                if (winnerAlreadyHasPrize) {
                    // Mostrar alerta de que este participante ya ganó
                    Swal.fire({
                        title: '⚠️ Participante ya premiado',
                        html: `
                        <div style="text-align: center;">
                            <p>El participante <strong>${data.winner.name}</strong> ya recibió un premio anteriormente.</p>
                            <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">
                                Se intentará seleccionar otro ganador en el próximo intento.
                            </p>
                        </div>
                    `,
                        icon: 'warning',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#FF69B4'
                    }).then(() => {
                        // Intentar de nuevo automáticamente
                        setSpinning(false);
                        setTimeout(() => {
                            runRaffle();
                        }, 1000);
                    });
                    return;
                }

                // Guardar resultados
                setRaffleResult(data);
                setWinner(data.winner);
                setSelectedPrize({
                    ...data.prize,
                    prize_name: data.prize.name || data.prize.prize_name
                });

                // Encontrar el índice del premio ganador
                const prizeIndex = prizes.findIndex(p => p.id === data.prize.id);
                console.log('🎯 ÍNDICE DEL PREMIO GANADOR:', prizeIndex);

                if (prizeIndex !== -1) {
                    setWinningIndex(prizeIndex);

                    // Calcular rotación exacta para el premio ganador
                    const targetRot = calculateWinningRotation(data.prize.id);
                    console.log('🎡 ROTACIÓN OBJETIVO CALCULADA:', targetRot);

                    setTargetRotation(targetRot);

                    // Animar el giro de la ruleta (SIEMPRE 5 SEGUNDOS)
                    animateWheel(targetRot);
                } else {
                    console.warn('⚠️ Premio ganado no encontrado en la ruleta actual');

                    // Girar aleatoriamente pero marcar como error
                    const randomRot = Math.random() * Math.PI * 10;
                    setTargetRotation(randomRot);
                    animateWheel(randomRot);

                    // Mostrar error en resultados
                    setRaffleResult({
                        ...data,
                        message: data.message + " (Premio no encontrado en ruleta)"
                    });
                }
            } else {
                console.error('❌ Estructura de respuesta inválida');
                throw new Error('Respuesta inválida del servidor');
            }

        } catch (error) {
            console.error('❌ Error en el sorteo:', error);

            // Verificar si es el error específico de no participantes
            if (error.response && error.response.data &&
                error.response.data.message &&
                error.response.data.message.includes("no quedan usuarios disponibles")) {
                setSpinning(false);
                showNoParticipantsAlert();
                return;
            }

            // Modo de emergencia: solo si hay participantes disponibles
            const availableCheck = checkAvailableParticipants();
            if (availableCheck.available) {
                const randomWinner = availableCheck.participants[
                    Math.floor(Math.random() * availableCheck.participants.length)
                ];
                const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
                const prizeIndex = prizes.findIndex(p => p.id === randomPrize.id);

                setRaffleResult({
                    message: "🎲 Sorteo simulado (modo emergencia)"
                });
                setWinner(randomWinner);
                setSelectedPrize(randomPrize);
                setWinningIndex(prizeIndex);

                const targetRot = calculateWinningRotation(randomPrize.id);
                setTargetRotation(targetRot);
                animateWheel(targetRot);
            } else {
                setSpinning(false);
                showNoParticipantsAlert();
            }
        }
    };

    // Animación del giro de la ruleta - SIEMPRE 5 SEGUNDOS COMPLETOS
    const animateWheel = (targetRotation) => {
        const spinDuration = 5000; // 5 segundos EXACTOS
        const startTime = Date.now();
        const startRotation = rotation;

        // Para un giro más espectacular, añadimos vueltas extras
        // pero mantenemos la duración de 5 segundos
        const extraRotations = Math.floor(Math.random() * 3 + 3) * (2 * Math.PI); // 3-5 vueltas extras
        const finalTargetRotation = targetRotation + extraRotations;

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);

            // Easing function para efecto realista
            const easeOut = 1 - Math.pow(1 - progress, 3);

            // Calcular rotación actual
            const currentRotation = startRotation + (finalTargetRotation - startRotation) * easeOut;
            setRotation(currentRotation);

            if (progress < 1) {
                // Continuar animación hasta completar 5 segundos
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // FIN DE LA ANIMACIÓN DESPUÉS DE 5 SEGUNDOS
                setSpinning(false);

                // console.log('🎡 GIRO COMPLETADO - 5 SEGUNDOS');
                // console.log('🎡 Ganador actual:', winner);

                // Agregar ganador a la lista de ganadores actuales
                if (winner && selectedPrize) {
                    setCurrentWinners(prev => [
                        ...prev,
                        {
                            ...winner,
                            prize: selectedPrize.name,
                            prize_id: selectedPrize.id,
                            timestamp: new Date().toLocaleTimeString()
                        }
                    ]);
                }

                // Pequeña pausa dramática antes de mostrar resultados
                setTimeout(() => {
                    setShowResults(true);

                    // Actualizar datos después de mostrar resultados
                    setTimeout(() => {
                        fetchParticipants();
                        fetchPrizes();
                    }, 1000);
                }, 500);
            }
        };

        // Iniciar animación
        animationRef.current = requestAnimationFrame(animate);
    };

    // Cancelar animación al desmontar
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Función para crear un nuevo premio
    const createPrize = async () => {
        if (!newPrizeName.trim()) {
            Swal.fire({
                title: '⚠️ Campo requerido',
                text: 'Por favor ingresa un nombre para el premio.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF69B4'
            });
            return;
        }

        try {
            setCreatingPrize(true);
            const response = await MethodPost('/admin/create-prize', {
                prize_name: newPrizeName.trim()
            });

            // Limpiar formulario y cerrar modal
            setNewPrizeName('');
            setShowPrizeModal(false);

            // Actualizar lista de premios
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
        } catch (error) {
            console.error('Error al crear premio:', error);
            Swal.fire({
                title: '❌ Error',
                text: 'Error al crear el premio. Por favor, intente nuevamente.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF69B4'
            });
        } finally {
            setCreatingPrize(false);
        }
    };

    // Función para abrir modal de crear premio
    const openCreatePrizeModal = () => {
        setShowPrizeModal(true);
    };

    // Función para cerrar modal de crear premio
    const closeCreatePrizeModal = () => {
        if (!creatingPrize) {
            setShowPrizeModal(false);
            setNewPrizeName('');
        }
    };

    // Función para cerrar resultados
    const closeResults = () => {
        setShowResults(false);
        setWinner(null);
        setSelectedPrize(null);
        setRaffleResult(null);
        setWinningIndex(-1);
        setTargetRotation(0);
    };

    return (
        <div className="lottery-container">
            <div className="lottery-header">
                <div className="header-content">
                    <h1 className="lottery-title">🌸 Gana el Salón de tus Sueños 🌸</h1>
                    <div className="header-stats">
                        <div className="stat-card">
                            <span className="stat-icon">👥</span>
                            <div className="stat-info">
                                <span className="stat-label">Participantes</span>
                                <span className="stat-value">{participants.length}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🎁</span>
                            <div className="stat-info">
                                <span className="stat-label">Premios</span>
                                <span className="stat-value">{prizes.length}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">🏆</span>
                            <div className="stat-info">
                                <span className="stat-label">Ganadores</span>
                                <span className="stat-value">{currentWinners.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lottery-content">
                {/* Columna izquierda - Participantes */}
                <div className="participants-column">
                    <div className="section-header">
                        <div className="section-title">
                            <span className="section-icon">🎟️</span>
                            <h2>Lista de Participantes</h2>
                        </div>
                        <div className="section-actions">
                            <button
                                className="action-btn refresh-btn"
                                onClick={fetchParticipants}
                                disabled={loadingParticipants || spinning}
                            >
                                <span className="btn-icon">🔄</span>
                                Actualizar
                            </button>
                            <button
                                className="action-btn add-prize-btn"
                                onClick={openCreatePrizeModal}
                                disabled={spinning}
                            >
                                <span className="btn-icon">➕</span>
                                Nuevo Premio
                            </button>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        {loadingParticipants ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando participantes...</p>
                            </div>
                        ) : participants.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">👥</span>
                                <p>No hay participantes disponibles</p>
                                <button
                                    className="retry-btn"
                                    onClick={fetchParticipants}
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : (
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
                                        {participants.map((participant) => {
                                            // Verificar si este participante ha ganado en sorteos anteriores
                                            const isWinner = currentWinners.some(w => w.id === participant.id);
                                            const winnerInfo = isWinner ? currentWinners.find(w => w.id === participant.id) : null;

                                            return (
                                                <tr
                                                    key={participant.id}
                                                    className={isWinner ? 'winner-row' : ''}
                                                >
                                                    <td className="id-cell">{participant.id}</td>
                                                    <td className="name-cell">
                                                        <div className="user-info">
                                                            <span className="user-name">{participant.name}</span>
                                                            {isWinner && (
                                                                <span className="winner-badge" title={`Premio: ${winnerInfo.prize}`}>
                                                                    🏆 GANADOR
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="email-cell">{participant.email}</td>
                                                    <td className="phone-cell">{participant.phone || 'N/A'}</td>
                                                    <td className="status-cell">
                                                        <span className={`status-badge ${isWinner ? 'winner' : participant.subscriptions?.[0]?.status === 'active' ? 'active' : 'inactive'}`}>
                                                            {isWinner ? 'Premiado' : participant.subscriptions?.[0]?.status === 'active' ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Sección de ganadores actuales */}
                                {currentWinners.length > 0 && (
                                    <div className="winners-section">
                                        <h3 className="winners-title">🏆 Ganadores de Hoy</h3>
                                        <div className="winners-list">
                                            {currentWinners.map((winner, index) => (
                                                <div key={index} className="winner-item">
                                                    <span className="winner-name">{winner.name}</span>
                                                    <span className="winner-prize">🎁 {winner.prize}</span>
                                                    <span className="winner-time">{winner.timestamp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna derecha - Ruleta */}
                <div className="wheel-column">
                    <div className="wheel-header">
                        <div className="section-title">
                            <span className="section-icon">🎡</span>
                            <h2>Ruleta de la Fortuna</h2>
                        </div>
                        <div className="wheel-stats">
                            <div className="wheel-stat">
                                <span className="stat-label">Premios</span>
                                <span className="stat-value">{prizes.length}</span>
                            </div>
                            <div className="wheel-stat">
                                <span className="stat-label">Estado</span>
                                <span className={`status-indicator ${spinning ? 'spinning' : 'ready'}`}>
                                    {spinning ? 'Girando...' : 'Lista'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="wheel-section">
                        <div className="wheel-container">
                            <div className="wheel-wrapper">
                                <canvas
                                    ref={canvasRef}
                                    width="500"
                                    height="500"
                                    className="wheel-canvas"
                                />
                            </div>

                            <div className="wheel-instructions">
                                <p className="instruction-text">
                                    Haz clic en "Girar Ruleta" para seleccionar un ganador aleatoriamente
                                </p>
                                {currentWinners.length > 0 && (
                                    <p className="instruction-info">
                                        <span className="info-icon">ℹ️</span>
                                        Ganadores de hoy: <strong>{currentWinners.length}</strong> de <strong>{participants.length}</strong> participantes
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="spin-controls">
                            <button
                                className="spin-button"
                                onClick={runRaffle}
                                disabled={spinning}
                            >
                                {spinning ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        <span className="button-text">Girando Ruleta...</span>
                                        <span className="button-time">⏱️ 5s</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="button-icon">🌸</span>
                                        <span className="button-text">Girar Ruleta</span>
                                        {/* <span className="button-hint">(5 segundos de emoción)</span> */}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de resultados */}
            {showResults && winner && selectedPrize && (
                <div className="results-overlay">
                    <div className="results-modal">
                        <div className="results-header">
                            <div className="results-title">
                                <span className="title-icon">🎉</span>
                                <h2>¡TENEMOS UN GANADOR!</h2>
                                <span className="title-icon">🎉</span>
                            </div>
                            <p className="results-subtitle">Felicitaciones al afortunado ganador</p>
                        </div>

                        <div className="results-body">
                            <div className="success-banner">
                                <div className="banner-content">
                                    <span className="banner-icon">🏆</span>
                                    <div className="banner-text">
                                        <h3>{raffleResult?.message || '¡Sorteo completado exitosamente!'}</h3>
                                        {/* <p>La ruleta ha girado durante 5 segundos</p> */}
                                    </div>
                                    <span className="banner-icon">🎁</span>
                                </div>
                            </div>

                            <div className="results-grid">
                                <div className="result-card winner-card">
                                    <div className="card-header">
                                        <span className="card-icon">👑</span>
                                        <h3>GANADOR</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="winner-profile">
                                            <div className="profile-avatar">
                                                {winner.name.charAt(0)}
                                            </div>
                                            <div className="profile-info">
                                                <h4 className="winner-name">{winner.name}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="result-card prize-card">
                                    <div className="card-header">
                                        <span className="card-icon">🎁</span>
                                        <h3>PREMIO GANADO</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="prize-display">
                                            <div className="prize-icon">🏆</div>
                                            <div className="prize-info">
                                                <h4 className="prize-name">{selectedPrize.name}</h4>
                                                <p className="prize-id">ID: {selectedPrize.id}</p>
                                            </div>
                                        </div>
                                        <div className="prize-notice">
                                            <span className="notice-icon">⚠️</span>
                                            <p>Este premio ya no está disponible para futuros sorteos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="results-actions">
                                <button
                                    className="action-btn primary-btn"
                                    onClick={closeResults}
                                >
                                    <span className="btn-icon">🎰</span>
                                    Realizar Nuevo Sorteo
                                </button>
                            </div>
                        </div>

                        <button
                            className="close-results-btn"
                            onClick={closeResults}
                        >
                            <span className="close-icon">✕</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Modal para crear nuevo premio - CON ESTILOS INLINE */}
            {showPrizeModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    // backdropFilter: 'blur(8px)',
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
                            boxShadow: '0 25px 50px rgba(255, 20, 147, 0.25), 0 10px 30px rgba(0, 0, 0, 0.2)',
                            overflow: 'hidden',
                            border: '2px solid #ff69b4',
                            position: 'relative'
                        }}>
                            {/* Header del modal */}
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
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(5px)',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        🌸
                                    </span>
                                    <h2 style={{
                                        color: 'white',
                                        margin: 0,
                                        fontSize: '1.8rem',
                                        fontWeight: 700,
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                                    }}>
                                        Crear Nuevo Premio
                                    </h2>
                                </div>
                                <button
                                    onClick={closeCreatePrizeModal}
                                    disabled={creatingPrize}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        color: 'white',
                                        fontSize: '1.2rem',
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!creatingPrize) {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                            e.target.style.transform = 'rotate(90deg)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!creatingPrize) {
                                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                            e.target.style.transform = 'rotate(0deg)';
                                        }
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Cuerpo del modal */}
                            <div style={{ padding: '30px' }}>
                                {/* Campo de nombre del premio */}
                                <div style={{ marginBottom: '25px' }}>
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
                                        onChange={(e) => setNewPrizeName(e.target.value)}
                                        placeholder="Kit profesional de uñas, Salón de tus sueños..."
                                        disabled={creatingPrize}
                                        onKeyPress={(e) => e.key === 'Enter' && !creatingPrize && createPrize()}
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            border: '2px solid #ffb6c1',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            background: 'white',
                                            transition: 'all 0.3s ease',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                            e.target.style.borderColor = '#ff69b4';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 105, 180, 0.2)';
                                        }}
                                        onBlur={(e) => {
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
                                        <span style={{ fontSize: '1rem', marginTop: '2px' }}>💡</span>
                                        Este nombre aparecerá en la ruleta y será visible para todos los participantes
                                    </div>
                                </div>

                                {/* Vista previa
                                <div style={{
                                    marginTop: '25px',
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, #fff8fb 0%, #fff0f6 100%)',
                                    borderRadius: '15px',
                                    border: '2px dashed #ff69b4'
                                }}>
                                    <h4 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: '#333',
                                        marginBottom: '15px',
                                        fontSize: '1.1rem',
                                        fontWeight: 600
                                    }}>
                                        <span style={{ fontSize: '1.3rem' }}>👁️</span>
                                        Vista previa en la ruleta
                                    </h4>
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            padding: '15px',
                                            background: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                            border: '1px solid #ffd1dc'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                                                boxShadow: '0 3px 6px rgba(255, 105, 180, 0.3)'
                                            }}></div>
                                            <div style={{
                                                flex: 1,
                                                fontWeight: 500,
                                                color: '#333',
                                                fontSize: '1.1rem',
                                                padding: '5px 0'
                                            }}>
                                                {newPrizeName || "Nombre del premio aparecerá aquí"}
                                            </div>
                                        </div>
                                        <p style={{
                                            color: '#666',
                                            fontSize: '0.9rem',
                                            textAlign: 'center',
                                            marginTop: '10px',
                                            padding: '12px',
                                            background: 'rgba(255, 182, 193, 0.15)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 105, 180, 0.2)'
                                        }}>
                                            El premio se agregará como una nueva sección en la ruleta
                                        </p>
                                    </div>
                                </div> */}
                            </div>

                            {/* Footer del modal */}
                            <div style={{
                                padding: '20px 30px',
                                background: 'linear-gradient(135deg, #fff8fb 0%, #fff0f6 100%)',
                                borderTop: '1px solid #ffd1dc',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '15px'
                            }}>
                                <button
                                    onClick={closeCreatePrizeModal}
                                    disabled={creatingPrize}
                                    style={{
                                        padding: '14px 28px',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: creatingPrize ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s ease',
                                        minWidth: '150px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                        color: '#666',
                                        border: '1px solid #ddd'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!creatingPrize) {
                                            e.target.style.background = 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!creatingPrize) {
                                            e.target.style.background = 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)';
                                            e.target.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <span>↩️</span>
                                    Cancelar
                                </button>
                                <button
                                    onClick={createPrize}
                                    disabled={!newPrizeName.trim() || creatingPrize}
                                    style={{
                                        padding: '14px 28px',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: (!newPrizeName.trim() || creatingPrize) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s ease',
                                        minWidth: '150px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        background: 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
                                        color: 'white',
                                        border: '1px solid #ff1493',
                                        opacity: (!newPrizeName.trim() || creatingPrize) ? 0.5 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (newPrizeName.trim() && !creatingPrize) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 15px rgba(255, 105, 180, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (newPrizeName.trim() && !creatingPrize) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                >
                                    {creatingPrize ? (
                                        <>
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                borderRadius: '50%',
                                                borderTopColor: 'white',
                                                animation: 'spin 1s linear infinite'
                                            }}></div>
                                            Creando Premio...
                                        </>
                                    ) : (
                                        <>
                                            <span>✅</span>
                                            Crear Premio
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Agregar los keyframes CSS para las animaciones */}
                    <style>
                        {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}
                    </style>
                </div>
            )}
        </div>
    );
};

export default Lottery;