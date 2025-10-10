import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { Grid, Button, TextField } from "@mui/material";
import Widget from "components/Widget";
import SystemContext from "../../context/SystemContext/SystemContext";

const AddSystem = ({ onCancel }) => {
  const { id } = useParams(); // ← Si existe, estamos en modo edición
  const history = useHistory();
  const { systems, addSystem, updateSystem } = useContext(SystemContext);

  const [initialValues, setInitialValues] = useState({ name: "" });

  // 🧠 Si estamos editando, carga los datos del sistema seleccionado
  useEffect(() => {
    if (id) {
      const systemToEdit = systems.find((s) => s.id === parseInt(id));
      if (systemToEdit) {
        setInitialValues({ name: systemToEdit.name });
      }
    }
  }, [id, systems]);

  // ✅ Validación
  const validationSchema = Yup.object({
    name: Yup.string().required("El nombre es obligatorio"),
  });

  // 💾 Crear o actualizar
  const handleSubmit = async (values, { resetForm }) => {
    if (id) {
      await updateSystem(id, values);
      history.push("/app/system/list"); // Redirige al listado
    } else {
      await addSystem(values);
      resetForm();
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

              {/* Botones */}
              <Grid item container spacing={2} mt={2}>
                <Grid item>
                  <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                  >
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
                    onClick={() => (onCancel ? onCancel() : history.push("/app/system/list"))}
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
