import React, { useState, useContext, useEffect } from "react";
import {
    Grid,
    Box,
    Card,
    TextField,
    Button,
    FormControlLabel,
    Typography,
    Paper,
    Avatar,
    Checkbox,
    Stack,
    CircularProgress,
} from "@mui/material";
import { useHistory, useParams } from "react-router-dom";
import {
    CloudUpload as CloudUploadIcon,
    Save as SaveIcon,
    PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { Typography as MuiTypography } from "@mui/material";
import Swal from "sweetalert2";
import CertificationContext from "../../context/CertificationContext/CertificationContext";
import { PDFDocument } from "pdf-lib";

/* ================================
   HOOK: Convierte URL remota a blob
================================= */
const usePdfBlobUrl = (url) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    useEffect(() => {
        if (!url) {
            setBlobUrl(null);
            return;
        }

        if (url.startsWith('blob:')) {
            setBlobUrl(url);
            return;
        }

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

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
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
                width: '100%',
                maxWidth: 420,
                aspectRatio: '8.5 / 11',
                border: '1px solid #ddd',
                borderRadius: 1,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                bgcolor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {loadingPdf ? (
                <CircularProgress size={28} />
            ) : blobUrl ? (
                <iframe
                    src={blobUrl}
                    title={title}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
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
const AddCertificate = ({ onCancel }) => {
    const initialFormData = {
        name: "",
        start_date: "",
        end_date: "",
        min_passing_score: "",
        max_passing_score: "",
        is_active: true,
    };

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

    const [formData, setFormData] = useState(initialFormData);

    // --- IMAGEN ---
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --- PDF ---
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [pdfName, setPdfName] = useState("");

    const [submitting, setSubmitting] = useState(false);

    /** CARGAR DATOS EN MODO EDICIÓN **/
    useEffect(() => {
        if (isEditMode) {
            getCertificationById(id);
        }
    }, [id]);

    useEffect(() => {
        if (isEditMode && certificationActual && Object.keys(certificationActual).length > 0) {
            setFormData({
                name: certificationActual.certification.name || "",
                start_date: certificationActual.certification.start_date
                    ? formatDateForInput(certificationActual.certification.start_date)
                    : "",
                end_date: certificationActual.certification.end_date
                    ? formatDateForInput(certificationActual.certification.end_date)
                    : "",
                min_passing_score: certificationActual.certification.min_passing_score || "",
                max_passing_score: certificationActual.certification.max_passing_score || "",
                is_active: certificationActual.certification.is_active !== undefined
                    ? certificationActual.certification.is_active
                    : true,
            });

            if (certificationActual.image) {
                setImagePreview(certificationActual.image);
            }
            if (certificationActual.certificate) {
                setPdfPreview(certificationActual.certificate);
                setPdfName("Certificado actual");
            }
        }
    }, [certificationActual]);

    useEffect(() => {
        if (!isEditMode) {
            setFormData(initialFormData);
            setImageFile(null);
            setImagePreview(null);
            setPdfFile(null);
            setPdfPreview(null);
            setPdfName("");
        }
    }, [isEditMode]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d+$/.test(value)) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // --- HANDLERS IMAGEN ---
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            Swal.fire({ icon: "error", title: "Archivo inválido", text: "Selecciona una imagen (PNG, JPG o JPEG)" });
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            Swal.fire({ icon: "error", title: "Archivo muy grande", text: "La imagen no debe superar los 5MB" });
            return;
        }

        setImageFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(isEditMode ? certificationActual?.image || null : null);
    };

    // --- HANDLERS PDF ---
    const handlePdfChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            Swal.fire({ icon: "error", title: "Archivo inválido", text: "Selecciona un archivo PDF" });
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            Swal.fire({ icon: "error", title: "Archivo muy grande", text: "El PDF no debe superar los 10MB" });
            return;
        }

        try {
            const buffer = await selectedFile.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            const { width, height } = pdf.getPage(0).getSize();

            const expectedWidth = 2550.83;
            const expectedHeight = 3300.66;
            const tolerance = 5;

            if (
                Math.abs(width - expectedWidth) > tolerance ||
                Math.abs(height - expectedHeight) > tolerance
            ) {
                Swal.fire({
                    icon: "error",
                    title: "Medidas incorrectas",
                    text: "El certificado debe tener tamaño vertical 89.96 × 116.42 cm.",
                });
                e.target.value = "";
                return;
            }

            setPdfFile(selectedFile);
            setPdfName(selectedFile.name);
            setPdfPreview(URL.createObjectURL(selectedFile));

        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo leer el PDF" });
        }
    };

    const handleRemovePdf = () => {
        setPdfFile(null);
        setPdfName("");
        setPdfPreview(isEditMode ? certificationActual?.certificate || null : null);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            Swal.fire({ icon: "error", title: "Error", text: "El nombre de la certificación es obligatorio" });
            return false;
        }
        if (!formData.start_date) {
            Swal.fire({ icon: "error", title: "Error", text: "La fecha de inicio es obligatoria" });
            return false;
        }
        if (!formData.end_date) {
            Swal.fire({ icon: "error", title: "Error", text: "La fecha de fin es obligatoria" });
            return false;
        }
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            Swal.fire({ icon: "error", title: "Error", text: "La fecha de fin debe ser posterior a la fecha de inicio" });
            return false;
        }
        if (!formData.min_passing_score) {
            Swal.fire({ icon: "error", title: "Error", text: "La puntuación mínima para aprobar es obligatoria" });
            return false;
        }
        if (!formData.max_passing_score) {
            Swal.fire({ icon: "error", title: "Error", text: "La puntuación máxima es obligatoria" });
            return false;
        }
        if (parseInt(formData.min_passing_score) > parseInt(formData.max_passing_score)) {
            Swal.fire({ icon: "error", title: "Error", text: "La puntuación mínima no puede ser mayor que la puntuación máxima" });
            return false;
        }
        if (!isEditMode && !imageFile) {
            Swal.fire({ icon: "error", title: "Error", text: "Debes subir una imagen para la certificación" });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("start_date", formData.start_date);
            fd.append("end_date", formData.end_date);
            fd.append("min_passing_score", formData.min_passing_score);
            fd.append("max_passing_score", formData.max_passing_score);
            fd.append("is_active", formData.is_active);
            if (imageFile) fd.append("image", imageFile);
            if (pdfFile) fd.append("certificate", pdfFile);

            if (isEditMode) {
                await updateCertification(id, fd);
            } else {
                await createCertification(fd);
            }

            history.push("/certifications/list");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error al guardar la certificación. Intenta nuevamente.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (isEditMode && loading && !certificationActual) {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                        <MuiTypography variant="h6">Cargando datos de la certificación...</MuiTypography>
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
                        background: "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
                        border: "1px solid rgba(200,200,200,0.3)",
                    }}
                >
                    <MuiTypography variant="h4" fontWeight={600} gutterBottom>
                        {isEditMode ? "Editar Certificación" : "Crear Nueva Certificación"}
                    </MuiTypography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Complete todos los campos requeridos para {isEditMode ? "actualizar la" : "crear una nueva"} certificación
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>

                            {/* NOMBRE */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nombre de la Certificación *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: Certificación en Desarrollo Web"
                                    helperText="Nombre descriptivo de la certificación"
                                    required
                                />
                            </Grid>

                            {/* FECHAS */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Fecha de Inicio *"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    helperText="Fecha desde cuando estará disponible"
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Fecha de Fin *"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    helperText="Fecha hasta cuando estará disponible"
                                    required
                                />
                            </Grid>

                            {/* PUNTUACIONES */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Puntuación Mínima para Aprobar *"
                                    name="min_passing_score"
                                    value={formData.min_passing_score}
                                    onChange={handleNumberChange}
                                    placeholder="Ej: 70"
                                    helperText="Puntaje mínimo requerido para aprobar"
                                    inputProps={{ min: 0, pattern: "\\d*" }}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Puntuación Máxima *"
                                    name="max_passing_score"
                                    value={formData.max_passing_score}
                                    onChange={handleNumberChange}
                                    placeholder="Ej: 100"
                                    helperText="Puntaje máximo posible"
                                    inputProps={{ min: 0, pattern: "\\d*" }}
                                    required
                                />
                            </Grid>

                            {/* ESTADO ACTIVO */}
                            <Grid item xs={12}>
                                <Card sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                                name="is_active"
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <MuiTypography fontWeight={600}>Certificación Activa</MuiTypography>
                                                <MuiTypography variant="caption" color="text.secondary">
                                                    Si está activa, los usuarios podrán ver y obtener esta certificación
                                                </MuiTypography>
                                            </Box>
                                        }
                                    />
                                </Card>
                            </Grid>

                            {/* IMAGEN */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                                    Imagen de la Certificación {!isEditMode && "*"}
                                </Typography>

                                <Card sx={{ p: 3, backgroundColor: "#f8f9fa" }}>
                                    {!imagePreview ? (
                                        <Box
                                            sx={{
                                                border: "2px dashed rgba(0,0,0,0.2)",
                                                borderRadius: 2,
                                                p: 4,
                                                textAlign: "center",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    borderColor: "primary.main",
                                                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                                                },
                                            }}
                                            onClick={() => document.getElementById("image-input").click()}
                                        >
                                            <CloudUploadIcon sx={{ fontSize: 60, mb: 2, color: "text.secondary" }} />
                                            <Typography fontWeight={600} gutterBottom>
                                                Haz clic para subir una imagen
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                PNG, JPG o JPEG (máx. 5MB)
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                Recomendado: 800×600 píxeles
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
                                            <Avatar
                                                src={imagePreview}
                                                variant="rounded"
                                                sx={{
                                                    width: { xs: "100%", sm: 150 },
                                                    height: { xs: 200, sm: 150 },
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <Stack direction="row" spacing={2}>
                                                <Button variant="outlined" color="error" size="medium" onClick={handleRemoveImage}>
                                                    {imageFile ? "Eliminar" : "Quitar imagen"}
                                                </Button>
                                                <Button variant="outlined" size="medium" onClick={() => document.getElementById("image-input").click()}>
                                                    Cambiar imagen
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    )}
                                    <input
                                        id="image-input"
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleImageChange}
                                        style={{ display: "none" }}
                                    />
                                </Card>
                            </Grid>

                            {/* PDF */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                                    Certificado en PDF
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    Opcional — tamaño carta vertical (8.5 × 11 in)
                                </Typography>

                                <Card sx={{ p: 3, backgroundColor: "#f8f9fa" }}>
                                    {!pdfPreview ? (
                                        <Box
                                            sx={{
                                                border: "2px dashed rgba(211, 47, 47, 0.3)",
                                                borderRadius: 2,
                                                p: 4,
                                                textAlign: "center",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    borderColor: "error.main",
                                                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                                                },
                                            }}
                                            onClick={() => document.getElementById("pdf-input").click()}
                                        >
                                            <PdfIcon sx={{ fontSize: 60, mb: 2, color: "error.light" }} />
                                            <Typography fontWeight={600} gutterBottom>
                                                Haz clic para subir el PDF del certificado
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Solo archivos PDF (máx. 10MB)
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Stack spacing={2} alignItems="center">
                                            {/* ✅ Reemplazado por PdfPreview */}
                                            <PdfPreview url={pdfPreview} title="Vista previa del certificado PDF" />
                                            <Typography variant="caption" color="text.secondary">
                                                {pdfName}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Button variant="outlined" color="error" size="medium" onClick={handleRemovePdf}>
                                                    Eliminar PDF
                                                </Button>
                                                <Button variant="outlined" size="medium" onClick={() => document.getElementById("pdf-input").click()}>
                                                    Cambiar PDF
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    )}
                                    <input
                                        id="pdf-input"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfChange}
                                        style={{ display: "none" }}
                                    />
                                </Card>
                            </Grid>

                            {/* BOTONES */}
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => (onCancel ? onCancel() : history.push("/certifications/list"))}
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={<SaveIcon />}
                                        disabled={submitting}
                                        sx={{ minWidth: 200 }}
                                    >
                                        {submitting
                                            ? (isEditMode ? "Actualizando..." : "Guardando...")
                                            : (isEditMode ? "Actualizar Certificación" : "Crear Certificación")}
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

export default AddCertificate;