import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import SystemContext from "../../context/SystemContext/SystemContext";

const AddSystem = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerSystemPorId, addSystem, updateSystem } = useContext(SystemContext);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Cargar sistema al editar
  useEffect(() => {
    const cargarSistema = async () => {
      if (!id) return; // Si no hay ID, es creación
      setLoading(true);
      try {
        const system = await obtenerSystemPorId(id);

        if (!system) {
          Swal.fire({
            icon: "error",
            title: "No encontrado",
            text: "El sistema solicitado no existe.",
          });
          return;
        }

        setForm({
          name: system.name || "",
          description: system.description || "",
          icon: null,
        });

        if (system.system_icon) {
          setPreview(system.system_icon);
        }
      } catch (error) {
        console.error("Error al cargar sistema:", error);
        Swal.fire("Error", "No se pudo cargar el sistema", "error");
      } finally {
        setLoading(false);
      }
    };

    cargarSistema();
  }, [id]);

  // 📤 Manejar cambios de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🖼️ Subir ícono SVG
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "image/svg+xml") {
      setForm({ ...form, icon: file });

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      Swal.fire({
        title: "Archivo no permitido",
        text: "Solo se aceptan archivos SVG.",
        icon: "warning",
      });
      e.target.value = "";
      setForm({ ...form, icon: null });
      setPreview(null);
    }
  };

  // 💾 Guardar sistema
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await updateSystem(id, form);
      } else {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        if (form.icon instanceof File) formData.append("icon", form.icon);
        await addSystem(formData);
      }

      Swal.fire({
        icon: "success",
        title: "Guardado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      if (onCancel) onCancel();
      else history.push("/system/list");
    } catch (error) {
      console.error("Error al guardar sistema:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un problema al guardar el sistema.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3 }}>
            {id ? "Editar Sistema" : "Agregar Nuevo Sistema"}
          </Typography>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid container spacing={2}>
              {/* Nombre */}
              <Grid item xs={12}>
                <TextField
                  label="Nombre del sistema"
                  name="name"
                  fullWidth
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </Grid>

              {/* Descripción */}
              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  name="description"
                  fullWidth
                  multiline
                  rows={3}
                  required
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Ícono (solo SVG) */}
              <Grid item xs={12} sm={6}>
                <Button variant="contained" component="label" fullWidth>
                  Subir ícono (solo SVG)
                  <input
                    type="file"
                    hidden
                    accept="image/svg+xml"
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>

              {/* Vista previa */}
              {preview && (
                <Grid item xs={12} sm={6}>
                  <Box
                    component="img"
                    src={preview}
                    alt="Vista previa ícono"
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      mt: 1,
                      objectFit: "contain",
                      border: "1px solid #ddd",
                      backgroundColor: "#f8f8f8",
                      p: 1,
                    }}
                  />
                </Grid>
              )}

              {/* Botones */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2, minHeight: 45, position: "relative" }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={22} color="inherit" thickness={5} />
                      Guardando...
                    </Box>
                  ) : id ? (
                    "Actualizar Sistema"
                  ) : (
                    "Guardar Sistema"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() =>
                    onCancel ? onCancel() : history.push("/system/list")
                  }
                >
                  Cancelar
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddSystem;
