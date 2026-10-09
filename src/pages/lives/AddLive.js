import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box, Grid, Stack, Paper, Typography, TextField, Button, Avatar,
    Divider, IconButton, Tooltip, FormControlLabel, Checkbox,
    CircularProgress,
} from "@mui/material";
import {
    Save as SaveIcon, ArrowBack as ArrowBackIcon, CloudUploadOutlined,
    SwapHorizOutlined, DeleteOutline as DeleteOutlineIcon, InfoOutlined,
    LiveTvOutlined, ImageOutlined, DescriptionOutlined,
    ScheduleOutlined, LockOutlined,
} from "@mui/icons-material";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";
import LiveContext from "../../context/LiveContext/LiveContext";

/* ═══════════════════════════════════════════════════════════════
   1. CONSTANTES
   ═══════════════════════════════════════════════════════════════ */
const PINK = "#FF5C93";
const PINK_DARK = "#E94E88";
const PINK_SOFT = "#FFE6F0";
const PINK_BG = "#FFF5FA";
const PINK_BG_SOFT = "#FFF0F7";
const GRADIENT = "linear-gradient(135deg,#FF5C93,#FF69B4)";
const GRADIENT_HOVER = "linear-gradient(135deg,#E94E88,#FF5C93)";
const MAX_SIZE_MB = 5;
const REDIRECT_PATH = "/lives/live_playlist";

const INITIAL_FORM = {
    title: "",
    description: "",
    start_time: "",
    is_private: false,
};

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "clean"],
    ],
};

const QUILL_FORMATS = [
    "header", "bold", "italic", "underline", "strike", "blockquote",
    "color", "background", "list", "bullet", "align", "link",
];

/* ═══════════════════════════════════════════════════════════════
   2. ESTILOS REUTILIZABLES
   ═══════════════════════════════════════════════════════════════ */
const sx = {
    field: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, bgcolor: "#fff",
            "& fieldset": { borderColor: PINK_SOFT },
            "&:hover fieldset": { borderColor: PINK },
            "&.Mui-focused fieldset": { borderColor: PINK, borderWidth: 2 },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: PINK },
    },
    primary: {
        py: 1.4, px: 3, borderRadius: 2, fontWeight: 700, color: "#fff",
        background: GRADIENT, boxShadow: "none",
        "&:hover": { background: GRADIENT_HOVER, boxShadow: "none" },
        "&.Mui-disabled": { background: "#F5C6D0", color: "#fff" },
    },
    outline: {
        py: 1.4, px: 3, borderRadius: 2, fontWeight: 600,
        color: PINK_DARK, border: `1px solid ${PINK}`,
        "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
    },
    smallOutline: {
        borderRadius: 2, color: PINK_DARK, borderColor: PINK,
        "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
    },
    smallDanger: {
        borderRadius: 2, borderColor: "#EF9A9A", color: "#C62828",
        "&:hover": { bgcolor: "#FFEBEE", borderColor: "#C62828" },
    },
    section: {
        p: 2.5, borderRadius: 3,
        border: `1px solid ${PINK_SOFT}`, bgcolor: "#fff",
    },
    sectionHead: { display: "flex", alignItems: "center", gap: 1, mb: 2 },
    avatarSm: { bgcolor: PINK_BG_SOFT, color: PINK, width: 32, height: 32 },
    img: {
        width: "100%", maxHeight: 320, objectFit: "contain",
        borderRadius: 2, border: `1px solid ${PINK_SOFT}`, bgcolor: "#fff", p: 1,
    },
    dropzone: {
        border: `2px dashed ${PINK}`, borderRadius: 3, p: 4, textAlign: "center",
        cursor: "pointer", bgcolor: PINK_BG_SOFT, transition: "all .25s ease",
        "&:hover": {
            bgcolor: PINK_BG, borderColor: PINK_DARK,
            transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(255,92,147,.15)",
        },
    },
    header: {
        background: GRADIENT, color: "#fff", p: 3,
        display: "flex", alignItems: "center", gap: 2,
    },
    headerBtn: {
        color: "#fff", bgcolor: "rgba(255,255,255,.15)",
        "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
    },
    checkbox: { color: PINK, "&.Mui-checked": { color: PINK } },
    quillWrapper: {
        "& .ql-toolbar": {
            borderTopLeftRadius: 2, borderTopRightRadius: 2,
            borderColor: PINK_SOFT, bgcolor: PINK_BG_SOFT,
        },
        "& .ql-container": {
            borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
            borderColor: PINK_SOFT, fontFamily: "inherit",
            fontSize: "0.95rem", minHeight: 180, bgcolor: "#fff",
        },
        "& .ql-editor": { minHeight: 180 },
        "& .ql-snow .ql-stroke": { stroke: PINK_DARK },
        "& .ql-snow .ql-fill": { fill: PINK_DARK },
        "& .ql-snow .ql-picker": { color: PINK_DARK },
        "& .ql-toolbar button:hover .ql-stroke": { stroke: PINK },
        "& .ql-toolbar button.ql-active .ql-stroke": { stroke: PINK },
    },
    card: {
        borderRadius: 4, overflow: "hidden",
        border: `1px solid ${PINK_SOFT}`,
        boxShadow: "0 8px 24px rgba(255,92,147,.08)",
    },
    pageWrap: {
        maxWidth: 1100, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 },
    },
};

/* ═══════════════════════════════════════════════════════════════
   3. SUBCOMPONENTES DE PRESENTACIÓN
   ═══════════════════════════════════════════════════════════════ */

/** Card con icono + título + subtítulo + contenido */
const Section = ({ icon, title, subtitle, children }) => (
    <Paper variant="outlined" sx={sx.section}>
        <Box sx={{ ...sx.sectionHead, mb: subtitle ? 0.5 : 2 }}>
            <Avatar sx={sx.avatarSm}>{icon}</Avatar>
            <Typography variant="subtitle1" fontWeight={700} color={PINK}>
                {title}
            </Typography>
        </Box>
        {subtitle && (
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2, ml: 6 }}
            >
                {subtitle}
            </Typography>
        )}
        {children}
    </Paper>
);

/** Selector de imagen: preview con acciones o dropzone */
const ImageField = ({ preview, onPick, onRemove, removeLabel }) => {
    const inputRef = useRef(null);
    const open = () => inputRef.current?.click();

    return (
        <Section
            icon={<ImageOutlined fontSize="small" />}
            title="Imagen del Live"
            subtitle={`PNG, JPG o JPEG · Máx. ${MAX_SIZE_MB} MB`}
        >
            {preview ? (
                <Stack spacing={2} alignItems="center">
                    <Box component="img" src={preview} alt="Vista previa del Live" sx={sx.img} />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SwapHorizOutlined />}
                            onClick={open}
                            sx={sx.smallOutline}
                        >
                            Cambiar imagen
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={onRemove}
                            sx={sx.smallDanger}
                        >
                            {removeLabel}
                        </Button>
                    </Stack>
                </Stack>
            ) : (
                <Box sx={sx.dropzone} onClick={open}>
                    <Avatar
                        sx={{
                            bgcolor: "#fff", color: PINK, width: 56, height: 56,
                            mx: "auto", mb: 1.5, border: `2px solid ${PINK_SOFT}`,
                        }}
                    >
                        <CloudUploadOutlined sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography fontWeight={700} color={PINK} gutterBottom>
                        Haz clic para subir la imagen
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        PNG, JPG o JPEG · Máx. {MAX_SIZE_MB} MB
                    </Typography>
                </Box>
            )}

            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
        </Section>
    );
};

/** Toggle de "Live privado" con descripción */
const PrivateToggle = ({ checked, onChange }) => (
    <Paper
        variant="outlined"
        sx={{
            p: 1.5, borderRadius: 2, border: `1px solid ${PINK_SOFT}`,
            bgcolor: checked ? PINK_BG_SOFT : "#fff",
            transition: "background .25s ease",
            height: "100%", display: "flex", alignItems: "center",
        }}
    >
        <FormControlLabel
            control={
                <Checkbox
                    checked={checked}
                    onChange={onChange}
                    name="is_private"
                    sx={sx.checkbox}
                />
            }
            label={
                <Box>
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                        <LockOutlined sx={{ fontSize: 18, color: PINK }} />
                        <Typography fontWeight={700} color={PINK_DARK}>
                            Live privado
                        </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Solo usuarios específicos podrán verlo
                    </Typography>
                </Box>
            }
        />
    </Paper>
);

/* ═══════════════════════════════════════════════════════════════
   4. HELPERS DE LÓGICA
   ═══════════════════════════════════════════════════════════════ */

const pad = (n) => n.toString().padStart(2, "0");

/** ISO → "YYYY-MM-DDTHH:mm" para <input type="datetime-local"> */
const toDateTimeInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Valida que el archivo sea imagen y no supere el tamaño máximo */
const validateImage = (file) => {
    if (!file.type.startsWith("image/")) {
        Swal.fire("Archivo inválido", "Selecciona una imagen PNG, JPG o JPEG.", "warning");
        return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        Swal.fire(
            "Archivo muy grande",
            `La imagen no puede superar los ${MAX_SIZE_MB} MB.`,
            "warning"
        );
        return false;
    }
    return true;
};

const readAsDataURL = (file) =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });

/** Valida los campos requeridos del formulario */
const validateForm = ({ formData, file, isEdit }) => {
    if (!formData.title.trim()) {
        Swal.fire("Título requerido", "El título del Live es obligatorio.", "warning");
        return false;
    }
    if (!formData.description.trim()) {
        Swal.fire("Descripción requerida", "La descripción del Live es obligatoria.", "warning");
        return false;
    }
    if (!formData.start_time) {
        Swal.fire("Fecha requerida", "La fecha y hora de inicio son obligatorias.", "warning");
        return false;
    }
    if (!isEdit && !file) {
        Swal.fire("Imagen requerida", "Debes subir una imagen para el Live.", "warning");
        return false;
    }
    return true;
};

/* ═══════════════════════════════════════════════════════════════
   5. COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

const AddLive = ({ onCancel }) => {
    const { id } = useParams();
    const history = useHistory();
    const isEdit = Boolean(id);

    const {
        crearLive,
        actualizarLive,
        obtenerLivePorId,
        liveActual,
        limpiarLiveActual,
        cargando,
    } = useContext(LiveContext);

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    /* Guardamos las funciones del context en un ref para poder usarlas
       dentro de efectos sin añadirlas como dependencias (evita loops). */
    const ctxRef = useRef({ obtenerLivePorId, limpiarLiveActual });
    ctxRef.current = { obtenerLivePorId, limpiarLiveActual };

    const goBack = () => (onCancel ? onCancel() : history.push(REDIRECT_PATH));

    /* ─── Efecto: cargar Live si es edición ─── */
    useEffect(() => {
        if (!isEdit) return;
        ctxRef.current.obtenerLivePorId(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    /* ─── Efecto: limpiar el context al desmontar ─── */
    useEffect(() => {
        return () => {
            ctxRef.current.limpiarLiveActual();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ─── Efecto: sincronizar los datos del Live cargado ─── */
    useEffect(() => {
        if (!isEdit || !liveActual || !Object.keys(liveActual).length) return;

        setFormData({
            title: liveActual.title || "",
            description: liveActual.description || "",
            start_time: liveActual.start_time
                ? toDateTimeInput(liveActual.start_time)
                : "",
            is_private: !!liveActual.is_private,
        });

        if (liveActual.thumbnail_url) setPreviewUrl(liveActual.thumbnail_url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, liveActual]);

    /* ─── Handlers ─── */
    const onChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData((p) => ({
            ...p,
            [name]: name === "is_private" ? checked : value,
        }));
    };

    const onDescriptionChange = (content) =>
        setFormData((p) => ({ ...p, description: content }));

    const onFileChange = async (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        if (!validateImage(selected)) {
            e.target.value = "";
            return;
        }
        setFile(selected);
        setPreviewUrl(await readAsDataURL(selected));
    };

    const onRemoveFile = () => {
        setFile(null);
        setPreviewUrl(isEdit ? liveActual?.thumbnail_url || null : null);
    };

    /* ─── Submit ─── */
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm({ formData, file, isEdit })) return;

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("start_time", formData.start_time);
            fd.append("is_private", formData.is_private);
            if (file) fd.append("file", file);

            const success = isEdit
                ? await actualizarLive(id, fd)
                : await crearLive(fd);

            if (success) {
                await Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: isEdit
                        ? "Live actualizado correctamente."
                        : "Live creado correctamente.",
                    timer: 1500,
                    showConfirmButton: false,
                });
                history.push(REDIRECT_PATH);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Ocurrió un error. Intenta nuevamente.", "error");
        } finally {
            setLoading(false);
        }
    };

    /* ─── Loading inicial en edición ─── */
    if (isEdit && cargando && !liveActual) {
        return (
            <Box sx={sx.pageWrap}>
                <Paper elevation={0} sx={sx.card}>
                    <Box sx={sx.header}>
                        <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", width: 48, height: 48 }}>
                            <LiveTvOutlined />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Editar Live
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Cargando información del Live...
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ p: 6, bgcolor: PINK_BG, textAlign: "center" }}>
                        <CircularProgress size={32} sx={{ color: PINK, mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            Cargando datos del Live...
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        );
    }

    /* ─── Textos derivados ─── */
    const texts = isEdit
        ? {
            title: "Editar Live",
            subtitle: "Modifica los datos del Live",
            submit: "Actualizar Live",
            loading: "Actualizando...",
        }
        : {
            title: "Nuevo Live",
            subtitle: "Completa los campos para crear una nueva transmisión",
            submit: "Crear Live",
            loading: "Guardando...",
        };

    /* ─── Render ─── */
    return (
        <Box sx={sx.pageWrap}>
            <Paper elevation={0} sx={sx.card}>
                {/* Header */}
                <Box sx={sx.header}>
                    <Tooltip title="Volver">
                        <IconButton
                            onClick={() => (onCancel ? onCancel() : history.goBack())}
                            sx={sx.headerBtn}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>

                    <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", width: 48, height: 48 }}>
                        <LiveTvOutlined />
                    </Avatar>

                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {texts.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {texts.subtitle}
                        </Typography>
                    </Box>
                </Box>

                {/* Formulario */}
                <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
                    <Box component="form" onSubmit={onSubmit}>
                        <Stack spacing={3}>
                            {/* Información básica */}
                            <Section
                                icon={<InfoOutlined fontSize="small" />}
                                title="Información básica"
                                subtitle="Título y descripción de la transmisión"
                            >
                                <TextField
                                    label="Título del Live *"
                                    name="title"
                                    fullWidth
                                    required
                                    value={formData.title}
                                    onChange={onChange}
                                    sx={sx.field}
                                    placeholder="Ej. Clase en vivo: Introducción al curso"
                                />
                            </Section>

                            {/* Descripción enriquecida */}
                            <Section
                                icon={<DescriptionOutlined fontSize="small" />}
                                title="Descripción del Live"
                                subtitle="Agrega información, formato, listas, enlaces y colores"
                            >
                                <Box sx={sx.quillWrapper}>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={onDescriptionChange}
                                        modules={QUILL_MODULES}
                                        formats={QUILL_FORMATS}
                                    />
                                </Box>
                            </Section>

                            {/* Programación y privacidad */}
                            <Section
                                icon={<ScheduleOutlined fontSize="small" />}
                                title="Programación y privacidad"
                                subtitle="Define cuándo se realizará el Live y quién podrá acceder"
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="datetime-local"
                                            label="Fecha y hora de inicio *"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={onChange}
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            sx={sx.field}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <PrivateToggle
                                            checked={formData.is_private}
                                            onChange={onChange}
                                        />
                                    </Grid>
                                </Grid>
                            </Section>

                            {/* Imagen */}
                            <ImageField
                                preview={previewUrl}
                                onPick={onFileChange}
                                onRemove={onRemoveFile}
                                removeLabel={file ? "Eliminar" : "Quitar"}
                            />

                            <Divider sx={{ borderColor: PINK_SOFT }} />

                            {/* Botones */}
                            <Stack
                                direction={{ xs: "column-reverse", sm: "row" }}
                                spacing={2}
                                justifyContent="flex-end"
                            >
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={goBack}
                                    disabled={loading}
                                    sx={sx.outline}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={18} sx={{ color: "#fff" }} />
                                        ) : (
                                            <SaveIcon />
                                        )
                                    }
                                    sx={{ ...sx.primary, minWidth: 220 }}
                                >
                                    {loading ? texts.loading : texts.submit}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default AddLive;