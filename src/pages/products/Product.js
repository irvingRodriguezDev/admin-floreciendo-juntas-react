import React, { useEffect, useContext, useReducer, useState } from "react";
import {
    Grid, Box, Card, CardContent, TextField, InputAdornment, Paper, Fade,
    IconButton, Pagination, useMediaQuery, useTheme, Button, Typography,
    Chip, Stack, Divider, Skeleton, Container,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Inventory2Outlined as InventoryIcon,
    AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import ProductContext from "../../context/ProductContext/ProductContext";
import Swal from "sweetalert2";

const PINK = "#FF5C93";

const clamp = (lines) => ({
    display: "-webkit-box",
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lines,
});

const formatPrice = (price) =>
    price != null
        ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(price)
        : "N/D";

const getImageUrl = (product) =>
    product.image?.url || "https://via.placeholder.com/300x190?text=Producto";

const Product = () => {
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { products, pagination, getProducts, loading, deleteProduct } = useContext(ProductContext);

    const [state, dispatch] = useReducer((s, a) => ({ ...s, ...a }), { searchTerm: "" });
    const [page, setPage] = useState(1);

    useEffect(() => {
        getProducts(page, state.searchTerm);
    }, [page, state.searchTerm]);

    useEffect(() => {
        if (pagination?.page) setPage(pagination.page);
    }, [pagination]);

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
                deleteProduct(id).then(() => getProducts(page, state.searchTerm));
            }
        });
    };

    const items = products || [];
    const totalPages = pagination?.totalPages || 1;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* 🔍 Buscador + botón agregar */}
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
                        <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexWrap="wrap">
                            <TextField
                                placeholder="Buscar producto..."
                                size="small"
                                value={state.searchTerm}
                                onChange={(e) => {
                                    dispatch({ searchTerm: e.target.value });
                                    setPage(1);
                                }}
                                sx={{
                                    width: isMobile ? "100%" : 400,
                                    backgroundColor: "white",
                                    borderRadius: 2,
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: PINK },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PINK },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: PINK }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    whiteSpace: "nowrap",
                                    boxShadow: "none",
                                    backgroundColor: PINK,
                                    color: "#fff",
                                    ml: { sm: 4 },
                                    "&:hover": { backgroundColor: "#e64a7f", boxShadow: "none" },
                                }}
                                onClick={() => history.push("/product/addproduct")}
                            >
                                Agregar Producto
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* 📦 Lista de productos */}
                <Grid item xs={12}>
                    {loading ? (
                        <Grid container spacing={3}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                                    <Card sx={{ borderRadius: 3 }}>
                                        <Skeleton variant="rectangular" height={160} />
                                        <CardContent>
                                            <Skeleton width="80%" />
                                            <Skeleton width="60%" />
                                            <Skeleton width="40%" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : items.length === 0 ? (
                        <Paper
                            elevation={0}
                            sx={{ p: 6, borderRadius: 3, textAlign: "center", border: "1px dashed", borderColor: "divider" }}
                        >
                            <InventoryIcon sx={{ fontSize: 64, color: "text.disabled", mb: 1 }} />
                            <Typography variant="h6" fontWeight={600}>
                                No hay productos
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {state.searchTerm
                                    ? `No se encontraron resultados para "${state.searchTerm}"`
                                    : "Comienza agregando tu primer producto"}
                            </Typography>
                        </Paper>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {items.map((product, index) => {
                                    const inStock = (product.stock ?? 0) > 0;
                                    const actions = [
                                        {
                                            Icon: EditIcon,
                                            label: "Editar",
                                            color: PINK,
                                            onClick: () => history.push(`/product/editproduct/${product.id}`),
                                        },
                                        {
                                            Icon: DeleteIcon,
                                            label: "Eliminar",
                                            color: "#d32f2f",
                                            onClick: () => handleDelete(product.id),
                                        },
                                    ];

                                    return (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                            <Fade in timeout={400 + index * 80}>
                                                <Card
                                                    sx={{
                                                        position: "relative",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        borderRadius: 3,
                                                        overflow: "hidden",
                                                        border: "1px solid",
                                                        borderColor: "divider",
                                                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                                        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                                                    }}
                                                >
                                                    {/* Acciones: colores explícitos para no depender del tema */}
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            top: 10,
                                                            right: 10,
                                                            zIndex: 10,
                                                            display: "flex",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        {actions.map(({ Icon, label, color, onClick }) => (
                                                            <IconButton
                                                                key={label}
                                                                aria-label={label}
                                                                onClick={onClick}
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    color,
                                                                    bgcolor: "#fff",
                                                                    boxShadow: 3,
                                                                    "&:hover": { bgcolor: "#fff", boxShadow: 6 },
                                                                }}
                                                            >
                                                                <Icon />
                                                            </IconButton>
                                                        ))}
                                                    </Box>

                                                    {/* Imagen */}
                                                    <Box
                                                        sx={{
                                                            backgroundColor: "#f7f7f7",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            p: 2,
                                                            minHeight: 140,
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={getImageUrl(product)}
                                                            alt={product.name}
                                                            sx={{
                                                                maxWidth: "100%",
                                                                maxHeight: 290,
                                                                width: "auto",
                                                                height: "auto",
                                                                objectFit: "contain",
                                                                display: "block",
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Contenido */}
                                                    <CardContent
                                                        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1, p: 2 }}
                                                    >
                                                        <Typography variant="subtitle1" fontWeight={700} sx={clamp(1)}>
                                                            {product.name}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ minHeight: 40, ...clamp(2) }}
                                                        >
                                                            {product.description || "Sin descripción"}
                                                        </Typography>

                                                        <Divider sx={{ my: 0.5 }} />

                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                <MoneyIcon fontSize="small" color="success" />
                                                                <Typography variant="subtitle2" fontWeight={700} color="success.main">
                                                                    {formatPrice(product.price)}
                                                                </Typography>
                                                            </Stack>

                                                            <Chip
                                                                size="small"
                                                                icon={<InventoryIcon />}
                                                                label={`Stock: ${product.stock ?? "N/A"}`}
                                                                variant="outlined"
                                                                color={inStock ? "primary" : "default"}
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    ...(inStock && {
                                                                        color: PINK,
                                                                        borderColor: PINK,
                                                                        "& .MuiChip-icon": { color: PINK },
                                                                    }),
                                                                }}
                                                            />
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    );
                                })}
                            </Grid>

                            {/* 🔢 Paginación */}
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        "& .MuiPaginationItem-root.Mui-selected": {
                                            backgroundColor: "#ff5c95",
                                            color: "#fff",
                                            "&:hover": {
                                                backgroundColor: "#ff5c95",
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Product;