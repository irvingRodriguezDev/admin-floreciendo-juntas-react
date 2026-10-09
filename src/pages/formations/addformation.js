import React, { useState, useContext, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
    Box, Container, Paper, Stack, TextField, Typography, Button, Avatar, Chip,
    IconButton, Tooltip, CircularProgress, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Swal from "sweetalert2";
import FormationContext from "../../context/FormationContext/FormationContext";
import MethodGet from "../../config/Service";

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

const showError = (text, title = "Error") => Swal.fire({ icon: "error", title, text });

/* PDFs remotos -> blob; blobs locales se usan directo */
const usePdfBlobUrl = (url) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) return setBlobUrl(null);
        if (url.startsWith("blob:")) return setBlobUrl(url);

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
                width: "100%", maxWidth: 380, aspectRatio: "8.5 / 11", bgcolor: "#fff", overflow: "hidden",
                borderRadius: 2, border: `1px solid ${alpha(PINK, 0.25)}`, boxShadow: `0 6px 18px ${alpha(PINK, 0.15)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            {loading ? <CircularProgress size={28} />
                : blobUrl ? <iframe src={blobUrl} title={title} sx={{ width: "100%", height: "100%", border: "none", display: "block" }} />
                    : <Typography variant="body2" color="text.secondary">No se pudo cargar el PDF.</Typography>}
        </Box>
    );
};

const AddFormation = () => {
    const history = useHistory();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const fileInput = useRef(null);

    const { createFormation, updateFormation } = useContext(FormationContext);

    const [name, setName] = useState("");
    const [diplomaFile, setDiplomaFile] = useState(null);
    const [diplomaPreview, setDiplomaPreview] = useState(null);
    const [diplomaName, setDiplomaName] = useState("");
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Cargar datos en modo edición
    useEffect(() => {
        if (!isEditMode) return;
        setLoadingData(true);
        MethodGet(`/formations/${id}`)
            .then((res) => {
                const data = res.data?.data || res.data;
                setName(data.name || "");
                if (data.diploma) {
                    setDiplomaPreview(data.diploma);
                    setDiplomaName("Diploma actual");
                }
            })
            .catch(() => Swal.fire("Error", "No se pudo cargar la formación.", "error"))
            .finally(() => setLoadingData(false));
    }, [id]);

    // Reset en modo creación
    useEffect(() => {
        if (!isEditMode) {
            setName("");
            setDiplomaFile(null);
            setDiplomaPreview(null);
            setDiplomaName("");
        }
    }, [isEditMode]);

    const handleDiplomaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf") return showError("Selecciona un archivo PDF", "Archivo inválido");
        if (file.size > 10 * 1024 * 1024) return showError("El PDF no debe superar los 10MB", "Archivo muy grande");

        setDiplomaFile(file);
        setDiplomaName(file.name);
        setDiplomaPreview(URL.createObjectURL(file));
    };

    const handleRemoveDiploma = () => {
        setDiplomaFile(null);
        setDiplomaName("");
        setDiplomaPreview(null);
        if (fileInput.current) fileInput.current.value = "";
    };

    const validateForm = () => {
        const error =
            (!name.trim() && "El nombre de la formación es obligatorio") ||
            (!isEditMode && !diplomaFile && "Debes subir el PDF del diploma");
        if (error) showError(error);
        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", name.trim());
            if (diplomaFile) fd.append("diploma", diplomaFile);

            isEditMode ? await updateFormation(id, fd) : await createFormation(fd);
            history.push("/formations/list");
        } catch {
            showError("Ocurrió un error al guardar la formación.");
        } finally {
            setSubmitting(false);
        }
    };

    if (isEditMode && loadingData) {
        return (
            <ThemeProvider theme={theme}>
                <Stack alignItems="center" spacing={2} py={10}>
                    <CircularProgress />
                    <Typography color="text.secondary">Cargando datos de la formación...</Typography>
                </Stack>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
                <Container maxWidth="sm" component="form" onSubmit={handleSubmit}>
                    {/* Encabezado */}
                    <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                        <Tooltip title="Volver">
                            <IconButton onClick={() => history.goBack()}>
                                <ArrowBackRoundedIcon />
                            </IconButton>
                        </Tooltip>
                        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
                            <SchoolRoundedIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                            <Typography variant="h5" fontWeight={800}>
                                {isEditMode ? "Editar Formación" : "Crear Nueva Formación"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditMode
                                    ? "Modifica los campos que deseas actualizar"
                                    : "Completa los campos para registrar una nueva formación"}
                            </Typography>
                        </Box>
                        {isEditMode && <Chip label="Edición" color="primary" variant="outlined" />}
                    </Stack>

                    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                        <Stack spacing={4}>
                            <TextField fullWidth required label="Nombre de la formación" value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Formación Gel Pro"
                                helperText="Nombre descriptivo de la formación" />

                            {/* Diploma */}
                            <Box>
                                <Typography fontWeight={700}>Diploma en PDF{!isEditMode && " *"}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    {isEditMode
                                        ? "Deja en blanco para mantener el diploma actual"
                                        : "PDF que se entregará como diploma de la formación (máx. 10MB)"}
                                </Typography>

                                <input ref={fileInput} hidden type="file" accept="application/pdf" onChange={handleDiplomaChange} />

                                {!diplomaPreview ? (
                                    <Box
                                        onClick={() => fileInput.current.click()}
                                        sx={{
                                            p: 5, textAlign: "center", cursor: "pointer", borderRadius: 3,
                                            border: `2px dashed ${alpha(PINK, 0.5)}`, bgcolor: alpha(PINK, 0.04), transition: ".2s",
                                            "&:hover": { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
                                        }}
                                    >
                                        <PictureAsPdfRoundedIcon color="primary" sx={{ fontSize: 52, mb: 1 }} />
                                        <Typography fontWeight={600}>Haz clic para subir el diploma en PDF</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Solo archivos PDF (máx. 10MB)
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack alignItems="center" spacing={2}>
                                        <PdfPreview url={diplomaPreview} title="Vista previa del diploma" />
                                        <Typography variant="caption" color="text.secondary">{diplomaName}</Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button variant="outlined" size="small" onClick={() => fileInput.current.click()}>
                                                Cambiar PDF
                                            </Button>
                                            <Button variant="outlined" color="error" size="small" onClick={handleRemoveDiploma}>
                                                Eliminar PDF
                                            </Button>
                                        </Stack>
                                    </Stack>
                                )}
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Acciones */}
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" size="large" disabled={submitting} sx={{ minWidth: 140 }}
                            onClick={() => history.push("/formations/list")}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" size="large" disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={18} color="inherit" thickness={5} /> : <SaveRoundedIcon />}
                            sx={{ minWidth: 220, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
                            {submitting
                                ? isEditMode ? "Actualizando..." : "Guardando..."
                                : isEditMode ? "Actualizar Formación" : "Crear Formación"}
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AddFormation;