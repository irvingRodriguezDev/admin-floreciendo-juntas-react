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
  Button,
  Typography as MuiTypography,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import SystemContext from "../../context/SystemContext/SystemContext";
import Swal from "sweetalert2";

const System = () => {
  const history = useHistory();
  const { systems, getSystems, loading, deleteSystem } =
    useContext(SystemContext);

  const [state, dispatch] = useReducer((s, a) => ({ ...s, ...a }), {
    searchTerm: "",
  });

  useEffect(() => {
    getSystems();
  }, []);

  const filteredSystems = systems.filter((s) =>
    s.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
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
      if (result.isConfirmed) deleteSystem(id);
    });
  };

  return (
    <Grid container spacing={3}>
      {/* ============ FILTROS ============ */}
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
            <TextField
              variant="outlined"
              size="small"
              placeholder="Buscar secreto..."
              value={state.searchTerm}
              onChange={(e) => dispatch({ searchTerm: e.target.value })}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                width: 250,

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FF5C93",
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#FF5C93",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#FF5C93" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              size="medium"
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                bgcolor: "#FF5C93",
                color: "#fff",
                "&:hover": { bgcolor: "#e64a7f" },
              }}
              onClick={() => history.push("/system/addsystem")}
            >
              Agregar Secreto
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* ============ CARDS ============ */}
      <Grid item xs={12}>
        {loading ? (
          <MuiTypography align="center">Cargando academias...</MuiTypography>
        ) : filteredSystems.length === 0 ? (
            <MuiTypography align="center">No hay academias disponibles.</MuiTypography>
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
                    {/* Botones editar / eliminar */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="large"
                        // color="primary"
                        sx={{
                          bgcolor: "white",
                          color: "#FF5C95",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                        }}
                        onClick={() =>
                          history.push(`/system/editsystem/${system.id}`)
                        }
                      >
                        <EditIcon fontSize="medium" />
                      </IconButton>
                      <IconButton
                        size="large"
                        color="error"
                        sx={{
                          bgcolor: "white",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                        }}
                        onClick={() => handleDelete(system.id)}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Box>

                    {/* Media */}
                    <Box
                      sx={{
                        position: "relative",
                        height: 190,
                        bgcolor: "#f7f7f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        component="video"
                        src={system.icon}
                        controls
                        sx={{
                          width: "100%",
                          height: "125%",
                          objectFit: "cover",
                          borderRadius: 2.5,
                        }}
                      />
                    </Box>

                    {/* Contenido */}
                    <Box sx={{ p: 2 }}>
                      <MuiTypography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold" }}
                      >
                        {system.name}
                      </MuiTypography>
                      <MuiTypography
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
                        {system.description || "Sin descripción"}
                      </MuiTypography>
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

export default System;