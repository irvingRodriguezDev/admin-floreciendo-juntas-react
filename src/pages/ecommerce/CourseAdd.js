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
  Paper,
} from '@mui/material';
import CoursesContext from '../../context/CoursesContext/CoursesContext';
import MethodGet from '../../config/Service';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const CourseAdd = ({ onCancel }) => {
  const { id } = useParams();
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

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [preview, setPreview] = useState(null);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!id) return;

    const fetchCurso = async () => {
      setLoading(true);
      try {
        let curso = courses.find((c) => c.id === parseInt(id));
        if (!curso) {
          const res = await MethodGet(`/courses/${id}`);
          curso = res.data;
        }

        setForm({
          title: curso.title || '',
          description: curso.description || '',
          level: curso.level || '',
          hasCertificate: curso.hasCertificate || false,
          coverImage: null,
          system_id: curso.system_id || '',
        });

        if (curso.description) {
          const contentBlock = htmlToDraft(curso.description);
          if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            setEditorState(EditorState.createWithContent(contentState));
          }
        }

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

  const handleEditorChange = (state) => {
    setEditorState(state);
    const html = draftToHtml(convertToRaw(state.getCurrentContent()));
    setForm({ ...form, description: html });
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
        await actualizarCurso(id, formData);
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
        setEditorState(EditorState.createEmpty());
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
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
            {id ? 'Editar curso' : 'Agregar nuevo curso'}
          </Typography>

          <form onSubmit={handleSubmit} encType='multipart/form-data'>
            <Grid container spacing={3}>
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
                <Typography sx={{ mb: 1, fontWeight: 500 }}>Descripción</Typography>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    minHeight: 200,
                    maxHeight: 300,
                    overflowY: 'auto',
                    backgroundColor: '#fffefc',
                  }}
                >
                  <Editor
                    editorState={editorState}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    onEditorStateChange={handleEditorChange}
                    toolbar={{
                      options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'history'],
                    }}
                  />
                </Paper>
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
                    sx={{
                      width: '100%',
                      height: 220,
                      borderRadius: 2,
                      mt: 1,
                      overflow: 'hidden',
                      backgroundColor: '#f7f7f7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      component='img'
                      src={preview}
                      alt='Vista previa'
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain', // 👈 Aquí se ajusta completa sin recortar
                      }}
                    />
                  </Box>
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
