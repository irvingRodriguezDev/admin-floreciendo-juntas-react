import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import { useParams, useHistory } from 'react-router-dom';
import Hls from 'hls.js';
import clienteAxios from '../../config/Axios';
import CoursesContext from '../../context/CoursesContext/CoursesContext';

const CHUNK_SIZE = 25 * 1024 * 1024;
const MAX_RETRIES = 3;

// ─── helpers ──────────────────────────────────────────────────────────────────
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

// ─── VideoCard ─────────────────────────────────────────────────────────────────
const VideoCard = ({ video, index, total, onRemove, onChange, onUploadSingle, onDeleteVideo }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title || '');
  const [editOrder, setEditOrder] = useState(video.order || '');

  const handleUpload = async () => {
    if (!video.file) {
      Swal.fire({ icon: 'warning', title: 'Sin video', text: 'Selecciona un archivo de video primero.' });
      return;
    }

    if (!video.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'Escribe un título para el video.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await onUploadSingle(video, index, (progress) => {
        setUploadProgress(progress);
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Falló la subida del video.' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: '¿Eliminar video?',
      text: `¿Estás seguro de que quieres eliminar "${video.title || 'este video'}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteVideo(index);
      }
    });
  };

  const handleEdit = () => {
    setEditTitle(video.title || '');
    setEditOrder(video.order || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'El título no puede estar vacío.' });
      return;
    }
    onChange(index, 'title', editTitle);
    onChange(index, 'order', parseInt(editOrder) || null);
    setIsEditing(false);
    Swal.fire({
      icon: 'success',
      title: 'Video actualizado',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (video.uploaded) {
      Swal.fire({
        title: '¿Reemplazar video?',
        text: 'Este video ya fue subido. ¿Quieres reemplazarlo por uno nuevo?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff4da6',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, reemplazar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          onRemove(index, true);
        }
      });
    } else {
      onRemove(index, false);
    }
  };

  return (
    <div style={styles.videoCard}>
      <div style={styles.orderBadge}>{video.order || '—'}</div>

      <div style={styles.previewWrap}>
        {video.previewUrl ? (
          <video
            src={video.previewUrl}
            controls
            style={styles.previewVideo}
          />
        ) : (
          <div style={styles.previewPlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>Vista previa</span>
          </div>
        )}
      </div>

      <div style={styles.cardFields}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Título del video</label>
          {isEditing && video.uploaded ? (
            <input
              type="text"
              placeholder="Ej. Introducción al módulo"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={styles.input}
            />
          ) : (
            <input
              type="text"
              placeholder="Ej. Introducción al módulo"
              value={video.title || ''}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              style={styles.input}
              disabled={video.uploaded && !video.isReplacing}
            />
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Orden</label>
          {isEditing && video.uploaded ? (
            <input
              type="number"
              min={1}
              max={total}
              value={editOrder || ''}
              onChange={(e) => setEditOrder(e.target.value)}
              style={{ ...styles.input, width: 80 }}
            />
          ) : (
            <input
              type="number"
              min={1}
              max={total}
              value={video.order || ''}
              onChange={(e) => onChange(index, 'order', e.target.value ? parseInt(e.target.value) : null)}
              style={{ ...styles.input, width: 80 }}
              disabled={video.uploaded && !video.isReplacing}
            />
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Archivo</label>
          {video.file ? (
            <div style={styles.fileMeta}>
              <span style={styles.fileChip}>{video.file.type.split('/')[1].toUpperCase()}</span>
              <span style={styles.fileChip}>{formatSize(video.file.size)}</span>
              {video.duration && (
                <span style={styles.fileChip}>⏱ {formatDuration(video.duration)}</span>
              )}
            </div>
          ) : (
            <label style={styles.fileButton}>
              Seleccionar video
              <input
                type="file"
                hidden
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (!file.type.startsWith('video/')) {
                    Swal.fire({ icon: 'error', title: 'Archivo no válido', text: 'Selecciona un video.' });
                    return;
                  }
                  const previewUrl = URL.createObjectURL(file);
                  const vid = document.createElement('video');
                  vid.preload = 'metadata';
                  vid.src = previewUrl;
                  vid.onloadedmetadata = () => {
                    onChange(index, 'duration', parseFloat(vid.duration.toFixed(2)));
                  };
                  onChange(index, 'file', file);
                  onChange(index, 'previewUrl', previewUrl);
                  setUploadProgress(0);
                  if (video.uploaded) {
                    onChange(index, 'isReplacing', true);
                  }
                }}
              />
            </label>
          )}
        </div>

        <div style={styles.fieldGroup}>
          {video.file && !video.uploaded && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                ...styles.uploadBtn,
                ...(isUploading && styles.uploadBtnWithProgress),
                background: isUploading
                  ? `linear-gradient(90deg, #ff4da6 ${uploadProgress}%, #c026d3 ${uploadProgress}%)`
                  : 'linear-gradient(135deg, #ff4da6 0%, #c026d3 100%)'
              }}
            >
              <span style={styles.uploadBtnContent}>
                {isUploading ? `Subiendo... ${uploadProgress}%` : 'Subir video'}
              </span>
            </button>
          )}
          {video.uploaded && !video.isReplacing && (
            <div style={styles.uploadedContainer}>
              <span style={styles.uploadedBadge}>✓ Subido</span>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    style={styles.saveEditBtn}
                  >
                    💾 Guardar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={styles.cancelEditBtn}
                  >
                    ✕ Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    style={styles.editBtn}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    style={styles.deleteBtn}
                  >
                    🗑️ Eliminar
                  </button>
                </>
              )}
            </div>
          )}
          {video.isReplacing && (
            <span style={styles.replacingBadge}>↻ Reemplazando</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        style={{
          ...styles.removeBtn,
          ...(video.uploaded && styles.removeBtnUploaded)
        }}
        title={video.uploaded ? "Reemplazar video" : "Eliminar video"}
      >
        {video.uploaded ? '↻' : '✕'}
      </button>
    </div>
  );
};

// ─── ExistingVideoCard ─────────────────────────────────────────────────────────
const ExistingVideoCard = ({ video, onDeleteExisting, onEditExisting }) => {
  const videoRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(video.title || '');
  const [editOrder, setEditOrder] = useState(video.order || '');

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
      text: `¿Estás seguro de que quieres eliminar "${video.title || 'este video'}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteExisting(video._id);
      }
    });
  };

  const handleEdit = () => {
    setEditTitle(video.title || '');
    setEditOrder(video.order || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'El título no puede estar vacío.' });
      return;
    }
    onEditExisting(video._id, editTitle, parseInt(editOrder) || null);
    setIsEditing(false);
    Swal.fire({
      icon: 'success',
      title: 'Video actualizado',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div style={styles.existingCard}>
      <div style={styles.orderBadge}>{video.order || '—'}</div>
      <video ref={videoRef} controls style={styles.existingVideo} />
      <div style={styles.existingInfo}>
        {isEditing ? (
          <div style={styles.editExistingContainer}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={styles.editExistingInput}
              placeholder="Título del video"
            />
            <input
              type="number"
              min={1}
              value={editOrder || ''}
              onChange={(e) => setEditOrder(e.target.value)}
              style={{ ...styles.editExistingInput, width: 60 }}
              placeholder="Orden"
            />
            <button
              type="button"
              onClick={handleSaveEdit}
              style={styles.saveEditBtnSmall}
            >
              💾
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={styles.cancelEditBtnSmall}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <p style={styles.existingTitle}>{video.title || 'Sin título'}</p>
            <span style={styles.fileChip}>⏱ {formatDuration(video.durationSeconds)}</span>
            <button
              type="button"
              onClick={handleEdit}
              style={styles.editExistingBtn}
              title="Editar video"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={styles.deleteExistingBtn}
              title="Eliminar video"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const CourseVideoAdd = () => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerCursoPorId } = useContext(CoursesContext);

  const [course, setCourse] = useState(null);
  const [existingVideos, setExistingVideos] = useState([]);
  const [newVideos, setNewVideos] = useState([
    { title: '', order: null, file: null, previewUrl: null, duration: null, uploaded: false, isReplacing: false },
  ]);

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await obtenerCursoPorId(id);
      if (data) {
        setCourse(data);
        if (Array.isArray(data.videos)) {
          setExistingVideos(data.videos);
        }
      }
    };
    fetchCourse();
  }, [id]);

  const addVideoSlot = () => {
    setNewVideos((prev) => [
      ...prev,
      { title: '', order: null, file: null, previewUrl: null, duration: null, uploaded: false, isReplacing: false },
    ]);
  };

  const removeVideoSlot = (index, isReplacing = false) => {
    if (isReplacing) {
      setNewVideos((prev) =>
        prev.map((v, i) => {
          if (i === index) {
            return {
              ...v,
              file: null,
              previewUrl: null,
              duration: null,
              uploaded: false,
              isReplacing: true,
              title: v.title,
              order: v.order,
            };
          }
          return v;
        })
      );
    } else {
      if (newVideos.length === 1) {
        setNewVideos((prev) =>
          prev.map((v, i) => {
            if (i === index) {
              return {
                title: '',
                order: null,
                file: null,
                previewUrl: null,
                duration: null,
                uploaded: false,
                isReplacing: false,
              };
            }
            return v;
          })
        );
        return;
      }
      setNewVideos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDeleteVideo = (index) => {
    setNewVideos((prev) => prev.filter((_, i) => i !== index));
    Swal.fire({
      icon: 'success',
      title: 'Video eliminado',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDeleteExisting = async (videoId) => {
    try {
      await clienteAxios.delete(`/videos/${videoId}`);
      setExistingVideos((prev) => prev.filter((v) => v._id !== videoId));
      Swal.fire({
        icon: 'success',
        title: 'Video eliminado',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el video.',
      });
    }
  };

  const handleEditExisting = async (videoId, title, order) => {
    try {
      await clienteAxios.put(`/videos/${videoId}`, { title, order });
      setExistingVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, title, order } : v))
      );
      Swal.fire({
        icon: 'success',
        title: 'Video actualizado',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el video.',
      });
    }
  };

  const handleChange = (index, field, value) => {
    setNewVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // ── Upload helpers ────────────────────────────────────────────────────────────
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

  // ── Upload single video ────────────────────────────────────────────────────
  const uploadSingleVideo = async (video, index, onProgress) => {
    try {
      // Validar que el video tenga título
      if (!video.title.trim()) {
        throw new Error('El título del video es requerido');
      }

      // 1. Init multipart - AHORA ENVIANDO TITLE Y ORDER CORRECTAMENTE
      const { data: init } = await clienteAxios.post('/videos/multipart/init', {
        courseId: id,
        fileName: video.file.name,
        fileType: video.file.type,
        durationSeconds: Number(video.duration),
        fileSizeBytes: video.file.size,
        title: video.title, // Usando el título del video, NO del curso
        order: video.order || null, // Usando el orden del video, NO del curso
      });

      const { uploadId, s3Key, videoId } = init;

      // 2. Subir partes
      const parts = await uploadMultipart(
        video.file,
        uploadId,
        s3Key,
        onProgress
      );

      // 3. Completar - ENVIANDO TITLE Y ORDER NUEVAMENTE
      await clienteAxios.post('/videos/multipart/complete', {
        uploadId,
        s3Key,
        parts,
        courseId: id,
        videoId,
        title: video.title, // Usando el título del video
        order: video.order || null, // Usando el orden del video
      });

      // Marcar como subido
      setNewVideos((prev) =>
        prev.map((v, i) => (i === index ? { ...v, uploaded: true, isReplacing: false } : v))
      );

      // Agregar a la lista de videos existentes
      const newVideoData = {
        _id: videoId,
        title: video.title,
        order: video.order || null,
        durationSeconds: video.duration,
        cloudfrontUrl: '',
      };
      setExistingVideos((prev) => [...prev, newVideoData]);

      Swal.fire({
        icon: 'success',
        title: 'Video subido correctamente',
        timer: 1500,
        showConfirmButton: false,
      });

      const allUploaded = newVideos.every(v => !v.file || v.uploaded);
      if (allUploaded) {
        setTimeout(() => {
          history.push('/ecommerce/gridproducts');
        }, 1500);
      }

    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          type="button"
          onClick={() => history.goBack()}
          style={styles.backBtn}
        >
          ← Volver
        </button>
        <div>
          <h1 style={styles.title}>Videos del curso</h1>
          {course && (
            <p style={styles.subtitle}>{course.title}</p>
          )}
        </div>
      </div>

      <form>
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <span style={{ ...styles.sectionDot, background: '#ff4da6' }} />
              Agregar videos
              <span style={styles.badge}>{newVideos.filter((v) => v.file).length}</span>
            </h2>
            <button
              type="button"
              onClick={addVideoSlot}
              style={styles.addBtn}
            >
              + Agregar otro
            </button>
          </div>

          <div style={styles.newGrid}>
            {newVideos.map((video, index) => (
              <VideoCard
                key={index}
                video={video}
                index={index}
                total={newVideos.length}
                onRemove={removeVideoSlot}
                onChange={handleChange}
                onUploadSingle={uploadSingleVideo}
                onDeleteVideo={handleDeleteVideo}
              />
            ))}
          </div>
        </section>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={() => history.goBack()}
            style={styles.cancelBtn}
          >
            Cancelar
          </button>
        </div>
      </form>

      {existingVideos.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionDot} />
            Videos actuales
            <span style={styles.badge}>{existingVideos.length}</span>
          </h2>
          <div style={styles.existingGrid}>
            {[...existingVideos]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((v, i) => (
                <ExistingVideoCard
                  key={v._id ?? i}
                  video={v}
                  onDeleteExisting={handleDeleteExisting}
                  onEditExisting={handleEditExisting}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '28px 24px 60px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    maxWidth: 1100,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 36,
  },
  backBtn: {
    background: 'none',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 14,
    color: '#64748b',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    marginTop: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '4px 0 0',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#334155',
    margin: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#94a3b8',
    display: 'inline-block',
  },
  badge: {
    background: '#f1f5f9',
    color: '#64748b',
    borderRadius: 20,
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 600,
  },
  existingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  },
  existingCard: {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  existingVideo: {
    width: '100%',
    aspectRatio: '16/9',
    objectFit: 'cover',
    display: 'block',
    background: '#000',
  },
  existingInfo: {
    padding: '10px 14px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  existingTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
    flex: 1,
  },
  editExistingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  editExistingInput: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 13,
    color: '#1e293b',
    outline: 'none',
    flex: 1,
    minWidth: 100,
    background: '#f8fafc',
  },
  editExistingBtn: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'all 0.2s',
    color: '#3b82f6',
  },
  deleteExistingBtn: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'all 0.2s',
    color: '#f43f5e',
  },
  saveEditBtnSmall: {
    background: '#dcfce7',
    border: '1px solid #86efac',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#16a34a',
  },
  cancelEditBtnSmall: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#dc2626',
  },
  newGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  videoCard: {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    padding: 20,
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    position: 'relative',
    transition: 'box-shadow 0.2s',
  },
  orderBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    background: '#f1f5f9',
    color: '#475569',
    fontWeight: 700,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  previewWrap: {
    width: 180,
    aspectRatio: '16/9',
    background: '#0f172a',
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  cardFields: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-end',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    color: '#1e293b',
    outline: 'none',
    minWidth: 200,
    fontFamily: 'inherit',
    background: '#f8fafc',
  },
  fileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  fileChip: {
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
  },
  fileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#f8fafc',
    border: '1.5px dashed #cbd5e1',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    color: '#475569',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'border-color 0.2s',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: '#fff0f5',
    border: 'none',
    borderRadius: '50%',
    width: 26,
    height: 26,
    fontSize: 14,
    color: '#f43f5e',
    cursor: 'pointer',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  removeBtnUploaded: {
    background: '#f0f7ff',
    color: '#3b82f6',
    fontSize: 16,
  },
  addBtn: {
    background: '#fff0f5',
    border: '1.5px solid #fecdd3',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    color: '#f43f5e',
    cursor: 'pointer',
    fontWeight: 600,
    marginBottom: 16,
  },
  uploadBtn: {
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 150,
  },
  uploadBtnWithProgress: {
    background: 'linear-gradient(90deg, #ff4da6 0%, #c026d3 100%)',
  },
  uploadBtnContent: {
    position: 'relative',
    zIndex: 1,
    display: 'block',
    textAlign: 'center',
  },
  uploadedContainer: {
    display: 'flex',
    gap: 8,
    width: '100%',
    flexWrap: 'wrap',
  },
  uploadedBadge: {
    background: '#dcfce7',
    color: '#16a34a',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 80,
  },
  editBtn: {
    background: '#eff6ff',
    color: '#3b82f6',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtn: {
    background: '#fef2f2',
    color: '#f43f5e',
    border: '1px solid #fecdd3',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  saveEditBtn: {
    background: '#dcfce7',
    color: '#16a34a',
    border: '1px solid #86efac',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  cancelEditBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  replacingBadge: {
    background: '#fef3c7',
    color: '#d97706',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '10px 24px',
    fontSize: 14,
    color: '#64748b',
    cursor: 'pointer',
    fontWeight: 500,
  },
};

export default CourseVideoAdd;