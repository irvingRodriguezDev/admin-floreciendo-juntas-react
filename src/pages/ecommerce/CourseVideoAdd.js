import React, { useState } from 'react';
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
import MethodGet, { MethodPost, MethodPut } from '../../config/Service';
import imageHeaders from '../../config/imageHeader';
const CourseVideoAdd = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoInfo, setVideoInfo] = useState({ name: '', type: '' });

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

    setVideoFile(file);
    setVideoInfo({ name: file.name, type: file.type });

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
      // 1️⃣ Pedir la URL firmada al backend
      const body = {
        fileName: videoFile.name,
        fileType: videoFile.type,
      };

      const res = await MethodPost('/videos/presigned-url', body);

      if (!res?.data?.presignedUrl || !res?.data?.key) {
        throw new Error('No se recibió la URL firmada o la clave del video');
      }

      const { presignedUrl, key } = res.data;

      // 2️⃣ Mostrar spinner de carga
      Swal.fire({
        title: 'Subiendo video...',
        html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
          <div class="swal2-loading-spinner" style="width:64px;height:64px;border:6px solid #ccc;border-top-color:#3085d6;border-radius:50%;animation:swal2-spin 1s linear infinite;"></div>
          <div id="swal-progress-text">0%</div>
        </div>
      `,
        allowOutsideClick: false,
        didOpen: () => {
          const style = document.createElement('style');
          style.innerHTML = `
          @keyframes swal2-spin {
            to { transform: rotate(360deg); }
          }
        `;
          document.head.appendChild(style);
        },
        showConfirmButton: false,
      });

      // 3️⃣ Subir el video con fetch y seguimiento de progreso
      const totalSize = videoFile.size;
      let uploaded = 0;

      const reader = videoFile.stream().getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              uploaded += value.length;
              const percent = Math.round((uploaded / totalSize) * 100);
              const progressText =
                document.getElementById('swal-progress-text');
              if (progressText) progressText.textContent = `${percent}%`;
              controller.enqueue(value);
              push();
            });
          }
          push();
        },
      });

      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': videoFile.type,
        },
        body: videoFile,
      });

      // 4️⃣ Resultado
      if (!response.ok) {
        throw new Error(`Error al subir: ${response.statusText}`);
      }

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'El video se subió correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });

      console.log('Video subido correctamente. Key:', key);
    } catch (error) {
      console.error('❌ Error al subir el video:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al subir',
        text: 'Ocurrió un error durante la subida del video.',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant='h5' sx={{ mb: 3, fontWeight: 600 }}>
            Subir video del curso
          </Typography>

          <form onSubmit={handleSubmit} encType='multipart/form-data'>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Button variant='contained' component='label' fullWidth>
                  Seleccionar video
                  <input
                    type='file'
                    hidden
                    accept='video/*'
                    onChange={handleVideoChange}
                  />
                </Button>
              </Grid>

              {videoPreview && (
                <>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 750, // 👈 tamaño reducido del video
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: '#000',
                          aspectRatio: '16/9',
                        }}
                      >
                        <video
                          src={videoPreview}
                          controls
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '10px',
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant='body1'
                      color='text.secondary'
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
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
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
