import React, { useEffect, useContext, useReducer } from "react";
import {
  Grid,
  Box,
  Card,
  CardActions,
  CardContent,
  CardActionArea,
  CardMedia,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Fade,
  IconButton,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
  Star as StarIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { yellow } from "@mui/material/colors";
import { Typography, Chip } from "../../components/Wrappers";
import SystemContext from "../../context/SystemContext/SystemContext";
import Swal from "sweetalert2";

const System = () => {
  const history = useHistory();
  const { systems, getSystems, loading, deleteSystem } = useContext(SystemContext);

  // 🔍 Estado local para búsqueda
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { searchTerm: "" }
  );

  // 📦 Cargar los sistemas al montar el componente
  useEffect(() => {
    getSystems();
  }, []);

  // 🔎 Filtrar sistemas por nombre
  const filteredSystems = systems.filter((s) =>
    s.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  // 🗑️ Función para confirmar y eliminar
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
        deleteSystem(id);
      }
    });
  };

  return (
    <Grid container spacing={3}>
      {/* 🎛️ Filtros */}
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
            {/* Buscador */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar sistema..."
                value={state.searchTerm}
                onChange={(e) => dispatch({ searchTerm: e.target.value })}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  width: 250,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Botón Crear Sistema */}
              {/* <Button
                style={{ marginTop: -10 }}
                variant="contained"
                color="success"
                onClick={() => history.push("/app/system/addsystem")}
              >
                Crear Sistema
              </Button> */}
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* 🧱 Cards de Sistemas */}
      <Grid item xs={12}>
        {loading ? (
          <Typography align="center">Cargando sistemas...</Typography>
        ) : filteredSystems.length === 0 ? (
          <Typography align="center">No hay sistemas disponibles.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredSystems.map((system, index) => (
              <Grid item xs={12} sm={6} md={3} key={system.id}>
                <Fade in timeout={400 + index * 80}>
                  <Card
                    sx={{
                      position: "relative",
                      borderRadius: 4,
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
                    {/* ⚡ ICONOS DE EDITAR Y ELIMINAR */}
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
                        onClick={() =>
                          history.push(`/app/system/editsystem/${system.id}`)
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
                        onClick={() => handleDelete(system.id)}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Box>

                    <CardActionArea
                      onClick={() =>
                        history.push(`/app/system/detail/${system.id}`)
                      }
                    >
                      {/* Imagen o placeholder */}
                      <Box sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="190"
                          image={
                            system.image ||
                            "https://via.placeholder.com/300x190?text=Sistema"
                          }
                          alt={system.name}
                          sx={{
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                          }}
                        />
                        <Chip
                          label="Activo"
                          color="success"
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
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {system.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {system.id}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography fontWeight="bold">Sistema</Typography>
                        <Box display="flex" alignItems="center" color={yellow[700]}>
                          <Typography>5.0</Typography>
                          <StarIcon sx={{ ml: 0.3, fontSize: 18 }} />
                        </Box>
                      </Box>
                    </CardActions>
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

export default System;
