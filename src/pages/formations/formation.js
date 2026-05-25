import React, { useEffect, useContext, useReducer } from "react";
import {
    Grid,
    Box,
    Paper,
    Fade,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    Divider,
    Tooltip,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AddOutlined,
    SchoolOutlined,
    CalendarTodayOutlined,
} from "@mui/icons-material";
import FormationContext from "../../context/FormationContext/FormationContext";
import Swal from "sweetalert2";

const Formation = () => {
    const history = useHistory();
    const { formations, getFormations, cargando, deleteFormation } = useContext(FormationContext);

    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { searchTerm: "" }
    );

    useEffect(() => {
        getFormations();
    }, []);

    const filteredFormations = formations.filter((f) =>
        f.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
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
                deleteFormation(id);
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
            {/* Buscador */}
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
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Buscar formación..."
                        value={state.searchTerm}
                        onChange={(e) => dispatch({ searchTerm: e.target.value })}
                        sx={{ backgroundColor: "white", borderRadius: 2, width: { xs: "100%", sm: 280 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>
            </Grid>

            {/* Lista */}
            <Grid item xs={12}>
                {cargando ? (
                    <Typography align="center" color="text.secondary" py={4}>
                        Cargando formaciones...
                    </Typography>
                ) : filteredFormations.length === 0 ? (
                    <Typography align="center" color="text.secondary" py={4}>
                        No hay formaciones disponibles.
                    </Typography>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            border: "1px solid rgba(200,200,200,0.3)",
                            overflow: "hidden",
                        }}
                    >
                        {filteredFormations.map((formation, index) => (
                            <Fade in timeout={300 + index * 60} key={formation.id}>
                                <Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            px: 3,
                                            py: 2,
                                            transition: "background 0.2s ease",
                                            "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                                        }}
                                    >
                                        {/* Avatar / miniatura diploma */}
                                        {/* <Box
                                            sx={{
                                                width: 52,
                                                height: 52,
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                bgcolor: "#f0f4f8",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {formation.diploma ? (
                                                <Box
                                                    component="img"
                                                    src={formation.diploma}
                                                    alt={formation.name}
                                                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <SchoolOutlined sx={{ color: "#bbb", fontSize: 26 }} />
                                            )}
                                        </Box> */}

                                        {/* Info */}
                                        <Box flex={1} minWidth={0}>
                                            <Typography variant="body1" fontWeight={600} noWrap>
                                                {formation.name}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={0.5} mt={0.3}>
                                                <CalendarTodayOutlined sx={{ fontSize: 12, color: "text.disabled" }} />
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDate(formation.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Acciones */}
                                        <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                                            <Tooltip title="Agregar módulos">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => history.push(`/formations/${formation.id}/modules`)}
                                                >
                                                    <AddOutlined fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => history.push(`/formations/editformation/${formation.id}`)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(formation.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {index < filteredFormations.length - 1 && (
                                        <Divider sx={{ mx: 3 }} />
                                    )}
                                </Box>
                            </Fade>
                        ))}
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
};

export default Formation;