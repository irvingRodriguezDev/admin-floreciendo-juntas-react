import React, { useEffect, useReducer, useState, useContext, useMemo } from "react";
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
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    AssignmentOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../config/Service";
import FormationContext from "../../context/FormationContext/FormationContext";

const initialState = {
    modules: [],
    loadingModules: false,
    newModuleName: "",
    savingModule: false,
    editingModuleId: null,
    editingModuleName: "",
};

const reducer = (s, a) => ({ ...s, ...a });

const AddModuleFormation = () => {
    const { formationId } = useParams();
    const history = useHistory();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { formations } = useContext(FormationContext);

    useEffect(() => {
        fetchModules();
    }, [formationId]);

    const formation = useMemo(() => {
        if (!formations.length) return null;
        return formations.find((f) => f.id === Number(formationId));
    }, [formations, formationId]);

    const [formationName, setFormationName] = useState(
        localStorage.getItem("formation_name") || ""
    );

    useEffect(() => {
        if (formation?.name) {
            localStorage.setItem("formation_name", formation.name);
            setFormationName(formation.name);
        }
    }, [formation]);

    // ── Fetch módulos ─────────────────────────────────────────────────────────
    const fetchModules = async () => {
        dispatch({ loadingModules: true });
        try {
            const res = await MethodGet(`/formations/${formationId}/modules`);
            const data = res.data;
            const modules =
                Array.isArray(data) ? data :
                    Array.isArray(data.data) ? data.data :
                        [];
            dispatch({ modules, loadingModules: false });
        } catch {
            dispatch({ loadingModules: false });
            Swal.fire("Error", "No se pudieron cargar los módulos.", "error");
        }
    };

    // ── Crear módulo ──────────────────────────────────────────────────────────
    const handleCreateModule = async () => {
        if (!state.newModuleName.trim()) return;
        dispatch({ savingModule: true });
        try {
            const res = await MethodPost("/module-formations/modules", {
                formationId,
                name: state.newModuleName.trim(),
            });
            dispatch({
                modules: [...state.modules, res.data],
                newModuleName: "",
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
        if (!state.editingModuleName.trim()) return;
        try {
            const res = await MethodPut(`/module-formations/${moduleId}`, {
                name: state.editingModuleName.trim(),
            });
            dispatch({
                modules: state.modules.map((m) => (m.id === moduleId ? res.data : m)),
                editingModuleId: null,
                editingModuleName: "",
            });
        } catch {
            Swal.fire("Error", "No se pudo actualizar el módulo.", "error");
        }
    };

    // ── Eliminar módulo ───────────────────────────────────────────────────────
    const handleDeleteModule = (moduleId) => {
        Swal.fire({
            title: "¿Eliminar módulo?",
            text: "Esta acción no se puede revertir.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await MethodDelete(`/module-formations/${moduleId}`);
                    dispatch({ modules: state.modules.filter((m) => m.id !== moduleId) });
                } catch {
                    Swal.fire("Error", "No se pudo eliminar el módulo.", "error");
                }
            }
        });
    };

    return (
        <Grid container spacing={3}>
            {/* Header */}
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
                                Módulos — {formationName}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Nombre del módulo..."
                                value={state.newModuleName}
                                onChange={(e) => dispatch({ newModuleName: e.target.value })}
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
                                disabled={!state.newModuleName.trim() || state.savingModule}
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
                                        }}
                                    >
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
                                                        value={state.editingModuleName}
                                                        onChange={(e) => dispatch({ editingModuleName: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveModule(module.id);
                                                            if (e.key === "Escape") dispatch({ editingModuleId: null, editingModuleName: "" });
                                                        }}
                                                        autoFocus
                                                        sx={{ flex: 1 }}
                                                    />
                                                ) : (
                                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                                        {module.name}
                                                    </Typography>
                                                )}
                                            </Box>

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
                                                    // <Tooltip title="Editar módulo">
                                                    //     <IconButton
                                                    //         size="small"
                                                    //         color="primary"
                                                    //         onClick={() =>
                                                    //             dispatch({
                                                    //                 editingModuleId: module.id,
                                                    //                 editingModuleName: module.name
                                                    //             })
                                                    //         }
                                                    //     >
                                                    //         <EditIcon fontSize="small" />
                                                    //     </IconButton>
                                                    // </Tooltip>
                                                    null
                                                )}

                                                {/* <Tooltip title="Eliminar módulo">
                                                     <IconButton
                                                         size="small"
                                                         color="error"
                                                         onClick={() => handleDeleteModule(module.id)}
                                                         >
                                                         <DeleteIcon fontSize="small" />
                                                     </IconButton>
                                                   </Tooltip> */}
                                            </Box>
                                        </Box>
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

export default AddModuleFormation;