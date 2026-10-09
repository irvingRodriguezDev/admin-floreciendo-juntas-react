import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
    Box, Grid, Stack, Paper, Typography, TextField, Button, Avatar,
    Divider, IconButton, Tooltip, Chip, CircularProgress,
} from "@mui/material";
import {
    Save as SaveIcon, ArrowBack as ArrowBackIcon, CloudUploadOutlined,
    SwapHorizOutlined, DeleteOutline as DeleteOutlineIcon, InfoOutlined,
    AttachMoneyOutlined, InventoryOutlined, ImageOutlined, ShoppingBagOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import ProductContext from "../../context/ProductContext/ProductContext";

/* ═══════════════════════════════════════════════════════════════
   1. CONSTANTES
   ═══════════════════════════════════════════════════════════════ */
const PINK = "#FF5C93";
const PINK_DARK = "#E94E88";
const PINK_SOFT = "#FFE6F0";
const PINK_BG = "#FFF5FA";
const PINK_BG_SOFT = "#FFF0F7";
const GRADIENT = "linear-gradient(135deg,#FF5C93,#FF69B4)";
const GRADIENT_HOVER = "linear-gradient(135deg,#E94E88,#FF5C93)";
const MAX_SIZE_MB = 5;

const INITIAL_FORM = { name: "", description: "", price: "", stock: "", image: null };

/* ═══════════════════════════════════════════════════════════════
   2. ESTILOS REUTILIZABLES
   ═══════════════════════════════════════════════════════════════ */
const sx = {
    field: {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2, bgcolor: "#fff",
            "& fieldset": { borderColor: PINK_SOFT },
            "&:hover fieldset": { borderColor: PINK },
            "&.Mui-focused fieldset": { borderColor: PINK, borderWidth: 2 },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: PINK },
    },
    primary: {
        py: 1.4, borderRadius: 2, fontWeight: 700, color: "#fff",
        background: GRADIENT, boxShadow: "none",
        "&:hover": { background: GRADIENT_HOVER, boxShadow: "none" },
        "&.Mui-disabled": { background: "#F5C6D0", color: "#fff" },
    },
    outline: {
        py: 1.4, borderRadius: 2, fontWeight: 600,
        color: PINK_DARK, border: `1px solid ${PINK}`,
        "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
    },
    section: {
        p: 2.5, borderRadius: 3,
        border: `1px solid ${PINK_SOFT}`, bgcolor: "#fff",
    },
    sectionHead: { display: "flex", alignItems: "center", gap: 1, mb: 2 },
    avatarSm: { bgcolor: PINK_BG_SOFT, color: PINK, width: 32, height: 32 },
    chip: {
        bgcolor: PINK_BG_SOFT, color: PINK_DARK, fontWeight: 600,
        border: `1px solid ${PINK_SOFT}`, maxWidth: "100%",
    },
    img: {
        width: "100%", maxHeight: 260, objectFit: "contain",
        borderRadius: 2, border: `1px solid ${PINK_SOFT}`,
        bgcolor: "#fff", p: 1,
    },
    imgLarge: {
        width: "100%", maxHeight: 480, objectFit: "contain",
        borderRadius: 2, border: `1px solid ${PINK_SOFT}`,
        bgcolor: PINK_BG_SOFT, p: 1,
    },
    dropzone: {
        border: `2px dashed ${PINK}`, borderRadius: 3, p: 5, textAlign: "center",
        cursor: "pointer", bgcolor: PINK_BG_SOFT, transition: "all .25s ease",
        "&:hover": {
            bgcolor: PINK_BG, borderColor: PINK_DARK,
            transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(255,92,147,.15)",
        },
    },
    header: {
        background: GRADIENT, color: "#fff", p: 3,
        display: "flex", alignItems: "center", gap: 2,
    },
    headerBtn: {
        color: "#fff", bgcolor: "rgba(255,255,255,.15)",
        "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
    },
};

/* ═══════════════════════════════════════════════════════════════
   3. SUBCOMPONENTES DE PRESENTACIÓN
   ═══════════════════════════════════════════════════════════════ */

/** Card con icono + título + contenido */
const Section = ({ icon, title, subtitle, children }) => (
    <Paper variant="outlined" sx={sx.section}>
        <Box sx={{ ...sx.sectionHead, mb: subtitle ? 0.5 : 2 }}>
            <Avatar sx={sx.avatarSm}>{icon}</Avatar>
            <Typography variant="subtitle1" fontWeight={700} color={PINK}>{title}</Typography>
        </Box>
        {subtitle && (
            <Typography variant="caption" color="text.secondary"
                sx={{ display: "block", mb: 2, ml: 6 }}>
                {subtitle}
            </Typography>
        )}
        {children}
    </Paper>
);

/** Selector de imagen: preview con acciones o dropzone */
const ImageField = ({ preview, onPick, onRemove }) => {
    const inputRef = useRef(null);
    const open = () => inputRef.current.click();

    return (
        <Section
            icon={<ImageOutlined fontSize="small" />}
            title="Imagen del producto"
            subtitle={`PNG, JPG o JPEG · Máx. ${MAX_SIZE_MB} MB`}
        >
            {preview ? (
                <Stack spacing={2} alignItems="center">
                    <Box component="img" src={preview} alt="Vista previa" sx={sx.img} />
                    <Chip label="Imagen cargada" size="small" sx={sx.chip} />

                    <Stack direction="row" spacing={1.5}>
                        <Button size="small" variant="outlined" startIcon={<SwapHorizOutlined />}
                            onClick={open}
                            sx={{ borderRadius: 2, color: PINK_DARK, borderColor: PINK }}>
                            Cambiar
                        </Button>
                        <Button size="small" variant="outlined" color="error"
                            startIcon={<DeleteOutlineIcon />} onClick={onRemove}
                            sx={{ borderRadius: 2 }}>
                            Eliminar
                        </Button>
                    </Stack>
                </Stack>
            ) : (
                <Box sx={sx.dropzone} onClick={open}>
                    <Avatar sx={{
                        bgcolor: "#fff", color: PINK, width: 64, height: 64,
                        mx: "auto", mb: 2, border: `2px solid ${PINK_SOFT}`,
                    }}>
                        <CloudUploadOutlined sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography fontWeight={700} color={PINK} gutterBottom>
                        Haz clic para subir la imagen
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        PNG, JPG o JPEG · Máx. {MAX_SIZE_MB} MB
                    </Typography>
                </Box>
            )}

            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
        </Section>
    );
};

/** Campo numérico con icono de prefijo */
const NumberField = ({ name, label, icon, value, onChange }) => (
    <TextField
        label={label} name={name} type="number" fullWidth required
        value={value} onChange={onChange} sx={sx.field}
        InputProps={{
            startAdornment: React.cloneElement(icon, { sx: { color: PINK, mr: 1, fontSize: 20 } }),
        }}
    />
);

/** Vista previa grande en columna lateral */
const PreviewPanel = ({ src }) => (
    <Paper variant="outlined" sx={{ ...sx.section, textAlign: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
            <ImageOutlined sx={{ color: PINK }} />
            <Typography variant="subtitle1" fontWeight={700} color={PINK}>
                Vista previa
            </Typography>
        </Box>
        <Box component="img" src={src} alt="Vista previa" sx={sx.imgLarge} />
    </Paper>
);

/* ═══════════════════════════════════════════════════════════════
   4. HELPERS DE LÓGICA
   ═══════════════════════════════════════════════════════════════ */

const validateImage = (file) => {
    if (!file.type.startsWith("image/")) {
        Swal.fire("Archivo inválido", "Selecciona una imagen (PNG, JPG o JPEG)", "warning");
        return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        Swal.fire("Imagen muy grande", `La imagen no debe superar los ${MAX_SIZE_MB} MB`, "warning");
        return false;
    }
    return true;
};

const readAsDataURL = (file) =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });

/* ═══════════════════════════════════════════════════════════════
   5. COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

const AddProduct = ({ onCancel }) => {
    const { id } = useParams();
    const history = useHistory();
    const { addProduct, updateProduct, obtenerProductPorId } = useContext(ProductContext);

    const [form, setForm] = useState(INITIAL_FORM);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const isEdit = Boolean(id);
    const goBack = () => (onCancel ? onCancel() : history.push("/product/list"));

    /* ─── Efecto: cargar si es edición ─── */
    useEffect(() => {
        if (!id) {
            setForm(INITIAL_FORM);
            setPreview(null);
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const { product } = await obtenerProductPorId(id);
                if (!product) {
                    Swal.fire({ icon: "error", title: "Producto no encontrado" });
                    history.push("/products");
                    return;
                }
                setForm({
                    name: product.name ?? "",
                    description: product.description ?? "",
                    price: product.price ?? "",
                    stock: product.stock ?? "",
                    image: null,
                });
                setPreview(product.image ?? null);
            } catch (err) {
                console.error("Error al obtener producto:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, history, obtenerProductPorId]);

    /* ─── Handlers ─── */
    const onChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const onImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!validateImage(file)) { e.target.value = ""; return; }

        setForm((p) => ({ ...p, image: file }));
        setPreview(await readAsDataURL(file));
    };

    const onRemoveImage = () => {
        setForm((p) => ({ ...p, image: null }));
        setPreview(null);
    };

    /* ─── Submit ─── */
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("stock", form.stock);
        if (form.image) fd.append("image", form.image);

        try {
            if (isEdit) await updateProduct(id, fd);
            else await addProduct(fd);

            await Swal.fire({
                icon: "success", title: "Producto guardado correctamente",
                timer: 1500, showConfirmButton: false,
            });
            goBack();
        } catch (err) {
            console.error("Error al guardar producto:", err);
            Swal.fire("Error", "Ocurrió un error al guardar el producto.", "error");
        } finally {
            setLoading(false);
        }
    };

    /* ─── Textos derivados ─── */
    const texts = isEdit
        ? { title: "Editar producto", subtitle: "Modifica los campos que deseas actualizar", submit: "Actualizar producto" }
        : { title: "Agregar nuevo producto", subtitle: "Completa los campos para registrar un nuevo producto", submit: "Guardar producto" };

    /* ─── Render ─── */
    return (
        <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } }}>
            <Paper elevation={0} sx={{
                borderRadius: 4, overflow: "hidden",
                border: `1px solid ${PINK_SOFT}`,
                boxShadow: "0 8px 24px rgba(255,92,147,.08)",
            }}>
                {/* Header */}
                <Box sx={sx.header}>
                    <Tooltip title="Volver">
                        <IconButton onClick={goBack} sx={sx.headerBtn}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>

                    <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", width: 48, height: 48 }}>
                        <ShoppingBagOutlined />
                    </Avatar>

                    <Box>
                        <Typography variant="h6" fontWeight={700}>{texts.title}</Typography>
                        <Typography variant="body2" sx={{ opacity: .9 }}>{texts.subtitle}</Typography>
                    </Box>
                </Box>

                {/* Formulario */}
                <Box sx={{ p: 3, bgcolor: PINK_BG }}>
                    <Box component="form" onSubmit={onSubmit} encType="multipart/form-data">
                        <Grid container spacing={3}>

                            {/* Columna: formulario */}
                            <Grid item xs={12} md={preview ? 6 : 12}>
                                <Stack spacing={3}>

                                    <Section icon={<InfoOutlined fontSize="small" />} title="Información del producto">
                                        <Stack spacing={2}>
                                            <TextField label="Nombre *" name="name" fullWidth required
                                                value={form.name} onChange={onChange} sx={sx.field} />
                                            <TextField label="Descripción" name="description" multiline rows={4}
                                                fullWidth value={form.description} onChange={onChange} sx={sx.field} />
                                        </Stack>
                                    </Section>

                                    <Section icon={<AttachMoneyOutlined fontSize="small" />}
                                        title="Precio y stock" subtitle="Datos numéricos del producto">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <NumberField name="price" label="Precio *"
                                                    icon={<AttachMoneyOutlined />}
                                                    value={form.price} onChange={onChange} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <NumberField name="stock" label="Stock *"
                                                    icon={<InventoryOutlined />}
                                                    value={form.stock} onChange={onChange} />
                                            </Grid>
                                        </Grid>
                                    </Section>

                                    <ImageField preview={preview}
                                        onPick={onImageChange} onRemove={onRemoveImage} />

                                    <Divider sx={{ borderColor: PINK_SOFT }} />

                                    <Stack direction={{ xs: "column-reverse", sm: "row" }}
                                        spacing={2} justifyContent="flex-end">
                                        <Button variant="outlined" size="large"
                                            onClick={goBack} disabled={loading} sx={sx.outline}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" variant="contained" size="large" disabled={loading}
                                            startIcon={loading
                                                ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                                                : <SaveIcon />}
                                            sx={{ ...sx.primary, minWidth: 220 }}>
                                            {loading ? "Guardando..." : texts.submit}
                                        </Button>
                                    </Stack>

                                </Stack>
                            </Grid>

                            {/* Columna: vista previa grande */}
                            {preview && (
                                <Grid item xs={12} md={6}>
                                    <PreviewPanel src={preview} />
                                </Grid>
                            )}

                        </Grid>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default AddProduct;