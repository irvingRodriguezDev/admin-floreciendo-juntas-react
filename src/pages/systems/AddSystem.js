import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Grid,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import Widget from "components/Widget";
import SystemContext from "../../context/SystemContext/SystemContext";

const AddSystem = ({ onCancel }) => {
  const { id } = useParams(); // Si existe, estamos en modo edición
  const history = useHistory();
  const { systems, addSystem, updateSystem } = useContext(SystemContext);

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    icon: null,
  });

  const [preview, setPreview] = useState(null);

  // 🧠 Si estamos editando, carga los datos del sistema seleccionado
  useEffect(() => {
    if (id) {
      const systemToEdit = systems.find((s) => s.id === parseInt(id));
      if (systemToEdit) {
        setInitialValues({
          name: systemToEdit.name || "",
          description: systemToEdit.description || "",
          icon: null, // si el usuario no cambia el ícono, no se vuelve a subir
        });
        if (systemToEdit.icon) setPreview(systemToEdit.icon);
      }
    }
  }, [id, systems]);

  // ✅ Validación
  const validationSchema = Yup.object({
    name: Yup.string().required("El nombre es obligatorio"),
    description: Yup.string().required("La descripción es obligatoria"),
  });

  // 📤 Manejar subida de imagen
  const handleImageChange = (e, setFieldValue) => {
    const file = e.currentTarget.files[0];
    if (file) {
      if (file.type === "image/svg+xml" || file.type.startsWith("image/")) {
        setFieldValue("icon", file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        alert("Solo se permiten imágenes o archivos SVG");
      }
    }
  };

  // 💾 Crear o actualizar
  const handleSubmit = async (values, { resetForm }) => {
    console.log("📦 Valores del formulario:", values);

    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("description", values.description || "");

    if (values.icon instanceof File) {
      formData.append("icon", values.icon);
    }

    try {
      if (id) {
        // enviar 'formData', no 'initialValues'
        await updateSystem(id, formData);
        history.push("/app/system/list");
      } else {
        await addSystem(formData);
        resetForm();
        setPreview(null);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };



  return (
    <Widget title={id ? "Editar Sistema" : "Agregar Sistema"} collapse close>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <Grid container spacing={3} direction="column">
              {/* Campo Nombre */}
              <Grid item>
                <TextField
                  fullWidth
                  label="Nombre del Sistema"
                  name="name"
                  value={form.values.name}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={!!(form.touched.name && form.errors.name)}
                  helperText={form.touched.name && form.errors.name}
                  autoFocus
                />
              </Grid>

              {/* Campo Descripción */}
              <Grid item>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descripción"
                  name="description"
                  value={form.values.description}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={!!(form.touched.description && form.errors.description)}
                  helperText={form.touched.description && form.errors.description}
                />
              </Grid>

              {/* Campo Ícono (subida de archivo) */}
              <Grid item>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Ícono del sistema (SVG o imagen)
                </Typography>
                <Button variant="contained" component="label">
                  Seleccionar archivo
                  <input
                    type="file"
                    hidden
                    accept="image/*,.svg"
                    onChange={(e) => handleImageChange(e, form.setFieldValue)}
                  />
                </Button>

                {preview && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Vista previa:
                    </Typography>
                    <img
                      src={preview}
                      alt="icon preview"
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 10,
                        marginTop: 5,
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        backgroundColor: "#f8f8f8",
                        padding: 5,
                      }}
                    />
                  </div>
                )}
              </Grid>

              {/* Botones */}
              <Grid item container spacing={2} mt={2}>
                <Grid item>
                  <Button color="primary" variant="contained" type="submit">
                    {id ? "Actualizar" : "Guardar"}
                  </Button>
                </Grid>

                {!id && (
                  <Grid item>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={form.handleReset}
                    >
                      Reset
                    </Button>
                  </Grid>
                )}

                <Grid item>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={() =>
                      onCancel ? onCancel() : history.push("/app/system/list")
                    }
                  >
                    Cancelar
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Widget>
  );
};

export default AddSystem;
