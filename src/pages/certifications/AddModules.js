import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box, Container, Paper, Stack, TextField, Typography, Button, Avatar, Chip, Collapse,
    Divider, IconButton, Tooltip, CircularProgress, InputAdornment, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import Swal from "sweetalert2";
import clienteAxios from "../../config/Axios";
import CertificationContext from "../../context/CertificationContext/CertificationContext";

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

const confirmDelete = (title, text) =>
    Swal.fire({
        title, text, icon: "warning", showCancelButton: true,
        confirmButtonColor: "#d33", cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    }).then((r) => r.isConfirmed);

const maxOf = (c) => c.maxScore ?? c.max_score;

const RowActions = ({ editing, onSave, onEdit, onDelete, label }) => (
    <Stack direction="row" spacing={0.5}>
        {editing ? (
            <Tooltip title="Guardar">
                <IconButton size="small" color="primary" onClick={onSave}><SaveRoundedIcon fontSize="small" /></IconButton>
            </Tooltip>
        ) : ALLOW_EDIT && (
            <Tooltip title={`Editar ${label}`}>
                <IconButton size="small" color="primary" onClick={onEdit}><EditRoundedIcon fontSize="small" /></IconButton>
            </Tooltip>
        )}
        {ALLOW_EDIT && (
            <Tooltip title={`Eliminar ${label}`}>
                <IconButton size="small" color="error" onClick={onDelete}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
            </Tooltip>
        )}
    </Stack>
);

/* ── Módulo con sus criterios ─────────────────────────────────────────────── */
const ModuleCard = ({ module, index, onUpdate, onRemove }) => {
    const [open, setOpen] = useState(false);
    const [editingTitle, setEditingTitle] = useState(null); // null = no edita

    const [criteria, setCriteria] = useState(null); // null = aún no cargado
    const [loadingCriteria, setLoadingCriteria] = useState(false);
    const [newC, setNewC] = useState({ title: "", maxScore: "" });
    const [savingC, setSavingC] = useState(false);
    const [editingC, setEditingC] = useState(null); // { id, title, maxScore }

    const fetchCriteria = async () => {
        setLoadingCriteria(true);
        try {
            const { data } = await clienteAxios.get(`/module-criterion/${module.id}`);
            setCriteria(data);
        } catch {
            /* sin mensaje, igual que antes */
        } finally {
            setLoadingCriteria(false);
        }
    };

    const toggle = () => {
        setOpen(!open);
        if (!open && !criteria) fetchCriteria();
    };

    // Módulo
    const saveModule = async () => {
        if (!editingTitle?.trim()) return;
        try {
            const { data } = await clienteAxios.patch(`/module-certifications/${module.id}/`, { title: editingTitle.trim() });
            onUpdate(data);
            setEditingTitle(null);
        } catch {
            showError("No se pudo actualizar el módulo.");
        }
    };

    const deleteModule = async () => {
        if (!(await confirmDelete("¿Eliminar módulo?", "Se eliminarán también sus criterios."))) return;
        try {
            await clienteAxios.delete(`/module-certifications/${module.id}/`);
            onRemove(module.id);
        } catch {
            showError("No se pudo eliminar el módulo.");
        }
    };

    // Criterios
    const createCriterion = async () => {
        if (!newC.title.trim() || !newC.maxScore) return;
        setSavingC(true);
        try {
            const { data } = await clienteAxios.post("/module-criterion/", {
                moduleId: module.id, title: newC.title.trim(), maxScore: Number(newC.maxScore),
            });
            setCriteria((p) => [...(p || []), data]);
            setNewC({ title: "", maxScore: "" });
        } catch {
            showError("No se pudo crear el criterio.");
        } finally {
            setSavingC(false);
        }
    };

    const saveCriterion = async () => {
        if (!editingC.title?.trim()) return;
        try {
            const { data } = await clienteAxios.patch(`/module-criterion/${editingC.id}/`, {
                title: editingC.title.trim(), maxScore: Number(editingC.maxScore),
            });
            setCriteria((p) => p.map((c) => (c.id === editingC.id ? data : c)));
            setEditingC(null);
        } catch {
            showError("No se pudo actualizar el criterio.");
        }
    };

    const deleteCriterion = async (criterionId) => {
        if (!(await confirmDelete("¿Eliminar criterio?"))) return;
        try {
            await clienteAxios.delete(`/module-criterion/${criterionId}/`);
            setCriteria((p) => p.filter((c) => c.id !== criterionId));
        } catch {
            showError("No se pudo eliminar el criterio.");
        }
    };

    const editingModule = editingTitle !== null;

    return (
        <Paper sx={{ border: `1px solid ${alpha(PINK, 0.15)}`, overflow: "hidden" }}>
            {/* Cabecera del módulo */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
                <Avatar sx={{ bgcolor: alpha(PINK, 0.15), color: PINK, width: 34, height: 34, fontWeight: 700, fontSize: 15 }}>
                    {index + 1}
                </Avatar>

                {editingModule ? (
                    <TextField size="small" autoFocus sx={{ flex: 1 }} value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") saveModule();
                            if (e.key === "Escape") setEditingTitle(null);
                        }} />
                ) : (
                    <Typography fontWeight={700} noWrap sx={{ flex: 1 }}>{module.title}</Typography>
                )}

                <RowActions label="módulo" editing={editingModule} onSave={saveModule}
                    onEdit={() => setEditingTitle(module.title)} onDelete={deleteModule} />

                <Tooltip title={open ? "Ocultar criterios" : "Ver criterios"}>
                    <IconButton size="small" onClick={toggle}>
                        {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Criterios */}
            <Collapse in={open}>
                <Divider />
                <Box sx={{ p: 2, bgcolor: alpha(PINK, 0.03) }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                        <ChecklistRoundedIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>Criterios</Typography>
                        <TextField size="small" placeholder="Título del criterio..." sx={{ flex: 1, minWidth: 160, bgcolor: "#fff" }}
                            value={newC.title} onChange={(e) => setNewC((p) => ({ ...p, title: e.target.value }))} />
                        <TextField size="small" type="number" placeholder="Puntaje máx." sx={{ width: 130, bgcolor: "#fff" }}
                            inputProps={{ min: 0 }} value={newC.maxScore}
                            onChange={(e) => setNewC((p) => ({ ...p, maxScore: e.target.value }))} />
                        <Button variant="outlined" size="small"
                            disabled={!newC.title.trim() || !newC.maxScore || savingC} onClick={createCriterion}
                            startIcon={savingC ? <CircularProgress size={14} /> : <AddRoundedIcon />}>
                            Agregar
                        </Button>
                    </Stack>

                    {loadingCriteria ? (
                        <Stack alignItems="center" py={2}><CircularProgress size={24} /></Stack>
                    ) : !criteria?.length ? (
                        <Typography variant="body2" color="text.disabled" align="center" py={1}>Sin criterios aún.</Typography>
                    ) : (
                        <Stack spacing={1}>
                            {criteria.map((c, ci) => {
                                const editing = editingC?.id === c.id;
                                return (
                                    <Stack key={c.id} direction="row" alignItems="center" spacing={1.5}
                                        sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 3, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                                        <Chip label={ci + 1} size="small" variant="outlined" color="primary" sx={{ minWidth: 28 }} />

                                        {editing ? (
                                            <>
                                                <TextField size="small" autoFocus sx={{ flex: 1 }} value={editingC.title || ""}
                                                    onChange={(e) => setEditingC((p) => ({ ...p, title: e.target.value }))} />
                                                <TextField size="small" type="number" sx={{ width: 110 }} inputProps={{ min: 0 }}
                                                    value={editingC.maxScore || ""}
                                                    onChange={(e) => setEditingC((p) => ({ ...p, maxScore: e.target.value }))} />
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>{c.title}</Typography>
                                                <Chip label={`Máx: ${maxOf(c)}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                                            </>
                                        )}

                                        <RowActions label="criterio" editing={editing} onSave={saveCriterion}
                                            onEdit={() => setEditingC({ id: c.id, title: c.title, maxScore: maxOf(c) })}
                                            onDelete={() => deleteCriterion(c.id)} />
                                    </Stack>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

/* ── Página ───────────────────────────────────────────────────────────────── */
const AddModules = () => {
    const { certificationId } = useParams();
    const history = useHistory();
    const { certifications } = useContext(CertificationContext);

    const [modules, setModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [savingModule, setSavingModule] = useState(false);
    const [certificationName, setCertificationName] = useState(localStorage.getItem("certification_name") || "");

    const certification = useMemo(
        () => (certifications?.length ? certifications.find((c) => c.id === Number(certificationId)) : null),
        [certifications, certificationId]
    );

    // Nombre de la certificación (con respaldo en localStorage)
    useEffect(() => {
        if (certification?.name) {
            localStorage.setItem("certification_name", certification.name);
            setCertificationName(certification.name);
        }
    }, [certification]);

    // Cargar módulos
    useEffect(() => {
        setLoadingModules(true);
        clienteAxios.get(`/module-certifications/${certificationId}`)
            .then(({ data }) => setModules(data))
            .catch(() => showError("No se pudieron cargar los módulos."))
            .finally(() => setLoadingModules(false));
    }, [certificationId]);

    const handleCreateModule = async () => {
        if (!newTitle.trim()) return;
        setSavingModule(true);
        try {
            const { data } = await clienteAxios.post("/module-certifications/", {
                certificationId, title: newTitle.trim(),
            });
            setModules((p) => [...p, data]);
            setNewTitle("");
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
                            <Typography variant="h5" fontWeight={800}>Módulos de la certificación</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{certificationName}</Typography>
                        </Box>
                        <Chip color="primary" variant="outlined" label={`${modules.length} módulos`} />
                    </Stack>

                    {/* Nuevo módulo */}
                    <Paper sx={{ p: 2, mb: 3, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField fullWidth size="small" placeholder="Título del módulo..."
                                value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateModule()}
                                InputProps={{ startAdornment: <InputAdornment position="start"><AssignmentRoundedIcon fontSize="small" color="primary" /></InputAdornment> }} />
                            <Button variant="contained" disabled={!newTitle.trim() || savingModule} onClick={handleCreateModule}
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
                                <ModuleCard key={m.id} module={m} index={i}
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

export default AddModules;