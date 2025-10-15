import React, { useContext, useEffect, useReducer } from "react";
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
} from "@mui/material";
import { useHistory } from "react-router-dom";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, VideoLibrary } from "@mui/icons-material";
import { Typography, Chip } from "../../components/Wrappers";
import CoursesContext from "../../context/CoursesContext/CoursesContext";
import Swal from "sweetalert2";

const Product = () => {
  const history = useHistory();
  const { courses = [], obtenerCursos, cargando, eliminarCurso } = useContext(CoursesContext);

  // Estado de filtros y búsqueda
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    {
      valueType: "Todos",
      valueBrands: "Todos",
      valueSize: "Todos",
      searchTerm: "",
    }
  );

  useEffect(() => {
    obtenerCursos();
  }, []);

  // Filtrado seguro
  const filteredCourses = (courses || [])
    .filter((c) => c?.title?.toLowerCase().includes(state.searchTerm.toLowerCase()))
    .filter((c) => state.valueType === "Todos" || c?.category === state.valueType)
    .filter((c) => state.valueBrands === "Todos" || c?.system === state.valueBrands)
    .filter((c) => state.valueSize === "Todos" || c?.level?.toLowerCase() === state.valueSize.toLowerCase());

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
        eliminarCurso(id);
      }
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
            background: "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(200,200,200,0.3)",
          }}
        >
          <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={2}>
            <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
              {/* Categoría */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={state.valueType}
                  onChange={(e) => dispatch({ valueType: e.target.value })}
                  label="Categoría"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Programación">Programación</MenuItem>
                  <MenuItem value="Diseño">Diseño</MenuItem>
                </Select>
              </FormControl>

              {/* Sistema */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Sistema</InputLabel>
                <Select
                  value={state.valueBrands}
                  onChange={(e) => dispatch({ valueBrands: e.target.value })}
                  label="Sistema"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Web">Web</MenuItem>
                  <MenuItem value="Móvil">Móvil</MenuItem>
                </Select>
              </FormControl>

              {/* Nivel */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={state.valueSize}
                  onChange={(e) => dispatch({ valueSize: e.target.value })}
                  label="Nivel"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Básico">Básico</MenuItem>
                  <MenuItem value="Intermedio">Intermedio</MenuItem>
                  <MenuItem value="Avanzado">Avanzado</MenuItem>
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
        <Grid container spacing={3}>
          {cargando ? (
            <Typography variant="body1" sx={{ p: 3 }}>
              Cargando cursos...
            </Typography>
          ) : filteredCourses.length === 0 ? (
            <Typography variant="body1" sx={{ p: 3 }}>
              No se encontraron cursos.
            </Typography>
          ) : (
            filteredCourses.map((c, index) => (
              <Grid item xs={12} sm={6} md={3} key={c.id || index}>
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
                    {/* ICONOS EDITAR / ELIMINAR */}
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
                        onClick={() => history.push(`/app/ecommerce/coursevideoadd/${c.id}`)}
                      >
                        <VideoLibrary fontSize="medium" />
                      </IconButton>
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
                        onClick={() => history.push(`/app/ecommerce/edit/${c.id}`)}
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
                        onClick={() => handleDelete(c.id)}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Box>

                    <CardActionArea onClick={() => history.push(`/app/courses/${c.id}`)}>
                      <Box sx={{ position: "relative", height: 200, backgroundColor: "#f7f7f7" }}>
                        <CardMedia
                          component="img"
                          image={
                            c.cover_image_url && c.cover_image_url !== ""
                              ? c.cover_image_url
                              : "/no-image.jpg"
                          }
                          alt={c.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain", // 🔥 Hace que se vea completa
                            objectPosition: "center",
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            transition: "transform 0.3s ease",
                            backgroundColor: "#fff", // mejora contraste si sobra espacio
                          }}
                        />
                        {/* <Chip
                          label={c.category || "General"}
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            borderRadius: "8px",
                            fontWeight: 600,
                          }}
                        /> */}
                      </Box>

                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          <b>{c.title}</b>
                        </Typography>
                        {/* <Typography variant="body2" color="text.secondary">
                          {c.description || "Sin descripción"}
                        </Typography> */}
                        {/* <div dangerouslySetInnerHTML={{__html: c.description}}/> */}
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
      </Grid>
    </Grid>
  );
};

export default Product;
