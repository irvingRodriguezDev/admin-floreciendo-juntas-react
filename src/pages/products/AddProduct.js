import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Divider,
} from "@mui/material";
import Swal from "sweetalert2";
import ProductContext from "../../context/ProductContext/ProductContext";

const AddProduct = ({ onCancel }) => {
    const { id } = useParams();
    const history = useHistory();
    const { addProduct, updateProduct, obtenerProductPorId } = useContext(ProductContext);

    const initialForm = {
        name: "",
        description: "",
        price: "",
        stock: "",
        image: null,
    };

    const [form, setForm] = useState(initialForm);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setForm(initialForm);
                setPreview(null);
                return;
            }

            setLoading(true);
            try {
                const product = await obtenerProductPorId(id);
                if (!product) {
                    Swal.fire({ icon: "error", title: "Producto no encontrado" });
                    history.push("/products");
                    return;
                }

                setForm({
                    name: product.name || "",
                    description: product.description || "",
                    price: product.price || "",
                    stock: product.stock || "",
                    image: null,
                });

                setPreview(product.image || null);
            } catch (error) {
                console.error("Error al obtener producto:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, history, obtenerProductPorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setForm((prev) => ({ ...prev, image: file }));

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("price", form.price);
        formData.append("stock", form.stock);
        if (form.image) formData.append("image", form.image);

        try {
            if (id) {
                await updateProduct(id, formData);
            } else {
                await addProduct(formData);
                setForm(initialForm);
                setPreview(null);
            }

            Swal.fire({
                icon: "success",
                title: "Producto guardado correctamente",
                timer: 1500,
                showConfirmButton: false,
            });

            if (onCancel) onCancel();
            else history.push("/product/list");
        } catch (error) {
            console.error("Error al guardar producto:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && id)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
            <Card sx={{ borderRadius: 4, boxShadow: 5, p: 3 }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>
                        {id ? "Editar producto" : "Agregar nuevo producto"}
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <Grid container spacing={4}>
                            {/* Formulario */}
                            <Grid item xs={12} md={preview ? 6 : 12}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Nombre"
                                            name="name"
                                            fullWidth
                                            required
                                            value={form.name}
                                            onChange={handleChange}
                                            size="medium"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Precio"
                                            name="price"
                                            type="number"
                                            fullWidth
                                            required
                                            value={form.price}
                                            onChange={handleChange}
                                            size="medium"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Stock"
                                            name="stock"
                                            type="number"
                                            fullWidth
                                            required
                                            value={form.stock}
                                            onChange={handleChange}
                                            size="medium"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Descripción"
                                            name="description"
                                            multiline
                                            rows={5}
                                            fullWidth
                                            value={form.description}
                                            onChange={handleChange}
                                            size="medium"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button variant="contained" component="label" fullWidth sx={{ py: 1.5 }}>
                                            Subir imagen
                                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                        </Button>
                                    </Grid>

                                    {/* Botones */}
                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            disabled={loading}
                                            sx={{ minHeight: 50, mb: 1.5 }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : id ? "Actualizar producto" : "Guardar producto"}
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            fullWidth
                                            sx={{ minHeight: 50 }}
                                            onClick={() => (onCancel ? onCancel() : history.push("/product/list"))}
                                        >
                                            Cancelar
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Preview de Imagen */}
                            {preview && (
                                <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            maxHeight: 400,
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            border: "1px solid #ddd",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            p: 1,
                                            backgroundColor: "#f9f9f9",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={preview}
                                            alt="Vista previa"
                                            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                        />
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>

    );
};

export default AddProduct;
