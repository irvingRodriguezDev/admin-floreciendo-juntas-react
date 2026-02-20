import React, { useState, useEffect, useContext } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid } from '@mui/material';
import Swal from 'sweetalert2';
import { useParams, useHistory } from 'react-router-dom';
import Hls from 'hls.js';
import clienteAxios from '../../config/Axios';
import CoursesContext from '../../context/CoursesContext/CoursesContext';
import { set } from 'date-fns';
import { vi } from 'date-fns/locale';

const CHUNK_SIZE = 25 * 1024 * 1024; // 50MB por parte
const MAX_RETRIES = 3;

const CourseVideoAdd = () => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerCursoPorId } = useContext(CoursesContext);

  const [course, setCourse] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoInfo, setVideoInfo] = useState({ name: '', type: '' });
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [videoId, setvideoId] = useState(null);
  const totalParts = Math.ceil(videoFile?.size / CHUNK_SIZE || 0);

  // Obtener curso
  useEffect(() => {
    const fetchCourse = async () => {
      const data = await obtenerCursoPorId(id);
      if (data) {
        setCourse(data);
        if (data.video?.cloudfrontUrl) setExistingVideoUrl(data.video?.cloudfrontUrl);
      }
    };
    fetchCourse();
  }, [id]);

  // Reproducir HLS si aplica
  useEffect(() => {
    if (!existingVideoUrl || videoPreview) return;

    const video = document.getElementById('existing-video');
    if (!video) return;

    if (existingVideoUrl.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = existingVideoUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(existingVideoUrl);
        hls.attachMedia(video);

        return () => hls.destroy();
      }
    } else {
      video.src = existingVideoUrl;
    }
  }, [existingVideoUrl, videoPreview]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      Swal.fire({ icon: 'error', title: 'Archivo no válido', text: 'Selecciona un video.' });
      return;
    }

    // Limpiar info anterior
    setCourse(null);
    setExistingVideoUrl(null);
    setVideoDuration(null);

    setVideoFile(file);
    setVideoInfo({ name: file.name, type: file.type.split('/')[1].toUpperCase() });

    const videoURL = URL.createObjectURL(file);
    setVideoPreview(videoURL);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoURL;
    video.onloadedmetadata = () => setVideoDuration(video.duration.toFixed(2));
  };

  // Función para subir una parte con reintentos
  const uploadChunkWithRetries = async (url, chunk, partNumber) => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": videoFile.type,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        return res.headers.get("ETag").replaceAll('"', '');
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        await new Promise(r => setTimeout(r, 1000 * attempt)); // backoff simple
      }
    }
  };

  // Subida multipart completa
  const uploadMultipart = async (file, uploadId, s3Key) => {
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedParts = [];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      // 🔹 pedir presigned URL SOLO para esta parte
      const { data } = await clienteAxios.post("/videos/multipart/presigned", {
        uploadId,
        s3Key,
        partNumber,
      });

      const etag = await uploadChunkWithRetries(
        data.presignedUrl,
        chunk,
        partNumber
      );

      uploadedParts.push({
        PartNumber: partNumber,
        ETag: etag,
      });

      // progreso
      const percent = Math.round((partNumber / totalParts) * 100);
      const text = document.getElementById("swal-progress-text");
      if (text) text.innerText = `${percent}%`;
    }

    return uploadedParts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ iniciar multipart
      const { data: init } = await clienteAxios.post(
        "/videos/multipart/init",
        {
          courseId: id,
          fileName: videoFile.name,
          fileType: videoFile.type,
          durationSeconds: Number(videoDuration),
          fileSizeBytes: videoFile.size,
        }
      );

      const { uploadId, s3Key, videoId } = init;
      setvideoId(videoId);
      // console.log(videoId, 'videoId guardado');
      


      Swal.fire({
        title: "Subiendo video",
        html: `
            <div class="pink-progress-container">
              <div class="pink-progress-bar" id="pink-progress-bar"></div>
            </div>
            <p id="swal-progress-text">0%</p>
            <p class="pink-subtext">Por favor espera un momento ✨</p>

            <style>
              .pink-progress-container {
                width: 100%;
                height: 14px;
                background: #ffe4f1;
                border-radius: 10px;
                overflow: hidden;
                margin-top: 15px;
              }

              .pink-progress-bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(
                  90deg,
                  #ff4da6,
                  #ff85c2,
                  #ffc1e3
                );
                border-radius: 10px;
                transition: width 0.4s ease;
                animation: shimmer 2s infinite;
              }

              #swal-progress-text {
                margin-top: 10px;
                font-size: 18px;
                font-weight: bold;
                color: #ff4da6;
              }

              .pink-subtext {
                font-size: 12px;
                color: #d63384;
                margin-top: 4px;
              }

              @keyframes shimmer {
                0% { filter: brightness(1); }
                50% { filter: brightness(1.2); }
                100% { filter: brightness(1); }
              }
            </style>
          `,
        allowOutsideClick: false,
        showConfirmButton: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        backdrop: true,
        // customClass: { popup: 'swal-zindex-400', backdrop: 'swal-backdrop-400' },
        didOpen: () => Swal.showLoading(),
      });

      // 2️⃣ subir partes
      const parts = await uploadMultipart(videoFile, uploadId, s3Key);

      // 3️⃣ completar
      await clienteAxios.post("/videos/multipart/complete", {
        uploadId,
        s3Key,
        parts,
        courseId: id,
        videoId,
      });

      Swal.fire({
        icon: "success",
        title: "Video cargado",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => history.push("/ecommerce/gridproducts"));

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Falló la carga del video",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Subir video del curso</Typography>

          {course && !videoPreview && (
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
              <strong>Nombre:</strong> {course.title || '—'}<br />
              <strong>Duración:</strong> {course.video?.durationSeconds || '—'} segundos
            </Typography>
          )}

          {(videoPreview || existingVideoUrl) && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 750, borderRadius: 2, overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16/9' }}>
                <video
                  controls
                  id={existingVideoUrl && !videoPreview ? 'existing-video' : undefined}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10px'
                  }}
                >
                  {videoPreview && (
                    <source src={videoPreview} type="video/mp4" />
                  )}
                </video>
              </Box>
            </Box>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth>
                  Seleccionar video
                  <input type="file" hidden accept="video/*" onChange={handleVideoChange} />
                </Button>
              </Grid>
              {videoPreview && (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                    <strong>Nombre:</strong> {videoInfo.name || '—'}<br />
                    <strong>Tipo:</strong> {videoInfo.type || '—'}<br />
                    {videoDuration && <><strong>Duración:</strong> {videoDuration} segundos</>}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Guardar video</Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseVideoAdd;