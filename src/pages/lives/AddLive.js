import React, { useState, useContext, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
    Box, Container, Paper, Grid, Stack, TextField, Typography, Button, Avatar,
    Chip, Switch, CircularProgress, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";
import LiveContext from "../../context/LiveContext/LiveContext";

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

const EMPTY_FORM = { title: "", description: "", start_time: "", is_private: false };

const COLORS = [
    "#000000", "#424242", "#636363", "#9c9c9c", "#cecece", "#efefef", "#ffffff",
    "#e60000", "#ff6600", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff",
    "#fa9c9c", "#ffdd99", "#ffff99", "#b3d9b3", "#99ccff", "#cc99ff", "#FF5C95",
    "#00b8e6", "#00cccc", "#20b2aa", "#1e90ff", "#1f3e7a", "#0a0a2a", "#4b0082",
    "#800000", "#cc3300", "#996600", "#666600", "#4d4d00", "#330000", "#808000",
    "#ffc0cb", "#f08080", "#ffa07a", "#ffb6c1", "#f0e68c", "#bdb76b", "#dda0dd",
];

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ color: COLORS }, { background: COLORS }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "clean"],
    ],
};

// ISO -> "YYYY-MM-DDTHH:mm" (hora local) para datetime-local
const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const showError = (text, title = "Error") => Swal.fire({ icon: "error", title, text });

const AddLive = ({ onCancel }) => {
    const history = useHistory();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const fileInput = useRef(null);

    const {
        crearLive, actualizarLive, obtenerLivePorId, liveActual, limpiarLiveActual, cargando,
    } = useContext(LiveContext);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const goBack = () => (onCancel ? onCancel() : history.push("/lives/live_playlist"));

    // Cargar datos en modo edición
    useEffect(() => {
        if (isEditMode) obtenerLivePorId(id);
        return () => limpiarLiveActual();
    }, [id]);

    // Llenar el formulario cuando lleguen los datos
    useEffect(() => {
        if (isEditMode && liveActual && Object.keys(liveActual).length > 0) {
            setFormData({
                title: liveActual.title || "",
                description: liveActual.description || "",
                start_time: formatDateTimeForInput(liveActual.start_time),
                is_private: !!liveActual.is_private,
            });
            if (liveActual.thumbnail_url) setPreviewUrl(liveActual.thumbnail_url);
        }
    }, [liveActual]);

    // Limpiar al crear
    useEffect(() => {
        if (!isEditMode) {
            setFormData(EMPTY_FORM);
            setFile(null);
            setPreviewUrl(null);
            limpiarLiveActual();
        }
    }, [isEditMode]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData((p) => ({ ...p, [name]: name === "is_private" ? checked : value }));
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        if (!selected.type.startsWith("image/")) return showError("Selecciona una imagen", "Archivo inválido");
        if (selected.size > 5 * 1024 * 1024) return showError("Máximo 5MB", "Archivo muy grande");

        setFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(selected);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(isEditMode ? liveActual?.thumbnail_url || null : null);
    };

    const validateForm = () => {
        if (!formData.title.trim()) return showError("El título es obligatorio"), false;
        if (!formData.description.trim()) return showError("La descripción es obligatoria"), false;
        if (!formData.start_time) return showError("La fecha de inicio es obligatoria"), false;
        if (!isEditMode && !file) return showError("Debes subir una imagen"), false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            if (file) fd.append("file", file);

            const success = isEditMode ? await actualizarLive(id, fd) : await crearLive(fd);

            if (success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: isEditMode ? "Live actualizado" : "Live creado",
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => history.push("/lives/live_playlist"));
            }
        } catch {
            showError("Ocurrió un error. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    // Loader
    if (isEditMode && cargando && !liveActual) {
        return (
            <ThemeProvider theme={theme}>
                <Stack alignItems="center" spacing={2} py={10}>
                    <CircularProgress />
                    <Typography color="text.secondary">Cargando datos del live...</Typography>
                </Stack>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
                <Container maxWidth="md" component="form" onSubmit={handleSubmit}>
                    {/* Encabezado */}
                    <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
                            <LiveTvRoundedIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                            <Typography variant="h5" fontWeight={800}>
                                {isEditMode ? "Editar Live" : "Crear Nuevo Live"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Información, programación e imagen de portada
                            </Typography>
                        </Box>
                        {isEditMode && <Chip label="Edición" color="primary" variant="outlined" />}
                    </Stack>

                    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Título del Live" name="title"
                                    value={formData.title} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography fontWeight={600} mb={1}>Descripción del Live</Typography>
                                <Box
                                    sx={{
                                        "& .ql-toolbar": { borderRadius: "12px 12px 0 0", borderColor: alpha(PINK, 0.3), bgcolor: alpha(PINK, 0.04) },
                                        "& .ql-container": { borderRadius: "0 0 12px 12px", borderColor: alpha(PINK, 0.3) },
                                        "& .ql-editor": { minHeight: 220 },
                                        "& .ql-snow .ql-active, & .ql-snow button:hover": { color: PINK },
                                    }}
                                >
                                    <ReactQuill theme="snow" value={formData.description} modules={QUILL_MODULES}
                                        onChange={(description) => setFormData((p) => ({ ...p, description }))} />
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField fullWidth type="datetime-local" label="Fecha y hora de inicio" name="start_time"
                                    value={formData.start_time} onChange={handleChange}
                                    InputLabelProps={{ shrink: true }} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Stack
                                    direction="row" alignItems="center" spacing={1.5}
                                    sx={{ height: "100%", px: 2, py: 1, borderRadius: 3, border: `1px solid ${alpha(PINK, 0.3)}`, bgcolor: alpha(PINK, 0.04) }}
                                >
                                    <LockRoundedIcon color="primary" />
                                    <Box flexGrow={1}>
                                        <Typography fontWeight={600}>Live privado</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Solo usuarios específicos podrán verlo
                                        </Typography>
                                    </Box>
                                    <Switch name="is_private" checked={formData.is_private} onChange={handleChange} />
                                </Stack>
                            </Grid>

                            {/* Imagen */}
                            <Grid item xs={12}>
                                <input ref={fileInput} hidden type="file" accept="image/*" onChange={handleFileChange} />

                                {!previewUrl ? (
                                    <Box
                                        onClick={() => fileInput.current.click()}
                                        sx={{
                                            p: 4, textAlign: "center", cursor: "pointer", borderRadius: 3,
                                            border: `2px dashed ${alpha(PINK, 0.5)}`, bgcolor: alpha(PINK, 0.04), transition: ".2s",
                                            "&:hover": { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
                                        }}
                                    >
                                        <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
                                        <Typography fontWeight={600}>Haz clic para subir una imagen</Typography>
                                        <Typography variant="caption" color="text.secondary">PNG, JPG o JPEG (máx. 5MB)</Typography>
                                    </Box>
                                ) : (
                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                                        <Box
                                            component="img" src={previewUrl} alt="Vista previa"
                                            sx={{
                                                width: { xs: "100%", sm: 220 }, height: { xs: 220, sm: 140 }, objectFit: "cover",
                                                borderRadius: 3, border: `1px solid ${alpha(PINK, 0.25)}`,
                                            }}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            <Button variant="outlined" size="small" onClick={() => fileInput.current.click()}>
                                                Cambiar imagen
                                            </Button>
                                            <Button variant="outlined" color="error" size="small" onClick={handleRemoveFile}>
                                                {file ? "Eliminar" : "Quitar"}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Acciones */}
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" size="large" onClick={goBack} sx={{ minWidth: 140 }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" size="large" disabled={loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" thickness={5} /> : <SaveRoundedIcon />}
                            sx={{ minWidth: 180, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
                            {loading
                                ? isEditMode ? "Actualizando..." : "Guardando..."
                                : isEditMode ? "Actualizar Live" : "Crear Live"}
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AddLive;