import React, { useEffect, useContext, useReducer, useState } from "react";
import {
    Grid,
    Box,
    Card,
    TextField,
    InputAdornment,
    Paper,
    Fade,
    IconButton,
    Pagination,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Typography } from "../../components/Wrappers";
import ProductContext from "../../context/ProductContext/ProductContext";
import Swal from "sweetalert2";

const Product = () => {
    const history = useHistory();
    const { products, getProducts, loading, deleteProduct, pagination } = useContext(ProductContext);

    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { searchTerm: "" }
    );

    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // ✅ Único useEffect para traer productos
    useEffect(() => {
        getProducts(page, state.searchTerm);
    }, [page, state.searchTerm]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás revertir esto",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProduct(id).then(() => {
                    getProducts(page, state.searchTerm);
                });
            }
        });
    };

    const getImageUrl = (product) =>
        product.image?.url || "https://via.placeholder.com/300x190?text=Producto";

    return (
        <Grid container spacing={3}>
            {/* Filtro de búsqueda */}
            <Grid item xs={12}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        background: "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(200,200,200,0.3)",
                    }}
                >
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Buscar producto..."
                            value={state.searchTerm}
                            onChange={(e) => {
                                dispatch({ searchTerm: e.target.value });
                                setPage(1); // Resetear página al buscar
                            }}
                            sx={{ backgroundColor: "white", borderRadius: 2, width: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Paper>
            </Grid>

            {/* Cards de productos */}
            <Grid item xs={12}>
                {loading ? (
                    <Typography align="center">Cargando productos...</Typography>
                ) : products.length === 0 ? (
                    <Typography align="center">No hay productos disponibles.</Typography>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {products.map((product, index) => (
                                <Grid item xs={12} sm={6} md={3} key={product.id}>
                                    <Fade in timeout={400 + index * 80}>
                                        <Card
                                            sx={{
                                                position: "relative",
                                                borderRadius: 4,
                                                boxShadow: "0px 4px 15px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.1)",
                                                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                                "&:hover": {
                                                    transform: "translateY(-6px)",
                                                    boxShadow: "0px 6px 18px rgba(0,0,0,0.12), 0px 3px 6px rgba(0,0,0,0.1)",
                                                },
                                            }}
                                        >
                                            {/* Iconos Editar / Eliminar */}
                                            <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                                                <IconButton
                                                    size="large"
                                                    color="primary"
                                                    sx={{
                                                        backgroundColor: "white",
                                                        "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" },
                                                        borderRadius: "50%",
                                                        width: 40,
                                                        height: 40,
                                                        mr: 1,
                                                    }}
                                                    onClick={() => history.push(`/product/editproduct/${product.id}`)}
                                                >
                                                    <EditIcon fontSize="medium" />
                                                </IconButton>
                                                <IconButton
                                                    size="large"
                                                    color="error"
                                                    sx={{
                                                        backgroundColor: "white",
                                                        "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" },
                                                        borderRadius: "50%",
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <DeleteIcon fontSize="medium" />
                                                </IconButton>
                                            </Box>

                                            {/* Imagen del producto */}
                                            <Box
                                                sx={{
                                                    position: "relative",
                                                    height: 220,
                                                    backgroundColor: "#f7f7f7",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderTopLeftRadius: 4,
                                                    borderTopRightRadius: 4,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={getImageUrl(product)}
                                                    alt={product.name}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "fill",
                                                    }}
                                                />
                                            </Box>

                                            {/* Contenido */}
                                            <Box sx={{ p: 2 }}>
                                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                                    <b>{product.name}</b>
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 1,
                                                        display: "-webkit-box",
                                                        overflow: "hidden",
                                                        WebkitBoxOrient: "vertical",
                                                        WebkitLineClamp: 2,
                                                    }}
                                                >
                                                    {product.description || "Sin descripción"}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Precio: ${product.price ?? "N/D"}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Stock: {product.stock ?? "N/A"}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Fade>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Paginación */}
                        {pagination && pagination.totalPages > 1 && (
                            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                )}
            </Grid>
        </Grid>
    );
};

export default Product;
