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
} from "@mui/material";
import { useHistory, useParams } from "react-router-dom";
import {
    Save as SaveIcon,
    SchoolOutlined,
    ArrowBack as ArrowBackIcon,
    PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import FormationContext from "../../context/FormationContext/FormationContext";
import MethodGet from "../../config/Service";

/* ================================
   HOOK: Convierte URL remota a blob
================================= */
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

/* ============================
   COMPONENTE: Preview PDF
============================= */
const PdfPreview = ({ url, title }) => {
    const { blobUrl, loadingPdf } = usePdfBlobUrl(url);

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 380,
                aspectRatio: "8.5 / 11",
                border: "1px solid #ddd",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {loadingPdf ? (
                <CircularProgress size={28} />
            ) : blobUrl ? (
                <iframe
                    src={blobUrl}
                    title={title}
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                />
            ) : (
                <Typography variant="body2" color="text.secondary">
                    No se pudo cargar el PDF.
                </Typography>
            )}
        </Box>
    );
};

/* ============================
   COMPONENTE PRINCIPAL
============================= */
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

    /* ── Cargar datos en modo edición ─────────────────────────────────────── */
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
    }, [id]);

    /* ── Reset en modo creación ───────────────────────────────────────────── */
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

    /* ── Diploma (PDF) ────────────────────────────────────────────────────── */
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
        document.getElementById("diploma-input").value = "";
    };

    /* ── Validación ───────────────────────────────────────────────────────── */
    const validateForm = () => {
        if (!formData.name.trim()) {
            Swal.fire({ icon: "error", title: "Error", text: "El nombre de la formación es obligatorio" });
            return false;
        }
        // if (!isEditMode && !diplomaFile) {
        //     Swal.fire({ icon: "error", title: "Error", text: "Debes subir el PDF del diploma" });
        //     return false;
        // }
        return true;
    };

    /* ── Submit ───────────────────────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", formData.name.trim());
            // if (diplomaFile) fd.append("diploma", diplomaFile);

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

    /* ── Loading inicial ──────────────────────────────────────────────────── */
    if (isEditMode && loadingData) {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
                        <CircularProgress size={32} sx={{ mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Cargando datos de la formación...
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        background:
                            "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
                        border: "1px solid rgba(200,200,200,0.3)",
                    }}
                >
                    {/* Encabezado */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => history.goBack()}
                            sx={{ minWidth: 0, p: 0.5, mr: 1 }}
                            color="inherit"
                        />
                        <SchoolOutlined color="primary" sx={{ fontSize: 28 }} />
                        <Typography variant="h5" fontWeight={700}>
                            {isEditMode ? "Editar Formación" : "Crear Nueva Formación"}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, ml: 6 }}>
                        {isEditMode
                            ? "Modifica los campos que deseas actualizar"
                            : "Completa los campos para registrar una nueva formación"}
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>

                            {/* NOMBRE */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre de la Formación *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Formación Gel Pro"
                                    helperText="Nombre descriptivo de la formación"
                                    required
                                />
                            </Grid>

                            {/* DIPLOMA (PDF) */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                                    Diploma en PDF {!isEditMode && "*"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    {isEditMode
                                        ? "Deja en blanco para mantener el diploma actual"
                                        : "PDF que se entregará como diploma de la formación (máx. 10MB)"}
                                </Typography>

                                <Card sx={{ p: 3, backgroundColor: "#f8f9fa" }}>
                                    {!diplomaPreview ? (
                                        <Box
                                            sx={{
                                                border: "2px dashed rgba(25, 118, 210, 0.3)",
                                                borderRadius: 2,
                                                p: 5,
                                                textAlign: "center",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    borderColor: "primary.main",
                                                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                                                },
                                            }}
                                            onClick={() => document.getElementById("diploma-input").click()}
                                        >
                                            <PdfIcon sx={{ fontSize: 56, mb: 1.5, color: "primary.light" }} />
                                            <Typography fontWeight={600} gutterBottom>
                                                Haz clic para subir el diploma en PDF
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Solo archivos PDF (máx. 10MB)
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Stack spacing={2} alignItems="center">
                                            <PdfPreview url={diplomaPreview} title="Vista previa del diploma" />
                                            <Typography variant="caption" color="text.secondary">
                                                {diplomaName}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={handleRemoveDiploma}
                                                >
                                                    Eliminar PDF
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => document.getElementById("diploma-input").click()}
                                                >
                                                    Cambiar PDF
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    )}

                                    <input
                                        id="diploma-input"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleDiplomaChange}
                                        style={{ display: "none" }}
                                    />
                                </Card>
                            </Grid>

                            {/* BOTONES */}
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => history.push("/formations/list")}
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={
                                            submitting
                                                ? <CircularProgress size={18} color="inherit" />
                                                : <SaveIcon />
                                        }
                                        disabled={submitting}
                                        sx={{ minWidth: 220 }}
                                    >
                                        {submitting
                                            ? isEditMode ? "Actualizando..." : "Guardando..."
                                            : isEditMode ? "Actualizar Formación" : "Crear Formación"}
                                    </Button>
                                </Box>
                            </Grid>

                        </Grid>
                    </form>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AddFormation;