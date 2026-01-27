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
} from "@mui/material";
import { useHistory, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import {
    CloudUpload as CloudUploadIcon,
    Save as SaveIcon,
} from "@mui/icons-material";
import { Typography as MuiTypography } from "@mui/material";
import Swal from "sweetalert2";
import LiveContext from "../../context/LiveContext/LiveContext";

const AddLive = () => {
    const initialFormData = {
        title: "",
        description: "",
        start_time: "",
        is_private: false,
    };

    const history = useHistory();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const {
        crearLive,
        actualizarLive,
        obtenerLivePorId,
        liveActual,
        limpiarLiveActual,
        cargando,
    } = useContext(LiveContext);

    const [formData, setFormData] = useState(initialFormData);

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    /** 🔹 CARGAR DATOS EN MODO EDICIÓN **/
    useEffect(() => {
        if (isEditMode) obtenerLivePorId(id);

        return () => limpiarLiveActual();
    }, [id]);

    /** 🔹 Cuando lleguen los datos, llenar el formulario **/
    useEffect(() => {
        if (isEditMode && liveActual && Object.keys(liveActual).length > 0) {
            setFormData({
                title: liveActual.title || "",
                description: liveActual.description || "",
                start_time: liveActual.start_time
                    ? formatDateTimeForInput(liveActual.start_time)
                    : "",
                is_private: !!liveActual.is_private,
            });

            if (liveActual.thumbnail_url) {
                setPreviewUrl(liveActual.thumbnail_url);
            }
        }
    }, [liveActual]);

    useEffect(() => {
        if (!isEditMode) {
            setFormData(initialFormData);
            setFile(null);
            setPreviewUrl(null);
            limpiarLiveActual(); // extra seguridad
        }
    }, [isEditMode]);


    const formatDateTimeForInput = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);

        const pad = (n) => n.toString().padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hour}:${minute}`;
    };


    /** 🔹 FORM HANDLERS **/
    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "is_private" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            Swal.fire({ icon: "error", title: "Archivo inválido", text: "Selecciona una imagen" });
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            Swal.fire({ icon: "error", title: "Archivo muy grande", text: "Máximo 5MB" });
            return;
        }

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreviewUrl(isEditMode ? liveActual?.thumbnail_url || null : null);
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            Swal.fire({ icon: "error", title: "Error", text: "El título es obligatorio" });
            return false;
        }
        if (!formData.description.trim()) {
            Swal.fire({ icon: "error", title: "Error", text: "La descripción es obligatoria" });
            return false;
        }
        if (!formData.start_time) {
            Swal.fire({ icon: "error", title: "Error", text: "La fecha de inicio es obligatoria" });
            return false;
        }
        if (!isEditMode && !file) {
            Swal.fire({ icon: "error", title: "Error", text: "Debes subir una imagen" });
            return false;
        }

        return true;
    };

    // 🔹 Configuración de React Quill
    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{
                color: [
                    '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#efefef', '#ffffff', // Neutros (7)
                    '#e60000', '#ff6600', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', // Vivos (7)
                    '#fa9c9c', '#ffdd99', '#ffff99', '#b3d9b3', '#99ccff', '#cc99ff', '#FF5C93', // Pastel y acento (7)
                    '#00b8e6', '#00cccc', '#20b2aa', '#1e90ff', '#1f3e7a', '#0a0a2a', '#4b0082', // Azules y fríos (7)
                    '#800000', '#cc3300', '#996600', '#666600', '#4d4d00', '#330000', '#808000', // Oscuros y tierra (7)
                    '#ffc0cb', '#f08080', '#ffa07a', '#ffb6c1', '#f0e68c', '#bdb76b', '#dda0dd'  // Otros pasteles (7)
                ]
            }, {
                background: [
                    '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#efefef', '#ffffff',
                    '#e60000', '#ff6600', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
                    '#fa9c9c', '#ffdd99', '#ffff99', '#b3d9b3', '#99ccff', '#cc99ff', '#FF5C93',
                    '#00b8e6', '#00cccc', '#20b2aa', '#1e90ff', '#1f3e7a', '#0a0a2a', '#4b0082',
                    '#800000', '#cc3300', '#996600', '#666600', '#4d4d00', '#330000', '#808000',
                    '#ffc0cb', '#f08080', '#ffa07a', '#ffb6c1', '#f0e68c', '#bdb76b', '#dda0dd'
                ]
            }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'clean'],
        ],
    };

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background', 'list', 'bullet', 'align', 'link'
    ];

    const handleDescriptionChange = (content) => {
        setFormData((prev) => ({ ...prev, description: content }));
    };

    /** 🔹 SUBMIT **/
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("start_time", formData.start_time);
            fd.append("is_private", formData.is_private);

            if (file) fd.append("file", file);

            const success = isEditMode
                ? await actualizarLive(id, fd)
                : await crearLive(fd);

            if (success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: isEditMode ? "Live actualizado" : "Live creado",
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => history.push("/lives/live_playlist"));
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error. Intenta nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    /** 🔹 LOADER CORREGIDO **/
    if (isEditMode && cargando && !liveActual) {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: "center" }}>
                        <MuiTypography variant="h6">Cargando datos del live...</MuiTypography>
                    </Paper>
                </Grid>
            </Grid>
        );
    }

    /** 🔹 FORMULARIO **/
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
                    <MuiTypography variant="h4" fontWeight={600}>
                        {isEditMode ? "Editar Live" : "Crear Nuevo Live"}
                    </MuiTypography>
                    <br />

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>

                            {/* TÍTULO */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Título del Live"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* DESCRIPCIÓN */}
                            <Grid item xs={12}>
                                <Typography sx={{ mt: 2, mb: 1, fontWeight: 500 }}>Descripción del Live</Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#fffefc' }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.description}
                                        onChange={handleDescriptionChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        style={{ minHeight: 250 }}
                                    />
                                </Paper>
                            </Grid>

                            {/* FECHA */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="datetime-local"
                                    label="Fecha y Hora de Inicio"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* PRIVADO */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.is_private}
                                                onChange={handleChange}
                                                name="is_private"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <MuiTypography fontWeight={600}>Live Privado</MuiTypography>
                                                <MuiTypography variant="caption" color="text.secondary">
                                                    Solo usuarios específicos podrán verlo
                                                </MuiTypography>
                                            </Box>
                                        }
                                    />
                                </Card>
                            </Grid>

                            {/* IMAGEN */}
                            <Grid item xs={12}>
                                <Card sx={{ p: 3 }}>
                                    <MuiTypography variant="h6" mb={2}>
                                        Imagen de portada {isEditMode && "(Opcional)"}
                                    </MuiTypography>

                                    {!previewUrl ? (
                                        <Box
                                            sx={{
                                                border: "2px dashed rgba(0,0,0,0.3)",
                                                p: 4,
                                                textAlign: "center",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => document.getElementById("file-input").click()}
                                        >
                                            <CloudUploadIcon sx={{ fontSize: 60, mb: 2 }} />
                                            <MuiTypography fontWeight={600}>
                                                Haz clic para subir una imagen
                                            </MuiTypography>
                                            <MuiTypography variant="caption">
                                                PNG, JPG o JPEG (máx. 5MB)
                                            </MuiTypography>

                                            <input
                                                id="file-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar src={previewUrl} variant="rounded" sx={{ width: 100, height: 100 }} />
                                            <Box flex={1}>
                                                <MuiTypography fontWeight={600}>
                                                    {file ? file.name : "Imagen actual"}
                                                </MuiTypography>
                                            </Box>

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={handleRemoveFile}
                                            >
                                                {file ? "Eliminar" : "Quitar"}
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => document.getElementById("file-input").click()}
                                            >
                                                Cambiar imagen
                                            </Button>

                                            <input
                                                id="file-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: "none" }}
                                            />
                                        </Box>
                                    )}
                                </Card>
                            </Grid>

                            {/* BOTONES */}
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={2}>
                                    <Button variant="outlined" onClick={() => history.goBack()}>
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? (isEditMode ? "Actualizando..." : "Guardando...")
                                            : (isEditMode ? "Actualizar Live" : "Crear Live")}
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

export default AddLive;
