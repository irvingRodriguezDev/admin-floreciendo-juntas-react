import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Button,
    MenuItem,
} from "@mui/material";
import Swal from "sweetalert2";
import UserContext from "../../../../context/UserContext/UserContext";

const UserAdd = ({ onCancel }) => {
    const { addUser } = useContext(UserContext);
    const history = useHistory();
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        roleId: "",
        profileImage: null,
    });

    // 🔹 Cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Imagen de perfil
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm((prev) => ({ ...prev, profileImage: file }));

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    // 🔹 Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password || !form.roleId) {
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        formData.append("password", form.password);
        formData.append("roleId", form.roleId);
        if (form.profileImage) formData.append("profileImage", form.profileImage);

        try {
            setLoading(true);
            await addUser(formData);

            // Resetear formulario
            setForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                roleId: "",
                profileImage: null,
            });
            setPreview(null);

            if (onCancel) onCancel();
            else history.push("/users/list");
        } catch (error) {
            console.error("Error al crear usuario:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        Agregar nuevo usuario
                    </Typography>

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <Grid container spacing={3}>
                            {/* Nombre */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Nombre completo"
                                    name="name"
                                    fullWidth
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Correo */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Correo electrónico"
                                    name="email"
                                    type="email"
                                    fullWidth
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Teléfono */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Teléfono"
                                    name="phone"
                                    fullWidth
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Contraseña */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Contraseña"
                                    name="password"
                                    type="password"
                                    fullWidth
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </Grid>

                            {/* Rol fijo (1-5) */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    label="Rol del usuario"
                                    name="roleId"
                                    fullWidth
                                    required
                                    value={form.roleId}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">Seleccionar rol</MenuItem>
                                    {/* <MenuItem value={1}>Administrador</MenuItem> */}
                                    {/* <MenuItem value={2}>Gerente</MenuItem>
                                    <MenuItem value={3}>Supervisor</MenuItem> */}
                                    {/* <MenuItem value={4}>Cliente</MenuItem> */}
                                    <MenuItem value={5}>Escaneador</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Imagen de perfil */}
                            <Grid item xs={12} sm={6}>
                                <Button variant="contained" component="label" fullWidth>
                                    Subir imagen de perfil
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </Button>

                                {preview && (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: 250,
                                            mt: 2,
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            border: "1px solid #ccc",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={preview}
                                            alt="Vista previa"
                                            sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                            {/* Botón Guardar */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    Guardar usuario
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UserAdd;
