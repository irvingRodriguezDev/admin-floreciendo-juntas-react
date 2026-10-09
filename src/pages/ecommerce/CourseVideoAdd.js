import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import { useParams, useHistory } from 'react-router-dom';
import Hls from 'hls.js';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  TextField,
  Typography,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Grid,
  CircularProgress,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudUploadOutlined,
  DeleteOutline as DeleteOutlineIcon,
  VideoLibraryOutlined,
  Save as SaveIcon,
  TitleOutlined,
  NumbersOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CloseOutlined,
  SwapHorizOutlined,
  PlayCircleOutlineOutlined,
} from '@mui/icons-material';
import clienteAxios from '../../config/Axios';
import CoursesContext from '../../context/CoursesContext/CoursesContext';

const CHUNK_SIZE = 25 * 1024 * 1024;
const MAX_RETRIES = 3;

// ─── Constantes de diseño (misma paleta que el resto) ────────────────────────
const PINK = '#FF5C93';
const PINK_DARK = '#E94E88';
const PINK_SOFT = '#FFE6F0';
const PINK_BG = '#FFF5FA';
const PINK_BG_SOFT = '#FFF0F7';
const GRADIENT = 'linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)';
const GRADIENT_HOVER = 'linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)';

const flexRow = { display: 'flex', alignItems: 'center', gap: 1 };

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fff',
    transition: 'all 0.25s ease',
    '& fieldset': { borderColor: PINK_SOFT },
    '&:hover fieldset': { borderColor: PINK },
    '&.Mui-focused fieldset': { borderColor: PINK, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: PINK },
};

const primaryBtnSx = {
  py: 1.4,
  borderRadius: 2,
  fontWeight: 700,
  color: '#fff',
  background: GRADIENT,
  boxShadow: 'none',
  '&:hover': { background: GRADIENT_HOVER, boxShadow: 'none' },
  '&.Mui-disabled': { background: '#F5C6D0', color: '#fff' },
};

const outlineBtnSx = {
  py: 1.4,
  borderRadius: 2,
  fontWeight: 600,
  color: PINK_DARK,
  border: `1px solid ${PINK}`,
  '&:hover': { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
};

const smallOutBtnSx = {
  borderRadius: 2,
  color: PINK_DARK,
  borderColor: PINK,
  '&:hover': { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
};

const smallErrBtnSx = {
  borderRadius: 2,
  borderColor: '#EF9A9A',
  color: '#C62828',
  '&:hover': { bgcolor: '#FFEBEE', borderColor: '#C62828' },
};

const chipSx = (extra = {}) => ({
  bgcolor: PINK_BG_SOFT,
  color: PINK_DARK,
  fontWeight: 600,
  fontSize: '0.72rem',
  height: 'auto',
  border: `1px solid ${PINK_SOFT}`,
  '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
  '& .MuiChip-icon': { color: PINK },
  ...extra,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDuration = (secs) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── PageHeader reutilizable ─────────────────────────────────────────────────
const PageHeader = ({ icon, title, subtitle, onBack }) => (
  <Box
    sx={{
      background: GRADIENT,
      color: '#fff',
      p: { xs: 2.5, sm: 3 },
      gap: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      {onBack && (
        <Tooltip title="Volver">
          <IconButton
            onClick={onBack}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
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

// ─── Section tipo card ───────────────────────────────────────────────────────
const Section = ({ icon, title, subtitle, children }) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: 3,
      border: `1px solid ${PINK_SOFT}`,
      bgcolor: '#fff',
    }}
  >
    <Box sx={{ ...flexRow, mb: subtitle ? 0.5 : 2 }}>
      <Avatar sx={{ bgcolor: PINK_BG_SOFT, color: PINK, width: 32, height: 32 }}>
        {icon}
      </Avatar>
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: PINK }}>
        {title}
      </Typography>
    </Box>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, ml: 6 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
);

// ─── DropZone ────────────────────────────────────────────────────────────────
const DropZone = ({ id, icon, title, helper, disabled }) => (
  <Box
    onClick={() => !disabled && document.getElementById(id).click()}
    sx={{
      border: `2px dashed ${PINK}`,
      borderRadius: 3,
      p: { xs: 3, sm: 4 },
      textAlign: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      bgcolor: PINK_BG_SOFT,
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.25s ease',
      '&:hover': disabled
        ? {}
        : {
          bgcolor: PINK_BG,
          borderColor: PINK_DARK,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(255,92,147,0.15)',
        },
    }}
  >
    <Avatar
      sx={{
        bgcolor: '#fff',
        color: PINK,
        width: 56,
        height: 56,
        mx: 'auto',
        mb: 1.5,
        border: `2px solid ${PINK_SOFT}`,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 28 } })}
    </Avatar>
    <Typography fontWeight={700} gutterBottom sx={{ color: PINK }}>
      {title}
    </Typography>
    <Typography variant="caption" color="text.secondary" display="block">
      {helper}
    </Typography>
  </Box>
);

// ─── ExistingVideoCard ───────────────────────────────────────────────────────
const ExistingVideoCard = ({ video, onDeleteExisting }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !video.cloudfrontUrl) return;

    if (video.cloudfrontUrl.includes('.m3u8')) {
      if (el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = video.cloudfrontUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(video.cloudfrontUrl);
        hls.attachMedia(el);
        return () => hls.destroy();
      }
    } else {
      el.src = video.cloudfrontUrl;
    }
  }, [video.cloudfrontUrl]);

  const handleDelete = () => {
    Swal.fire({
      title: '¿Eliminar video?',
      text: `Se eliminará "${video.title || 'este video'}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: PINK_DARK,
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((r) => r.isConfirmed && onDeleteExisting(video.id));
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: `1px solid ${PINK_SOFT}`,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#fff',
        transition: 'all 0.25s ease',
        '&:hover': { boxShadow: '0 8px 24px rgba(255,92,147,0.15)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 2,
          minWidth: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: 'rgba(255,255,255,0.9)',
          color: PINK,
          fontWeight: 700,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {video.order ?? '—'}
      </Box>

      <Box
        component="video"
        ref={videoRef}
        controls
        sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', bgcolor: '#000' }}
      />

      <Box sx={{ p: 1.75, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: PINK_DARK, flex: 1, minWidth: 0 }} noWrap>
          {video.title || 'Sin título'}
        </Typography>
        <Chip
          icon={<VideoLibraryOutlined />}
          label={formatDuration(video.durationSeconds)}
          size="small"
          sx={chipSx()}
        />
        <Tooltip title="Eliminar video">
          <IconButton
            onClick={handleDelete}
            sx={{
              color: PINK_DARK,
              border: `1px solid ${PINK_SOFT}`,
              borderRadius: 2,
              '&:hover': { bgcolor: PINK_BG_SOFT, color: '#C62828' },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────
const CourseVideoAdd = () => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerCursoPorId } = useContext(CoursesContext);

  const [course, setCourse] = useState(null);
  const [existingVideos, setExistingVideos] = useState([]);

  // ─── Un solo slot de video nuevo ────────────────────────────────────────
  const [newVideo, setNewVideo] = useState({
    title: '',
    order: null,
    file: null,
    previewUrl: null,
    duration: null,
    uploaded: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await obtenerCursoPorId(id);
      if (data) {
        setCourse(data);
        if (Array.isArray(data.videos)) setExistingVideos(data.videos);
      }
    };
    fetchCourse();
  }, [id, obtenerCursoPorId]);

  const updateNewVideo = (field, value) =>
    setNewVideo((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      Swal.fire({ icon: 'error', title: 'Archivo no válido', text: 'Selecciona un video.' });
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.src = previewUrl;
    vid.onloadedmetadata = () => {
      updateNewVideo('duration', parseFloat(vid.duration.toFixed(2)));
    };

    setNewVideo((prev) => ({
      ...prev,
      file,
      previewUrl,
      uploaded: false,
    }));
    setUploadProgress(0);
  };

  const handleRemoveNewVideo = () => {
    setNewVideo({
      title: '',
      order: null,
      file: null,
      previewUrl: null,
      duration: null,
      uploaded: false,
    });
    setUploadProgress(0);
    const input = document.getElementById('single-video-input');
    if (input) input.value = '';
  };

  const handleDeleteExisting = async (videoId) => {
    try {
      await clienteAxios.delete(`/videos/delete/${videoId}`);
      setExistingVideos((prev) => prev.filter((v) => v.id !== videoId));
      Swal.fire({
        icon: 'success',
        title: 'Video eliminado',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al eliminar video:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.response?.data?.message || 'No se pudo eliminar el video.',
      });
    }
  };

  // ── Upload helpers ──────────────────────────────────────────────────────
  const uploadChunkXHR = (url, chunk, fileType, onChunkProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', fileType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onChunkProgress(e.loaded, e.total);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.getResponseHeader('ETag').replaceAll('"', ''));
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(chunk);
    });

  const uploadChunkWithRetries = async (url, chunk, fileType, onChunkProgress) => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await uploadChunkXHR(url, chunk, fileType, onChunkProgress);
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  };

  const uploadMultipart = async (file, uploadId, s3Key, onProgress) => {
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedParts = [];
    let bytesUploadedBeforeChunk = 0;

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkSize = end - start;

      const { data } = await clienteAxios.post('/videos/multipart/presigned', {
        uploadId,
        s3Key,
        partNumber,
      });

      const etag = await uploadChunkWithRetries(
        data.presignedUrl,
        chunk,
        file.type,
        (loaded) => {
          const totalUploaded = bytesUploadedBeforeChunk + loaded;
          const pct = Math.min(Math.round((totalUploaded / file.size) * 100), 100);
          onProgress(pct);
        }
      );

      bytesUploadedBeforeChunk += chunkSize;
      uploadedParts.push({ PartNumber: partNumber, ETag: etag });
    }

    return uploadedParts;
  };

  // ── Upload single video ─────────────────────────────────────────────────
  const handleUploadSingle = async () => {
    if (!newVideo.file) {
      Swal.fire({ icon: 'warning', title: 'Sin video', text: 'Selecciona un archivo de video primero.' });
      return;
    }
    if (!newVideo.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'Escribe un título para el video.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: init } = await clienteAxios.post('/videos/multipart/init', {
        courseId: id,
        fileName: newVideo.file.name,
        fileType: newVideo.file.type,
        durationSeconds: Number(newVideo.duration),
        fileSizeBytes: newVideo.file.size,
        title: newVideo.title,
        order: newVideo.order || null,
      });

      const { uploadId, s3Key, videoId } = init;

      const parts = await uploadMultipart(
        newVideo.file,
        uploadId,
        s3Key,
        setUploadProgress
      );

      await clienteAxios.post('/videos/multipart/complete', {
        uploadId,
        s3Key,
        parts,
        courseId: id,
        videoId,
        title: newVideo.title,
        order: newVideo.order || null,
      });

      setNewVideo((prev) => ({ ...prev, uploaded: true }));

      const newVideoData = {
        _id: videoId,
        title: newVideo.title,
        order: newVideo.order || null,
        durationSeconds: newVideo.duration,
        cloudfrontUrl: '',
      };
      setExistingVideos((prev) => [...prev, newVideoData]);

      Swal.fire({
        icon: 'success',
        title: 'Video subido correctamente',
        timer: 1500,
        showConfirmButton: false,
      });

      // Limpiar slot tras subida exitosa
      handleRemoveNewVideo();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Falló la subida del video.' });
    } finally {
      setIsUploading(false);
    }
  };

  const sortedExisting = [...existingVideos].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${PINK_SOFT}`,
          boxShadow: '0 8px 24px rgba(255,92,147,0.08)',
        }}
      >
        {/* ── Header ── */}
        <PageHeader
          icon={<VideoLibraryOutlined />}
          title="Videos del curso"
          subtitle={course?.title || 'Cargando curso...'}
          onBack={() => history.goBack()}
        />

        {/* ── Contenido ── */}
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
          <Stack spacing={3}>

            {/* ── Slot único de video ── */}
            <Section
              icon={<CloudUploadOutlined fontSize="small" />}
              title="Subir video"
              subtitle="Solo se puede subir un video a la vez. Al completarlo, podrás subir otro."
            >
              <Grid container spacing={2.5}>
                {/* Datos del video */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Título del video *"
                    fullWidth
                    value={newVideo.title}
                    onChange={(e) => updateNewVideo('title', e.target.value)}
                    disabled={isUploading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleOutlined sx={{ color: PINK, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Orden"
                    type="number"
                    fullWidth
                    inputProps={{ min: 1 }}
                    value={newVideo.order ?? ''}
                    onChange={(e) =>
                      updateNewVideo(
                        'order',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    disabled={isUploading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NumbersOutlined sx={{ color: PINK, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>

                {/* Selector / preview */}
                <Grid item xs={12}>
                  {!newVideo.previewUrl ? (
                    <>
                      <DropZone
                        id="single-video-input"
                        icon={<CloudUploadOutlined />}
                        title="Haz clic para seleccionar el video"
                        helper="MP4, MOV, WEBM · Sin límite práctico (subida por partes)"
                        disabled={isUploading}
                      />
                      <input
                        id="single-video-input"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        sx={{ display: 'none' }}
                      />
                    </>
                  ) : (
                    <Stack spacing={2} alignItems="center">
                      <Box
                        component="video"
                        src={newVideo.previewUrl}
                        controls
                        sx={{
                          width: '100%',
                          maxHeight: 340,
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: `1px solid ${PINK_SOFT}`,
                          bgcolor: '#000',
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        {newVideo.file && (
                          <>
                            <Chip
                              icon={<VideoLibraryOutlined />}
                              label={newVideo.file.type.split('/')[1].toUpperCase()}
                              size="small"
                              sx={chipSx()}
                            />
                            <Chip
                              label={formatSize(newVideo.file.size)}
                              size="small"
                              sx={chipSx()}
                            />
                            {newVideo.duration && (
                              <Chip
                                label={`⏱ ${formatDuration(newVideo.duration)}`}
                                size="small"
                                sx={chipSx()}
                              />
                            )}
                          </>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SwapHorizOutlined />}
                          onClick={() =>
                            document.getElementById('single-video-input').click()
                          }
                          disabled={isUploading}
                          sx={smallOutBtnSx}
                        >
                          Cambiar video
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={handleRemoveNewVideo}
                          disabled={isUploading}
                          sx={smallErrBtnSx}
                        >
                          Quitar
                        </Button>
                        <input
                          id="single-video-input"
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          sx={{ display: 'none' }}
                        />
                      </Stack>
                    </Stack>
                  )}
                </Grid>

                {/* Barra de progreso */}
                {isUploading && (
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${PINK_SOFT}`,
                        bgcolor: PINK_BG_SOFT,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: PINK_DARK, fontWeight: 600 }}>
                          Subiendo video...
                        </Typography>
                        <Typography variant="body2" sx={{ color: PINK_DARK, fontWeight: 700 }}>
                          {uploadProgress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: PINK_SOFT,
                          '& .MuiLinearProgress-bar': {
                            background: GRADIENT,
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Paper>
                  </Grid>
                )}

                {/* Botón subir */}
                {newVideo.file && !isUploading && (
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleUploadSingle}
                      startIcon={<SaveIcon />}
                      sx={primaryBtnSx}
                    >
                      Subir video
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Section>

            <Divider sx={{ borderColor: PINK_SOFT }} />

            {/* ── Botón volver ── */}
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={2}
              justifyContent="flex-end"
            >
              <Button
                variant="outlined"
                size="large"
                onClick={() => history.goBack()}
                sx={outlineBtnSx}
              >
                Volver
              </Button>
            </Stack>

            {/* ── Videos existentes ── */}
            {sortedExisting.length > 0 && (
              <Section
                icon={<CheckCircleOutlined fontSize="small" />}
                title={`Videos actuales (${sortedExisting.length})`}
                subtitle="Videos ya subidos al curso. Puedes eliminarlos individualmente."
              >
                <Grid container spacing={2}>
                  {sortedExisting.map((v, i) => (
                    <Grid item xs={12} sm={6} md={4} key={v.id ?? i}>
                      <ExistingVideoCard
                        video={v}
                        onDeleteExisting={handleDeleteExisting}
                      />
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