import React, { useContext, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    Box, Container, Paper, Grid, Stack, TextField, Typography, Button, MenuItem,
    Avatar, IconButton, Tooltip, CircularProgress, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Swal from "sweetalert2";
import UserContext from "../../../../context/UserContext/UserContext";

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

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", roleId: "", profileImage: null };

const ROLES = [
    { id: 3, label: "Evaluador" },
    { id: 5, label: "Escaneador" },
    { id: 6, label: "Administrador de Lives" },
];

const REQUIRED = [
    ["name", "Nombre requerido", "Ingresa el nombre completo del usuario."],
    ["email", "Correo requerido", "Ingresa el correo electrónico."],
    ["password", "Contraseña requerida", "Ingresa una contraseña para el usuario."],
    ["roleId", "Rol requerido", "Selecciona el rol del usuario."],
];

const UserAdd = ({ onCancel }) => {
    const { addUser } = useContext(UserContext);
    const history = useHistory();
    const fileInput = useRef(null);

    const [form, setForm] = useState(EMPTY_FORM);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const goBack = () => (onCancel ? onCancel() : history.push("/users/list"));
    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const invalid =
            (!file.type.startsWith("image/") && ["Archivo inválido", "Selecciona una imagen PNG, JPG o JPEG."]) ||
            (file.size > 5 * 1024 * 1024 && ["Archivo muy grande", "La imagen no puede superar los 5MB."]);

        if (invalid) {
            Swal.fire({ icon: "error", title: invalid[0], text: invalid[1] });
            e.target.value = "";
            return;
        }

        setForm((p) => ({ ...p, profileImage: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setForm((p) => ({ ...p, profileImage: null }));
        setPreview(null);
        if (fileInput.current) fileInput.current.value = "";
    };

    const validateForm = () => {
        const missing = REQUIRED.find(([key]) => !String(form[key]).trim());
        if (missing) Swal.fire({ icon: "warning", title: missing[1], text: missing[2] });
        return !missing;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        ["name", "email", "phone", "password", "roleId"].forEach((k) => formData.append(k, form[k]));
        if (form.profileImage) formData.append("profileImage", form.profileImage);

        try {
            setLoading(true);
            await addUser(formData);

            Swal.fire({
                icon: "success",
                title: "¡Usuario creado!",
                text: "El usuario se creó correctamente.",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                setForm(EMPTY_FORM);
                setPreview(null);
                goBack();
            });
        } catch (error) {
            console.error("Error al crear usuario:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.response?.data?.message || "No se pudo crear el usuario. Intenta nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
                <Container maxWidth="md" component="form" onSubmit={handleSubmit} encType="multipart/form-data">
                    {/* Encabezado */}
                    <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                        <Tooltip title="Volver">
                            <IconButton onClick={() => (onCancel ? onCancel() : history.goBack())}>
                                <ArrowBackRoundedIcon />
                            </IconButton>
                        </Tooltip>
                        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
                            <PersonAddRoundedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={800}>Nuevo usuario</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Completa los datos para crear un nuevo usuario
                            </Typography>
                        </Box>
                    </Stack>

                    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                        <Grid container spacing={4}>
                            {/* Datos */}
                            <Grid item xs={12} md={7}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField label="Nombre completo" name="name" fullWidth required
                                            placeholder="Ej. Juan Pérez" value={form.name} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField label="Correo electrónico" name="email" type="email" fullWidth required
                                            placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Teléfono" name="phone" fullWidth
                                            placeholder="Ej. 555 123 4567" value={form.phone} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Contraseña" name="password" type="password" fullWidth required
                                            value={form.password} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField select label="Rol del usuario" name="roleId" fullWidth required
                                            value={form.roleId} onChange={handleChange}
                                            helperText="El rol determina las funciones disponibles para el usuario">
                                            <MenuItem value="">Seleccionar rol</MenuItem>
                                            {ROLES.map((r) => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Imagen de perfil */}
                            <Grid item xs={12} md={5}>
                                <Typography fontWeight={700}>Imagen de perfil</Typography>
                                <Typography variant="caption" color="text.secondary">PNG, JPG o JPEG · Máx. 5 MB</Typography>

                                <input ref={fileInput} hidden type="file" accept="image/*" onChange={handleImageChange} />

                                {preview ? (
                                    <Stack alignItems="center" spacing={2} mt={2}>
                                        <Avatar src={preview} alt="Vista previa del perfil"
                                            sx={{ width: 160, height: 160, border: `3px solid ${alpha(PINK, 0.4)}` }} />
                                        <Stack direction="row" spacing={1}>
                                            <Button variant="outlined" size="small" startIcon={<SwapHorizRoundedIcon />}
                                                onClick={() => fileInput.current.click()}>
                                                Cambiar
                                            </Button>
                                            <Button variant="outlined" color="error" size="small"
                                                startIcon={<DeleteOutlineRoundedIcon />} onClick={handleRemoveImage}>
                                                Eliminar
                                            </Button>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Box
                                        onClick={() => fileInput.current.click()}
                                        sx={{
                                            mt: 2, p: 4, textAlign: "center", cursor: "pointer", borderRadius: 3,
                                            border: `2px dashed ${alpha(PINK, 0.5)}`, bgcolor: alpha(PINK, 0.04), transition: ".2s",
                                            "&:hover": { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
                                        }}
                                    >
                                        <Avatar sx={{ mx: "auto", mb: 1.5, width: 64, height: 64, bgcolor: alpha(PINK, 0.15), color: PINK }}>
                                            <PersonRoundedIcon fontSize="large" />
                                        </Avatar>
                                        <CloudUploadRoundedIcon color="primary" />
                                        <Typography fontWeight={600}>Haz clic para subir la imagen</Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Acciones */}
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" size="large" onClick={goBack} disabled={loading} sx={{ minWidth: 140 }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" size="large" disabled={loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" thickness={5} /> : <SaveRoundedIcon />}
                            sx={{ minWidth: 200, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
                            {loading ? "Guardando..." : "Guardar usuario"}
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default UserAdd;