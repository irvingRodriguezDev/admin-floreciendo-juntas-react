import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box, Grid, Stack, Paper, Typography, TextField, Button, Avatar,
    Divider, IconButton, Tooltip, Chip, Checkbox, FormControlLabel,
    CircularProgress,
} from "@mui/material";
import {
    CloudUpload as CloudUploadIcon, Save as SaveIcon, PictureAsPdf as PdfIcon,
    ArrowBack as ArrowBackIcon, WorkspacePremiumOutlined,
    DeleteOutline as DeleteOutlineIcon, SwapHorizOutlined, InfoOutlined,
    CalendarTodayOutlined, EmojiEventsOutlined, ImageOutlined,
    CheckCircleOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { PDFDocument } from "pdf-lib";
import CertificationContext from "../../context/CertificationContext/CertificationContext";

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

const REDIRECT_PATH = "/certifications/list";
const IMG_MAX_MB = 5;
const PDF_MAX_MB = 10;
const LETTER_W = 2550.83;
const LETTER_H = 3300.66;
const LETTER_TOL = 5;

const INITIAL_FORM = {
    name: "",
    start_date: "",
    end_date: "",
    min_passing_score: "",
    max_passing_score: "",
    is_active: true,
};

const INITIAL_FILES = {
    image: { file: null, preview: null, name: "" },
    certificate: { file: null, preview: null, name: "" },
    diploma: { file: null, preview: null, name: "" },
};

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
        py: 1.4, borderRadius: 2, fontWeight: 700, color: "#fff",
        background: GRADIENT, boxShadow: "none",
        "&:hover": { background: GRADIENT_HOVER, boxShadow: "none" },
        "&.Mui-disabled": { background: "#F5C6D0", color: "#fff" },
    },
    outline: {
        py: 1.4, borderRadius: 2, fontWeight: 600,
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
    chip: {
        bgcolor: PINK_BG_SOFT, color: PINK_DARK, fontWeight: 600,
        border: `1px solid ${PINK_SOFT}`, maxWidth: "100%",
    },
    dropzone: {
        border: `2px dashed ${PINK}`, borderRadius: 3, p: 4, textAlign: "center",
        cursor: "pointer", bgcolor: PINK_BG_SOFT, transition: "all .25s ease",
        "&:hover": {
            bgcolor: PINK_BG, borderColor: PINK_DARK,
            transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(255,92,147,.15)",
        },
    },
    imgPreview: {
        width: { xs: "100%", sm: 180 },
        height: { xs: 200, sm: 180 },
        objectFit: "cover", borderRadius: 2,
        border: `1px solid ${PINK_SOFT}`,
        boxShadow: "0 8px 24px rgba(255,92,147,.12)",
    },
    pdfBox: {
        width: "100%", maxWidth: 360, aspectRatio: "8.5 / 11",
        border: `1px solid ${PINK_SOFT}`, borderRadius: 2,
        overflow: "hidden", boxShadow: "0 8px 24px rgba(255,92,147,.12)",
        bgcolor: "#fff", display: "flex",
        alignItems: "center", justifyContent: "center",
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
    card: {
        borderRadius: 4, overflow: "hidden",
        border: `1px solid ${PINK_SOFT}`,
        boxShadow: "0 8px 24px rgba(255,92,147,.08)",
    },
    pageWrap: { maxWidth: 1100, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } },
};

/* ═══════════════════════════════════════════════════════════════
   3. HELPERS DE LÓGICA
   ═══════════════════════════════════════════════════════════════ */

const fireError = (text, title = "Error") =>
    Swal.fire({ icon: "error", title, text });

const pad = (n) => String(n).padStart(2, "0");

/** ISO → "YYYY-MM-DD" para <input type="date"> */
const toDateInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Valida imagen: tipo y tamaño */
const validateImage = (file) => {
    if (!file.type.startsWith("image/"))
        return "Selecciona una imagen (PNG, JPG o JPEG)";
    if (file.size > IMG_MAX_MB * 1024 * 1024)
        return `La imagen no debe superar los ${IMG_MAX_MB} MB`;
    return null;
};

/** Valida PDF: tipo, tamaño y dimensiones carta vertical */
const validatePdf = async (file, label) => {
    if (file.type !== "application/pdf") return "Selecciona un archivo PDF";
    if (file.size > PDF_MAX_MB * 1024 * 1024)
        return `El PDF no debe superar los ${PDF_MAX_MB} MB`;
    try {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        const { width, height } = pdf.getPage(0).getSize();
        const offW = Math.abs(width - LETTER_W) > LETTER_TOL;
        const offH = Math.abs(height - LETTER_H) > LETTER_TOL;
        if (offW || offH)
            return `El ${label} debe tener tamaño carta vertical (8.5 × 11 in)`;
        return null;
    } catch {
        return "No se pudo leer el PDF";
    }
};

/** Lee un archivo como dataURL (para imágenes) */
const readAsDataURL = (file) =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });

/** Valida los campos requeridos del formulario */
const validateForm = ({ formData, files, isEdit }) => {
    const checks = [
        [!formData.name.trim(), "El nombre de la certificación es obligatorio"],
        [!formData.start_date, "La fecha de inicio es obligatoria"],
        [!formData.end_date, "La fecha de fin es obligatoria"],
        [
            new Date(formData.end_date) < new Date(formData.start_date),
            "La fecha de fin debe ser posterior a la fecha de inicio",
        ],
        [!formData.min_passing_score, "La puntuación mínima para aprobar es obligatoria"],
        [!formData.max_passing_score, "La puntuación máxima es obligatoria"],
        [
            parseInt(formData.min_passing_score) > parseInt(formData.max_passing_score),
            "La puntuación mínima no puede ser mayor que la máxima",
        ],
        [!isEdit && !files.image.file, "Debes subir una imagen para la certificación"],
    ];
    const failed = checks.find(([cond]) => cond);
    if (failed) { fireError(failed[1]); return false; }
    return true;
};

/* ═══════════════════════════════════════════════════════════════
   4. SUBCOMPONENTES DE PRESENTACIÓN
   ═══════════════════════════════════════════════════════════════ */

/** Card con icono + título + subtítulo + contenido */
const Section = ({ icon, title, subtitle, children }) => (
    <Paper variant="outlined" sx={sx.section}>
        <Box sx={{ ...sx.sectionHead, mb: subtitle ? 0.5 : 2 }}>
            <Avatar sx={sx.avatarSm}>{icon}</Avatar>
            <Typography variant="subtitle1" fontWeight={700} color={PINK}>{title}</Typography>
        </Box>
        {subtitle && (
            <Typography variant="caption" color="text.secondary"
                sx={{ display: "block", mb: 2, ml: 6 }}>
                {subtitle}
            </Typography>
        )}
        {children}
    </Paper>
);

/** Hook: convierte URL remota en blob URL para el <iframe> del PDF */
const usePdfBlobUrl = (url) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        if (!url) { setBlobUrl(null); return; }
        if (url.startsWith("blob:")) { setBlobUrl(url); return; }

        let objectUrl;
        setLoadingPdf(true);
        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            })
            .catch(() => setBlobUrl(null))
            .finally(() => setLoadingPdf(false));

        return () => objectUrl && URL.revokeObjectURL(objectUrl);
    }, [url]);

    return { blobUrl, loadingPdf };
};

/** Preview de PDF embebido en un iframe */
const PdfPreview = ({ url, title }) => {
    const { blobUrl, loadingPdf } = usePdfBlobUrl(url);
    return (
        <Box sx={sx.pdfBox}>
            {loadingPdf ? (
                <CircularProgress size={28} sx={{ color: PINK }} />
            ) : blobUrl ? (
                <Box component="iframe" src={blobUrl} title={title}
                    sx={{ width: "100%", height: "100%", border: "none", display: "block" }} />
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No se pudo cargar el PDF.
                </Typography>
            )}
        </Box>
    );
};

/** Selector de archivo: preview (imagen o PDF) con acciones, o dropzone */
const UploadField = ({
    label, helper, accept, preview, fileName, isImage,
    icon, onPick, onRemove, required,
}) => {
    const inputRef = useRef(null);
    const open = () => inputRef.current?.click();

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={700} color={PINK_DARK} sx={{ mb: 0.5 }}>
                {label} {required && "*"}
            </Typography>
            {helper && (
                <Typography variant="caption" color="text.secondary"
                    sx={{ display: "block", mb: 1.5 }}>
                    {helper}
                </Typography>
            )}

            {preview ? (
                <Stack spacing={2} alignItems="center">
                    {isImage
                        ? <Box component="img" src={preview} alt={label} sx={sx.imgPreview} />
                        : <PdfPreview url={preview} title={`Vista previa de ${label}`} />}

                    {fileName && (
                        <Chip icon={<CheckCircleOutlined />} label={fileName}
                            size="small" sx={sx.chip} />
                    )}

                    <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
                        <Button size="small" variant="outlined" startIcon={<SwapHorizOutlined />}
                            onClick={open} sx={sx.smallOutline}>
                            Cambiar
                        </Button>
                        <Button size="small" variant="outlined" color="error"
                            startIcon={<DeleteOutlineIcon />} onClick={onRemove} sx={sx.smallDanger}>
                            Eliminar
                        </Button>
                    </Stack>
                </Stack>
            ) : (
                <Box sx={sx.dropzone} onClick={open}>
                    <Avatar sx={{
                        bgcolor: "#fff", color: PINK, width: 64, height: 64,
                        mx: "auto", mb: 2, border: `2px solid ${PINK_SOFT}`,
                    }}>
                        {icon}
                    </Avatar>
                    <Typography fontWeight={700} color={PINK} gutterBottom>
                        Haz clic para subir {label.toLowerCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {helper}
                    </Typography>
                </Box>
            )}

            <input ref={inputRef} type="file" accept={accept} hidden onChange={onPick} />
        </Box>
    );
};

/* ═══════════════════════════════════════════════════════════════
   5. COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

const AddCertificate = ({ onCancel }) => {
    const { id } = useParams();
    const history = useHistory();
    const isEdit = Boolean(id);

    const {
        certification: current,
        getCertificationById,
        createCertification,
        updateCertification,
        loading,
    } = useContext(CertificationContext);

    const [formData, setFormData] = useState(INITIAL_FORM);
    const [files, setFiles] = useState(INITIAL_FILES);
    const [submitting, setSubmitting] = useState(false);

    /* Ref con las funciones del context para no meterlas en deps */
    const ctxRef = useRef({ getCertificationById });
    ctxRef.current = { getCertificationById };

    const goBack = () => (onCancel ? onCancel() : history.push(REDIRECT_PATH));

    /* ─── Cargar si es edición ─── */
    useEffect(() => {
        if (isEdit) ctxRef.current.getCertificationById(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEdit]);

    /* ─── Sincronizar datos cargados ─── */
    useEffect(() => {
        if (!isEdit || !current?.certification) return;
        const c = current.certification;

        setFormData({
            name: c.name || "",
            start_date: toDateInput(c.start_date),
            end_date: toDateInput(c.end_date),
            min_passing_score: c.min_passing_score || "",
            max_passing_score: c.max_passing_score || "",
            is_active: c.is_active ?? true,
        });

        setFiles({
            image: { file: null, preview: current.image || null, name: "" },
            certificate: {
                file: null, preview: current.certificate || null,
                name: current.certificate ? "Certificado actual" : "",
            },
            diploma: {
                file: null, preview: current.diploma || null,
                name: current.diploma ? "Diploma actual" : "",
            },
        });
    }, [isEdit, current]);

    /* ─── Handlers ─── */
    const onChange = ({ target: { name, value, checked, type } }) =>
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));

    const onNumberChange = ({ target: { name, value } }) => {
        if (value === "" || /^\d+$/.test(value))
            setFormData((p) => ({ ...p, [name]: value }));
    };

    const setFileField = (key, patch) =>
        setFiles((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

    const onFileChange = (key, validator) => async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = await validator(file);
        if (error) { fireError(error, "Archivo inválido"); e.target.value = ""; return; }

        const preview = key === "image"
            ? await readAsDataURL(file)
            : URL.createObjectURL(file);

        setFileField(key, { file, preview, name: file.name });
    };

    const onRemoveFile = (key) => () =>
        setFileField(key, {
            file: null,
            preview: isEdit ? current?.[key] || null : null,
            name: isEdit && current?.[key] ? "Archivo actual" : "",
        });

    /* ─── Submit ─── */
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm({ formData, files, isEdit })) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            ["image", "certificate", "diploma"].forEach((k) => {
                if (files[k].file) fd.append(k, files[k].file);
            });

            if (isEdit) await updateCertification(id, fd);
            else await createCertification(fd);

            history.push(REDIRECT_PATH);
        } catch {
            fireError("Ocurrió un error al guardar la certificación. Intenta nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── Loading inicial ─── */
    if (isEdit && loading && !current) {
        return (
            <Box sx={sx.pageWrap}>
                <Paper elevation={0} sx={{ ...sx.card, p: 5, textAlign: "center", bgcolor: PINK_BG }}>
                    <CircularProgress size={36} sx={{ color: PINK, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Cargando datos de la certificación...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    /* ─── Textos derivados ─── */
    const texts = isEdit
        ? {
            title: "Editar certificación",
            subtitle: "Completa todos los campos requeridos para actualizar la certificación",
            submit: "Actualizar certificación",
            loading: "Actualizando...",
        }
        : {
            title: "Crear nueva certificación",
            subtitle: "Completa todos los campos requeridos para crear una nueva certificación",
            submit: "Crear certificación",
            loading: "Guardando...",
        };

    /* ─── Render ─── */
    return (
        <Box sx={sx.pageWrap}>
            <Paper elevation={0} sx={sx.card}>
                {/* Header */}
                <Box sx={sx.header}>
                    <Tooltip title="Volver">
                        <IconButton onClick={goBack} sx={sx.headerBtn}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", width: 48, height: 48 }}>
                        <WorkspacePremiumOutlined />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>{texts.title}</Typography>
                        <Typography variant="body2" sx={{ opacity: .9 }}>{texts.subtitle}</Typography>
                    </Box>
                </Box>

                {/* Formulario */}
                <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
                    <Box component="form" onSubmit={onSubmit}>
                        <Stack spacing={3}>

                            {/* Información básica */}
                            <Section icon={<InfoOutlined fontSize="small" />} title="Información básica"
                                subtitle="Nombre descriptivo de la certificación">
                                <TextField fullWidth label="Nombre de la certificación *" name="name"
                                    value={formData.name} onChange={onChange} required
                                    placeholder="Ej: Certificación en Desarrollo Web" sx={sx.field} />
                            </Section>

                            {/* Vigencia */}
                            <Section icon={<CalendarTodayOutlined fontSize="small" />} title="Vigencia"
                                subtitle="Periodo durante el cual estará disponible la certificación">
                                <Grid container spacing={2}>
                                    {[
                                        { name: "start_date", label: "Fecha de inicio *", helper: "Fecha desde cuando estará disponible" },
                                        { name: "end_date", label: "Fecha de fin *", helper: "Fecha hasta cuando estará disponible" },
                                    ].map((f) => (
                                        <Grid item xs={12} md={6} key={f.name}>
                                            <TextField fullWidth type="date" label={f.label} name={f.name}
                                                value={formData[f.name]} onChange={onChange}
                                                InputLabelProps={{ shrink: true }} helperText={f.helper}
                                                required sx={sx.field} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Section>

                            {/* Puntuaciones */}
                            <Section icon={<EmojiEventsOutlined fontSize="small" />} title="Puntuaciones"
                                subtitle="Rangos de calificación para aprobar la certificación">
                                <Grid container spacing={2}>
                                    {[
                                        { name: "min_passing_score", label: "Puntuación mínima para aprobar *", placeholder: "Ej: 70", helper: "Puntaje mínimo requerido para aprobar" },
                                        { name: "max_passing_score", label: "Puntuación máxima *", placeholder: "Ej: 100", helper: "Puntaje máximo posible" },
                                    ].map((f) => (
                                        <Grid item xs={12} md={6} key={f.name}>
                                            <TextField fullWidth label={f.label} name={f.name}
                                                value={formData[f.name]} onChange={onNumberChange}
                                                placeholder={f.placeholder} helperText={f.helper}
                                                inputProps={{ min: 0, pattern: "\\d*" }}
                                                required sx={sx.field} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Section>

                            {/* Estado activo */}
                            <Paper variant="outlined" sx={{
                                p: 2, borderRadius: 3, border: `1px solid ${PINK_SOFT}`,
                                bgcolor: formData.is_active ? PINK_BG_SOFT : "#fff",
                                transition: "background .25s ease",
                            }}>
                                <FormControlLabel
                                    control={<Checkbox checked={formData.is_active}
                                        onChange={onChange} name="is_active" sx={sx.checkbox} />}
                                    label={
                                        <Box>
                                            <Typography fontWeight={700} color={PINK_DARK}>
                                                Certificación activa
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Si está activa, los usuarios podrán ver y obtener esta certificación
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Paper>

                            {/* Imagen */}
                            <Section icon={<ImageOutlined fontSize="small" />}
                                title="Imagen de la certificación"
                                subtitle={`PNG, JPG o JPEG · Máx. ${IMG_MAX_MB} MB`}>
                                <UploadField
                                    label="Imagen" helper={`PNG, JPG o JPEG (máx. ${IMG_MAX_MB} MB)`}
                                    accept="image/png, image/jpeg, image/jpg"
                                    preview={files.image.preview} fileName={files.image.name}
                                    isImage icon={<CloudUploadIcon />} required={!isEdit}
                                    onPick={onFileChange("image", validateImage)}
                                    onRemove={onRemoveFile("image")}
                                />
                            </Section>

                            {/* PDFs */}
                            <Section icon={<PdfIcon fontSize="small" />} title="Documentos PDF"
                                subtitle={`Tamaño carta vertical (8.5 × 11 in) · Máx. ${PDF_MAX_MB} MB cada uno`}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <UploadField
                                            label="Certificado en PDF" helper="Opcional"
                                            accept="application/pdf"
                                            preview={files.certificate.preview}
                                            fileName={files.certificate.name} icon={<PdfIcon />}
                                            onPick={onFileChange("certificate", (f) => validatePdf(f, "certificado"))}
                                            onRemove={onRemoveFile("certificate")}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <UploadField
                                            label="Diploma en PDF" helper="Opcional"
                                            accept="application/pdf"
                                            preview={files.diploma.preview}
                                            fileName={files.diploma.name} icon={<PdfIcon />}
                                            onPick={onFileChange("diploma", (f) => validatePdf(f, "diploma"))}
                                            onRemove={onRemoveFile("diploma")}
                                        />
                                    </Grid>
                                </Grid>
                            </Section>

                            <Divider sx={{ borderColor: PINK_SOFT }} />

                            {/* Botones */}
                            <Stack direction={{ xs: "column-reverse", sm: "row" }}
                                spacing={2} justifyContent="flex-end">
                                <Button variant="outlined" size="large" onClick={goBack}
                                    disabled={submitting} sx={sx.outline}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="contained" size="large" disabled={submitting}
                                    startIcon={submitting
                                        ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                                        : <SaveIcon />}
                                    sx={{ ...sx.primary, minWidth: 220 }}>
                                    {submitting ? texts.loading : texts.submit}
                                </Button>
                            </Stack>

                        </Stack>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default AddCertificate;