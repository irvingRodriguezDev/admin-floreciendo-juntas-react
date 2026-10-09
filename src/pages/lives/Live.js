import React, {
    useContext,
    useEffect,
    useState,
    useMemo,
    useRef
} from "react";

import {
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Button,
} from "@mui/material";

import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

import LiveContext from "../../context/LiveContext/LiveContext";
import AuthContext from "../../context/AuthContext/AuthContext";

import useLiveComments from "./components/useLiveComments";
import { DEFAULT_PAGE_SIZE } from "./components/constants";
import { useLiveFilters } from "./hooks/useLiveFilters";
import { useFullscreen } from "./hooks/useFullscreen";

import LiveHeader from "./components/LiveHeader";
import LiveFilters from "./components/LiveFilters";
import LiveTable from "./components/LiveTable";
import LiveAdminModal from "./components/LiveAdminModal";

const Live = () => {
    const history = useHistory();

    const videoContainerRef = useRef(null);
    const commentsContainerRef = useRef(null);
    const fullscreenCommentsRef = useRef(null);

    // CONTEXTOS
    const {
        lives,
        obtenerLives,
        cargando,
        eliminarLive
    } = useContext(LiveContext);

    const { usuario } = useContext(AuthContext);

    const roleId = usuario?.user?.roleId;

    // ESTADOS DEL MODAL
    const [openAdminModal, setOpenAdminModal] = useState(false);
    const [selectedLive, setSelectedLive] = useState(null);
    const [commentText, setCommentText] = useState("");

    // HOOK DE COMENTARIOS
    const {
        comments,
        sendComment,
        deleteComment
    } = useLiveComments(selectedLive?.id);

    // HOOK DE FILTROS
    const {
        state,
        dispatch,
        filterItems,
        showFilters,
        setShowFilters,
        displayRows,
        handleChange,
        handleReset,
        addFilter,
        deleteFilter
    } = useLiveFilters(lives);

    // HOOK DE FULLSCREEN
    const {
        isFullscreen,
        showCommentsInFullscreen,
        toggleFullscreen,
        exitFullscreen,
        toggleCommentsVisibility,
        closeComments
    } = useFullscreen();

    // PAGINACIÓN
    const [rowsState, setRowsState] = useState({
        page: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });

    // CARGA INICIAL
    useEffect(() => {
        obtenerLives();
    }, []);

    // SCROLL AUTOMÁTICO PARA NUEVOS COMENTARIOS
    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = 0;
        }

        if (
            fullscreenCommentsRef.current &&
            showCommentsInFullscreen
        ) {
            fullscreenCommentsRef.current.scrollTop =
                fullscreenCommentsRef.current.scrollHeight;
        }
    }, [comments, showCommentsInFullscreen]);

    // ESTADÍSTICAS DEL LIVE
    const liveStats = useMemo(() => ({
        comments: comments.length,
    }), [comments]);

    // ABRIR MODAL DE ADMIN
    const handleOpenAdminModal = (live) => {
        console.log("LIVE ABIERTO:", live.id);

        setSelectedLive(live);
        setOpenAdminModal(true);
    };

    // CERRAR MODAL
    const handleCloseAdminModal = () => {
        setOpenAdminModal(false);
        setSelectedLive(null);
    };

    // ELIMINAR COMENTARIO
    const handleDeleteComment = (commentId) => {
        console.log("Deleting message:", commentId);
        deleteComment(commentId);
    };

    // ENVIAR COMENTARIO
    const handleSendComment = () => {
        if (!commentText.trim()) return;

        sendComment(commentText);
        setCommentText("");
    };

    // FINALIZAR LIVE
    const handleEndLive = () => {
        Swal.fire({
            title: '¿Finalizar transmisión?',
            text: 'Esta acción terminará el live para todos los espectadores',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5350',
            cancelButtonColor: '#9E9E9E',
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '¡Finalizado!',
                    text: 'La transmisión ha terminado exitosamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });

                handleCloseAdminModal();
            }
        });
    };

    // ELIMINAR LIVE
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esto",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarLive(id);
            }
        });
    };

    return (
        <Box>

            {/* MODAL DE ADMINISTRACIÓN */}
            <LiveAdminModal
                open={openAdminModal}
                selectedLive={selectedLive}
                comments={comments}
                commentText={commentText}
                setCommentText={setCommentText}
                handleSendComment={handleSendComment}
                handleDeleteComment={handleDeleteComment}
                handleCloseAdminModal={handleCloseAdminModal}
                handleEndLive={handleEndLive}
                isFullscreen={isFullscreen}
                showCommentsInFullscreen={showCommentsInFullscreen}
                toggleFullscreen={toggleFullscreen}
                exitFullscreen={exitFullscreen}
                toggleCommentsVisibility={toggleCommentsVisibility}
                closeComments={closeComments}
                videoContainerRef={videoContainerRef}
                commentsContainerRef={commentsContainerRef}
                fullscreenCommentsRef={fullscreenCommentsRef}
            />

            {/* FILTROS ACTIVOS */}
            <LiveFilters
                filterItems={filterItems}
                showFilters={showFilters}
                handleChange={handleChange}
                handleReset={handleReset}
                deleteFilter={deleteFilter}
            />

            {/* TABLA PRINCIPAL */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #FFE6F0',
                }}
            >

                {/* HEADER */}
                <LiveHeader
                    searchTerm={state.searchTerm}
                    dispatch={dispatch}
                />

                {/* FILTROS EN LÍNEA */}
                <Box
                    sx={{
                        bgcolor: '#FFF5FA',
                        borderBottom: '1px solid #FFE6F0',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >

                    {/* SELECT ESTADO */}
                    <FormControl
                        variant="outlined"
                        size="small"
                        sx={{
                            minWidth: 160
                        }}
                    >
                        <InputLabel>
                            Estado
                        </InputLabel>

                        <Select
                            value={state.valueStatus}
                            onChange={(e) => {
                                dispatch({
                                    valueStatus: e.target.value
                                });

                                setRowsState((prev) => ({
                                    ...prev,
                                    page: 0
                                }));
                            }}
                            label="Estado"
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: 2,
                            }}
                        >
                            <MenuItem value="Todos">
                                Todos
                            </MenuItem>

                            <MenuItem value="scheduled">
                                Programado
                            </MenuItem>

                            <MenuItem value="live">
                                En vivo
                            </MenuItem>

                            <MenuItem value="ended">
                                Finalizado
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* BOTÓN AGREGAR LIVE */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        sx={{
                            ml: 'auto',
                            fontWeight: 700,
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            boxShadow: 'none',
                            backgroundColor: '#FF5C93',
                            color: '#fff',

                            '&:hover': {
                                backgroundColor: '#e94d83',
                            },
                        }}
                        onClick={() =>
                            history.push("/lives/addlive")
                        }
                    >
                        Agregar Live
                    </Button>

                </Box>

                {/* CONTADOR DE RESULTADOS */}
                {state.searchTerm && (
                    <Box
                        sx={{
                            px: 3,
                            py: 1.5,
                            bgcolor: '#FFF5FA',
                            borderBottom: '1px solid #FFE6F0'
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            🔍 Mostrando {displayRows.length} resultado
                            {displayRows.length !== 1 ? 's' : ''}
                            {" "}para "{state.searchTerm}"
                        </Typography>
                    </Box>
                )}

                {/* TABLA */}
                <LiveTable
                    displayRows={displayRows}
                    cargando={cargando}
                    rowsState={rowsState}
                    setRowsState={setRowsState}
                    handleOpenAdminModal={handleOpenAdminModal}
                    handleDelete={handleDelete}
                    roleId={roleId}
                />

            </Paper>

        </Box>
    );
};

export default Live;