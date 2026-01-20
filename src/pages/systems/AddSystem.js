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
  LinearProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import SystemContext from "../../context/SystemContext/SystemContext";

const AddSystem = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerSystemPorId, addSystem, updateSystem } =
    useContext(SystemContext);

  const initialForm = {
    name: "",
    description: "",
    video: null,
  };


  const [form, setForm] = useState(initialForm);


  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🔹 Cargar academia al editar
  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      setLoading(true);
      try {
        const system = await obtenerSystemPorId(id);

        setForm({
          name: system.name || "",
          description: system.description || "",
          video: null,
        });

        if (system.system_icon) {
          setPreview(system.system_icon);
        }
      } catch (e) {
        Swal.fire("Error", "No se pudo cargar la academia", "error");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  useEffect(() => {
    if (!id) {
      setForm(initialForm);
      setPreview(null);
      setProgress(0);
    }
  }, [id]);


  // 🔹 Inputs texto
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Subir video + preview
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      Swal.fire("Archivo inválido", "Solo se permiten videos", "warning");
      return;
    }

    setForm({ ...form, video: file });
    setPreview(URL.createObjectURL(file));
  };

  // 🔹 Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);

    if (form.video instanceof File) {
      formData.append("video", form.video);
    }

    setLoading(true);
    setProgress(0);

    // Modal con barra de progreso
    Swal.fire({
      title: "Subiendo video...",
      html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;">
        <div style="width:100%;background:#d8d6d7;border-radius:4px;overflow:hidden;">
          <div id="swal-progress-bar"
               style="width:0%;height:10px;background:#FF5C93;transition:width 0.2s;">
          </div>
        </div>
        <div id="swal-progress-text">0%</div>
      </div>
    `,
      allowOutsideClick: false,
      showConfirmButton: false
    });

    try {
      if (id) {
        await updateSystem(id, formData, setProgress);
      } else {
        await addSystem(formData, setProgress);
      }

      Swal.fire({
        icon: "success",
        title: "Academia guardada",
        timer: 1500,
        showConfirmButton: false,
        willClose: () => history.push("/system/list"),
      });

    } catch (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" mb={3}>
            {id ? "Editar Academia" : "Agregar Secreto"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Nombre"
                  fullWidth
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* 🎥 SUBIR VIDEO */}
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth>
                  Subir video del secreto
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                </Button>
              </Grid>

              {/* 🎬 PREVIEW */}
              {preview && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <video
                    src={preview}
                    controls
                    style={{
                      width: '55%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '10px',
                    }}
                  />
                  </Box>
                </Grid>
              )}

              {/* 📊 PROGRESO */}
              {/* {progress > 0 && (
                <Grid item xs={12}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography align="center">{progress}%</Typography>
                </Grid>
              )} */}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Secreto"}
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
