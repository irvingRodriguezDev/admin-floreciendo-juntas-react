import React, { useState, useContext, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
    Box, Container, Paper, Grid, Stack, TextField, Typography, Button, Avatar, Chip,
    Switch, CircularProgress, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Swal from "sweetalert2";
import { PDFDocument } from "pdf-lib";
import CertificationContext from "../../context/CertificationContext/CertificationContext";

const PINK = "#FF5C95";
const KEYS = ["image", "certificate", "diploma"];
const EMPTY_FORM = {
    name: "", start_date: "", end_date: "",
    min_passing_score: "", max_passing_score: "", is_active: true,
};
const EMPTY_FILES = { image: null, certificate: null, diploma: null };
const EMPTY_NAMES = { certificate: "", diploma: "" };
const CURRENT_LABEL = { certificate: "Certificado actual", diploma: "Diploma actual" };

// Medidas esperadas del PDF (puntos): 216 × 279 mm vertical
const PDF_W = (216 * 72) / 25.4;
const PDF_H = (279 * 72) / 25.4;
const PDF_TOLERANCE = 5;

const FIELDS = [
    { name: "name", label: "Nombre de la certificación", placeholder: "Ej: Certificación en Desarrollo Web", helper: "Nombre descriptivo de la certificación", md: 12 },
    { name: "start_date", label: "Fecha de inicio", type: "date", helper: "Fecha desde cuando estará disponible" },
    { name: "end_date", label: "Fecha de fin", type: "date", helper: "Fecha hasta cuando estará disponible" },
    { name: "min_passing_score", label: "Puntuación mínima para aprobar", number: true, placeholder: "Ej: 70", helper: "Puntaje mínimo requerido para aprobar" },
    { name: "max_passing_score", label: "Puntuación máxima", number: true, placeholder: "Ej: 100", helper: "Puntaje máximo posible" },
];

const theme = createTheme({
    palette: { primary: { main: PINK, contrastText: "#fff" }, background: { default: "#FFF6F9" } },
    shape: { borderRadius: 14 },
    typography: { button: { textTransform: "none", fontWeight: 600 } },
    components: {
        MuiButton: { defaultProps: { disableElevation: true } },
        MuiPaper: { defaultProps: { elevation: 0 } },
    },
});

const formatDateForInput = (s) => {
    if (!s) return "";
    const d = new Date(s);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const showError = (text, title = "Error") => Swal.fire({ icon: "error", title, text });

/* PDFs remotos -> blob; blobs locales se usan directo */
const usePdfBlobUrl = (url) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url || url.startsWith("blob:")) return setBlobUrl(url || null);

        let objectUrl;
        setLoading(true);
        fetch(url)
            .then((r) => r.blob())
            .then((b) => setBlobUrl((objectUrl = URL.createObjectURL(b))))
            .catch(() => setBlobUrl(null))
            .finally(() => setLoading(false));

        return () => objectUrl && URL.revokeObjectURL(objectUrl);
    }, [url]);

    return { blobUrl, loading };
};

const PdfPreview = ({ url, title }) => {
    const { blobUrl, loading } = usePdfBlobUrl(url);
    return (
        <Box
            sx={{
                width: "100%", maxWidth: 480, height: 475, bgcolor: "#fff", overflow: "hidden",
                borderRadius: 2, border: `1px solid ${alpha(PINK, 0.25)}`,
                boxShadow: `0 6px 18px ${alpha(PINK, 0.15)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            {loading ? (
                <CircularProgress size={28} />
            ) : blobUrl ? (
                <Box
                    component="iframe"
                    src={`${blobUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                    title={title}
                    sx={{ width: "100%", height: "100%", border: "none", display: "block" }}
                />
            ) : (
                <Typography variant="body2" color="text.secondary">No se pudo cargar el PDF.</Typography>
            )}
        </Box>
    );
};

/* Zona de subida + vista previa + botones cambiar/quitar */
const UploadCard = ({ title, hint, dropText, helper, accept, pdf, preview, fileName, hasNewFile, onChange, onRemove }) => {
    const input = useRef(null);
    const Icon = pdf ? PictureAsPdfRoundedIcon : CloudUploadRoundedIcon;

    return (
        <Box>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>{hint}</Typography>

            <input ref={input} hidden type="file" accept={accept} onChange={onChange} />

            {!preview ? (
                <Box
                    onClick={() => input.current.click()}
                    sx={{
                        p: 4, textAlign: "center", cursor: "pointer", borderRadius: 3,
                        border: `2px dashed ${alpha(PINK, 0.5)}`, bgcolor: alpha(PINK, 0.04), transition: ".2s",
                        "&:hover": { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
                    }}
                >
                    <Icon color="primary" sx={{ fontSize: 52, mb: 1 }} />
                    <Typography fontWeight={600}>{dropText}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{helper}</Typography>
                </Box>
            ) : (
                <Stack alignItems="center" spacing={2}>
                    {pdf ? (
                        <PdfPreview url={preview} title={title} />
                    ) : (
                        <Box
                            sx={{
                                width: "100%", maxWidth: 380, bgcolor: "#fafafa", borderRadius: 3, p: 1,
                                border: `1px solid ${alpha(PINK, 0.25)}`,
                            }}
                        >
                            <Box
                                component="img"
                                src={preview}
                                alt={title}
                                sx={{ width: "100%", maxHeight: 380, objectFit: "contain", display: "block", borderRadius: 2 }}
                            />
                        </Box>
                    )}

                    {fileName && <Typography variant="caption" color="text.secondary">{fileName}</Typography>}

                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                        <Button variant="outlined" size="small" onClick={() => input.current.click()}>Cambiar</Button>
                        <Button variant="outlined" color="error" size="small" onClick={onRemove}>
                            {hasNewFile ? "Eliminar" : "Quitar"}
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Box>
    );
};

const Section = ({ title, subtitle, children }) => (
    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3, border: `1px solid ${alpha(PINK, 0.15)}` }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>{subtitle}</Typography>
        {children}
    </Paper>
);

const AddCertificate = ({ onCancel }) => {
    const history = useHistory();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const {
        certification: certificationActual,
        getCertificationById,
        createCertification,
        updateCertification,
        loading,
    } = useContext(CertificationContext);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [files, setFiles] = useState(EMPTY_FILES);
    const [previews, setPreviews] = useState(EMPTY_FILES);
    const [names, setNames] = useState(EMPTY_NAMES);
    const [submitting, setSubmitting] = useState(false);

    const patch = (setter) => (key, value) => setter((p) => ({ ...p, [key]: value }));
    const setFile = patch(setFiles);
    const setPreview = patch(setPreviews);
    const setName = patch(setNames);

    // Cargar datos en modo edición
    useEffect(() => {
        if (isEditMode) getCertificationById(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Llenar o limpiar formulario
    useEffect(() => {
        if (!isEditMode) {
            setFormData(EMPTY_FORM);
            setFiles(EMPTY_FILES);
            setPreviews(EMPTY_FILES);
            setNames(EMPTY_NAMES);
            return;
        }
        if (!certificationActual || !Object.keys(certificationActual).length) return;

        const c = certificationActual.certification;
        setFormData({
            name: c.name || "",
            start_date: formatDateForInput(c.start_date),
            end_date: formatDateForInput(c.end_date),
            min_passing_score: c.min_passing_score || "",
            max_passing_score: c.max_passing_score || "",
            is_active: c.is_active !== undefined ? c.is_active : true,
        });
        KEYS.forEach((k) => {
            if (!certificationActual[k]) return;
            setPreview(k, certificationActual[k]);
            if (CURRENT_LABEL[k]) setName(k, CURRENT_LABEL[k]);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [certificationActual, isEditMode]);

    const goBack = () => (onCancel ? onCancel() : history.push("/certifications/list"));

    const handleChange = ({ target: { name, value, checked, type } }) =>
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));

    const handleNumberChange = (e) => /^\d*$/.test(e.target.value) && handleChange(e);

    // Imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/"))
            return showError("Selecciona una imagen (PNG, JPG o JPEG)", "Archivo inválido");
        if (file.size > 5 * 1024 * 1024)
            return showError("La imagen no debe superar los 5MB", "Archivo muy grande");

        setFile("image", file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview("image", reader.result);
        reader.readAsDataURL(file);
    };

    // PDFs (certificado y diploma comparten lógica)
    const handlePdfChange = (key) => async (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        const fail = (text, title) => {
            input.value = "";
            return showError(text, title);
        };

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
            return fail("Selecciona un archivo PDF", "Archivo inválido");
        if (file.size > 10 * 1024 * 1024)
            return fail("El PDF no debe superar los 10MB", "Archivo muy grande");

        try {
            const pdf = await PDFDocument.load(await file.arrayBuffer());
            if (pdf.getPageCount() === 0) return fail("El PDF no contiene páginas", "PDF vacío");

            const { width, height } = pdf.getPage(0).getSize();
            if (Math.abs(width - PDF_W) > PDF_TOLERANCE || Math.abs(height - PDF_H) > PDF_TOLERANCE)
                return fail("El PDF debe medir 216 × 279 mm en orientación vertical.", "Medidas incorrectas");

            setFile(key, file);
            setName(key, file.name);
            setPreview(key, URL.createObjectURL(file));
        } catch (err) {
            console.error("Error al leer el PDF:", err);
            fail("El archivo puede estar dañado o no ser válido.", "No se pudo leer el PDF");
        }
    };

    // Quitar archivo nuevo (en edición vuelve al archivo actual)
    const handleRemove = (key) => () => {
        setFile(key, null);
        if (key !== "image") setName(key, "");
        setPreview(key, isEditMode ? certificationActual?.[key] || null : null);
    };

    const validateForm = () => {
        const f = formData;
        const error = [
            [!f.name.trim(), "El nombre de la certificación es obligatorio"],
            [!f.start_date, "La fecha de inicio es obligatoria"],
            [!f.end_date, "La fecha de fin es obligatoria"],
            [new Date(f.end_date) < new Date(f.start_date), "La fecha de fin debe ser posterior a la fecha de inicio"],
            [!f.min_passing_score, "La puntuación mínima para aprobar es obligatoria"],
            [!f.max_passing_score, "La puntuación máxima es obligatoria"],
            [parseInt(f.min_passing_score) > parseInt(f.max_passing_score), "La puntuación mínima no puede ser mayor que la puntuación máxima"],
            [!isEditMode && !files.image, "Debes subir una imagen para la certificación"],
        ].find(([invalid]) => invalid)?.[1];

        if (error) showError(error);
        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            Object.entries(files).forEach(([k, file]) => file && fd.append(k, file));

            await (isEditMode ? updateCertification(id, fd) : createCertification(fd));
            history.push("/certifications/list");
        } catch {
            showError("Ocurrió un error al guardar la certificación. Intenta nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    if (isEditMode && loading && !certificationActual) {
        return (
            <ThemeProvider theme={theme}>
                <Stack alignItems="center" spacing={2} py={10}>
                    <CircularProgress />
                    <Typography color="text.secondary">Cargando datos de la certificación...</Typography>
                </Stack>
            </ThemeProvider>
        );
    }

    const pdfCard = (key, title, dropText) => (
        <Grid item xs={12} md={6}>
            <UploadCard
                pdf
                title={title}
                hint="Opcional — tamaño carta vertical (8.5 × 11 in)"
                dropText={dropText}
                helper="Solo archivos PDF (máx. 10MB)"
                accept="application/pdf"
                preview={previews[key]}
                fileName={names[key]}
                hasNewFile={!!files[key]}
                onChange={handlePdfChange(key)}
                onRemove={handleRemove(key)}
            />
        </Grid>
    );

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
                <Container maxWidth="md" component="form" onSubmit={handleSubmit}>
                    {/* Encabezado */}
                    <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
                            <WorkspacePremiumRoundedIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                            <Typography variant="h5" fontWeight={800}>
                                {isEditMode ? "Editar Certificación" : "Crear Nueva Certificación"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Complete todos los campos requeridos para{" "}
                                {isEditMode ? "actualizar la" : "crear una nueva"} certificación
                            </Typography>
                        </Box>
                        {isEditMode && <Chip label="Edición" color="primary" variant="outlined" />}
                    </Stack>

                    {/* Información */}
                    <Section title="Información general" subtitle="Nombre, vigencia y puntuaciones">
                        <Grid container spacing={3}>
                            {FIELDS.map(({ name, label, type, number, placeholder, helper, md = 6 }) => (
                                <Grid item xs={12} md={md} key={name}>
                                    <TextField
                                        fullWidth
                                        required
                                        name={name}
                                        label={label}
                                        type={type}
                                        placeholder={placeholder}
                                        helperText={helper}
                                        value={formData[name]}
                                        onChange={number ? handleNumberChange : handleChange}
                                        InputLabelProps={type === "date" ? { shrink: true } : undefined}
                                        inputProps={number ? { min: 0, pattern: "\\d*" } : undefined}
                                    />
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.5}
                                    sx={{
                                        px: 2, py: 1, borderRadius: 3,
                                        border: `1px solid ${alpha(PINK, 0.3)}`, bgcolor: alpha(PINK, 0.04),
                                    }}
                                >
                                    <Box flexGrow={1}>
                                        <Typography fontWeight={600}>Certificación activa</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Si está activa, los usuarios podrán ver y obtener esta certificación
                                        </Typography>
                                    </Box>
                                    <Switch name="is_active" checked={formData.is_active} onChange={handleChange} />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Section>

                    {/* Archivos */}
                    <Section title="Archivos" subtitle="Imagen de la certificación, certificado y diploma">
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <UploadCard
                                    title={`Imagen de la certificación${isEditMode ? "" : " *"}`}
                                    hint="Recomendado: 800×600 píxeles"
                                    dropText="Haz clic para subir una imagen"
                                    helper="PNG, JPG o JPEG (máx. 5MB)"
                                    accept="image/png, image/jpeg, image/jpg"
                                    preview={previews.image}
                                    hasNewFile={!!files.image}
                                    onChange={handleImageChange}
                                    onRemove={handleRemove("image")}
                                />
                            </Grid>
                            {pdfCard("certificate", "Certificado en PDF", "Haz clic para subir el PDF del certificado")}
                            {pdfCard("diploma", "Diploma en PDF", "Haz clic para subir el diploma en PDF")}
                        </Grid>
                    </Section>

                    {/* Acciones */}
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="flex-end">
                        <Button variant="outlined" size="large" onClick={goBack} disabled={submitting} sx={{ minWidth: 140 }}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={submitting}
                            startIcon={
                                submitting ? <CircularProgress size={18} color="inherit" thickness={5} /> : <SaveRoundedIcon />
                            }
                            sx={{ minWidth: 220, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}
                        >
                            {submitting
                                ? isEditMode ? "Actualizando..." : "Guardando..."
                                : isEditMode ? "Actualizar Certificación" : "Crear Certificación"}
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AddCertificate;