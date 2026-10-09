import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Box, Stack, Paper, Typography, TextField, Button, Avatar,
  Divider, IconButton, Tooltip, Chip, CircularProgress,
} from "@mui/material";
import {
  Save as SaveIcon, ArrowBack as ArrowBackIcon, CloudUploadOutlined,
  SwapHorizOutlined, DeleteOutline as DeleteOutlineIcon, InfoOutlined,
  VideoLibraryOutlined, AutoAwesomeOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import SystemContext from "../../context/SystemContext/SystemContext";

/* ═══════════════════════════════════════════════════════════════
   1. CONSTANTES
   ═══════════════════════════════════════════════════════════════ */
const PINK = "#FF5C93";
const PINK_DARK = "#E94E88";
const PINK_SOFT = "#FFE6F0";
const PINK_BG = "#FFF5FA";
const PINK_BG_SOFT = "#FFF0F7";
const GRADIENT = "linear-gradient(135deg,#FF5C93,#FF69B4)";
const GRADIENT_HOVER = "linear-gradient(135deg,#E94E88,#FF5C93)";

const INITIAL_FORM = { name: "", description: "", video: null };

/* ═══════════════════════════════════════════════════════════════
   2. ESTILOS REUTILIZABLES
   ═══════════════════════════════════════════════════════════════ */
const sx = {
  field: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2, bgcolor: "#fff",
      "& fieldset": { borderColor: PINK_SOFT },
      "&:hover fieldset": { borderColor: PINK },
      "&.Mui-focused fieldset": { borderColor: PINK, borderWidth: 2 },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: PINK },
  },
  primary: {
    py: 1.4, borderRadius: 2, fontWeight: 700, color: "#fff",
    background: GRADIENT, boxShadow: "none",
    "&:hover": { background: GRADIENT_HOVER, boxShadow: "none" },
    "&.Mui-disabled": { background: "#F5C6D0", color: "#fff" },
  },
  outline: {
    py: 1.4, borderRadius: 2, fontWeight: 600,
    color: PINK_DARK, border: `1px solid ${PINK}`,
    "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
  },
  section: {
    p: 2.5, borderRadius: 3,
    border: `1px solid ${PINK_SOFT}`, bgcolor: "#fff",
  },
  sectionHead: { display: "flex", alignItems: "center", gap: 1, mb: 2 },
  avatarSm: { bgcolor: PINK_BG_SOFT, color: PINK, width: 32, height: 32 },
  chip: {
    bgcolor: PINK_BG_SOFT, color: PINK_DARK, fontWeight: 600,
    border: `1px solid ${PINK_SOFT}`, maxWidth: "100%",
  },
  video: {
    width: "100%", maxHeight: 420,
    borderRadius: 2, bgcolor: "#000",
  },
  dropzone: {
    border: `2px dashed ${PINK}`, borderRadius: 3, p: 5, textAlign: "center",
    cursor: "pointer", bgcolor: PINK_BG_SOFT, transition: "all .25s ease",
    "&:hover": {
      bgcolor: PINK_BG, borderColor: PINK_DARK,
      transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(255,92,147,.15)",
    },
  },
  header: {
    background: GRADIENT, color: "#fff", p: 3,
    display: "flex", alignItems: "center", gap: 2,
  },
  headerBtn: {
    color: "#fff", bgcolor: "rgba(255,255,255,.15)",
    "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. SUBCOMPONENTES DE PRESENTACIÓN
   ═══════════════════════════════════════════════════════════════ */

/** Card con icono + título + contenido */
const Section = ({ icon, title, children }) => (
  <Paper variant="outlined" sx={sx.section}>
    <Box sx={sx.sectionHead}>
      <Avatar sx={sx.avatarSm}>{icon}</Avatar>
      <Typography variant="subtitle1" fontWeight={700} color={PINK}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

/** Selector de video: preview con acciones o dropzone */
const VideoField = ({ preview, videoName, onPick, onRemove }) => {
  const inputRef = useRef(null);
  const open = () => inputRef.current.click();

  return (
    <Section icon={<VideoLibraryOutlined fontSize="small" />} title="Video del secreto">
      {preview ? (
        <Stack spacing={2} alignItems="center">
          <Box component="video" src={preview} controls sx={sx.video} />

          <Chip
            icon={<VideoLibraryOutlined />}
            label={videoName || "Video cargado"}
            size="small"
            sx={sx.chip}
          />

          <Stack direction="row" spacing={1.5}>
            <Button size="small" variant="outlined" startIcon={<SwapHorizOutlined />}
              onClick={open}
              sx={{ borderRadius: 2, color: PINK_DARK, borderColor: PINK }}>
              Cambiar
            </Button>
            <Button size="small" variant="outlined" color="error"
              startIcon={<DeleteOutlineIcon />} onClick={onRemove}
              sx={{ borderRadius: 2 }}>
              Eliminar
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box sx={sx.dropzone} onClick={open}>
          <Avatar sx={{
            bgcolor: "#fff", color: PINK, width: 64, height: 64,
            mx: "auto", mb: 2, border: `2px solid ${PINK_SOFT}`,
          }}>
            <CloudUploadOutlined sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography fontWeight={700} color={PINK} gutterBottom>
            Haz clic para subir el video
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Solo archivos de video (MP4, MOV, etc.)
          </Typography>
        </Box>
      )}

      <input ref={inputRef} type="file" accept="video/*" hidden onChange={onPick} />
    </Section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   4. HELPERS DE LÓGICA
   ═══════════════════════════════════════════════════════════════ */

/** Modal de progreso con SweetAlert */
const openProgressModal = () => Swal.fire({
  title: "Subiendo video...",
  html: `
    <div style="width:100%;background:${PINK_SOFT};border-radius:4px;overflow:hidden;">
      <div id="bar" style="width:0%;height:10px;background:${PINK};transition:width .2s;"></div>
    </div>
    <div id="pct" style="color:${PINK_DARK};font-weight:600;margin-top:8px;">0%</div>`,
  allowOutsideClick: false,
  showConfirmButton: false,
});

const updateProgress = (value) => {
  const bar = document.getElementById("bar");
  const pct = document.getElementById("pct");
  if (bar) bar.style.width = `${value}%`;
  if (pct) pct.textContent = `${value}%`;
};

/* ═══════════════════════════════════════════════════════════════
   5. COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

const AddSystem = ({ onCancel }) => {
  const { id } = useParams();
  const history = useHistory();
  const { obtenerSystemPorId, addSystem, updateSystem } = useContext(SystemContext);

  const [form, setForm] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(id);
  const goBack = () => (onCancel ? onCancel() : history.push("/system/list"));

  /* ─── Efecto: cargar datos si es edición ─── */
  useEffect(() => {
    if (!id) {
      setForm(INITIAL_FORM);
      setPreview(null);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const s = await obtenerSystemPorId(id);
        setForm({ name: s.name || "", description: s.description || "", video: null });
        if (s.system_icon) setPreview(s.system_icon);
      } catch {
        Swal.fire("Error", "No se pudo cargar la academia", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, obtenerSystemPorId]);

  /* ─── Handlers ─── */
  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      Swal.fire("Archivo inválido", "Solo se permiten videos", "warning");
      e.target.value = "";
      return;
    }
    setForm((p) => ({ ...p, video: file }));
    setPreview(URL.createObjectURL(file));
  };

  const onRemoveVideo = () => {
    setForm((p) => ({ ...p, video: null }));
    setPreview(null);
  };

  /* ─── Submit ─── */
  const onSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    if (form.video instanceof File) fd.append("video", form.video);

    setLoading(true);
    openProgressModal();

    try {
      if (isEdit) await updateSystem(id, fd, updateProgress);
      else await addSystem(fd, updateProgress);

      await Swal.fire({
        icon: "success", title: "Academia guardada",
        timer: 1500, showConfirmButton: false,
      });
      history.push("/system/list");
    } catch {
      Swal.fire("Error", "No se pudo guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Textos derivados ─── */
  const texts = isEdit
    ? { title: "Editar academia", subtitle: "Modifica los campos que deseas actualizar", submit: "Actualizar secreto" }
    : { title: "Agregar secreto", subtitle: "Completa los campos para registrar un nuevo secreto", submit: "Guardar secreto" };

  /* ─── Render ─── */
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Paper elevation={0} sx={{
        borderRadius: 4, overflow: "hidden",
        border: `1px solid ${PINK_SOFT}`,
        boxShadow: "0 8px 24px rgba(255,92,147,.08)",
      }}>
        {/* Header */}
        <Box sx={sx.header}>
          <Tooltip title="Volver">
            <IconButton onClick={goBack} sx={sx.headerBtn}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Avatar sx={{ bgcolor: "rgba(255,255,255,.2)", width: 48, height: 48 }}>
            <AutoAwesomeOutlined />
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={700}>{texts.title}</Typography>
            <Typography variant="body2" sx={{ opacity: .9 }}>{texts.subtitle}</Typography>
          </Box>
        </Box>

        {/* Formulario */}
        <Box sx={{ p: 3, bgcolor: PINK_BG }}>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={3}>

              <Section icon={<InfoOutlined fontSize="small" />} title="Información del secreto">
                <Stack spacing={2}>
                  <TextField name="name" label="Nombre *" fullWidth required
                    value={form.name} onChange={onChange} sx={sx.field} />
                  <TextField name="description" label="Descripción" fullWidth multiline rows={4}
                    value={form.description} onChange={onChange} sx={sx.field} />
                </Stack>
              </Section>

              <VideoField
                preview={preview}
                videoName={form.video?.name}
                onPick={onVideoChange}
                onRemove={onRemoveVideo}
              />

              <Divider sx={{ borderColor: PINK_SOFT }} />

              <Stack direction={{ xs: "column-reverse", sm: "row" }}
                spacing={2} justifyContent="flex-end">
                <Button variant="outlined" size="large" onClick={goBack}
                  disabled={loading} sx={sx.outline}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" size="large" disabled={loading}
                  startIcon={loading
                    ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                    : <SaveIcon />}
                  sx={{ ...sx.primary, minWidth: 220 }}>
                  {loading ? "Guardando..." : texts.submit}
                </Button>
              </Stack>

            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddSystem;