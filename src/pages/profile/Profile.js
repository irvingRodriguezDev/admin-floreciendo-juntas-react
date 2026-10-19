
import React, { useContext } from "react";
import {
  Avatar, Box, Grid, Paper, Stack, Typography, Chip, Divider, Link,
} from "@mui/material";
import {
  PersonOutlined, EmailOutlined, LanguageOutlined,
  BadgeOutlined, ShieldOutlined, VerifiedOutlined,
} from "@mui/icons-material";
import AuthContext from "../../context/AuthContext/AuthContext";

const PINK = "#FF5C93";
const DARK = "#E94E88";
const SOFT = "#FFE6F0";
const BG = "#FFF5FA";
const GRADIENT = "linear-gradient(135deg, #FF5C93, #FF69B4)";

const ROLES = {
  1: "Admin",
  2: "Gerente",
  3: "Supervisor",
  4: "Vendedor",
  5: "Escaneador",
};

const Profile = () => {
  const { usuario } = useContext(AuthContext);
  const user = usuario?.user || {};

  const name = user.name || "Administrador";
  const email = user.email || "admin@floreciendojuntas.com";
  const image = user.profileImage;
  const role = user.roleId;
  const isAdmin = role === 1;

  const rows = [
    { label: "Nombre completo", value: name, icon: <PersonOutlined /> },
    { label: "Correo electrónico", value: email, icon: <EmailOutlined /> },
    { label: "Rol", value: ROLES[role] || "Usuario", icon: <BadgeOutlined /> },
    {
      label: "Sitio web",
      value: "https://floreciendojuntas.com",
      icon: <LanguageOutlined />,
      link: true,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Paper sx={{ overflow: "hidden", borderRadius: 4, border: `1px solid ${SOFT}` }}>
        <Box sx={{ p: 3, color: "#fff", background: GRADIENT }}>
          <Typography variant="h5" fontWeight={700}>Mi perfil</Typography>
          <Typography variant="body2">Información de tu cuenta</Typography>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: BG }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3, textAlign: "center", borderRadius: 3,
                  borderColor: SOFT, height: "100%",
                }}
              >
                <Avatar
                  src={image || ""}
                  alt={name}
                  sx={{
                    width: 120, height: 120, mx: "auto", mb: 2,
                    background: image ? "transparent" : GRADIENT,
                    border: "4px solid white", fontSize: 48,
                  }}
                >
                  {!image && name[0]?.toUpperCase()}
                </Avatar>

                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Typography variant="h6" fontWeight={700} color={DARK}>
                    {name}
                  </Typography>
                  {isAdmin && <VerifiedOutlined sx={{ color: PINK }} />}
                </Stack>

                <Chip
                  icon={isAdmin ? <ShieldOutlined /> : <BadgeOutlined />}
                  label={ROLES[role] || "Usuario"}
                  sx={{
                    mt: 1, bgcolor: "#FFF0F7", color: DARK,
                    border: `1px solid ${SOFT}`, fontWeight: 600,
                  }}
                />

                <Divider sx={{ my: 2, borderColor: SOFT }} />
                <Typography variant="body2" color="text.secondary"
                  sx={{ overflowWrap: "anywhere" }}>
                  {email}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper
                variant="outlined"
                sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, borderColor: SOFT }}
              >
                <Typography variant="h6" fontWeight={700} color={DARK} mb={1}>
                  Información de la cuenta
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Datos de tu cuenta en Floreciendo Juntas
                </Typography>

                {rows.map((row, index) => (
                  <React.Fragment key={row.label}>
                    {index > 0 && <Divider sx={{ my: 2, borderColor: SOFT }} />}

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{
                        p: 1, display: "flex", borderRadius: 2,
                        bgcolor: "#FFF0F7", color: PINK,
                      }}>
                        {row.icon}
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {row.label}
                        </Typography>

                        {row.link ? (
                          <Link
                            href={row.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ display: "block", color: DARK, overflowWrap: "anywhere" }}
                          >
                            {row.value.replace(/^https?:\/\//, "")}
                          </Link>
                        ) : (
                          <Typography sx={{ overflowWrap: "anywhere" }}>
                            {row.value}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </React.Fragment>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
