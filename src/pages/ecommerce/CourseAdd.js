import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Avatar, Box, Button, ButtonBase, Checkbox, CircularProgress, FormControlLabel, Grid, IconButton,
  MenuItem, Paper, Stack, TextField, ThemeProvider, Tooltip, Typography, createTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CloudUploadOutlined,
  SwapHorizOutlined,
  DeleteOutline as DeleteOutlineIcon,
  InfoOutlined,
  MenuBookOutlined,
  ImageOutlined,
  WorkspacePremiumOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { PDFDocument } from 'pdf-lib';
import CoursesContext from '../../context/CoursesContext/CoursesContext';
import MethodGet from '../../config/Service';

// ─── Tema local: la paleta y los estilos base viven aquí, no en cada sx ──────
const PINK = '#FF5C93';
const PINK_DARK = '#E94E88';
const PINK_SOFT = '#FFE6F0';
const PINK_BG = '#FFF5FA';
const GRADIENT = `linear-gradient(135deg, ${PINK} 0%, #FF69B4 100%)`;

const theme = createTheme({
  palette: { primary: { main: PINK, dark: PINK_DARK } },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
        containedPrimary: {
          background: GRADIENT,
          '&:hover': { background: `linear-gradient(135deg, ${PINK_DARK} 0%, ${PINK} 100%)` },
          '&.Mui-disabled': { background: '#F5C6D0', color: '#fff' },
        },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#fff', '& fieldset': { borderColor: PINK_SOFT }, '&:hover fieldset': { borderColor: PINK } },
      },
    },
  },
});

// ─── Constantes (fuera del componente para no recrearlas en cada render) ─────
const EMPTY_FORM = { title: '', description: '', level: '', system_id: '', hasCertificate: true };
const LEVELS = ['principiante', 'intermedio', 'avanzado'];

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

const quillSx = {
  '& .ql-toolbar': { borderColor: PINK_SOFT, bgcolor: PINK_BG, borderRadius: '8px 8px 0 0' },
  '& .ql-container': { borderColor: PINK_SOFT, borderRadius: '0 0 8px 8px', fontFamily: 'inherit', fontSize: '0.95rem' },
  '& .ql-editor': { minHeight: 180 },
};

// Valida el archivo según su tipo; devuelve el mensaje de error o null
const validateFile = async (key, file) => {
  const isImage = key === 'coverImage';
  const maxMb = isImage ? 5 : 10;
  if (isImage ? !file.type.startsWith('image/') : file.type !== 'application/pdf') {
    return isImage ? 'Selecciona una imagen (PNG, JPG o JPEG)' : 'Solo se permiten PDFs';
  }
  if (file.size > maxMb * 1024 * 1024) return `El archivo no debe superar los ${maxMb} MB`;
  if (key === 'certificate') {
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const { width, height } = pdf.getPage(0).getSize();
      if (Math.abs(width - 792) > 5 || Math.abs(height - 612) > 5) return 'El certificado debe ser tamaño carta horizontal';
    } catch {
      return 'No se pudo leer el PDF';
    }
  }
  return null;
};

// ─── Componentes reutilizables ───────────────────────────────────────────────
const Section = ({ icon, title, subtitle, children }) => (
  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, borderColor: PINK_SOFT }}>
    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
      <Avatar sx={{ bgcolor: PINK_BG, color: 'primary.main', width: 36, height: 36 }}>{icon}</Avatar>
      <Box>
        <Typography fontWeight={700} color="primary">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
    </Stack>
    {children}
  </Paper>
);

// Los PDFs remotos se descargan como blob para poder mostrarlos en el iframe
const PdfPreview = ({ url, title }) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (url.startsWith('blob:')) { setSrc(url); return; }
    let objectUrl;
    fetch(url)
      .then((r) => r.blob())
      .then((b) => setSrc((objectUrl = URL.createObjectURL(b))))
      .catch(() => setSrc(null));
    return () => objectUrl && URL.revokeObjectURL(objectUrl);
  }, [url]);

  return (
    <Box sx={{ width: '100%', height: 360, border: 1, borderColor: PINK_SOFT, borderRadius: 2, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      {src ? <Box component="iframe" src={src} title={title} sx={{ width: 1, height: 1, border: 0 }} /> : <CircularProgress size={28} />}
    </Box>
  );
};

// Zona de carga + vista previa + cambiar/eliminar (reemplaza 3 bloques duplicados)
const FileField = ({ label, helper, icon, accept, preview, isImage, onSelect, onRemove }) => {
  const inputRef = useRef(null);
  const pick = () => inputRef.current.click();

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="primary.dark" mb={1}>{label}</Typography>

      {preview ? (
        <Stack spacing={1.5} alignItems="center">
          {isImage ? (
            <Box component="img" src={preview} alt={label}
              sx={{ width: 1, maxHeight: 280, objectFit: 'contain', borderRadius: 2, border: 1, borderColor: PINK_SOFT, p: 1 }} />
          ) : (
            <PdfPreview url={preview} title={label} />
          )}
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<SwapHorizOutlined />} onClick={pick}>Cambiar</Button>
            <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={onRemove}>Eliminar</Button>
          </Stack>
        </Stack>
      ) : (
        <ButtonBase
          onClick={pick}
          sx={{
            width: 1, p: { xs: 3, sm: 4 }, flexDirection: 'column', gap: 0.5, borderRadius: 3,
            border: '2px dashed', borderColor: 'primary.main', bgcolor: PINK_BG, transition: 'all .2s',
            '&:hover': { borderColor: 'primary.dark', boxShadow: '0 8px 24px rgba(255,92,147,0.15)' },
          }}
        >
          <Avatar sx={{ bgcolor: '#fff', color: 'primary.main', width: 56, height: 56, border: 2, borderColor: PINK_SOFT }}>{icon}</Avatar>
          <Typography fontWeight={700} color="primary">Haz clic para subir</Typography>
          <Typography variant="caption" color="text.secondary">{helper}</Typography>
        </ButtonBase>
      )}

      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        onChange={(e) => { onSelect(e.target.files[0]); e.target.value = ''; }}
      />
    </Box>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────
const CourseAdd = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { crearCurso, actualizarCurso, obtenerCursoPorId } = useContext(CoursesContext);

  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState({});       // { coverImage, certificate, workbook } → File
  const [previews, setPreviews] = useState({}); // mismas llaves → URL (blob o remota)
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(false);

  const goBack = () => (onCancel ? onCancel() : history.push('/ecommerce/gridproducts'));

  useEffect(() => {
    MethodGet('/systems').then((res) => setSystems(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) { setForm(EMPTY_FORM); setFiles({}); setPreviews({}); return; }
    setLoading(true);
    obtenerCursoPorId(id)
      .then((c) => {
        setForm({
          title: c.title || '',
          description: c.description || '',
          level: c.level || '',
          system_id: c.system_id || '',
          hasCertificate: !!c.certificate_url,
        });
        setFiles({});
        setPreviews({ coverImage: c.cover_image_url, certificate: c.certificate_url, workbook: c.workbookUrl });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, obtenerCursoPorId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const setFile = (key, file) => {
    setFiles((p) => ({ ...p, [key]: file }));
    setPreviews((p) => ({ ...p, [key]: file ? URL.createObjectURL(file) : null }));
  };

  const handleSelect = (key) => async (file) => {
    if (!file) return;
    const error = await validateFile(key, file);
    error ? Swal.fire('Error', error, 'error') : setFile(key, file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.hasCertificate && !previews.certificate) {
      return Swal.fire('Falta certificado', 'Debes subir un certificado', 'warning');
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, k === 'hasCertificate' ? +v : v));
    Object.entries(files).forEach(([k, file]) => file && data.append(k, file));

    setLoading(true);
    try {
      id ? await actualizarCurso(id, data) : await crearCurso(data);
      Swal.fire({ icon: 'success', title: 'Curso guardado correctamente', timer: 1800, showConfirmButton: false });
      goBack();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar el curso', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: 1, borderColor: PINK_SOFT, boxShadow: '0 8px 24px rgba(255,92,147,0.08)' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ background: GRADIENT, color: '#fff', p: { xs: 2.5, sm: 3 } }}>
            <Tooltip title="Volver">
              <IconButton onClick={() => (onCancel ? onCancel() : history.goBack())}
                sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}><MenuBookOutlined /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>{id ? 'Editar curso' : 'Nuevo curso'}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {id ? 'Modifica los campos que deseas actualizar' : 'Completa los campos para registrar un nuevo curso'}
              </Typography>
            </Box>
          </Stack>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
            <Stack spacing={3}>
              <Section icon={<InfoOutlined fontSize="small" />} title="Información básica" subtitle="Título, nivel y sistema al que pertenece el curso">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField required label="Título" name="title" value={form.title} onChange={handleChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select required label="Nivel" name="level" value={form.level} onChange={handleChange}>
                      {LEVELS.map((l) => <MenuItem key={l} value={l} sx={{ textTransform: 'capitalize' }}>{l}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select required label="Sistema" name="system_id" value={form.system_id} onChange={handleChange}>
                      {systems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ px: 1.5, height: 1, display: 'flex', alignItems: 'center', borderColor: PINK_SOFT, bgcolor: form.hasCertificate ? PINK_BG : '#fff' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.hasCertificate}
                            onChange={(e) => {
                              setForm((p) => ({ ...p, hasCertificate: e.target.checked }));
                              if (!e.target.checked) setFile('certificate', null);
                            }}
                          />
                        }
                        label={
                          <>
                            <Typography fontWeight={700} color="primary.dark">Incluye certificado</Typography>
                            <Typography variant="caption" color="text.secondary">Los estudiantes recibirán un PDF al completar</Typography>
                          </>
                        }
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Section>

              <Section icon={<DescriptionOutlined fontSize="small" />} title="Descripción del curso" subtitle="Editor con formato, listas, enlaces, etc.">
                <Box sx={quillSx}>
                  <ReactQuill value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} modules={QUILL_MODULES} />
                </Box>
              </Section>

              <Section icon={<ImageOutlined fontSize="small" />} title="Portada del curso">
                <FileField
                  isImage
                  label="Imagen de portada"
                  helper="PNG, JPG o JPEG · Máx. 5 MB"
                  icon={<CloudUploadOutlined />}
                  accept="image/*"
                  preview={previews.coverImage}
                  onSelect={handleSelect('coverImage')}
                  onRemove={() => setFile('coverImage', null)}
                />
              </Section>

              <Section icon={<WorkspacePremiumOutlined fontSize="small" />} title="Documentos PDF" subtitle="Certificado (solo si aplica) y workbook del curso">
                <Grid container spacing={3}>
                  {form.hasCertificate && (
                    <Grid item xs={12} md={6}>
                      <FileField
                        label="Certificado (PDF) *"
                        helper="PDF tamaño carta horizontal · Máx. 10 MB"
                        icon={<WorkspacePremiumOutlined />}
                        accept="application/pdf"
                        preview={previews.certificate}
                        onSelect={handleSelect('certificate')}
                        onRemove={() => setFile('certificate', null)}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={form.hasCertificate ? 6 : 12}>
                    <FileField
                      label="Workbook (PDF)"
                      helper="PDF · Máx. 10 MB"
                      icon={<DescriptionOutlined />}
                      accept="application/pdf"
                      preview={previews.workbook}
                      onSelect={handleSelect('workbook')}
                      onRemove={() => setFile('workbook', null)}
                    />
                  </Grid>
                </Grid>
              </Section>

              <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" size="large" onClick={goBack} disabled={loading}>Cancelar</Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{ minWidth: 220 }}
                >
                  {loading ? 'Guardando...' : id ? 'Actualizar curso' : 'Guardar curso'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default CourseAdd;