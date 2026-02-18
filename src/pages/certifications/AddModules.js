import React, { useEffect, useReducer, useState, useContext } from "react";
import {
    Grid,
    Box,
    Card,
    TextField,
    Paper,
    Fade,
    IconButton,
    Typography,
    Button,
    Divider,
    Collapse,
    Tooltip,
    CircularProgress,
    Chip,
    InputAdornment,
} from "@mui/material";
import { useParams, useHistory } from "react-router-dom";
import {
    AddOutlined,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    AssignmentOutlined,
    ChecklistOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import clienteAxios from "../../config/Axios";
import CertificationContext from "../../context/CertificationContext/CertificationContext";

// ─── Estado inicial del reducer ──────────────────────────────────────────────
const initialState = {
    modules: [],          // Lista de módulos del certification
    loadingModules: false,

    // Formulario nuevo módulo
    newModuleTitle: "",
    savingModule: false,

    // Edición de módulo
    editingModuleId: null,
    editingModuleTitle: "",

    // Criterios por módulo: { [moduleId]: criterion[] }
    criteria: {},
    loadingCriteria: {},

    // Formulario nuevo criterio por módulo: { [moduleId]: { title, maxScore } }
    newCriterion: {},
    savingCriterion: {},

    // Edición de criterio
    editingCriterionId: null,
    editingCriterion: {},

    // Módulos expandidos
    expandedModules: {},
};

const reducer = (s, a) => ({ ...s, ...a });

// ─────────────────────────────────────────────────────────────────────────────

const AddModules = () => {
    const { certificationId } = useParams(); // Asume ruta: /certifications/:certificationId/modules
    const history = useHistory();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { certifications } = useContext(CertificationContext);

    // ── Cargar módulos al montar ──────────────────────────────────────────────
    useEffect(() => {
        fetchModules();
    }, [certificationId]);

    const certification = certifications.find((c) => c.id === Number(certificationId));

    const fetchModules = async () => {
        dispatch({ loadingModules: true });
        try {
            const { data } = await clienteAxios.get(`/module-certifications/${certificationId}`);
            dispatch({ modules: data, loadingModules: false });
        } catch {
            dispatch({ loadingModules: false });
            Swal.fire("Error", "No se pudieron cargar los módulos.", "error");
        }
    };

    // ── Cargar criterios de un módulo ─────────────────────────────────────────
    const fetchCriteria = async (moduleId) => {
        dispatch({ loadingCriteria: { ...state.loadingCriteria, [moduleId]: true } });
        try {
            const { data } = await clienteAxios.get(`/module-criterion/${moduleId}`);
            dispatch({
                criteria: { ...state.criteria, [moduleId]: data },
                loadingCriteria: { ...state.loadingCriteria, [moduleId]: false },
            });
        } catch {
            dispatch({ loadingCriteria: { ...state.loadingCriteria, [moduleId]: false } });
        }
    };

    // ── Toggle expansión de módulo ────────────────────────────────────────────
    const toggleExpand = (moduleId) => {
        const isExpanded = state.expandedModules[moduleId];
        dispatch({ expandedModules: { ...state.expandedModules, [moduleId]: !isExpanded } });
        if (!isExpanded && !state.criteria[moduleId]) {
            fetchCriteria(moduleId);
        }
    };

    // ── Crear módulo ──────────────────────────────────────────────────────────
    const handleCreateModule = async () => {
        if (!state.newModuleTitle.trim()) return;
        dispatch({ savingModule: true });
        try {
            const { data } = await clienteAxios.post("/module-certifications/", {
                certificationId,
                title: state.newModuleTitle.trim(),
            });
            dispatch({
                modules: [...state.modules, data],
                newModuleTitle: "",
                savingModule: false,
            });
            Swal.fire({ icon: "success", title: "Módulo creado", timer: 1500, showConfirmButton: false });
        } catch {
            dispatch({ savingModule: false });
            Swal.fire("Error", "No se pudo crear el módulo.", "error");
        }
    };

    // ── Guardar edición de módulo ─────────────────────────────────────────────
    const handleSaveModule = async (moduleId) => {
        if (!state.editingModuleTitle.trim()) return;
        try {
            const { data } = await clienteAxios.patch(`/module-certifications/${moduleId}/`, {
                title: state.editingModuleTitle.trim(),
            });
            dispatch({
                modules: state.modules.map((m) => (m.id === moduleId ? data : m)),
                editingModuleId: null,
                editingModuleTitle: "",
            });
        } catch {
            Swal.fire("Error", "No se pudo actualizar el módulo.", "error");
        }
    };

    // ── Eliminar módulo ───────────────────────────────────────────────────────
    const handleDeleteModule = (moduleId) => {
        Swal.fire({
            title: "¿Eliminar módulo?",
            text: "Se eliminarán también sus criterios.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await clienteAxios.delete(`/module-certifications/${moduleId}/`);
                    dispatch({ modules: state.modules.filter((m) => m.id !== moduleId) });
                } catch {
                    Swal.fire("Error", "No se pudo eliminar el módulo.", "error");
                }
            }
        });
    };

    // ── Crear criterio ────────────────────────────────────────────────────────
    const handleCreateCriterion = async (moduleId) => {
        const criterion = state.newCriterion[moduleId] || {};
        if (!criterion.title?.trim() || !criterion.maxScore) return;
        dispatch({ savingCriterion: { ...state.savingCriterion, [moduleId]: true } });
        try {
            const { data } = await clienteAxios.post("/module-criterion/", {
                moduleId,
                title: criterion.title.trim(),
                maxScore: Number(criterion.maxScore),
            });
            const existing = state.criteria[moduleId] || [];
            dispatch({
                criteria: { ...state.criteria, [moduleId]: [...existing, data] },
                newCriterion: { ...state.newCriterion, [moduleId]: { title: "", maxScore: "" } },
                savingCriterion: { ...state.savingCriterion, [moduleId]: false },
            });
        } catch {
            dispatch({ savingCriterion: { ...state.savingCriterion, [moduleId]: false } });
            Swal.fire("Error", "No se pudo crear el criterio.", "error");
        }
    };

    // ── Guardar edición criterio ──────────────────────────────────────────────
    const handleSaveCriterion = async (moduleId, criterionId) => {
        const ec = state.editingCriterion;
        if (!ec.title?.trim()) return;
        try {
            const { data } = await clienteAxios.patch(`/module-criterion/${criterionId}/`, {
                title: ec.title.trim(),
                maxScore: Number(ec.maxScore),
            });
            dispatch({
                criteria: {
                    ...state.criteria,
                    [moduleId]: state.criteria[moduleId].map((c) => (c.id === criterionId ? data : c)),
                },
                editingCriterionId: null,
                editingCriterion: {},
            });
        } catch {
            Swal.fire("Error", "No se pudo actualizar el criterio.", "error");
        }
    };

    // ── Eliminar criterio ─────────────────────────────────────────────────────
    const handleDeleteCriterion = (moduleId, criterionId) => {
        Swal.fire({
            title: "¿Eliminar criterio?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await clienteAxios.delete(`/module-criterion/${criterionId}/`);
                    dispatch({
                        criteria: {
                            ...state.criteria,
                            [moduleId]: state.criteria[moduleId].filter((c) => c.id !== criterionId),
                        },
                    });
                } catch {
                    Swal.fire("Error", "No se pudo eliminar el criterio.", "error");
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Grid container spacing={3}>
            {/* Header / Navegación */}
            <Grid item xs={12}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        background: "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(200,200,200,0.3)",
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton onClick={() => history.goBack()} size="small">
                                <ArrowBackIcon />
                            </IconButton>
                            <AssignmentOutlined color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Módulos de la Certificación - {certification?.name || ""}
                            </Typography>
                        </Box>

                        {/* Formulario: Nuevo módulo */}
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Título del módulo..."
                                value={state.newModuleTitle}
                                onChange={(e) => dispatch({ newModuleTitle: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateModule()}
                                sx={{ backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: 260 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AssignmentOutlined fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={state.savingModule ? <CircularProgress size={16} color="inherit" /> : <AddOutlined />}
                                onClick={handleCreateModule}
                                disabled={!state.newModuleTitle.trim() || state.savingModule}
                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                            >
                                Agregar módulo
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Lista de módulos */}
            <Grid item xs={12}>
                {state.loadingModules ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : state.modules.length === 0 ? (
                    <Typography align="center" color="text.secondary" py={6}>
                        No hay módulos aún. ¡Agrega el primero!
                    </Typography>
                ) : (
                    <Grid container spacing={2}>
                        {state.modules.map((module, index) => (
                            <Grid item xs={12} key={module.id}>
                                <Fade in timeout={300 + index * 60}>
                                    <Card
                                        sx={{
                                            borderRadius: 4,
                                            boxShadow: "0px 4px 15px rgba(0,0,0,0.07)",
                                            transition: "box-shadow 0.2s ease",
                                            "&:hover": { boxShadow: "0px 6px 20px rgba(0,0,0,0.11)" },
                                            overflow: "visible",
                                        }}
                                    >
                                        {/* ── Cabecera del módulo ── */}
                                        <Box
                                            sx={{
                                                p: 2,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                flexWrap: "wrap",
                                                gap: 1,
                                            }}
                                        >
                                            {/* Título / Edición inline */}
                                            <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
                                                <Chip
                                                    label={index + 1}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ fontWeight: 700, minWidth: 32 }}
                                                />
                                                {state.editingModuleId === module.id ? (
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        value={state.editingModuleTitle}
                                                        onChange={(e) => dispatch({ editingModuleTitle: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveModule(module.id);
                                                            if (e.key === "Escape") dispatch({ editingModuleId: null, editingModuleTitle: "" });
                                                        }}
                                                        autoFocus
                                                        sx={{ flex: 1 }}
                                                    />
                                                ) : (
                                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                                        {module.title}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Acciones módulo */}
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                {state.editingModuleId === module.id ? (
                                                    <Tooltip title="Guardar">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleSaveModule(module.id)}
                                                        >
                                                            <SaveIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Editar módulo">
                                                        {/* <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                dispatch({
                                                                    editingModuleId: module.id,
                                                                    editingModuleTitle: module.title,
                                                                })
                                                            }
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton> */}
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Eliminar módulo">
                                                    {/* <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteModule(module.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton> */}
                                                </Tooltip>
                                                <Tooltip title={state.expandedModules[module.id] ? "Ocultar criterios" : "Ver criterios"}>
                                                    <IconButton size="small" onClick={() => toggleExpand(module.id)}>
                                                        {state.expandedModules[module.id] ? (
                                                            <ExpandLessIcon fontSize="small" />
                                                        ) : (
                                                            <ExpandMoreIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* ── Criterios (collapsible) ── */}
                                        <Collapse in={!!state.expandedModules[module.id]}>
                                            <Divider />
                                            <Box sx={{ p: 2, bgcolor: "rgba(248,250,252,0.8)" }}>
                                                {/* Formulario nuevo criterio */}
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                    flexWrap="wrap"
                                                    mb={2}
                                                >
                                                    <ChecklistOutlined fontSize="small" color="action" />
                                                    <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>
                                                        Criterios
                                                    </Typography>
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="Título del criterio..."
                                                        value={state.newCriterion[module.id]?.title || ""}
                                                        onChange={(e) =>
                                                            dispatch({
                                                                newCriterion: {
                                                                    ...state.newCriterion,
                                                                    [module.id]: {
                                                                        ...state.newCriterion[module.id],
                                                                        title: e.target.value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        sx={{ backgroundColor: "white", borderRadius: 2, flex: 1, minWidth: 160 }}
                                                    />
                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="Puntaje máx."
                                                        type="number"
                                                        value={state.newCriterion[module.id]?.maxScore || ""}
                                                        onChange={(e) =>
                                                            dispatch({
                                                                newCriterion: {
                                                                    ...state.newCriterion,
                                                                    [module.id]: {
                                                                        ...state.newCriterion[module.id],
                                                                        maxScore: e.target.value,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                        sx={{ backgroundColor: "white", borderRadius: 2, width: 130 }}
                                                        inputProps={{ min: 0 }}
                                                    />
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            state.savingCriterion[module.id] ? (
                                                                <CircularProgress size={14} />
                                                            ) : (
                                                                <AddOutlined />
                                                            )
                                                        }
                                                        onClick={() => handleCreateCriterion(module.id)}
                                                        disabled={
                                                            !state.newCriterion[module.id]?.title?.trim() ||
                                                            !state.newCriterion[module.id]?.maxScore ||
                                                            state.savingCriterion[module.id]
                                                        }
                                                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                                    >
                                                        Agregar
                                                    </Button>
                                                </Box>

                                                {/* Lista de criterios */}
                                                {state.loadingCriteria[module.id] ? (
                                                    <Box display="flex" justifyContent="center" py={2}>
                                                        <CircularProgress size={24} />
                                                    </Box>
                                                ) : !state.criteria[module.id] || state.criteria[module.id].length === 0 ? (
                                                    <Typography variant="body2" color="text.disabled" align="center" py={1}>
                                                        Sin criterios aún.
                                                    </Typography>
                                                ) : (
                                                    <Box display="flex" flexDirection="column" gap={1}>
                                                        {state.criteria[module.id].map((criterion, ci) => (
                                                            <Fade in key={criterion.id} timeout={200 + ci * 50}>
                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        borderRadius: 3,
                                                                        border: "1px solid rgba(0,0,0,0.07)",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                        flexWrap: "wrap",
                                                                        gap: 1,
                                                                        bgcolor: "white",
                                                                        transition: "box-shadow 0.15s",
                                                                        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
                                                                    }}
                                                                >
                                                                    <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
                                                                        <Chip
                                                                            label={ci + 1}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            sx={{ fontSize: 11, minWidth: 28 }}
                                                                        />
                                                                        {state.editingCriterionId === criterion.id ? (
                                                                            <>
                                                                                <TextField
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    value={state.editingCriterion.title || ""}
                                                                                    onChange={(e) =>
                                                                                        dispatch({
                                                                                            editingCriterion: { ...state.editingCriterion, title: e.target.value },
                                                                                        })
                                                                                    }
                                                                                    autoFocus
                                                                                    sx={{ flex: 1 }}
                                                                                />
                                                                                <TextField
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                    type="number"
                                                                                    value={state.editingCriterion.maxScore || ""}
                                                                                    onChange={(e) =>
                                                                                        dispatch({
                                                                                            editingCriterion: { ...state.editingCriterion, maxScore: e.target.value },
                                                                                        })
                                                                                    }
                                                                                    sx={{ width: 110 }}
                                                                                    inputProps={{ min: 0 }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Typography variant="body2" fontWeight={500} noWrap flex={1}>
                                                                                    {criterion.title}
                                                                                </Typography>
                                                                                <Chip
                                                                                    label={`Máx: ${criterion.maxScore ?? criterion.max_score}`}
                                                                                    size="small"
                                                                                    color="info"
                                                                                    variant="outlined"
                                                                                    sx={{ fontWeight: 600 }}
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </Box>

                                                                    {/* Acciones criterio */}
                                                                    <Box display="flex" gap={0.5}>
                                                                        {state.editingCriterionId === criterion.id ? (
                                                                            <Tooltip title="Guardar">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    color="primary"
                                                                                    onClick={() => handleSaveCriterion(module.id, criterion.id)}
                                                                                >
                                                                                    <SaveIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Tooltip title="Editar criterio">
                                                                                {/* <IconButton
                                                                                    size="small"
                                                                                    color="primary"
                                                                                    onClick={() =>
                                                                                        dispatch({
                                                                                            editingCriterionId: criterion.id,
                                                                                            editingCriterion: {
                                                                                                title: criterion.title,
                                                                                                maxScore: criterion.maxScore ?? criterion.max_score,
                                                                                            },
                                                                                        })
                                                                                    }
                                                                                >
                                                                                    <EditIcon fontSize="small" />
                                                                                </IconButton> */}
                                                                            </Tooltip>
                                                                        )}
                                                                        <Tooltip title="Eliminar criterio">
                                                                            {/* <IconButton
                                                                                size="small"
                                                                                color="error"
                                                                                onClick={() => handleDeleteCriterion(module.id, criterion.id)}
                                                                            >
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton> */}
                                                                        </Tooltip>
                                                                    </Box>
                                                                </Paper>
                                                            </Fade>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

export default AddModules;