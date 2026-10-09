import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box, Container, Paper, Grid, Stack, TextField, MenuItem, Typography, Button,
  Switch, FormControlLabel, CircularProgress, Avatar, Chip,
  ThemeProvider, createTheme, alpha,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CoursesContext from '../../context/CoursesContext/CoursesContext';
import MethodGet from '../../config/Service';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { PDFDocument } from 'pdf-lib';

const PINK = '#FF5C95';

const theme = createTheme({
  palette: {
    primary: { main: PINK, contrastText: '#fff' },
    background: { default: '#FFF6F9' },
  },
  shape: { borderRadius: 14 },
  typography: { button: { textTransform: 'none', fontWeight: 600 } },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

const EMPTY_FORM = {
  title: '', description: '', level: '', hasCertificate: true,
  coverImage: null, certificate: null, workbook: null, system_id: '',
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'clean'],
  ],
};

/* PDFs remotos -> blob; blobs locales se usan directo */
const usePdfBlobUrl = (url) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return setBlobUrl(null);
    if (url.startsWith('blob:')) return setBlobUrl(url);

    let objectUrl;
    setLoading(true);
    fetch(url)
      .then((r) => r.blob())
      .then((b) => setBlobUrl((objectUrl = URL.createObjectURL(b))))
      .catch(() => setBlobUrl(null))
      .finally(() => setLoading(false));

    return () => objectUrl && URL.revokeObjectURL(objectUrl);
  }, [url]);

  return { blobUrl, loading };
};

const PdfPreview = ({ url, title }) => {
  const { blobUrl, loading } = usePdfBlobUrl(url);
  return loading ? <CircularProgress size={28} />
    : blobUrl ? <iframe src={blobUrl} width="100%" height="100%" style={{ border: 'none' }} title={title} />
      : <Typography variant="body2" color="text.secondary">No se pudo cargar el PDF.</Typography>;
};

/* Tarjeta de subida con zona punteada + vista previa */
const UploadCard = ({ label, accept, onChange, preview, pdf, ready }) => (
  <Box>
    <Box
      component="label"
      sx={(t) => ({
        display: 'flex', alignItems: 'center', gap: 1.5, p: 2, cursor: 'pointer',
        border: `2px dashed ${alpha(PINK, 0.5)}`, borderRadius: 3,
        bgcolor: alpha(PINK, 0.04), transition: '.2s',
        '&:hover': { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
      })}
    >
      <Avatar sx={{ bgcolor: alpha(PINK, 0.15), color: PINK }}>
        {pdf ? <PictureAsPdfRoundedIcon /> : <ImageRoundedIcon />}
      </Avatar>
      <Box flexGrow={1}>
        <Typography fontWeight={600}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {preview ? 'Haz clic para reemplazar' : 'Haz clic para seleccionar'}
        </Typography>
      </Box>
      {ready && <CheckCircleRoundedIcon color="primary" />}
      <input hidden type="file" accept={accept} onChange={onChange} />
    </Box>

    {preview && (
      <Box
        sx={{
          mt: 2, height: 400, borderRadius: 3, overflow: 'hidden', bgcolor: 'background.default',
          border: `1px solid ${alpha(PINK, 0.25)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {pdf ? <PdfPreview url={preview} title={label} />
          : <Box component="img" src={preview} alt={label}
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
      </Box>
    )}
  </Box>
);

const Section = ({ title, subtitle, children }) => (
  <Paper sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3, border: `1px solid ${alpha(PINK, 0.15)}` }}>
    <Typography variant="h6" fontWeight={700}>{title}</Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>{subtitle}</Typography>
    {children}
  </Paper>
);

const CourseAdd = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { crearCurso, actualizarCurso, obtenerCursoPorId } = useContext(CoursesContext);

  const [form, setForm] = useState(EMPTY_FORM);
  const [previews, setPreviews] = useState({ cover: null, certificate: null, workbook: null });
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);

  const setField = (patch) => setForm((p) => ({ ...p, ...patch }));
  const setPreview = (key, value) => setPreviews((p) => ({ ...p, [key]: value }));
  const goBack = () => (onCancel ? onCancel() : history.push('/ecommerce/gridproducts'));
  const handleChange = (e) => setField({ [e.target.name]: e.target.value });

  useEffect(() => {
    MethodGet('/systems').then((res) => setSystems(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) {
      setForm(EMPTY_FORM);
      setPreviews({ cover: null, certificate: null, workbook: null });
      return;
    }
    setLoading(true);
    obtenerCursoPorId(id)
      .then((c) => {
        setForm({
          ...EMPTY_FORM,
          title: c.title || '',
          description: c.description || '',
          level: c.level || '',
          hasCertificate: !!c.certificate_url,
          system_id: c.system_id || '',
        });
        setPreviews({
          cover: c.cover_image_url || null,
          certificate: c.certificate_url || null,
          workbook: c.workbookUrl || null,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setField({ coverImage: file });
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview('cover', reader.result);
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (field, validate) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      return Swal.fire('Error', 'Solo se permiten PDFs', 'error');
    }
    if (validate) {
      try {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        const { width, height } = pdf.getPage(0).getSize();
        if (Math.abs(width - 792) > 5 || Math.abs(height - 612) > 5) {
          return Swal.fire('Error', 'El certificado debe ser tamaño carta horizontal', 'error');
        }
      } catch {
        return Swal.fire('Error', 'No se pudo leer el PDF', 'error');
      }
    }
    setField({ [field]: file });
    setPreview(field, URL.createObjectURL(file));
  };

  const handleCertificateToggle = (e) => {
    const checked = e.target.checked;
    setForm((p) => ({ ...p, hasCertificate: checked, certificate: checked ? p.certificate : null }));
    if (!checked) setPreview('certificate', null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.hasCertificate && !form.certificate && !previews.certificate) {
      return Swal.fire('Falta certificado', 'Debes subir un certificado', 'warning');
    }
    setLoading(true);
    try {
      id ? await actualizarCurso(id, form) : await crearCurso(form);
      Swal.fire('Éxito', 'Curso guardado correctamente', 'success');
      goBack();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100%', py: 4 }}>
        <Container maxWidth="md" component="form" onSubmit={handleSubmit}>
          {/* Encabezado */}
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
              <SchoolRoundedIcon />
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight={800}>
                {id ? 'Editar curso' : 'Nuevo curso'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completa la información y sube los archivos del curso
              </Typography>
            </Box>
            {id && <Chip label="Edición" color="primary" variant="outlined" />}
          </Stack>

          {/* Información */}
          <Section title="Información general" subtitle="Datos principales y descripción del curso">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField label="Título" name="title" fullWidth required
                  value={form.title} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select label="Nivel" name="level" fullWidth required
                  value={form.level} onChange={handleChange}>
                  <MenuItem value="principiante">Principiante</MenuItem>
                  <MenuItem value="intermedio">Intermedio</MenuItem>
                  <MenuItem value="avanzado">Avanzado</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select label="Sistema" name="system_id" fullWidth required
                  value={form.system_id} onChange={handleChange}>
                  <MenuItem value="">Seleccionar</MenuItem>
                  {systems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    '& .ql-toolbar': { borderRadius: '12px 12px 0 0', borderColor: alpha(PINK, 0.3), bgcolor: alpha(PINK, 0.04) },
                    '& .ql-container': { borderRadius: '0 0 12px 12px', borderColor: alpha(PINK, 0.3), minHeight: 160 },
                    '& .ql-editor': { minHeight: 160 },
                    '& .ql-snow .ql-active, & .ql-snow button:hover': { color: PINK },
                  }}
                >
                  <ReactQuill value={form.description} modules={QUILL_MODULES}
                    onChange={(description) => setField({ description })} />
                </Box>
              </Grid>
            </Grid>
          </Section>

          {/* Archivos */}
          <Section title="Archivos" subtitle="Portada, certificado y workbook">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <UploadCard label="Portada" accept="image/*" preview={previews.cover}
                  ready={!!previews.cover} onChange={handleImageChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <UploadCard pdf label="Workbook (PDF)" accept="application/pdf"
                  preview={previews.workbook} ready={!!previews.workbook}
                  onChange={handlePdfChange('workbook')} />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  label="Este curso incluye certificado"
                  control={<Switch checked={form.hasCertificate} onChange={handleCertificateToggle} />}
                />
              </Grid>
              {form.hasCertificate && (
                <Grid item xs={12} md={6}>
                  <UploadCard pdf label="Certificado (PDF, carta horizontal)" accept="application/pdf"
                    preview={previews.certificate} ready={!!previews.certificate}
                    onChange={handlePdfChange('certificate', true)} />
                </Grid>
              )}
            </Grid>
          </Section>

          {/* Acciones */}
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <Button variant="outlined" size="large" onClick={goBack} sx={{ minWidth: 140 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{ minWidth: 180, boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
              {loading
                ? <><CircularProgress size={20} color="inherit" thickness={5} sx={{ mr: 1 }} />Guardando...</>
                : id ? 'Actualizar curso' : 'Guardar curso'}
            </Button>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CourseAdd;