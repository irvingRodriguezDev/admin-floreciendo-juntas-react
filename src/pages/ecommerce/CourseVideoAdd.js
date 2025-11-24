import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';
import { useParams, useHistory } from 'react-router-dom';
import Hls from 'hls.js';
import clienteAxios from '../../config/Axios';
import CoursesContext from '../../context/CoursesContext/CoursesContext';

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

  //Obtener curso al montar el componente
  useEffect(() => {
    const fetchCourse = async () => {
      const data = await obtenerCursoPorId(id);

      if (data) {
        setCourse(data);

        // Si el curso tiene video, guardar su URL existente
        if (data.video?.cloudfrontUrl) {
          setExistingVideoUrl(data.video.cloudfrontUrl);
        }
      }
    };

    fetchCourse();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Reproducir HLS si es necesario
  useEffect(() => {
    if (!existingVideoUrl || videoPreview) return;
    const video = document.getElementById('existing-video');
    if (Hls.isSupported() && existingVideoUrl.endsWith('.m3u8')) {
      const hls = new Hls();
      hls.loadSource(existingVideoUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [existingVideoUrl, videoPreview]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0]; 
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo no válido',
        text: 'Por favor selecciona un archivo de video.',
      });
      return;
    }

    // 🔹 Limpiar información anterior
    setCourse(null);
    setExistingVideoUrl(null);
    setVideoDuration(null);

    // 🔹 Cargar nuevo video
    setVideoFile(file);
    setVideoInfo({
      name: file.name,
      type: file.type.split('/')[1].toUpperCase(), // ejemplo: MP4
    });

    const videoURL = URL.createObjectURL(file);
    setVideoPreview(videoURL);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoURL;
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration.toFixed(2));
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay video',
        text: 'Por favor selecciona un video antes de guardar.',
      });
      return;
    }

    try {
      const body = {
        courseId: id,
        fileName: videoFile.name,
        fileType: videoFile.type,
        durationSeconds: Number(videoDuration),
      };

      const res = await clienteAxios.post('/videos/presigned-url', body);
      if (!res?.data?.presignedUrl) throw new Error('No se recibió la URL firmada');

      const { presignedUrl } = res.data;

      Swal.fire({
        title: 'Subiendo video...',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;">
            <div style="width:100%;background:#d8d6d7;border-radius:4px;overflow:hidden;">
              <div id="swal-progress-bar" style="width:0%;height:10px;background:#FF5C93;transition:width 0.2s;"></div>
            </div>
            <div id="swal-progress-text">0%</div>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', videoFile.type);

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            const progressBar = document.getElementById('swal-progress-bar');
            const progressText = document.getElementById('swal-progress-text');
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${percent}%`;
          }
        });

        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.statusText));
        xhr.onerror = () => reject(new Error('Error de red durante la subida'));
        xhr.send(videoFile);
      });

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El video se subió correctamente.',
        timer: 2000,
        showConfirmButton: false,
        willClose: () => history.push('/ecommerce/gridproducts'),
      });
    } catch (error) {
      console.error('Error al subir el video:', error);
      Swal.fire({ icon: 'error', title: 'Error al subir', text: 'Ocurrió un error durante la subida.' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Subir video del curso
          </Typography>

          {/* 🔹 Mostrar datos solo si no hay video nuevo */}
          {course && !videoPreview && (
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
              <strong>Nombre:</strong> {course.title || '—'}
              <br />
              {/* <strong>Tipo:</strong>{' '}
              {course.video?.cloudfrontUrl
                ? course.video.cloudfrontUrl.split('.').pop().toUpperCase()
                : '—'}
              <br /> */}
              <strong>Duración:</strong>{' '}
              {course.video?.durationSeconds || '—'} segundos
            </Typography>
          )}

          {(videoPreview || existingVideoUrl) && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 750,
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  aspectRatio: '16/9',
                }}
              >
                <video
                  src={videoPreview || existingVideoUrl}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10px',
                  }}
                  id={existingVideoUrl && !videoPreview ? 'existing-video' : undefined}
                />
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

              {/* 🔹 Mostrar información del video nuevo */}
              {videoPreview && (
                <Grid item xs={12}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: 'center', mt: 1 }}
                  >
                    <strong>Nombre:</strong> {videoInfo.name || '—'}
                    <br />
                    <strong>Tipo:</strong> {videoInfo.type || '—'}
                    <br />
                    {videoDuration && (
                      <>
                        <strong>Duración:</strong> {videoDuration} segundos
                      </>
                    )}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Guardar video
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseVideoAdd;
