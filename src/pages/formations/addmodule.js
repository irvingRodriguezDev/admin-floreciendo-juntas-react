import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box, Container, Paper, Stack, TextField, Typography, Button, Avatar, Chip, IconButton,
    Tooltip, CircularProgress, InputAdornment, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Swal from "sweetalert2";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../config/Service";
import FormationContext from "../../context/FormationContext/FormationContext";

const PINK = "#FF5C95";

const theme = createTheme({
    palette: {
        primary: { main: PINK, contrastText: "#fff" },
        background: { default: "#FFF6F9" },
    },
    shape: { borderRadius: 14 },
    typography: { button: { textTransform: "none", fontWeight: 600 } },
    components: {
        MuiButton: { defaultProps: { disableElevation: true } },
        MuiPaper: { defaultProps: { elevation: 0 } },
    },
});

// Los botones de editar/eliminar estaban comentados en el original.
// Cambia a true para volver a mostrarlos (los handlers siguen funcionando).
const ALLOW_EDIT = false;

const showError = (text) => Swal.fire("Error", text, "error");

/* ── Fila de módulo ───────────────────────────────────────────────────────── */
const ModuleRow = ({ module, index, onUpdate, onRemove }) => {
    const [editingName, setEditingName] = useState(null); // null = no edita
    const editing = editingName !== null;

    const save = async () => {
        if (!editingName.trim()) return;
        try {
            const res = await MethodPut(`/module-formations/${module.id}`, { name: editingName.trim() });
            onUpdate(res.data);
            setEditingName(null);
        } catch {
            showError("No se pudo actualizar el módulo.");
        }
    };

    const remove = async () => {
        const { isConfirmed } = await Swal.fire({
            title: "¿Eliminar módulo?",
            text: "Esta acción no se puede revertir.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!isConfirmed) return;
        try {
            await MethodDelete(`/module-formations/${module.id}`);
            onRemove(module.id);
        } catch {
            showError("No se pudo eliminar el módulo.");
        }
    };

    return (
        <Paper sx={{ p: 2, border: `1px solid ${alpha(PINK, 0.15)}` }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: alpha(PINK, 0.15), color: PINK, width: 34, height: 34, fontWeight: 700, fontSize: 15 }}>
                    {index + 1}
                </Avatar>

                {editing ? (
                    <TextField size="small" autoFocus sx={{ flex: 1 }} value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") save();
                            if (e.key === "Escape") setEditingName(null);
                        }} />
                ) : (
                    <Typography fontWeight={700} noWrap sx={{ flex: 1 }}>{module.name}</Typography>
                )}

                {editing ? (
                    <Tooltip title="Guardar">
                        <IconButton size="small" color="primary" onClick={save}><SaveRoundedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                ) : ALLOW_EDIT && (
                    <Tooltip title="Editar módulo">
                        <IconButton size="small" color="primary" onClick={() => setEditingName(module.name)}>
                            <EditRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                {ALLOW_EDIT && (
                    <Tooltip title="Eliminar módulo">
                        <IconButton size="small" color="error" onClick={remove}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Paper>
    );
};

/* ── Página ───────────────────────────────────────────────────────────────── */
const AddModuleFormation = () => {
    const { formationId } = useParams();
    const history = useHistory();
    const { formations } = useContext(FormationContext);

    const [modules, setModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [newName, setNewName] = useState("");
    const [savingModule, setSavingModule] = useState(false);
    const [formationName, setFormationName] = useState(localStorage.getItem("formation_name") || "");

    const formation = useMemo(
        () => (formations.length ? formations.find((f) => f.id === Number(formationId)) : null),
        [formations, formationId]
    );

    // Nombre de la formación (con respaldo en localStorage)
    useEffect(() => {
        if (formation?.name) {
            localStorage.setItem("formation_name", formation.name);
            setFormationName(formation.name);
        }
    }, [formation]);

    // Cargar módulos
    useEffect(() => {
        setLoadingModules(true);
        MethodGet(`/formations/${formationId}/modules`)
            .then(({ data }) => setModules(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []))
            .catch(() => showError("No se pudieron cargar los módulos."))
            .finally(() => setLoadingModules(false));
    }, [formationId]);

    const handleCreateModule = async () => {
        if (!newName.trim()) return;
        setSavingModule(true);
        try {
            const res = await MethodPost("/module-formations/modules", { formationId, name: newName.trim() });
            setModules((p) => [...p, res.data]);
            setNewName("");
            Swal.fire({ icon: "success", title: "Módulo creado", timer: 1500, showConfirmButton: false });
        } catch {
            showError("No se pudo crear el módulo.");
        } finally {
            setSavingModule(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
                <Container maxWidth="md">
                    {/* Encabezado */}
                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <Tooltip title="Volver">
                            <IconButton onClick={() => history.goBack()}><ArrowBackRoundedIcon /></IconButton>
                        </Tooltip>
                        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}><AssignmentRoundedIcon /></Avatar>
                        <Box flexGrow={1} minWidth={0}>
                            <Typography variant="h5" fontWeight={800}>Módulos de la formación</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{formationName}</Typography>
                        </Box>
                        <Chip color="primary" variant="outlined" label={`${modules.length} módulos`} />
                    </Stack>

                    {/* Nuevo módulo */}
                    <Paper sx={{ p: 2, mb: 3, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField fullWidth size="small" placeholder="Nombre del módulo..."
                                value={newName} onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateModule()}
                                InputProps={{ startAdornment: <InputAdornment position="start"><AssignmentRoundedIcon fontSize="small" color="primary" /></InputAdornment> }} />
                            <Button variant="contained" disabled={!newName.trim() || savingModule} onClick={handleCreateModule}
                                startIcon={savingModule ? <CircularProgress size={16} color="inherit" /> : <AddRoundedIcon />}
                                sx={{ flexShrink: 0, boxShadow: `0 6px 16px ${alpha(PINK, 0.35)}` }}>
                                Agregar módulo
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Lista */}
                    {loadingModules ? (
                        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
                    ) : modules.length === 0 ? (
                        <Typography align="center" color="text.secondary" py={6}>
                            No hay módulos aún. ¡Agrega el primero!
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {modules.map((m, i) => (
                                <ModuleRow key={m.id} module={m} index={i}
                                    onUpdate={(updated) => setModules((p) => p.map((x) => (x.id === updated.id ? updated : x)))}
                                    onRemove={(id) => setModules((p) => p.filter((x) => x.id !== id))} />
                            ))}
                        </Stack>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AddModuleFormation;