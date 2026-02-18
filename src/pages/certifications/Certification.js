import React, { useEffect, useContext, useReducer } from "react";
import {
    Grid,
    Box,
    Card,
    TextField,
    InputAdornment,
    Paper,
    Fade,
    IconButton,
    Chip,
    Typography,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AddOutlined,
} from "@mui/icons-material";
import CertificationContext from "../../context/CertificationContext/CertificationContext";
import Swal from "sweetalert2";

const Certification = () => {
    const history = useHistory();
    const { certifications, getCertifications, loading, deleteCertification } = useContext(CertificationContext);

    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { searchTerm: "" }
    );

    useEffect(() => {
        getCertifications();
    }, []);

    const filteredCertifications = certifications.filter((c) =>
        c.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
    );

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
                deleteCertification(id);
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            timeZone: "UTC",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };



    return (
        <Grid container spacing={3}>
            {/* Filtros */}
            <Grid item xs={12}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        background:
                            "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(200,200,200,0.3)",
                    }}
                >
                    <Box
                        display="flex"
                        flexWrap="wrap"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={2}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Buscar certificación..."
                                value={state.searchTerm}
                                onChange={(e) => dispatch({ searchTerm: e.target.value })}
                                sx={{
                                    backgroundColor: "white",
                                    borderRadius: 2,
                                    width: { xs: "100%", sm: 250 }, // Responsive width
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Cards de Certificaciones */}
            <Grid item xs={12}> {/* Cambiado de xs=8 a xs=12 */}
                {loading ? (
                    <Typography align="center">Cargando certificaciones...</Typography>
                ) : filteredCertifications.length === 0 ? (
                    <Typography align="center">No hay certificaciones disponibles.</Typography>
                ) : (
                    <Grid
                        container
                        spacing={3}
                        sx={{
                            justifyContent: { xs: "center", md: "flex-start" } // Centrar en móvil
                        }}
                    >
                        {filteredCertifications.map((certification, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={certification.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center" // Centrar cada item
                                }}
                            >
                                <Fade in timeout={400 + index * 80}>
                                    <Card
                                        sx={{
                                            position: "relative",
                                            borderRadius: 4,
                                            width: { xs: "100%", sm: 260 }, // Ancho completo en móvil
                                            maxWidth: 320, // Máximo ancho
                                            height: 470,
                                            boxShadow:
                                                "0px 4px 15px rgba(0,0,0,0.08), 0px 1px 3px rgba(0,0,0,0.1)",
                                            transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                            "&:hover": {
                                                transform: "translateY(-6px)",
                                                boxShadow:
                                                    "0px 6px 18px rgba(0,0,0,0.12), 0px 3px 6px rgba(0,0,0,0.1)",
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
                                                onClick={() => history.push(`/certifications/${certification.id}/modules`)}
                                            >
                                                <AddOutlined fontSize="medium" />
                                            </IconButton>
                                            <IconButton
                                                size="large"
                                                color="secondary"
                                                sx={{
                                                    backgroundColor: "white",
                                                    "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" },
                                                    borderRadius: "50%",
                                                    width: 40,
                                                    height: 40,
                                                    mr: 1,
                                                }}
                                                onClick={() =>
                                                    history.push(`/certifications/editcertificate/${certification.id}`)
                                                }
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
                                                onClick={() => handleDelete(certification.id)}
                                            >
                                                <DeleteIcon fontSize="medium" />
                                            </IconButton>
                                        </Box>

                                        {/* Imagen */}
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: 250,
                                                borderTopLeftRadius: 3,
                                                borderTopRightRadius: 3,
                                                overflow: "hidden",
                                                position: "relative",
                                            }}
                                        >
                                            {certification.image ? (
                                                <Box
                                                    component="img"
                                                    src={certification.image}
                                                    alt={certification.name}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        objectPosition: "center",
                                                        transition: "transform 0.3s ease",
                                                        "&:hover": {
                                                            transform: "scale(1.05)",
                                                        },
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        bgcolor: "#f5f5f5"
                                                    }}
                                                >
                                                    <Typography variant="body2" color="pink.500">
                                                        Sin imagen
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Chip de estado */}
                                            <Chip
                                                label={certification.is_active ? "Activo" : "Inactivo"}
                                                color={certification.is_active ? "success" : "default"}
                                                size="small"
                                                sx={{
                                                    position: "absolute",
                                                    top: 10,
                                                    left: 10,
                                                    borderRadius: "8px",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>

                                        {/* Contenido */}
                                        <Box sx={{ p: 2 }}>
                                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                                {certification.name}
                                            </Typography>

                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="caption" color="pink.500">
                                                    Inicio: {formatDate(certification.start_date)}
                                                </Typography>
                                                <br />
                                                <Typography variant="caption" color="pink.500">
                                                    Fin: {formatDate(certification.end_date)}
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    mt: 4,
                                                    pt: 2,
                                                    borderTop: "1px solid rgba(0,0,0,0.08)",
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="caption" color="secondary">
                                                        Puntaje mínimo
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {certification.min_passing_score || "N/A"}
                                                    </Typography>
                                                </Box>
                                                <Box textAlign="right">
                                                    <Typography variant="caption" color="secondary">
                                                        Puntaje máximo
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {certification.max_passing_score || "N/A"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

export default Certification;