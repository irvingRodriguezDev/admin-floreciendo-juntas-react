import React, { useState, useContext, useEffect } from "react";
import {
    Grid,
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Paper,
    Stack,
    CircularProgress,
    Avatar,
    Chip,
    Divider,
    IconButton,
    Tooltip,
} from "@mui/material";
import { useHistory, useParams } from "react-router-dom";
import {
    Save as SaveIcon,
    SchoolOutlined,
    ArrowBack as ArrowBackIcon,
    PictureAsPdf as PdfIcon,
    CloudUploadOutlined,
    DeleteOutline as DeleteOutlineIcon,
    SwapHorizOutlined,
    InfoOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import FormationContext from "../../context/FormationContext/FormationContext";
import MethodGet from "../../config/Service";

// ─── Constantes de diseño (misma paleta que Login/PendingTask) ───────────────
const PINK = "#FF5C93";
const PINK_DARK = "#E94E88";
const PINK_SOFT = "#FFE6F0";
const PINK_BG = "#FFF5FA";
const PINK_BG_SOFT = "#FFF0F7";
const GRADIENT = "linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)";
const GRADIENT_HOVER = "linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)";

const flexRow = { display: "flex", alignItems: "center", gap: 1 };

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        bgcolor: "#fff",
        transition: "all 0.25s ease",
        "& fieldset": { borderColor: PINK_SOFT },
        "&:hover fieldset": { borderColor: PINK },
        "&.Mui-focused fieldset": { borderColor: PINK, borderWidth: 2 },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: PINK },
};

const primaryBtnSx = {
    py: 1.4,
    borderRadius: 2,
    fontWeight: 700,
    color: "#fff",
    background: GRADIENT,
    boxShadow: "none",
    "&:hover": { background: GRADIENT_HOVER, boxShadow: "none" },
    "&.Mui-disabled": { background: "#F5C6D0", color: "#fff" },
};

const outlineBtnSx = {
    py: 1.4,
    borderRadius: 2,
    fontWeight: 600,
    color: PINK_DARK,
    border: `1px solid ${PINK}`,
    "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
};

// ─── Hook: Convierte URL remota a blob ───────────────────────────────────────
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
            .then((blob) => { objectUrl = URL.createObjectURL(blob); setBlobUrl(objectUrl); })
            .catch(() => setBlobUrl(null))
            .finally(() => setLoadingPdf(false));

        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [url]);

    return { blobUrl, loadingPdf };
};

// ─── Subcomponente: Preview PDF ──────────────────────────────────────────────
const PdfPreview = ({ url, title }) => {
    const { blobUrl, loadingPdf } = usePdfBlobUrl(url);

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 360,
                aspectRatio: "8.5 / 11",
                border: `1px solid ${PINK_SOFT}`,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(255,92,147,0.12)",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {loadingPdf ? (
                <CircularProgress size={28} sx={{ color: PINK }} />
            ) : blobUrl ? (
                <Box
                    component="iframe"
                    src={blobUrl}
                    title={title}
                    sx={{ width: "100%", height: "100%", border: "none", display: "block" }}
                />
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No se pudo cargar el PDF.
                </Typography>
            )}
        </Box>
    );
};

// ─── Subcomponente: Header reutilizable ──────────────────────────────────────
const PageHeader = ({ icon, title, subtitle, onBack }) => (
    <Box
        sx={{
            background: GRADIENT,
            color: "#fff",
            p: { xs: 2.5, sm: 3 },
            gap: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}
    >
        <Stack direction="row" alignItems="center" spacing={2}>
            {onBack && (
                <Tooltip title="Volver">
                    <IconButton
                        onClick={onBack}
                        sx={{
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.15)",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>
            )}
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", width: 48, height: 48 }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={700}>{title}</Typography>
                {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
            </Box>
        </Stack>
    </Box>
);

// ─── Subcomponente: Sección tipo card ────────────────────────────────────────
const Section = ({ icon, title, subtitle, children }) => (
    <Paper
        variant="outlined"
        sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            border: `1px solid ${PINK_SOFT}`,
            bgcolor: "#fff",
        }}
    >
        <Box sx={{ ...flexRow, mb: subtitle ? 0.5 : 2 }}>
            <Avatar sx={{ bgcolor: PINK_BG_SOFT, color: PINK, width: 32, height: 32 }}>
                {icon}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: PINK }}>
                {title}
            </Typography>
        </Box>
        {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, ml: 6 }}>
                {subtitle}
            </Typography>
        )}
        {children}
    </Paper>
);

// ─── Componente principal ────────────────────────────────────────────────────
const AddFormation = () => {
    const history = useHistory();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const { createFormation, updateFormation } = useContext(FormationContext);

    const [formData, setFormData] = useState({ name: "" });
    const [diplomaFile, setDiplomaFile] = useState(null);
    const [diplomaPreview, setDiplomaPreview] = useState(null);
    const [diplomaName, setDiplomaName] = useState("");
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Cargar datos en modo edición ────────────────────────────────────────
    useEffect(() => {
        if (!isEditMode) return;
        const fetchFormation = async () => {
            setLoadingData(true);
            try {
                const res = await MethodGet(`/formations/${id}`);
                const data = res.data?.data || res.data;
                setFormData({ name: data.name || "" });
                if (data.diploma) {
                    setDiplomaPreview(data.diploma);
                    setDiplomaName("Diploma actual");
                }
            } catch {
                Swal.fire("Error", "No se pudo cargar la formación.", "error");
            } finally {
                setLoadingData(false);
            }
        };
        fetchFormation();
    }, [id, isEditMode]);

    // ── Reset en modo creación ─────────────────────────────────────────────
    useEffect(() => {
        if (!isEditMode) {
            setFormData({ name: "" });
            setDiplomaFile(null);
            setDiplomaPreview(null);
            setDiplomaName("");
        }
    }, [isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── Diploma (PDF) ───────────────────────────────────────────────────────
    const handleDiplomaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            Swal.fire({ icon: "error", title: "Archivo inválido", text: "Selecciona un archivo PDF" });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({ icon: "error", title: "Archivo muy grande", text: "El PDF no debe superar los 10MB" });
            return;
        }

        setDiplomaFile(file);
        setDiplomaName(file.name);
        setDiplomaPreview(URL.createObjectURL(file));
    };

    const handleRemoveDiploma = () => {
        setDiplomaFile(null);
        setDiplomaName("");
        setDiplomaPreview(null);
        const input = document.getElementById("diploma-input");
        if (input) input.value = "";
    };

    // ── Validación ──────────────────────────────────────────────────────────
    const validateForm = () => {
        if (!formData.name.trim()) {
            Swal.fire({ icon: "error", title: "Error", text: "El nombre de la formación es obligatorio" });
            return false;
        }
        if (!isEditMode && !diplomaFile) {
            Swal.fire({ icon: "error", title: "Error", text: "Debes subir el PDF del diploma" });
            return false;
        }
        return true;
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", formData.name.trim());
            if (diplomaFile) fd.append("diploma", diplomaFile);

            if (isEditMode) {
                await updateFormation(id, fd);
            } else {
                await createFormation(fd);
            }

            history.push("/formations/list");
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Ocurrió un error al guardar la formación." });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading inicial ─────────────────────────────────────────────────────
    if (isEditMode && loadingData) {
        return (
            <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, sm: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        textAlign: "center",
                        borderRadius: 4,
                        border: `1px solid ${PINK_SOFT}`,
                        bgcolor: PINK_BG,
                    }}
                >
                    <CircularProgress size={36} sx={{ color: PINK, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Cargando datos de la formación...
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${PINK_SOFT}`,
                    boxShadow: "0 8px 24px rgba(255,92,147,0.08)",
                }}
            >
                {/* ── Header ── */}
                <PageHeader
                    icon={<SchoolOutlined />}
                    title={isEditMode ? "Editar formación" : "Crear nueva formación"}
                    subtitle={
                        isEditMode
                            ? "Modifica los campos que deseas actualizar"
                            : "Completa los campos para registrar una nueva formación"
                    }
                    onBack={() => history.goBack()}
                />

                {/* ── Formulario ── */}
                <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {/* ── Nombre ── */}
                            <Section
                                icon={<InfoOutlined fontSize="small" />}
                                title="Datos de la formación"
                            >
                                <TextField
                                    fullWidth
                                    label="Nombre de la formación *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Formación Gel Pro"
                                    helperText="Nombre descriptivo de la formación"
                                    required
                                    sx={fieldSx}
                                />
                            </Section>

                            {/* ── Diploma PDF ── */}
                            <Section
                                icon={<PdfIcon fontSize="small" />}
                                title={`Diploma en PDF${!isEditMode ? " *" : ""}`}
                                subtitle={
                                    isEditMode
                                        ? "Deja en blanco para mantener el diploma actual"
                                        : "PDF que se entregará como diploma de la formación (máx. 10MB)"
                                }
                            >
                                {!diplomaPreview ? (
                                    <Box
                                        onClick={() => document.getElementById("diploma-input").click()}
                                        sx={{
                                            border: `2px dashed ${PINK}`,
                                            borderRadius: 3,
                                            p: { xs: 4, sm: 5 },
                                            textAlign: "center",
                                            cursor: "pointer",
                                            bgcolor: PINK_BG_SOFT,
                                            transition: "all 0.25s ease",
                                            "&:hover": {
                                                bgcolor: PINK_BG,
                                                borderColor: PINK_DARK,
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 8px 24px rgba(255,92,147,0.15)",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: "#fff",
                                                color: PINK,
                                                width: 64,
                                                height: 64,
                                                mx: "auto",
                                                mb: 2,
                                                border: `2px solid ${PINK_SOFT}`,
                                            }}
                                        >
                                            <CloudUploadOutlined sx={{ fontSize: 32 }} />
                                        </Avatar>
                                        <Typography fontWeight={700} gutterBottom sx={{ color: PINK }}>
                                            Haz clic para subir el diploma en PDF
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Solo archivos PDF · Máx. 10 MB
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={2} alignItems="center">
                                        <PdfPreview url={diplomaPreview} title="Vista previa del diploma" />
                                        <Chip
                                            icon={<PdfIcon />}
                                            label={diplomaName}
                                            sx={{
                                                bgcolor: PINK_BG_SOFT,
                                                color: PINK_DARK,
                                                fontWeight: 600,
                                                border: `1px solid ${PINK_SOFT}`,
                                                "& .MuiChip-icon": { color: PINK },
                                                maxWidth: "100%",
                                            }}
                                        />
                                        <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<SwapHorizOutlined />}
                                                onClick={() => document.getElementById("diploma-input").click()}
                                                sx={{
                                                    borderRadius: 2,
                                                    color: PINK_DARK,
                                                    borderColor: PINK,
                                                    "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
                                                }}
                                            >
                                                Cambiar PDF
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteOutlineIcon />}
                                                onClick={handleRemoveDiploma}
                                                sx={{
                                                    borderRadius: 2,
                                                    borderColor: "#EF9A9A",
                                                    color: "#C62828",
                                                    "&:hover": { bgcolor: "#FFEBEE", borderColor: "#C62828" },
                                                }}
                                            >
                                                Eliminar PDF
                                            </Button>
                                        </Stack>
                                    </Stack>
                                )}

                                <input
                                    id="diploma-input"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleDiplomaChange}
                                    sx={{ display: "none" }}
                                />
                            </Section>

                            <Divider sx={{ borderColor: PINK_SOFT }} />

                            {/* ── Botones ── */}
                            <Stack
                                direction={{ xs: "column-reverse", sm: "row" }}
                                spacing={2}
                                justifyContent="flex-end"
                            >
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => history.push("/formations/list")}
                                    disabled={submitting}
                                    sx={outlineBtnSx}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={
                                        submitting
                                            ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                                            : <SaveIcon />
                                    }
                                    disabled={submitting}
                                    sx={{ ...primaryBtnSx, minWidth: 220 }}
                                >
                                    {submitting
                                        ? isEditMode ? "Actualizando..." : "Guardando..."
                                        : isEditMode ? "Actualizar formación" : "Crear formación"}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
};

export default AddFormation;