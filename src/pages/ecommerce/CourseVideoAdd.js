import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import { useParams, useHistory } from 'react-router-dom';
import Hls from 'hls.js';
import {
  Box, Button, Chip, IconButton, Paper, TextField, Typography, Avatar,
  Stack, Divider, Tooltip, Grid, LinearProgress, InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, CloudUploadOutlined,
  DeleteOutline as DeleteOutlineIcon, VideoLibraryOutlined,
  Save as SaveIcon, TitleOutlined, NumbersOutlined,
  CheckCircleOutlined, SwapHorizOutlined,
} from '@mui/icons-material';
import clienteAxios from '../../config/Axios';
import CoursesContext from '../../context/CoursesContext/CoursesContext';

// ─── Constantes ──────────────────────────────────────────────────────────────
const CHUNK_SIZE = 25 * 1024 * 1024;
const MAX_RETRIES = 3;

const PINK = '#FF5C93';
const PINK_DARK = '#E94E88';
const PINK_SOFT = '#FFE6F0';
const PINK_BG = '#FFF5FA';
const PINK_BG_SOFT = '#FFF0F7';
const GRADIENT = 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)';
const GRADIENT_HOVER = 'linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)';

// ─── Estilos ─────────────────────────────────────────────────────────────────
const sx = {
  field: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2, bgcolor: '#fff', transition: 'all 0.25s ease',
      '& fieldset': { borderColor: PINK_SOFT },
      '&:hover fieldset': { borderColor: PINK },
      '&.Mui-focused fieldset': { borderColor: PINK, borderWidth: 2 },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: PINK },
  },
  primaryBtn: {
    py: 1.4, borderRadius: 2, fontWeight: 700, color: '#fff',
    background: GRADIENT, boxShadow: 'none',
    '&:hover': { background: GRADIENT_HOVER, boxShadow: 'none' },
    '&.Mui-disabled': { background: '#F5C6D0', color: '#fff' },
  },
  outlineBtn: {
    py: 1.4, borderRadius: 2, fontWeight: 600, color: PINK_DARK,
    border: `1px solid ${PINK}`,
    '&:hover': { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
  },
  smallBtn: {
    borderRadius: 2, color: PINK_DARK, borderColor: PINK,
    '&:hover': { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
  },
  smallErrBtn: {
    borderRadius: 2, borderColor: '#EF9A9A', color: '#C62828',
    '&:hover': { bgcolor: '#FFEBEE', borderColor: '#C62828' },
  },
  chip: {
    bgcolor: PINK_BG_SOFT, color: PINK_DARK, fontWeight: 600, fontSize: '0.72rem',
    height: 'auto', border: `1px solid ${PINK_SOFT}`,
    '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
    '& .MuiChip-icon': { color: PINK },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDuration = (s) => !s ? '—' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const fmtSize = (b) => !b ? '—' : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

const getVideoDuration = (url) => new Promise((resolve) => {
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.src = url;
  v.onloadedmetadata = () => resolve(parseFloat(v.duration.toFixed(2)));
});

// ─── Upload helpers ──────────────────────────────────────────────────────────
const uploadChunkXHR = (url, chunk, fileType, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', fileType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded, e.total);
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300
      ? resolve((xhr.getResponseHeader('ETag') || '').replaceAll('"', ''))
      : reject(new Error(`HTTP ${xhr.status}`));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(chunk);
  });

const uploadChunkWithRetries = async (url, chunk, fileType, onProgress) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try { return await uploadChunkXHR(url, chunk, fileType, onProgress); }
    catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
};

const uploadMultipart = async (file, uploadId, s3Key, onProgress) => {
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts = [];
  let uploadedBytes = 0;

  for (let n = 1; n <= totalParts; n++) {
    const start = (n - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const { data } = await clienteAxios.post('/videos/multipart/presigned', {
      uploadId, s3Key, partNumber: n,
    });

    const etag = await uploadChunkWithRetries(data.presignedUrl, chunk, file.type, (loaded) => {
      onProgress(Math.min(Math.round(((uploadedBytes + loaded) / file.size) * 100), 100));
    });

    uploadedBytes += end - start;
    parts.push({ PartNumber: n, ETag: etag });
  }
  return parts;
};

// ─── Componentes UI reutilizables ────────────────────────────────────────────
const PageHeader = ({ icon, title, subtitle, onBack }) => (
  <Box sx={{
    background: GRADIENT, color: '#fff', p: { xs: 2.5, sm: 3 },
    display: 'flex', alignItems: 'center', gap: 2
  }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      {onBack && (
        <Tooltip title="Volver">
          <IconButton onClick={onBack} sx={{
            color: '#fff', bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
          }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      )}
      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 48, height: 48 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
      </Box>
    </Stack>
  </Box>
);

const Section = ({ icon, title, subtitle, children }) => (
  <Paper variant="outlined" sx={{
    p: { xs: 2, sm: 2.5 }, borderRadius: 3,
    border: `1px solid ${PINK_SOFT}`, bgcolor: '#fff',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: subtitle ? 0.5 : 2 }}>
      <Avatar sx={{ bgcolor: PINK_BG_SOFT, color: PINK, width: 32, height: 32 }}>{icon}</Avatar>
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: PINK }}>{title}</Typography>
    </Box>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, ml: 6 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
);

const DropZone = ({ icon, title, helper, disabled, onClick, onFiles }) => {
  const [drag, setDrag] = useState(false);
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <Box
      onClick={() => !disabled && onClick?.()}
      onDragEnter={(e) => { stop(e); !disabled && setDrag(true); }}
      onDragOver={(e) => { stop(e); !disabled && setDrag(true); }}
      onDragLeave={(e) => { stop(e); setDrag(false); }}
      onDrop={(e) => {
        stop(e); setDrag(false);
        if (!disabled && e.dataTransfer?.files?.length) onFiles?.(e.dataTransfer.files);
      }}
      sx={{
        border: `2px dashed ${drag ? PINK_DARK : PINK}`, borderRadius: 3,
        p: { xs: 3, sm: 4 }, textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: drag ? PINK_BG : PINK_BG_SOFT, opacity: disabled ? 0.5 : 1,
        transition: 'all 0.25s ease',
        '&:hover': disabled ? {} : {
          bgcolor: PINK_BG, borderColor: PINK_DARK,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(255,92,147,0.15)',
        },
      }}
    >
      <Avatar sx={{
        bgcolor: '#fff', color: PINK, width: 56, height: 56,
        mx: 'auto', mb: 1.5, border: `2px solid ${PINK_SOFT}`,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Avatar>
      <Typography fontWeight={700} gutterBottom sx={{ color: PINK }}>{title}</Typography>
      <Typography variant="caption" color="text.secondary" display="block">{helper}</Typography>
    </Box>
  );
};

const ExistingVideoCard = ({ video, onDelete }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !video.cloudfrontUrl) return;
    let hls;
    if (video.cloudfrontUrl.includes('.m3u8')) {
      if (el.canPlayType('application/vnd.apple.mpegurl')) el.src = video.cloudfrontUrl;
      else if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(video.cloudfrontUrl);
        hls.attachMedia(el);
      }
    } else el.src = video.cloudfrontUrl;
    return () => hls?.destroy();
  }, [video.cloudfrontUrl]);

  const confirmDelete = () => Swal.fire({
    title: '¿Eliminar video?',
    text: `Se eliminará "${video.title || 'este video'}". Esta acción no se puede deshacer.`,
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: PINK_DARK, cancelButtonColor: '#9e9e9e',
    confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
  }).then((r) => r.isConfirmed && onDelete(video.id));

  return (
    <Paper variant="outlined" sx={{
      borderRadius: 3, border: `1px solid ${PINK_SOFT}`,
      overflow: 'hidden', position: 'relative', bgcolor: '#fff',
      transition: 'all 0.25s ease',
      '&:hover': { boxShadow: '0 8px 24px rgba(255,92,147,0.15)' },
    }}>
      <Box sx={{
        position: 'absolute', top: 10, left: 10, zIndex: 2,
        minWidth: 32, height: 32, borderRadius: '8px',
        bgcolor: 'rgba(255,255,255,0.9)', color: PINK,
        fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {video.order ?? '—'}
      </Box>
      <Box component="video" ref={ref} controls
        sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', bgcolor: '#000' }} />
      <Box sx={{ p: 1.75, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: PINK_DARK, flex: 1, minWidth: 0 }} noWrap>
          {video.title || 'Sin título'}
        </Typography>
        <Chip icon={<VideoLibraryOutlined />} label={fmtDuration(video.durationSeconds)} size="small" sx={sx.chip} />
        <Tooltip title="Eliminar video">
          <IconButton onClick={confirmDelete} sx={{
            color: PINK_DARK, border: `1px solid ${PINK_SOFT}`, borderRadius: 2,
            '&:hover': { bgcolor: PINK_BG_SOFT, color: '#C62828' },
          }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────
const EMPTY_VIDEO = { title: '', order: null, file: null, previewUrl: null, duration: null };

const CourseVideoAdd = () => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerCursoPorId } = useContext(CoursesContext);

  const [course, setCourse] = useState(null);
  const [existingVideos, setExistingVideos] = useState([]);
  const [newVideo, setNewVideo] = useState(EMPTY_VIDEO);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Carga inicial
  useEffect(() => {
    (async () => {
      const data = await obtenerCursoPorId(id);
      if (data) {
        setCourse(data);
        if (Array.isArray(data.videos)) setExistingVideos(data.videos);
      }
    })();
  }, [id, obtenerCursoPorId]);

  // Cleanup preview URL
  useEffect(() => () => {
    if (newVideo.previewUrl) URL.revokeObjectURL(newVideo.previewUrl);
  }, [newVideo.previewUrl]);

  const patchVideo = (field, value) => setNewVideo((p) => ({ ...p, [field]: value }));

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      return Swal.fire({ icon: 'error', title: 'Archivo no válido', text: 'Selecciona un video.' });
    }
    const previewUrl = URL.createObjectURL(file);
    const duration = await getVideoDuration(previewUrl);

    setNewVideo((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { ...prev, file, previewUrl, duration };
    });
    setUploadProgress(0);
  }, []);

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const clearNewVideo = () => {
    setNewVideo((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return EMPTY_VIDEO;
    });
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteExisting = async (videoId) => {
    try {
      await clienteAxios.delete(`/videos/delete/${videoId}`);
      setExistingVideos((prev) => prev.filter((v) => v.id !== videoId));
      Swal.fire({ icon: 'success', title: 'Video eliminado', timer: 1800, showConfirmButton: false });
    } catch (error) {
      console.error('Error al eliminar video:', error);
      Swal.fire({
        icon: 'error', title: 'Error',
        text: error?.response?.data?.message || 'No se pudo eliminar el video.',
      });
    }
  };

  const handleUpload = async () => {
    if (!newVideo.file) return Swal.fire({ icon: 'warning', title: 'Sin video', text: 'Selecciona un archivo primero.' });
    if (!newVideo.title.trim()) return Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'Escribe un título.' });

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: init } = await clienteAxios.post('/videos/multipart/init', {
        courseId: id, fileName: newVideo.file.name, fileType: newVideo.file.type,
        durationSeconds: Number(newVideo.duration), fileSizeBytes: newVideo.file.size,
        title: newVideo.title, order: newVideo.order || null,
      });
      const { uploadId, s3Key, videoId } = init;

      const parts = await uploadMultipart(newVideo.file, uploadId, s3Key, setUploadProgress);

      await clienteAxios.post('/videos/multipart/complete', {
        uploadId, s3Key, parts, courseId: id, videoId,
        title: newVideo.title, order: newVideo.order || null,
      });

      setExistingVideos((prev) => [...prev, {
        id: videoId, title: newVideo.title, order: newVideo.order || null,
        durationSeconds: newVideo.duration, cloudfrontUrl: '',
      }]);

      Swal.fire({ icon: 'success', title: 'Video subido correctamente', timer: 1500, showConfirmButton: false });
      clearNewVideo();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Falló la subida del video.' });
    } finally {
      setIsUploading(false);
    }
  };

  const sortedExisting = [...existingVideos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Paper elevation={0} sx={{
        borderRadius: 4, overflow: 'hidden', border: `1px solid ${PINK_SOFT}`,
        boxShadow: '0 8px 24px rgba(255,92,147,0.08)',
      }}>
        <PageHeader
          icon={<VideoLibraryOutlined />}
          title="Videos del curso"
          subtitle={course?.title || 'Cargando curso...'}
          onBack={() => history.goBack()}
        />

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
          <Stack spacing={3}>
            <Section
              icon={<CloudUploadOutlined fontSize="small" />}
              title="Subir video"
              subtitle="Solo se puede subir un video a la vez. Al completarlo, podrás subir otro."
            >
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Título del video *" fullWidth
                    value={newVideo.title}
                    onChange={(e) => patchVideo('title', e.target.value)}
                    disabled={isUploading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><TitleOutlined sx={{ color: PINK, fontSize: 20 }} /></InputAdornment>
                      )
                    }}
                    sx={sx.field}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Orden" type="number" fullWidth
                    inputProps={{ min: 1 }}
                    value={newVideo.order ?? ''}
                    onChange={(e) => patchVideo('order', e.target.value ? parseInt(e.target.value, 10) : null)}
                    disabled={isUploading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><NumbersOutlined sx={{ color: PINK, fontSize: 20 }} /></InputAdornment>
                      )
                    }}
                    sx={sx.field}
                  />
                </Grid>

                <Box component="input" ref={fileInputRef} type="file" accept="video/*"
                  onChange={handleFileChange} sx={{ display: 'none' }} />

                <Grid item xs={12}>
                  {!newVideo.previewUrl ? (
                    <DropZone
                      icon={<CloudUploadOutlined />}
                      title="Haz clic o arrastra el video aquí"
                      helper="MP4, MOV, WEBM · Sin límite práctico (subida por partes)"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      onFiles={(files) => processFile(files?.[0])}
                    />
                  ) : (
                    <Stack spacing={2} alignItems="center">
                      <Box component="video" src={newVideo.previewUrl} controls sx={{
                        width: '100%', maxHeight: 340, objectFit: 'contain',
                        borderRadius: 2, border: `1px solid ${PINK_SOFT}`, bgcolor: '#000',
                      }} />
                      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                        {newVideo.file && (
                          <>
                            <Chip icon={<VideoLibraryOutlined />}
                              label={newVideo.file.type.split('/')[1]?.toUpperCase() || 'VIDEO'}
                              size="small" sx={sx.chip} />
                            <Chip label={fmtSize(newVideo.file.size)} size="small" sx={sx.chip} />
                            {newVideo.duration && (
                              <Chip label={`⏱ ${fmtDuration(newVideo.duration)}`} size="small" sx={sx.chip} />
                            )}
                          </>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
                        <Button variant="outlined" size="small" startIcon={<SwapHorizOutlined />}
                          onClick={() => fileInputRef.current?.click()} disabled={isUploading} sx={sx.smallBtn}>
                          Cambiar video
                        </Button>
                        <Button variant="outlined" color="error" size="small" startIcon={<DeleteOutlineIcon />}
                          onClick={clearNewVideo} disabled={isUploading} sx={sx.smallErrBtn}>
                          Quitar
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </Grid>

                {isUploading && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{
                      p: 2, borderRadius: 2, border: `1px solid ${PINK_SOFT}`, bgcolor: PINK_BG_SOFT,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: PINK_DARK, fontWeight: 600 }}>
                          Subiendo video...
                        </Typography>
                        <Typography variant="body2" sx={{ color: PINK_DARK, fontWeight: 700 }}>
                          {uploadProgress}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={uploadProgress} sx={{
                        height: 10, borderRadius: 5, bgcolor: PINK_SOFT,
                        '& .MuiLinearProgress-bar': { background: GRADIENT, borderRadius: 5 },
                      }} />
                    </Paper>
                  </Grid>
                )}

                {newVideo.file && !isUploading && (
                  <Grid item xs={12}>
                    <Button fullWidth variant="contained" size="large"
                      onClick={handleUpload} startIcon={<SaveIcon />} sx={sx.primaryBtn}>
                      Subir video
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Section>

            <Divider sx={{ borderColor: PINK_SOFT }} />

            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2} justifyContent="flex-end">
              <Button variant="outlined" size="large" onClick={() => history.goBack()} sx={sx.outlineBtn}>
                Volver
              </Button>
            </Stack>

            {sortedExisting.length > 0 && (
              <Section
                icon={<CheckCircleOutlined fontSize="small" />}
                title={`Videos actuales (${sortedExisting.length})`}
                subtitle="Videos ya subidos al curso. Puedes eliminarlos individualmente."
              >
                <Grid container spacing={2}>
                  {sortedExisting.map((v, i) => (
                    <Grid item xs={12} sm={6} md={4} key={v.id ?? i}>
                      <ExistingVideoCard video={v} onDelete={handleDeleteExisting} />
                    </Grid>
                  ))}
                </Grid>
              </Section>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default CourseVideoAdd;