import React, { useContext } from "react";
import {
  Avatar,
  Box,
  Grid,
  Tooltip,
  Typography,
  Chip,
  Paper,
  Stack,
  Divider,
  Button,
  Link,
} from "@mui/material";
import {
  VerifiedOutlined,
  EmailOutlined,
  LanguageOutlined,
  BadgeOutlined,
  PersonOutlined,
  ShieldOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";
import AuthContext from "../../context/AuthContext/AuthContext";

// ─── Constantes de diseño (misma paleta que el resto) ────────────────────────
const PINK = "#FF5C93";
const PINK_DARK = "#E94E88";
const PINK_SOFT = "#FFE6F0";
const PINK_BG = "#FFF5FA";
const PINK_BG_SOFT = "#FFF0F7";
const GRADIENT = "linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)";

const flexRow = { display: "flex", alignItems: "center", gap: 1 };

const chipSx = (extra = {}) => ({
  bgcolor: PINK_BG_SOFT,
  color: PINK_DARK,
  fontWeight: 600,
  fontSize: "0.72rem",
  height: "auto",
  border: `1px solid ${PINK_SOFT}`,
  "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
  "& .MuiChip-icon": { color: PINK },
  ...extra,
});

// ─── PageHeader reutilizable ─────────────────────────────────────────────────
const PageHeader = ({ icon, title, subtitle, children }) => (
  <Box
    sx={{
      background: GRADIENT,
      color: "#fff",
      p: { xs: 2.5, sm: 3 },
      gap: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", width: 48, height: 48 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle && <Typography variant="body2" sx={{ opacity: 0.9 }}>{subtitle}</Typography>}
      </Box>
    </Stack>
    {children}
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
      bgcolor: "#fff",
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
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, ml: 6 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
);

// ─── DataRow: fila con ícono + etiqueta + valor ──────────────────────────────
const DataRow = ({ icon, label, value, link }) => (
  <Box sx={{ ...flexRow, alignItems: "flex-start", gap: 1.5 }}>
    <Box
      sx={{
        bgcolor: PINK_BG_SOFT,
        color: PINK,
        width: 32,
        height: 32,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="caption" sx={{ color: "#9e9e9e", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      {link ? (
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            display: "block",
            color: PINK_DARK,
            fontWeight: 600,
            fontSize: "0.95rem",
            wordBreak: "break-word",
          }}
        >
          {value.replace(/^https?:\/\//, "")}
        </Link>
      ) : (
        <Typography
          sx={{ color: "#1e293b", fontWeight: 500, fontSize: "0.95rem", wordBreak: "break-word" }}
        >
          {value}
        </Typography>
      )}
    </Box>
  </Box>
);

// ─── Componente principal ────────────────────────────────────────────────────
const ROLE_LABELS = {
  1: "Admin",
  2: "Gerente",
  3: "Supervisor",
  4: "Vendedor",
  5: "Escaneador",
};

const Profile = () => {
  const { usuario } = useContext(AuthContext);

  const roleId = usuario?.user?.roleId;
  const roleLabel = ROLE_LABELS[roleId] || "Usuario";
  const isAdmin = roleId === 1;

  const profileImage = usuario?.user?.profileImage;
  const userName = usuario?.user?.name || "Administrador";
  const userEmail = usuario?.user?.email || "admin@floreciendojuntas.com";
  const userInitial = userName?.[0]?.toUpperCase() || "U";
  const avatarBg = profileImage ? "transparent" : GRADIENT;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${PINK_SOFT}`,
          boxShadow: "0 8px 24px rgba(255,92,147,0.08)",
        }}
      >
        {/* ── Header ── */}
        <PageHeader
          icon={<PersonOutlined />}
          title="Mi perfil"
          subtitle="Información de tu cuenta"
        />

        {/* ── Contenido ── */}
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: PINK_BG }}>
          <Grid container spacing={3}>
            {/* ── Columna izquierda: avatar + rol ── */}
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${PINK_SOFT}`,
                  bgcolor: "#fff",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Fondo decorativo gradiente arriba */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    background: GRADIENT,
                  }}
                />

                {/* Avatar */}
                <Box sx={{ position: "relative", zIndex: 1, mt: 2 }}>
                  <Avatar
                    alt={userName}
                    src={profileImage || ""}
                    sx={{
                      width: 128,
                      height: 128,
                      background: avatarBg,
                      fontSize: 52,
                      fontWeight: 700,
                      color: "#fff",
                      border: "4px solid #fff",
                      boxShadow: "0 8px 24px rgba(255,92,147,0.25)",
                    }}
                  >
                    {!profileImage && userInitial}
                  </Avatar>
                </Box>

                {/* Nombre + verificación */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{ zIndex: 1, textAlign: "center", flexWrap: "wrap", justifyContent: "center" }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: PINK_DARK, lineHeight: 1.2, wordBreak: "break-word" }}
                  >
                    {userName}
                  </Typography>
                  {isAdmin && (
                    <Tooltip title="Administrador" arrow>
                      <VerifiedOutlined sx={{ fontSize: 20, color: PINK }} />
                    </Tooltip>
                  )}
                </Stack>

                {/* Rol */}
                <Chip
                  icon={isAdmin ? <ShieldOutlined /> : <BadgeOutlined />}
                  label={roleLabel}
                  sx={chipSx({ px: 0.5, py: 1 })}
                />

                <Divider sx={{ borderColor: PINK_SOFT, width: "100%" }} />

                {/* Email corto debajo del avatar */}
                <Typography
                  variant="caption"
                  sx={{ color: "#9e9e9e", textAlign: "center", wordBreak: "break-all" }}
                >
                  {userEmail}
                </Typography>
              </Paper>
            </Grid>

            {/* ── Columna derecha: información ── */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3} sx={{ height: "100%" }}>
                <Section
                  icon={<PersonOutlined fontSize="small" />}
                  title="Información personal"
                  subtitle="Datos de tu cuenta en Floreciendo Juntas"
                >
                  <Stack spacing={2.5}>
                    <DataRow
                      icon={<PersonOutlined fontSize="small" />}
                      label="Nombre completo"
                      value={userName}
                    />
                    <Divider sx={{ borderColor: PINK_SOFT }} />
                    <DataRow
                      icon={<EmailOutlined fontSize="small" />}
                      label="Correo electrónico"
                      value={userEmail}
                    />
                    <Divider sx={{ borderColor: PINK_SOFT }} />
                    <DataRow
                      icon={<BadgeOutlined fontSize="small" />}
                      label="Rol"
                      value={roleLabel}
                    />
                  </Stack>
                </Section>

                <Section
                  icon={<WorkspacePremiumOutlined fontSize="small" />}
                  title="Sitio web"
                  subtitle="Sitio oficial de Floreciendo Juntas"
                >
                  <DataRow
                    icon={<LanguageOutlined fontSize="small" />}
                    label="URL"
                    value="https://floreciendojuntas.com"
                    link
                  />
                </Section>

                {/* Botón opcional de sitio web */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    size="large"
                    component="a"
                    href="https://floreciendojuntas.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<LanguageOutlined />}
                    sx={{
                      py: 1.4,
                      borderRadius: 2,
                      fontWeight: 600,
                      color: PINK_DARK,
                      border: `1px solid ${PINK}`,
                      "&:hover": { bgcolor: PINK_BG_SOFT, borderColor: PINK_DARK },
                    }}
                  >
                    Visitar sitio web
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;