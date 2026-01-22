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
  CircularProgress,
} from '@mui/material';
import CoursesContext from '../../context/CoursesContext/CoursesContext';
import MethodGet from '../../config/Service';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { PDFDocument } from 'pdf-lib';

const CourseAdd = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { crearCurso, actualizarCurso, obtenerCursoPorId } =
    useContext(CoursesContext);

  const [form, setForm] = useState({
    title: '',
    description: '',
    level: '',
    hasCertificate: true,
    coverImage: null,
    certificate: null,
    system_id: '',
  });

  const [preview, setPreview] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'link',
  ];

  /* =========================
      CARGAR SISTEMAS
  ========================== */
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const res = await MethodGet('/systems');
        setSystems(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSystems();
  }, []);

  /* =========================
      CARGAR CURSO (EDITAR)
  ========================== */
  useEffect(() => {
    const fetchCurso = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const curso = await obtenerCursoPorId(id);

        setForm({
          title: curso.title || '',
          description: curso.description || '',
          level: curso.level || '',
          hasCertificate: !!curso.certificate_url,
          coverImage: null,
          certificate: null,
          system_id: curso.system_id || '',
        });

        setPreview(curso.cover_image_url || null);
        setCertificatePreview(curso.certificate_url || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [id]);

  /* =========================
      HANDLERS
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, coverImage: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire('Error', 'Solo se permiten PDFs', 'error');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      const { width, height } = pdf.getPage(0).getSize();

      if (Math.abs(width - 792) > 5 || Math.abs(height - 612) > 5) {
        Swal.fire(
          'Error',
          'El certificado debe ser tamaño carta horizontal',
          'error'
        );
        return;
      }

      setForm((prev) => ({ ...prev, certificate: file }));
      setCertificatePreview(URL.createObjectURL(file));
    } catch {
      Swal.fire('Error', 'No se pudo leer el PDF', 'error');
    }
  };

  /* =========================
      SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      form.hasCertificate &&
      !form.certificate &&
      !certificatePreview
    ) {
      Swal.fire(
        'Falta certificado',
        'Debes subir un certificado',
        'warning'
      );
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('level', form.level);
    formData.append('system_id', form.system_id);
    formData.append('hasCertificate', form.hasCertificate ? 1 : 0);

    if (form.coverImage) formData.append('coverImage', form.coverImage);
    if (form.hasCertificate && form.certificate) {
      formData.append('certificate', form.certificate);
    }

    try {
      if (id) {
        await actualizarCurso(id, formData);
      } else {
        await crearCurso(formData);
      }

      Swal.fire('Éxito', 'Curso guardado correctamente', 'success');
      onCancel ? onCancel() : history.push('/ecommerce/gridproducts');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      RENDER
  ========================== */
  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" mb={3}>
            {id ? 'Editar curso' : 'Nuevo curso'}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Título"
                  name="title"
                  fullWidth
                  required
                  value={form.title}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Nivel"
                  name="level"
                  fullWidth
                  required
                  value={form.level}
                  onChange={handleChange}
                >
                  <MenuItem value="principiante">Principiante</MenuItem>
                  <MenuItem value="intermedio">Intermedio</MenuItem>
                  <MenuItem value="avanzado">Avanzado</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <ReactQuill
                  value={form.description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Sistema"
                  name="system_id"
                  fullWidth
                  required
                  value={form.system_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  {systems.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasCertificate}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          hasCertificate: checked,
                          certificate: checked ? prev.certificate : null,
                        }));
                        if (!checked) setCertificatePreview(null);
                      }}
                    />
                  }
                  label="Incluye certificado"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button component="label" variant="contained" fullWidth>
                  Subir portada
                  <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                </Button>
              </Grid>

              {form.hasCertificate && (
                <Grid item xs={12} sm={6}>
                  <Button component="label" variant="contained" fullWidth>
                    Subir certificado (PDF)
                    <input hidden type="file" accept="application/pdf" onChange={handleCertificateChange} />
                  </Button>
                </Grid>
              )}

              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                      sx={{ minHeight: 45 }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={22} color="inherit" thickness={5} />
                          Guardando...
                        </Box>
                      ) : (
                        id ? 'Actualizar curso' : 'Guardar curso'
                      )}
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      sx={{ minHeight: 45 }}
                      onClick={() =>
                        onCancel ? onCancel() : history.push('/ecommerce/gridproducts')
                      }
                    >
                      Cancelar
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseAdd;
