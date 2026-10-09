import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Box, Container, Paper, Grid, Stack, TextField, Typography, Button, Avatar,
  Chip, CircularProgress, LinearProgress, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Swal from "sweetalert2";
import SystemContext from "../../context/SystemContext/SystemContext";

const PINK = "#FF5C95";

const theme = createTheme({
  palette: {
    primary: { main: PINK, contrastText: "#fff" },
    background: { default: "#FFF6F9" },
  },
  shape: { borderRadius: 14 },
  typography: { button: { textTransform: "none", fontWeight: 600 } },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

const EMPTY_FORM = { name: "", description: "", video: null };

const AddSystem = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerSystemPorId, addSystem, updateSystem } = useContext(SystemContext);

  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const goBack = () => (onCancel ? onCancel() : history.push("/system/list"));
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Cargar al editar / limpiar al crear
  useEffect(() => {
    if (!id) {
      setForm(EMPTY_FORM);
      setPreview(null);
      setProgress(0);
      return;
    }
    setLoading(true);
    obtenerSystemPorId(id)
      .then((s) => {
        setForm({ name: s.name || "", description: s.description || "", video: null });
        setPreview(s.system_icon || null);
      })
      .catch(() => Swal.fire("Error", "No se pudo cargar la academia", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      return Swal.fire("Archivo inválido", "Solo se permiten videos", "warning");
    }
    setForm((p) => ({ ...p, video: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (form.video instanceof File) formData.append("video", form.video);

    setLoading(true);
    setProgress(0);

    try {
      id ? await updateSystem(id, formData, setProgress) : await addSystem(formData, setProgress);

      Swal.fire({
        icon: "success",
        title: "Academia guardada",
        timer: 1500,
        showConfirmButton: false,
        willClose: () => history.push("/system/list"),
      });
    } catch {
      Swal.fire("Error", "No se pudo guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  const uploading = loading && progress > 0;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
        <Container maxWidth="sm" component="form" onSubmit={handleSubmit}>
          {/* Encabezado */}
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
              <SchoolRoundedIcon />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight={800}>
                {id ? "Editar Academia" : "Agregar Secreto"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nombre, descripción y video
              </Typography>
            </Box>
            {id && <Chip label="Edición" color="primary" variant="outlined" />}
          </Stack>

          <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${alpha(PINK, 0.15)}` }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField name="name" label="Nombre" fullWidth required
                  value={form.name} onChange={handleChange} disabled={loading} />
              </Grid>

              <Grid item xs={12}>
                <TextField name="description" label="Descripción" fullWidth multiline rows={3}
                  value={form.description} onChange={handleChange} disabled={loading} />
              </Grid>

              {/* Video */}
              <Grid item xs={12}>
                <Box
                  component="label"
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 2,
                    cursor: loading ? "not-allowed" : "pointer",
                    border: `2px dashed ${alpha(PINK, 0.5)}`, borderRadius: 3,
                    bgcolor: alpha(PINK, 0.04), transition: ".2s",
                    "&:hover": { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha(PINK, 0.15), color: PINK }}>
                    <VideoLibraryRoundedIcon />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography fontWeight={600}>Video del secreto</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {form.video ? form.video.name : preview ? "Haz clic para reemplazar" : "Haz clic para seleccionar"}
                    </Typography>
                  </Box>
                  {preview && <CheckCircleRoundedIcon color="primary" />}
                  <input hidden type="file" accept="video/*" onChange={handleVideoChange} disabled={loading} />
                </Box>

                {preview && (
                  <Box
                    component="video" src={preview} controls
                    sx={{
                      mt: 2, width: "100%", maxHeight: 360, borderRadius: 3, bgcolor: "#000",
                      border: `1px solid ${alpha(PINK, 0.25)}`,
                    }}
                  />
                )}
              </Grid>

              {/* Progreso de subida */}
              {uploading && (
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LinearProgress variant="determinate" value={progress}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                    <Typography variant="body2" fontWeight={600}>{progress}%</Typography>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Acciones */}
          <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={2} justifyContent="flex-end" mt={3}>
            <Button variant="outlined" size="large" onClick={goBack} disabled={loading} sx={{ minWidth: 140 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{ minWidth: 180, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
              {loading
                ? <><CircularProgress size={20} color="inherit" thickness={5} sx={{ mr: 1 }} />Guardando...</>
                : "Guardar Secreto"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AddSystem;