import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardActions,
  CardContent,
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

  // 💡 Nuevo: Hook para detectar el tamaño de la pantalla
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Función para determinar el ancho óptimo de la imagen basado en el viewport
  const getOptimalWidth = () => {
    if (isMobile) return 300; // Móviles (300px)
    if (isTablet) return 400; // Tablets (400px)
    return 350; // Desktop (350px)
  };

  // 📌 El ancho de la imagen que se solicitará a CloudFront
  const optimalWidth = getOptimalWidth();
  // 📌 Calidad de la imagen (ajustable)
  const imageQuality = 85;

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  // Función para obtener la URL correcta de la imagen
  const getImage = (c) => {
    if (c.coverImage && c.coverImage !== "") return c.coverImage;
    if (c.cover_image_url && c.cover_image_url !== "") return c.cover_image_url;
    return "/no-image.jpg";
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
              {/* Sistema */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Secreto</InputLabel>
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

              {/* Nivel */}
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

            {/* Buscador */}
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
                      borderRadius: 3,
                      width: 260,
                      height: 470,
                      boxShadow: "0px 2px 8px rgba(15, 14, 14, 0.1), 0px 1px 2px rgba(0,0,0,0.1)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0px 4px 12px rgba(27, 25, 25, 0.31), 0px 2px 4px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {/* ICONOS */}
                    <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
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

                    <CardActionArea>
                      <CardMedia
                        component="img"
                        image={getImageUrl(
                          c.cover_image_url,
                          optimalWidth,
                          imageQuality
                        )}
                        alt={c.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center",
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3,
                          backgroundColor: "#fff",
                        }}
                      />
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          <b>{c.title}</b>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {systems.find(s => s.id === c.system_id)?.name || "Sin sistema"}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <Typography fontWeight="bold">{c.level}</Typography>
                        {c.hasCertificate && <Chip label="Certificado" color="primary" size="small" />}
                      </Box>
                    </CardActions>
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
