import React, { useContext, useEffect, useReducer, useState } from "react";
import {
  Grid,
  Box,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardActionArea,
  TextField,
  InputAdornment,
  Paper,
  Fade,
  IconButton,
  Pagination,
  Button,
  Typography,
  Chip,
  Skeleton,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoLibraryIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useHistory } from "react-router-dom";
import CoursesContext from "../../context/CoursesContext/CoursesContext";
import SystemContext from "../../context/SystemContext/SystemContext";
import Swal from "sweetalert2";

// ============ Constantes de diseño ============
const PRIMARY = "#FF5C93";
const CARD_WIDTH = 300;
const CARD_HEIGHT = 340;

const LEVEL_COLORS = {
  principiante: "#2ecc71",
  intermedio: "#f5a623",
  avanzado: "#e74c3c",
};

const Product = () => {
  const history = useHistory();
  const { courses = [], obtenerCursos, cargando, eliminarCurso } = useContext(CoursesContext);
  const { systems = [], getSystems } = useContext(SystemContext);

  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { valueSystem: "Todos", valueLevel: "Todos", searchTerm: "" }
  );

  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    obtenerCursos();
    getSystems();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [state.valueSystem, state.valueLevel, state.searchTerm]);

  const filteredCourses = (courses || [])
    .filter((c) => c.title?.toLowerCase().includes(state.searchTerm.toLowerCase()))
    .filter((c) => state.valueSystem === "Todos" || c.system_id === parseInt(state.valueSystem))
    .filter(
      (c) =>
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

  const getImage = (c) => c.coverImage || c.cover_image_url || "/no-image.jpg";

  const getLevelColor = (level) => LEVEL_COLORS[level?.toLowerCase()] || "#999";

  return (
    <Grid container spacing={3}>
      {/* ================= FILTROS ================= */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(240,244,248,0.9), rgba(255,255,255,0.95))",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(200,200,200,0.3)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel
                  sx={{
                    "&.Mui-focused": {
                      color: PRIMARY,
                    },
                  }}
                >
                  Sistema
                </InputLabel>
                <Select
                  value={state.valueSystem}
                  onChange={(e) => dispatch({ valueSystem: e.target.value })}
                  label="Sistema"
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: PRIMARY,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: PRIMARY,
                    },
                  }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {systems.map((sys) => (
                    <MenuItem key={sys.id} value={sys.id}>
                      {sys.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel
                  sx={{
                    "&.Mui-focused": {
                      color: PRIMARY,
                    },
                  }}
                >
                  Nivel
                </InputLabel>

                <Select
                  value={state.valueLevel}
                  onChange={(e) => dispatch({ valueLevel: e.target.value })}
                  label="Nivel"
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: PRIMARY,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: PRIMARY,
                    },
                  }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Principiante">Principiante</MenuItem>
                  <MenuItem value="Intermedio">Intermedio</MenuItem>
                  <MenuItem value="Avanzado">Avanzado</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                size="small"
                placeholder="Buscar curso..."
                value={state.searchTerm}
                onChange={(e) => dispatch({ searchTerm: e.target.value })}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  width: { xs: "100%", sm: 250 },

                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: PRIMARY,
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: PRIMARY,
                    },
                  },

                  "& .MuiInputBase-input": {
                    "&::placeholder": {
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: PRIMARY }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => history.push("/ecommerce/courseadd")}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  backgroundColor: PRIMARY,
                  color: "#fff",
                  "&:hover": { backgroundColor: "#e14b82", boxShadow: "none" },
                }}
              >
                Agregar Curso
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* ================= CARDS ================= */}
      <Grid item xs={12}>
        {cargando ? (
          <Grid container spacing={{ xs: 2, md: 2.5 }} justifyContent="center">
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid item key={i}>
                <Skeleton
                  variant="rounded"
                  width={CARD_WIDTH}
                  height={CARD_HEIGHT}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : filteredCourses.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No se encontraron cursos con los filtros seleccionados.
          </Alert>
        ) : (
          <Grid
            container
            spacing={{ xs: 2, md: 2.5 }}
            justifyContent="center"
            alignItems="stretch"
          >
            {paginatedCourses.map((c, index) => (
              <Grid item key={c.id || index}>
                <Fade in timeout={400 + index * 60}>
                  <Card
                    sx={{
                      position: "relative",
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow:
                        "0px 3px 10px rgba(15,14,14,0.12), 0px 1px 3px rgba(0,0,0,0.08)",
                      transition: "transform .3s ease, box-shadow .3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow:
                          "0px 12px 26px rgba(15,14,14,0.28), 0px 3px 6px rgba(0,0,0,0.1)",
                      },
                      "&:hover .card-actions": { opacity: 1 },
                      "&:hover .card-img": { transform: "scale(1.05)" },
                    }}
                  >
                    {/* -------- IMAGEN DE FONDO (cubre toda la card) -------- */}
                    <Box
                      className="card-img"
                      component="img"
                      src={getImage(c)}
                      alt={c.title}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        transition: "transform .5s ease",
                        zIndex: 0,
                      }}
                    />

                    {/* -------- CAPA CLICKEABLE -------- */}
                    <CardActionArea
                      onClick={() => history.push(`/ecommerce/edit/${c.id}`)}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        background: "transparent",
                        "& .MuiCardActionArea-focusHighlight": {
                          background: "transparent",
                        },
                      }}
                    />

                    {/* -------- OVERLAY DEGRADADO -------- */}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 2,
                        pointerEvents: "none",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.15) 70%, rgba(0,0,0,0) 100%)",
                      }}
                    />

                    {/* -------- ETIQUETA DE NIVEL -------- */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 4,
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
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#333",
                          textTransform: "capitalize",
                        }}
                      >
                        {c.level}
                      </Typography>
                    </Box>

                    {/* -------- ICONOS FLOTANTES -------- */}
                    <Stack
                      className="card-actions"
                      direction="row"
                      spacing={0.5}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 4,
                        opacity: { xs: 1, md: 0 },
                        transition: "opacity .25s ease",
                      }}
                    >
                      <Tooltip title="Videos">
                        <IconButton
                          size="small"
                          onClick={() =>
                            history.push(`/ecommerce/coursevideoadd/${c.id}`)
                          }
                          sx={{
                            bgcolor: "white",
                            width: 36,
                            height: 36,
                            "&:hover": { bgcolor: "grey.100" },
                          }}
                        >
                          <VideoLibraryIcon
                            fontSize="small"
                            sx={{ color: "#FF5C95" }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => history.push(`/ecommerce/edit/${c.id}`)}
                          sx={{
                            bgcolor: "white",
                            width: 36,
                            height: 36,
                            "&:hover": { bgcolor: "grey.100" },
                          }}
                        >
                          <EditIcon
                            fontSize="small"
                            sx={{ color: "#FF5C95" }}
                          />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(c.id)}
                          sx={{
                            bgcolor: "white",
                            width: 36,
                            height: 36,
                            "&:hover": { bgcolor: "grey.100" },
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* -------- INFO EN LA PARTE INFERIOR -------- */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        zIndex: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        pointerEvents: "none",
                      }}
                    >
                      {c.hasCertificate && (
                        <Chip
                          label="Certificado"
                          size="small"
                          sx={{
                            alignSelf: "flex-start",
                            mb: 0.5,
                            fontWeight: 600,
                            backgroundColor: PRIMARY,
                            color: "#fff",
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
                          textShadow: "0px 1px 3px rgba(0,0,0,0.6)",
                        }}
                      >
                        {c.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        {systems.find((s) => s.id === c.system_id)?.name ||
                          "Sin sistema"}
                      </Typography>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ================= PAGINACIÓN ================= */}
        {filteredCourses.length > itemsPerPage && (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <Pagination
              count={Math.ceil(filteredCourses.length / itemsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
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
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};

export default Product;