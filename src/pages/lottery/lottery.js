import React, { useState, useCallback } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    GlobalStyles,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import {
    AddRounded,
    AutorenewRounded,
    BarChartRounded,
    EmojiEventsRounded,
    FilterVintage,
    GroupsRounded,
    PeopleAltRounded,
    RedeemRounded,
    StarRounded,
    WorkspacePremiumRounded
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { keyframes } from '@mui/system';

import theme, { gradients, swalGlobalStyles } from './Theme';

import { useLotteryData } from './hooks/useLotteryData';
import { useWheelAnimation } from './hooks/useWheelAnimation';
import { useRaffle } from './hooks/useRaffle';
import { useExcelExport } from './hooks/useExcelExport';

import WheelCanvas from './components/WheelCanvas';
import ParticipantsTable from './components/ParticipantsTable';
import WinnersTable from './components/WinnersTable';
import PrizeModal from './components/PrizeModal';
import ResultsModal from './components/ResultsModal';
import FullscreenWheel from './components/FullscreenWheel';

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.65; }
`;

const spinIcon = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const Lottery = () => {
    /* ------------------------------- Datos -------------------------------- */
    const {
        participants,
        loadingParticipants,
        prizes,
        currentWinners,
        setCurrentWinners,
        historicalWinners,
        setHistoricalWinners,
        loadingHistorical,
        availableMonths,
        selectedMonth,
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
    } = useLotteryData();

    /* ------------------------------ Estado UI ----------------------------- */
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPrizeModal, setShowPrizeModal] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [winner, setWinner] = useState(null);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [raffleResult, setRaffleResult] = useState(null);

    /* ------------------------------ Animación ----------------------------- */
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

    /* ------------------------------- Sorteo ------------------------------- */
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

    const { exportingExcel, exportWinners } = useExcelExport();

    const closeResults = useCallback(() => {
        setShowResults(false);
        setWinner(null);
        setSelectedPrize(null);
        setRaffleResult(null);
        setWinningIndex(-1);
        stopAnimation();
    }, [stopAnimation, setWinningIndex]);

    /* ------------------------------ Derivados ----------------------------- */
    const isCurrentTab = activeTable === 'current';

    const exportDisabled =
        exportingExcel ||
        spinning ||
        (isCurrentTab ? currentWinners.length === 0 : historicalWinners.length === 0);

    const stats = [
        { icon: <GroupsRounded />, label: 'Participantes', value: participants.length },
        { icon: <RedeemRounded />, label: 'Premios', value: prizes.length }
    ];

    /* ------------------------------- Render ------------------------------- */
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles styles={swalGlobalStyles} />

            <Box
                sx={{
                    minHeight: '100vh',
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    background: `
                        radial-gradient(circle at top right, rgba(255,105,180,0.12), transparent 30%),
                        linear-gradient(135deg, #fff7fb 0%, #fff0f6 50%, #fff7fb 100%)
                    `
                }}
            >
                {/* ============================ HEADER ============================ */}
                <Paper
                    elevation={0}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        mb: { xs: 2, md: 3 },
                        p: { xs: 2, sm: 3, md: 3.5 },
                        color: '#fff',
                        borderRadius: 4,
                        background: gradients.pinkHeader,
                        boxShadow: '0 12px 35px rgba(255,20,147,0.18)',
                        '&::before, &::after': {
                            content: '""',
                            position: 'absolute',
                            borderRadius: '50%'
                        },
                        '&::before': {
                            width: 220,
                            height: 220,
                            top: -120,
                            right: -50,
                            bgcolor: 'rgba(255,255,255,0.08)'
                        },
                        '&::after': {
                            width: 150,
                            height: 150,
                            bottom: -100,
                            left: -30,
                            bgcolor: 'rgba(255,255,255,0.06)'
                        }
                    }}
                >
                    <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <StarRounded sx={{ fontSize: { xs: 28, sm: 34 }, color: '#ffd1e3' }} />
                            <Typography
                                component="h1"
                                sx={{
                                    textAlign: 'center',
                                    fontSize: { xs: '1.35rem', sm: '1.8rem', md: '2.25rem' },
                                    fontWeight: 800,
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.02em',
                                    textShadow: '0 3px 8px rgba(0,0,0,0.18)'
                                }}
                            >
                                Gana el Salón de tus Sueños
                            </Typography>
                            <StarRounded sx={{ fontSize: { xs: 28, sm: 34 }, color: '#ffd1e3' }} />
                        </Stack>

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1.5}
                            width="100%"
                            maxWidth={700}
                        >
                            {stats.map(({ icon, label, value }) => (
                                <Paper
                                    key={label}
                                    variant="glass"
                                    sx={{
                                        flex: 1,
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        color: '#fff',
                                        borderRadius: 3,
                                        transition: 'transform 0.25s ease, background 0.25s ease',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            bgcolor: 'rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            color: '#fff',
                                            bgcolor: 'rgba(255,255,255,0.13)',
                                            '& svg': { fontSize: 30 }
                                        }}
                                    >
                                        {icon}
                                    </Avatar>
                                    <Box minWidth={0}>
                                        <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
                                            {label}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: { xs: '1.5rem', md: '1.8rem' },
                                                fontWeight: 800,
                                                lineHeight: 1.1
                                            }}
                                        >
                                            {value}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Stack>
                </Paper>

                {/* ============================= GRID ============================= */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' },
                        gap: { xs: 2, md: 3 },
                        alignItems: 'stretch'
                    }}
                >
                    {/* ------------------------- TABLAS ------------------------- */}
                    <Paper
                        variant="panel"
                        sx={{
                            minHeight: { xs: 450, lg: 650 },
                            maxHeight: { lg: 'calc(100vh - 210px)' }
                        }}
                    >
                        <Paper variant="panelHeader">
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar variant="badge">
                                        {isCurrentTab ? <PeopleAltRounded /> : <EmojiEventsRounded />}
                                    </Avatar>
                                    <Box>
                                        <Typography component="h2" variant="h6" fontWeight={800}>
                                            {isCurrentTab ? 'Lista de Participantes' : 'Ganadores'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {isCurrentTab
                                                ? 'Personas disponibles para el sorteo'
                                                : 'Consulta los resultados históricos'}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1}
                                    useFlexGap
                                    flexWrap="wrap"
                                >
                                    <ToggleButtonGroup
                                        exclusive
                                        size="small"
                                        value={activeTable}
                                        onChange={handleTableChange}
                                        disabled={spinning}
                                        aria-label="Seleccionar vista"
                                    >
                                        <ToggleButton value="current" sx={{ flex: { xs: 1, sm: 'initial' } }}>
                                            <PeopleAltRounded fontSize="small" />
                                            Participantes
                                        </ToggleButton>
                                        <ToggleButton value="historical" sx={{ flex: { xs: 1, sm: 'initial' } }}>
                                            <EmojiEventsRounded fontSize="small" />
                                            Ganadores
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                    <Button
                                        variant="gradient"
                                        color="info"
                                        disabled={exportDisabled}
                                        onClick={() =>
                                            exportWinners({
                                                isCurrent: isCurrentTab,
                                                currentWinners,
                                                historicalWinners,
                                                month: selectedMonth
                                            })
                                        }
                                        startIcon={
                                            exportingExcel ? (
                                                <CircularProgress size={18} color="inherit" />
                                            ) : (
                                                <BarChartRounded />
                                            )
                                        }
                                    >
                                        {exportingExcel ? 'Exportando...' : 'Exportar Excel'}
                                    </Button>

                                    <Button
                                        variant="gradient"
                                        disabled={spinning}
                                        onClick={() => setShowPrizeModal(true)}
                                        startIcon={<AddRounded />}
                                    >
                                        Nuevo Premio
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>

                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                p: { xs: 1.5, sm: 2.5 },
                                '&::-webkit-scrollbar': { width: 7 },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: 'rgba(255,105,180,0.25)',
                                    borderRadius: 10
                                }
                            }}
                        >
                            {isCurrentTab ? (
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
                                    months={availableMonths}
                                    selectedMonth={selectedMonth}
                                    formatDisplayDate={formatDisplayDate}
                                    onMonthChange={handleMonthChange}
                                    onRefresh={refreshHistorical}
                                    disabled={spinning}
                                />
                            )}
                        </Box>
                    </Paper>

                    {/* ------------------------- RULETA ------------------------- */}
                    <Paper variant="panel" sx={{ minHeight: { xs: 620, md: 650 } }}>
                        <Paper variant="panelHeader">
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                justifyContent="space-between"
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar variant="badge">
                                        <FilterVintage />
                                    </Avatar>
                                    <Box>
                                        <Typography component="h2" variant="h6" fontWeight={800}>
                                            Gira la Flor
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Elige un ganador al azar
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    divider={<Divider orientation="vertical" flexItem />}
                                    justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                                    sx={{ '& > div': { minWidth: 72, textAlign: 'center' } }}
                                >
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            fontWeight={700}
                                            display="block"
                                            mb={0.5}
                                        >
                                            Premios
                                        </Typography>
                                        <Typography variant="h5" fontWeight={800} color="primary.main">
                                            {prizes.length}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            fontWeight={700}
                                            display="block"
                                            mb={0.5}
                                        >
                                            Estado
                                        </Typography>
                                        <Chip
                                            size="small"
                                            icon={
                                                spinning ? (
                                                    <AutorenewRounded
                                                        sx={{ animation: `${spinIcon} 1s linear infinite` }}
                                                    />
                                                ) : (
                                                    <WorkspacePremiumRounded />
                                                )
                                            }
                                            label={spinning ? 'Girando...' : 'Lista'}
                                            sx={{
                                                fontWeight: 700,
                                                color: '#fff',
                                                background: spinning ? gradients.orange : gradients.green,
                                                animation: spinning ? `${pulse} 1.5s infinite` : 'none',
                                                '& .MuiChip-icon': { color: 'inherit' }
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>

                        <Stack
                            spacing={3}
                            alignItems="center"
                            justifyContent="center"
                            sx={{ flex: 1, p: { xs: 2, sm: 2.5, md: 3 }, overflow: 'hidden' }}
                        >
                            <WheelCanvas
                                prizes={prizes}
                                rotation={rotation}
                                winningIndex={winningIndex}
                                selectedPrize={selectedPrize}
                                onFullscreen={() => setIsFullscreen(true)}
                            />

                            {prizes.length === 0 ? (
                                <Alert
                                    severity="info"
                                    icon={<RedeemRounded />}
                                    sx={{
                                        width: '100%',
                                        maxWidth: 620,
                                        borderRadius: 3,
                                        color: 'text.secondary',
                                        bgcolor: 'rgba(255,105,180,0.06)',
                                        border: '1px solid rgba(255,105,180,0.14)'
                                    }}
                                >
                                    Crea un premio para activar la rueda y comenzar el sorteo.
                                </Alert>
                            ) : (
                                <Stack spacing={1.5} alignItems="center" textAlign="center">
                                    <Typography fontWeight={600}>
                                        Haz clic en{' '}
                                        <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                            "Girar Flor"
                                        </Box>{' '}
                                        para seleccionar un ganador aleatoriamente.
                                    </Typography>

                                    {currentWinners.length > 0 && (
                                        <Paper
                                            variant="glass"
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                borderRadius: 3,
                                                color: 'text.secondary'
                                            }}
                                        >
                                            <PeopleAltRounded sx={{ fontSize: 19, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                Ganadores de hoy: <strong>{currentWinners.length}</strong> de{' '}
                                                <strong>{participants.length}</strong>
                                            </Typography>
                                        </Paper>
                                    )}
                                </Stack>
                            )}

                            <Stack spacing={1.5} alignItems="center" width="100%">
                                {prizes.length === 0 && (
                                    <Button
                                        variant="gradient"
                                        disabled={spinning}
                                        onClick={() => setShowPrizeModal(true)}
                                        startIcon={<AddRounded />}
                                        sx={{ px: 3, py: 1.3 }}
                                    >
                                        Crear primer premio
                                    </Button>
                                )}

                                <Button
                                    variant="pill"
                                    onClick={runRaffle}
                                    disabled={spinning || prizes.length === 0}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    startIcon={
                                        spinning ? (
                                            <CircularProgress size={22} thickness={5} color="inherit" />
                                        ) : (
                                            <StarRounded sx={{ animation: `${spinIcon} 3s linear infinite` }} />
                                        )
                                    }
                                >
                                    {spinning ? 'Girando Flor...' : 'Girar Flor'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>

                {/* ============================ MODALES =========================== */}
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
                    <PrizeModal onClose={() => setShowPrizeModal(false)} onCreate={createPrize} />
                )}
            </Box>
        </ThemeProvider>
    );
};

export default Lottery;