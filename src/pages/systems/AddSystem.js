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
} from "@mui/material";
import Swal from "sweetalert2";
import SystemContext from "../../context/SystemContext/SystemContext";
import MethodGet from "../../config/Service";

const AddSystem = ({ onCancel }) => {
  const { id } = useParams(); // Si existe, estamos editando
  const history = useHistory();
  const { systems, addSystem, updateSystem } = useContext(SystemContext);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Efecto para cargar datos o limpiar formulario según el ID
  useEffect(() => {
    if (!id) {
      // 🔹 Si no hay ID => modo "agregar nuevo"
      setForm({
        name: "",
        description: "",
        icon: null,
      });
      setPreview(null);
      return;
    }

    // 🔹 Si hay ID => modo "editar"
    const fetchSystem = async () => {
      setLoading(true);
      try {
        let system = systems.find((s) => s.id === parseInt(id));

        if (!system) {
          const res = await MethodGet(`/systems/${id}`);
          system = res.data;
        }

        setForm({
          name: system.name || "",
          description: system.description || "",
          icon: null,
        });

        if (system.icon) setPreview(system.icon);
      } catch (error) {
        console.error("Error al cargar sistema:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystem();
  }, [id, systems]);

  // 📤 Cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🖼️ Manejar ícono (solo SVG)
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

  // 💾 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await updateSystem(id, form);
      } else {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        if (form.icon instanceof File) formData.append("icon", form.icon);

        await addSystem(formData);

        // 🔹 Limpiar formulario después de agregar
        setForm({
          name: "",
          description: "",
          icon: null,
        });
        setPreview(null);
      }

      if (onCancel) onCancel();
      else history.push("/app/system/list");
    } catch (error) {
      console.error("Error al guardar sistema:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un problema al guardar el sistema.",
      });
    }
  };

  if (loading) return <Typography>Cargando sistema...</Typography>;

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
                  sx={{ mt: 2 }}
                >
                  {id ? "Actualizar Sistema" : "Guardar Sistema"}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() =>
                    onCancel ? onCancel() : history.push("/app/system/list")
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
