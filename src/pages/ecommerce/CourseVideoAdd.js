import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { useParams, useHistory } from "react-router-dom";
import Hls from "hls.js";
import {
  Box, Container, Paper, Grid, Stack, TextField, Typography, Button, Avatar, Chip,
  IconButton, Tooltip, LinearProgress, InputAdornment, ThemeProvider, createTheme, alpha,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import clienteAxios from "../../config/Axios";
import CoursesContext from "../../context/CoursesContext/CoursesContext";

const PINK = "#FF5C95";

const theme = createTheme({
  palette: {
    primary: { main: PINK, contrastText: "#fff" },
    background: { default: "#FFF6F9" },
  },
  shape: { borderRadius: 14 },
  typography: { button: { textTransform: "none", fontWeight: 600 } },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

const CHUNK_SIZE = 25 * 1024 * 1024;
const MAX_RETRIES = 3;
const EMPTY_VIDEO = { title: "", order: null, file: null, previewUrl: null, duration: null };

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmtDuration = (s) => (!s ? "—" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`);
const fmtSize = (b) => (!b ? "—" : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);

const getVideoDuration = (url) =>
  new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    v.onloadedmetadata = () => resolve(parseFloat(v.duration.toFixed(2)));
    v.onerror = () => resolve(null);
  });

const alertMsg = (icon, title, text) => Swal.fire({ icon, title, text });

/* ── Subida multipart ─────────────────────────────────────────────────────── */
const uploadChunkXHR = (url, chunk, fileType, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", fileType);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded, e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve((xhr.getResponseHeader("ETag") || "").replaceAll('"', ""))
        : reject(new Error(`HTTP ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(chunk);
  });

const uploadChunkWithRetries = async (url, chunk, fileType, onProgress) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await uploadChunkXHR(url, chunk, fileType, onProgress);
    } catch (err) {
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

    const { data } = await clienteAxios.post("/videos/multipart/presigned", { uploadId, s3Key, partNumber: n });

    const etag = await uploadChunkWithRetries(data.presignedUrl, file.slice(start, end), file.type, (loaded) =>
      onProgress(Math.min(Math.round(((uploadedBytes + loaded) / file.size) * 100), 100))
    );

    uploadedBytes += end - start;
    parts.push({ PartNumber: n, ETag: etag });
  }
  return parts;
};

/* ── UI ───────────────────────────────────────────────────────────────────── */
const Section = ({ title, subtitle, children }) => (
  <Paper sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3, border: `1px solid ${alpha(PINK, 0.15)}` }}>
    <Typography variant="h6" fontWeight={700}>{title}</Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>{subtitle}</Typography>
    {children}
  </Paper>
);

const DropZone = ({ disabled, onClick, onFiles }) => {
  const [drag, setDrag] = useState(false);
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  const over = (e) => { stop(e); !disabled && setDrag(true); };

  return (
    <Box
      onClick={() => !disabled && onClick()}
      onDragEnter={over}
      onDragOver={over}
      onDragLeave={(e) => { stop(e); setDrag(false); }}
      onDrop={(e) => {
        stop(e);
        setDrag(false);
        if (!disabled && e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
      }}
      sx={{
        p: { xs: 3, sm: 5 }, textAlign: "center", borderRadius: 3, transition: ".2s",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        border: `2px dashed ${alpha(PINK, drag ? 1 : 0.5)}`, bgcolor: alpha(PINK, drag ? 0.12 : 0.04),
        "&:hover": disabled ? {} : { bgcolor: alpha(PINK, 0.1), borderColor: PINK },
      }}
    >
      <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
      <Typography fontWeight={600}>Haz clic o arrastra el video aquí</Typography>
      <Typography variant="caption" color="text.secondary">
        MP4, MOV, WEBM · Sin límite práctico (subida por partes)
      </Typography>
    </Box>
  );
};

const ExistingVideoCard = ({ video, onDelete }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const url = video.cloudfrontUrl;
    if (!el || !url) return;

    let hls;
    if (url.includes(".m3u8")) {
      if (el.canPlayType("application/vnd.apple.mpegurl")) el.src = url;
      else if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(el);
      }
    } else el.src = url;

    return () => hls?.destroy();
  }, [video.cloudfrontUrl]);

  const confirmDelete = () =>
    Swal.fire({
      title: "¿Eliminar video?",
      text: `Se eliminará "${video.title || "este video"}". Esta acción no se puede deshacer.`,
      icon: "warning", showCancelButton: true,
      confirmButtonColor: PINK, cancelButtonColor: "#9e9e9e",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    }).then((r) => r.isConfirmed && onDelete(video.id));

  return (
    <Paper sx={{ overflow: "hidden", position: "relative", border: `1px solid ${alpha(PINK, 0.2)}` }}>
      <Avatar variant="rounded" sx={{
        position: "absolute", top: 10, left: 10, zIndex: 2, width: 32, height: 32, fontSize: 13, fontWeight: 700,
        bgcolor: "rgba(255,255,255,0.92)", color: PINK,
      }}>
        {video.order ?? "—"}
      </Avatar>
      <Box component="video" ref={ref} controls
        sx={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", bgcolor: "#000" }} />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>{video.title || "Sin título"}</Typography>
        <Chip size="small" color="primary" variant="outlined" label={fmtDuration(video.durationSeconds)} />
        <Tooltip title="Eliminar video">
          <IconButton size="small" color="primary" onClick={confirmDelete}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

/* ── Página ───────────────────────────────────────────────────────────────── */
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

  // Liberar la URL de vista previa
  useEffect(() => () => {
    if (newVideo.previewUrl) URL.revokeObjectURL(newVideo.previewUrl);
  }, [newVideo.previewUrl]);

  const patchVideo = (field, value) => setNewVideo((p) => ({ ...p, [field]: value }));
  const openPicker = () => fileInputRef.current?.click();

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return alertMsg("error", "Archivo no válido", "Selecciona un video.");

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
    e.target.value = "";
  };

  const clearNewVideo = () => {
    setNewVideo((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return EMPTY_VIDEO;
    });
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteExisting = async (videoId) => {
    try {
      await clienteAxios.delete(`/videos/delete/${videoId}`);
      setExistingVideos((prev) => prev.filter((v) => v.id !== videoId));
      Swal.fire({ icon: "success", title: "Video eliminado", timer: 1800, showConfirmButton: false });
    } catch (error) {
      console.error("Error al eliminar video:", error);
      alertMsg("error", "Error", error?.response?.data?.message || "No se pudo eliminar el video.");
    }
  };

  const handleUpload = async () => {
    const { file, title, order, duration } = newVideo;
    if (!file) return alertMsg("warning", "Sin video", "Selecciona un archivo primero.");
    if (!title.trim()) return alertMsg("warning", "Título requerido", "Escribe un título.");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: init } = await clienteAxios.post("/videos/multipart/init", {
        courseId: id, fileName: file.name, fileType: file.type,
        durationSeconds: Number(duration), fileSizeBytes: file.size,
        title, order: order || null,
      });
      const { uploadId, s3Key, videoId } = init;

      const parts = await uploadMultipart(file, uploadId, s3Key, setUploadProgress);

      await clienteAxios.post("/videos/multipart/complete", {
        uploadId, s3Key, parts, courseId: id, videoId, title, order: order || null,
      });

      setExistingVideos((prev) => [
        ...prev,
        { id: videoId, title, order: order || null, durationSeconds: duration, cloudfrontUrl: "" },
      ]);

      Swal.fire({ icon: "success", title: "Video subido correctamente", timer: 1500, showConfirmButton: false });
      clearNewVideo();
    } catch (err) {
      console.error(err);
      alertMsg("error", "Error", "Falló la subida del video.");
    } finally {
      setIsUploading(false);
    }
  };

  const sortedExisting = [...existingVideos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
        <Container maxWidth="md">
          {/* Encabezado */}
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <Tooltip title="Volver">
              <IconButton onClick={() => history.goBack()}><ArrowBackRoundedIcon /></IconButton>
            </Tooltip>
            <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}><VideoLibraryRoundedIcon /></Avatar>
            <Box flexGrow={1} minWidth={0}>
              <Typography variant="h5" fontWeight={800}>Videos del curso</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {course?.title || "Cargando curso..."}
              </Typography>
            </Box>
            <Chip color="primary" variant="outlined" label={`${existingVideos.length} videos`} />
          </Stack>

          {/* Subir video */}
          <Section title="Subir video" subtitle="Solo se puede subir un video a la vez. Al completarlo, podrás subir otro.">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth required label="Título del video" value={newVideo.title} disabled={isUploading}
                  onChange={(e) => patchVideo("title", e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TitleRoundedIcon color="primary" fontSize="small" /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth type="number" label="Orden" inputProps={{ min: 1 }}
                  value={newVideo.order ?? ""} disabled={isUploading}
                  onChange={(e) => patchVideo("order", e.target.value ? parseInt(e.target.value, 10) : null)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><NumbersRoundedIcon color="primary" fontSize="small" /></InputAdornment> }} />
              </Grid>

              <input ref={fileInputRef} hidden type="file" accept="video/*" onChange={handleFileChange} />

              <Grid item xs={12}>
                {!newVideo.previewUrl ? (
                  <DropZone disabled={isUploading} onClick={openPicker} onFiles={(files) => processFile(files?.[0])} />
                ) : (
                  <Stack spacing={2} alignItems="center">
                    <Box component="video" src={newVideo.previewUrl} controls sx={{
                      width: "100%", maxHeight: 340, objectFit: "contain", borderRadius: 3, bgcolor: "#000",
                      border: `1px solid ${alpha(PINK, 0.25)}`,
                    }} />
                    {newVideo.file && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
                        <Chip size="small" color="primary" variant="outlined"
                          label={newVideo.file.type.split("/")[1]?.toUpperCase() || "VIDEO"} />
                        <Chip size="small" color="primary" variant="outlined" label={fmtSize(newVideo.file.size)} />
                        {newVideo.duration && (
                          <Chip size="small" color="primary" variant="outlined" label={`⏱ ${fmtDuration(newVideo.duration)}`} />
                        )}
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1.5}>
                      <Button variant="outlined" size="small" startIcon={<SwapHorizRoundedIcon />}
                        onClick={openPicker} disabled={isUploading}>
                        Cambiar video
                      </Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteOutlineRoundedIcon />}
                        onClick={clearNewVideo} disabled={isUploading}>
                        Quitar
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Grid>

              {isUploading && (
                <Grid item xs={12}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight={600}>Subiendo video...</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">{uploadProgress}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 10, borderRadius: 5 }} />
                </Grid>
              )}

              {newVideo.file && !isUploading && (
                <Grid item xs={12}>
                  <Button fullWidth variant="contained" size="large" startIcon={<PublishRoundedIcon />}
                    onClick={handleUpload} sx={{ boxShadow: `0 8px 20px ${alpha(PINK, 0.35)}` }}>
                    Subir video
                  </Button>
                </Grid>
              )}
            </Grid>
          </Section>

          {/* Videos actuales */}
          {sortedExisting.length > 0 && (
            <Section title={`Videos actuales (${sortedExisting.length})`}
              subtitle="Videos ya subidos al curso. Puedes eliminarlos individualmente.">
              <Grid container spacing={2}>
                {sortedExisting.map((v, i) => (
                  <Grid item xs={12} sm={6} key={v.id ?? i}>
                    <ExistingVideoCard video={v} onDelete={handleDeleteExisting} />
                  </Grid>
                ))}
              </Grid>
            </Section>
          )}

          <Stack direction="row" justifyContent="flex-end">
            <Button variant="outlined" size="large" onClick={() => history.goBack()} sx={{ minWidth: 140 }}>
              Volver
            </Button>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CourseVideoAdd;