import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardActionArea,
  CardMedia,
  TextField,
  InputAdornment,
  Paper,
  Fade,
  IconButton,
  Pagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary,
} from "@mui/icons-material";
import { Typography, Chip } from "../../components/Wrappers";
import CoursesContext from "../../context/CoursesContext/CoursesContext";
import SystemContext from "../../context/SystemContext/SystemContext";
import Swal from "sweetalert2";
import { getImageUrl } from "../../utils/image";

const Product = () => {
  const history = useHistory();
  const theme = useTheme();
  const { courses = [], obtenerCursos, cargando, eliminarCurso } = useContext(CoursesContext);
  const { systems, getSystems } = useContext(SystemContext);

  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    {
      valueSystem: "Todos",
      valueLevel: "Todos",
      searchTerm: "",
    }
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const getOptimalWidth = () => {
    if (isMobile) return 300;
    if (isTablet) return 400;
    return 350;
  };

  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    obtenerCursos();
    getSystems();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [state.valueSystem, state.valueLevel, state.searchTerm]);

  const filteredCourses = (courses || [])
    .filter((c) =>
      c.title?.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
    .filter((c) =>
      state.valueSystem === "Todos" ||
      c.system_id === parseInt(state.valueSystem)
    )
    .filter((c) =>
      state.valueLevel === "Todos" ||
      c.level?.toLowerCase() === state.valueLevel.toLowerCase()
    );

  const paginatedCourses = filteredCourses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
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
      if (result.isConfirmed) eliminarCurso(id);
    });
  };

  const getImage = (c) => {
    if (c.coverImage && c.coverImage !== "") return c.coverImage;
    if (c.cover_image_url && c.cover_image_url !== "") return c.cover_image_url;
    return "/no-image.jpg";
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "principiante":
        return "#2ecc71";
      case "intermedio":
        return "#f5a623";
      case "avanzado":
        return "#e74c3c";
      default:
        return "#999";
    }
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
            background: "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(200,200,200,0.3)",
          }}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
            <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Sistema</InputLabel>
                <Select
                  value={state.valueSystem}
                  onChange={(e) => dispatch({ valueSystem: e.target.value })}
                  label="Sistema"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {systems.map((sys) => (
                    <MenuItem key={sys.id} value={sys.id}>
                      {sys.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={state.valueLevel}
                  onChange={(e) => dispatch({ valueLevel: e.target.value })}
                  label="Nivel"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Principiante">principiante</MenuItem>
                  <MenuItem value="Intermedio">intermedio</MenuItem>
                  <MenuItem value="Avanzado">avanzado</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar curso..."
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
          </Box>
        </Paper>
      </Grid>

      {/* Cards */}
      <Grid item xs={12}>
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} justifyContent="center">
          {cargando ? (
            <Typography variant="body1" sx={{ p: 3 }}>
              Cargando cursos...
            </Typography>
          ) : filteredCourses.length === 0 ? (
            <Typography variant="body1" sx={{ p: 3 }}>
              No se encontraron cursos.
            </Typography>
          ) : (
            paginatedCourses.map((c, index) => (
              <Grid item key={c.id || index}>
                <Fade in timeout={400 + index * 80}>
                  <Card
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      width: 300,
                      // height: 480,
                      overflow: "hidden",
                      boxShadow: "0px 3px 10px rgba(15,14,14,0.12), 0px 1px 3px rgba(0,0,0,0.08)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0px 12px 26px rgba(15,14,14,0.28), 0px 3px 6px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {/* ICONOS */}
                    <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}>
                      <IconButton
                        size="large"
                        color="primary"
                        sx={{
                          backgroundColor: "white",
                          "&:hover": { backgroundColor: "rgba(125, 11, 72, 0.69)" },
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          mr: 1,
                        }}
                        onClick={() => history.push(`/ecommerce/coursevideoadd/${c.id}`)}
                      >
                        <VideoLibrary fontSize="medium" />
                      </IconButton>
                      <IconButton
                        size="large"
                        color="primary"
                        sx={{
                          backgroundColor: "white",
                          "&:hover": { backgroundColor: "rgba(125, 11, 72, 0.69)" },
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          mr: 1,
                        }}
                        onClick={() => history.push(`/ecommerce/edit/${c.id}`)}
                      >
                        <EditIcon fontSize="medium" />
                      </IconButton>
                      <IconButton
                        size="large"
                        color="error"
                        sx={{
                          backgroundColor: "white",
                          "&:hover": { backgroundColor: "rgba(125, 11, 72, 0.69)" },
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                        }}
                        onClick={() => handleDelete(c.id)}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Box>

                    {/* Etiqueta de nivel, esquina opuesta a los iconos */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 3,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(3px)",
                        borderRadius: 10,
                        px: 1.2,
                        py: 0.4,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        boxShadow: "0px 1px 4px rgba(0,0,0,0.15)",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: getLevelColor(c.level),
                        }}
                      />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#333" }}>
                        {c.level}
                      </Typography>
                    </Box>

                    <CardActionArea sx={{ height: "70%" }}>
                      {/* Imagen a pantalla completa de la card */}
                      <CardMedia
                        component="img"
                        image={c.cover_image_url}
                        alt={c.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", 
                          objectPosition: "center",
                        }}
                      />

                      {/* Overlay degradado para legibilidad del texto */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "45%",
                          background: "linear-gradient(to top, rgba(0, 0, 0, 0.77) 0%, rgba(0, 0, 0, 0.58) 55%, rgba(0,0,0,0) 100%)",
                        }}
                      />

                      {/* Panel de información flotante */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {c.hasCertificate && (
                          <Chip
                            label="Certificado"
                            color="primary"
                            size="small"
                            sx={{
                              alignSelf: "flex-start",
                              mb: 0.5,
                              fontWeight: 600,
                              boxShadow: "0px 2px 6px rgba(0,0,0,0.25)",
                            }}
                          />
                        )}
                        <Typography
                          sx={{
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 16,
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textShadow: "0px 1px 3px rgba(0,0,0,0.5)",
                          }}
                        >
                          {c.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 13,
                            textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          {systems.find((s) => s.id === c.system_id)?.name || "Sin sistema"}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>

        {/* Paginación */}
        {filteredCourses.length > itemsPerPage && (
          <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredCourses.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default Product;