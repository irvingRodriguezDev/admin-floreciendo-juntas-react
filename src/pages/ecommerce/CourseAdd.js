import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CoursesContext from '../../context/CoursesContext/CoursesContext';
import MethodGet from '../../config/Service';

const CourseAdd = ({ onCancel }) => {
  const { id } = useParams(); // Si existe, estamos en modo edición
  const history = useHistory();
  const { courses, crearCurso, actualizarCurso } = useContext(CoursesContext);

  const [form, setForm] = useState({
    title: '',
    description: '',
    level: '',
    hasCertificate: false,
    coverImage: null,
    system_id: '',
  });

  const [preview, setPreview] = useState(null);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar sistemas disponibles
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const res = await MethodGet('/systems');
        setSystems(res.data);
      } catch (error) {
        console.error('Error al obtener sistemas:', error);
      }
    };
    fetchSystems();
  }, []);

  // Cargar curso si estamos en edición
  useEffect(() => {
    if (!id) return;

    const fetchCurso = async () => {
      setLoading(true);
      try {
        // Primero intentamos obtenerlo de memoria
        let curso = courses.find((c) => c.id === parseInt(id));

        // Si no está en memoria, lo pedimos al backend
        if (!curso) {
          const res = await MethodGet(`/courses/${id}`);
          curso = res.data;
        }

        setForm({
          title: curso.title || '',
          description: curso.description || '',
          level: curso.level || '',
          hasCertificate: curso.hasCertificate || false,
          cover_image_url: null, // La imagen nueva
          system_id: curso.system_id || '',
        });

        // Vista previa con la imagen existente
        setPreview(curso.cover_image_url || null);
      } catch (error) {
        console.error('Error al obtener curso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [id, courses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, coverImage: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('level', form.level);
    formData.append('hasCertificate', form.hasCertificate ? 1 : 0);
    formData.append('system_id', form.system_id);
    if (form.coverImage) formData.append('coverImage', form.coverImage);

    try {
      if (id) {
        await actualizarCurso(id, form);
      } else {
        await crearCurso(formData);
        setForm({
          title: '',
          description: '',
          level: '',
          hasCertificate: false,
          coverImage: null,
          system_id: '',
        });
        setPreview(null);
      }

      if (onCancel) onCancel();
      else history.push('/app/ecommerce/gridproducts');
    } catch (error) {
      console.error('Error al guardar curso:', error);
    }
  };

  if (loading) return <Typography>Cargando curso...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 3 }}>
            {id ? 'Editar curso' : 'Agregar nuevo curso'}
          </Typography>

          <form onSubmit={handleSubmit} encType='multipart/form-data'>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Título'
                  name='title'
                  fullWidth
                  required
                  value={form.title}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label='Nivel'
                  name='level'
                  fullWidth
                  required
                  value={form.level}
                  onChange={handleChange}
                >
                  <MenuItem value='principiante'>Principiante</MenuItem>
                  <MenuItem value='intermedio'>Intermedio</MenuItem>
                  <MenuItem value='avanzado'>Avanzado</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label='Descripción'
                  name='description'
                  fullWidth
                  multiline
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label='Sistema'
                  name='system_id'
                  fullWidth
                  required
                  value={form.system_id}
                  onChange={handleChange}
                >
                  <MenuItem value=''>Seleccionar sistema</MenuItem>
                  {systems.map((system) => (
                    <MenuItem key={system.id} value={system.id}>
                      {system.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasCertificate}
                      onChange={handleChange}
                      name='hasCertificate'
                    />
                  }
                  label='Incluye certificado'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button variant='contained' component='label' fullWidth>
                  Subir imagen de portada
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>

              {preview && (
                <Grid item xs={12} sm={6}>
                  <Box
                    component='img'
                    src={preview}
                    alt='Vista previa'
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      mt: 1,
                      objectFit: 'cover',
                      maxHeight: 200,
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {id ? 'Actualizar curso' : 'Guardar curso'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseAdd;
