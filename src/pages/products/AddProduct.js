import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box, Container, Paper, Grid, Stack, TextField, Typography, Button, Avatar,
    Chip, CircularProgress, InputAdornment, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Swal from "sweetalert2";
import ProductContext from "../../context/ProductContext/ProductContext";

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

const EMPTY_FORM = { name: "", description: "", price: "", stock: "", image: null };

const AddProduct = ({ onCancel }) => {
    const { id } = useParams();
    const history = useHistory();
    const { addProduct, updateProduct, obtenerProductPorId } = useContext(ProductContext);

    const [form, setForm] = useState(EMPTY_FORM);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const goBack = () => (onCancel ? onCancel() : history.push("/product/list"));
    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    // Cargar producto al editar / limpiar al crear
    useEffect(() => {
        if (!id) {
            setForm(EMPTY_FORM);
            setPreview(null);
            return;
        }
        setLoading(true);
        obtenerProductPorId(id)
            .then(({ product }) => {
                if (!product) {
                    Swal.fire({ icon: "error", title: "Producto no encontrado" });
                    return history.push("/products");
                }
                setForm({
                    name: product.name ?? "",
                    description: product.description ?? "",
                    price: product.price ?? "",
                    stock: product.stock ?? "",
                    image: null,
                });
                setPreview(product.image ?? null);
            })
            .catch((error) => console.error("Error al obtener producto:", error))
            .finally(() => setLoading(false));
    }, [id, history, obtenerProductPorId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setForm((p) => ({ ...p, image: file }));
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        ["name", "description", "price", "stock"].forEach((k) => formData.append(k, form[k]));
        if (form.image) formData.append("image", form.image);

        try {
            if (id) {
                await updateProduct(id, formData);
            } else {
                await addProduct(formData);
                setForm(EMPTY_FORM);
                setPreview(null);
            }

            Swal.fire({
                icon: "success",
                title: "Producto guardado correctamente",
                timer: 1500,
                showConfirmButton: false,
            });
            goBack();
        } catch (error) {
            console.error("Error al guardar producto:", error);
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
                        <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
                            <Inventory2RoundedIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                            <Typography variant="h5" fontWeight={800}>
                                {id ? "Editar producto" : "Agregar nuevo producto"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Datos del producto, inventario e imagen
                            </Typography>
                        </Box>
                        {id && <Chip label="Edición" color="primary" variant="outlined" />}
                    </Stack>

                    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${alpha(PINK, 0.15)}` }}>
                        <Grid container spacing={4}>
                            {/* Datos */}
                            <Grid item xs={12} md={7}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField label="Nombre" name="name" fullWidth required
                                            value={form.name} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Precio" name="price" type="number" fullWidth required
                                            value={form.price} onChange={handleChange}
                                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Stock" name="stock" type="number" fullWidth required
                                            value={form.stock} onChange={handleChange}
                                            InputProps={{ endAdornment: <InputAdornment position="end">uds.</InputAdornment> }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField label="Descripción" name="description" multiline rows={5} fullWidth
                                            value={form.description} onChange={handleChange} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Imagen */}
                            <Grid item xs={12} md={5}>
                                <Box
                                    component="label"
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.5, p: 2, cursor: "pointer",
                                        border: `2px dashed ${alpha(PINK, 0.5)}`, borderRadius: 3,
                                        bgcolor: alpha(PINK, 0.04), transition: ".2s",
                                        "&:hover": { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: alpha(PINK, 0.15), color: PINK }}>
                                        <ImageRoundedIcon />
                                    </Avatar>
                                    <Box flexGrow={1}>
                                        <Typography fontWeight={600}>Imagen</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {preview ? "Haz clic para reemplazar" : "Haz clic para seleccionar"}
                                        </Typography>
                                    </Box>
                                    {preview && <CheckCircleRoundedIcon color="primary" />}
                                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                                </Box>

                                {preview && (
                                    <Box
                                        sx={{
                                            mt: 2, height: 300, p: 1, borderRadius: 3, bgcolor: "background.default",
                                            border: `1px solid ${alpha(PINK, 0.25)}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                    >
                                        <Box component="img" src={preview} alt="Vista previa"
                                            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Acciones */}
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="flex-end" mt={3}>
                        <Button variant="outlined" size="large" onClick={goBack} sx={{ minWidth: 140 }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" size="large" disabled={loading}
                            sx={{ minWidth: 180, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
                            {loading
                                ? <><CircularProgress size={20} color="inherit" thickness={5} sx={{ mr: 1 }} />Guardando...</>
                                : id ? "Actualizar producto" : "Guardar producto"}
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AddProduct;