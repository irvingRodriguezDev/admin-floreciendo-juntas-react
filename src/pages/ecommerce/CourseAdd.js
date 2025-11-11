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
  CircularProgress, // 🔹 agregado
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
  const { crearCurso, actualizarCurso, obtenerCursoPorId } = useContext(CoursesContext);

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

  // 🔹 Configuración del toolbar de Quill
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
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'color', 'background', 'list', 'bullet', 'align', 'link'
  ];

  // 🔹 Cargar sistemas
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

  // 🔹 Si hay ID, cargar curso
  useEffect(() => {
    const fetchCurso = async () => {
      if (!id) {
        setForm({
          title: '',
          description: '',
          level: '',
          hasCertificate: true,
          coverImage: null,
          certificate: null,
          system_id: '',
        });
        setPreview(null);
        setCertificatePreview(null);
        return;
      }

      setLoading(true);
      try {
        const curso = await obtenerCursoPorId(id);
        if (!curso) {
          Swal.fire({ icon: 'error', title: 'Curso no encontrado' });
          history.push('/ecommerce/gridproducts');
          return;
        }

        setForm({
          title: curso.title || '',
          description: curso.description || '',
          level: curso.level || '',
          hasCertificate: true,
          coverImage: null,
          certificate: null,
          system_id: curso.system_id || '',
        });

        setPreview(curso.cover_image_url || null);
        if (curso.certificate_url) setCertificatePreview(curso.certificate_url);
      } catch (error) {
        console.error('Error al obtener curso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [id, history]);

  // 🔹 Cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Cambios en el editor
  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  // 🔹 Imagen de portada
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, coverImage: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 🔹 Validar PDF
  const handleCertificateChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire({ icon: 'error', title: 'Archivo inválido', text: 'Solo se permiten archivos PDF.' });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();

      if (!(Math.abs(width - 792) < 5 && Math.abs(height - 612) < 5)) {
        Swal.fire({
          icon: 'error',
          title: 'Tamaño incorrecto',
          text: 'El PDF debe ser tamaño carta horizontal.',
        });
        return;
      }

      setForm((prev) => ({ ...prev, certificate: file }));
      setCertificatePreview(URL.createObjectURL(file));
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error al leer el PDF',
        text: 'No se pudo analizar el archivo. Intenta con otro PDF.',
      });
    }
  };

  // 🔹 Guardar curso
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 🔹 Activar loading

    if (!form.certificate && !certificatePreview) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta certificado',
        text: 'Debes subir un archivo PDF válido.',
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('level', form.level);
    formData.append('hasCertificate', 1);
    formData.append('system_id', form.system_id);
    if (form.coverImage) formData.append('coverImage', form.coverImage);
    if (form.certificate) formData.append('certificate', form.certificate);

    try {
      if (id) {
        await actualizarCurso(id, form);
      } else {
        await crearCurso(formData);
        setForm({
          title: '',
          description: '',
          level: '',
          hasCertificate: true,
          coverImage: null,
          certificate: null,
          system_id: '',
        });
        setPreview(null);
        setCertificatePreview(null);
      }

      Swal.fire({
        icon: 'success',
        title: 'Guardado correctamente',
        timer: 1500,
        showConfirmButton: false,
      });

      if (onCancel) onCancel();
      else history.push('/ecommerce/gridproducts');
    } catch (error) {
      console.error('Error al guardar curso:', error);
    } finally {
      setLoading(false); // 🔹 Desactivar loading
    }
  };

  if (loading && !id) return <Typography>Cargando curso...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {id ? 'Editar curso' : 'Agregar nuevo curso'}
          </Typography>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid container spacing={3}>
              {/* Título */}
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

              {/* Nivel */}
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

              {/* Descripción */}
              <Grid item xs={12}>
                <Typography sx={{ mb: 1, fontWeight: 500 }}>Descripción</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#fffefc' }}>
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={handleDescriptionChange}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ minHeight: 250 }}
                  />
                </Paper>
              </Grid>

              {/* Sistema */}
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
                  <MenuItem value="">Seleccionar sistema</MenuItem>
                  {systems.map((system) => (
                    <MenuItem key={system.id} value={system.id}>
                      {system.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Checkbox checked disabled />} label="Incluye certificado" />
              </Grid>

              {/* Portada y certificado */}
              <Grid container item xs={12} spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="contained" component="label" fullWidth>
                    Subir imagen de portada
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {preview && (
                    <Box sx={{ width: '100%', height: 400, mt: 1, borderRadius: 2, overflow: 'hidden' }}>
                      <Box component="img" src={preview} alt="Vista previa" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button variant="contained" component="label" fullWidth>
                    Subir certificado (PDF)
                    <input type="file" hidden accept="application/pdf" onChange={handleCertificateChange} />
                  </Button>

                  {(certificatePreview || form.certificate) && (
                    <Box sx={{ mt: 1, width: '100%', height: 400, border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden' }}>
                      <object data={`${certificatePreview}#zoom=44`} type="application/pdf" width="100%" height="100%">
                        <Typography variant="body2" sx={{ p: 1 }}>Tu navegador no soporta previsualizar PDFs.</Typography>
                      </object>
                    </Box>
                  )}
                </Grid>
              </Grid>

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
                    "Actualizar curso"
                  ) : (
                    "Guardar curso"
                  )}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() =>
                    onCancel ? onCancel() : history.push("/ecommerce/gridproducts")
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

export default CourseAdd;
