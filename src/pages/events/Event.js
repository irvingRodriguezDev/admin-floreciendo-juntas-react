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
    useMediaQuery,
    useTheme
} from "@mui/material";
import { useHistory } from "react-router-dom";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Typography } from "../../components/Wrappers";
import EventContext from "../../context/EventContext/EventContext";
import Swal from "sweetalert2";
import { getImageUrl } from "../../utils/image"; // Reutilizamos la función de Product

const Event = () => {
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    const getOptimalWidth = () => {
        if (isMobile) return 300;
        if (isTablet) return 400;
        return 350;
    };
    const optimalWidth = getOptimalWidth();
    const imageQuality = 85;

    const { eventos, obtenerEventos, eliminarEvento } = useContext(EventContext);

    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { searchTerm: "" }
    );

    useEffect(() => {
        obtenerEventos();
    }, []);

    const filteredEvents = Array.isArray(eventos)
        ? eventos.filter((e) =>
            e.title?.toLowerCase().includes(state.searchTerm.toLowerCase())
        )
        : [];

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
            if (result.isConfirmed) eliminarEvento(id);
        });
    };

    const getEventImage = (event) => {
        if (event.image && event.image !== "") return getImageUrl(event.image, optimalWidth, imageQuality);
        return "https://via.placeholder.com/350x200?text=Evento"; // fallback
    };

    return (
        <Grid container spacing={3}>
            {/* Buscador */}
            <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: "#f9f9f9" }}>
                    <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Buscar evento..."
                            value={state.searchTerm}
                            onChange={(e) => dispatch({ searchTerm: e.target.value })}
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

            {/* Cards */}
            <Grid item xs={12}>
                {filteredEvents.length === 0 ? (
                    <Typography align="center">No hay eventos disponibles.</Typography>
                ) : (
                    <Grid container spacing={3} justifyContent="center">
                        {filteredEvents.map((event, index) => (
                            <Grid item xs={12} sm={6} md={3} key={event.id}>
                                <Fade in timeout={400 + index * 80}>
                                    <Card sx={{ position: "relative", borderRadius: 4, boxShadow: "0px 4px 15px rgba(0,0,0,0.08)" }}>
                                        {/* ICONOS */}
                                        <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                                            <IconButton
                                                size="large"
                                                color="primary"
                                                sx={{ backgroundColor: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" }, borderRadius: "50%", width: 40, height: 40, mr: 1 }}
                                                onClick={() => history.push(`/app/events/editevent/${event.id}`)}
                                            >
                                                <EditIcon fontSize="medium" />
                                            </IconButton>
                                            <IconButton
                                                size="large"
                                                color="error"
                                                sx={{ backgroundColor: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.08)" }, borderRadius: "50%", width: 40, height: 40 }}
                                                onClick={() => handleDelete(event.id)}
                                            >
                                                <DeleteIcon fontSize="medium" />
                                            </IconButton>
                                        </Box>

                                        {/* IMAGEN */}
                                        <Box sx={{
                                            width: "100%",
                                            aspectRatio: "14/11",
                                            backgroundColor: "#f7f7f7",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderTopLeftRadius: 4,
                                            borderTopRightRadius: 4,
                                            overflow: "hidden"
                                        }}>
                                            <Box
                                                component="img"
                                                src={getEventImage(event)}
                                                alt={event.title}
                                                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                                            />
                                        </Box>

                                        <Box sx={{ p: 2 }}>
                                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                                <b>{event.title}</b>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
                                                {event.location?.replace(/<[^>]+>/g, '') || "Sin descripción"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Fecha: {event.startDate
                                                    ? (() => {
                                                        const d = new Date(event.startDate);
                                                        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                                                        return d.toLocaleDateString();
                                                    })()
                                                    : "Sin fecha"}
                                            </Typography>
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

export default Event;
