import React, { useState, useContext } from "react";
import {
  CircularProgress, Grow, TextField, Typography, InputAdornment, IconButton,
  Card, Box, Fade, Stack, Alert, Divider, Button, Avatar, Chip,
} from "@mui/material";
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined, LoginOutlined,
  VpnKeyOutlined, ArrowBackOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { withRouter } from "react-router-dom";
import AuthContext from "../../context/AuthContext/AuthContext";
import ResetPasswordContext from "../../context/ResetPasswordContext/ResetPasswordContext";
import logo from "../../LOGOTIPO FLORECIENDO JUNTAS negro.png";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// ─── Configuración ───────────────────────────────────────────────────────────
const GREETING_MESSAGE = "Administra cada detalle para seguir Floreciendo";
// 👇 Cambia aquí el tamaño del texto (acepta valores responsivos)
const GREETING_FONT_SIZE = { md: "1.5rem", lg: "2rem", xl: "1.2rem" };

const PINK = "#FF5C93";
const PINK_DARK = "#E94E88";
const PINK_SOFT = "#FFE6F0";
const GRADIENT = "linear-gradient(135deg, #FF5C93 0%, #FF69B4 100%)";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#fff",
    "& fieldset": { borderColor: PINK_SOFT },
    "&:hover fieldset": { borderColor: PINK },
    "&.Mui-focused fieldset": { borderColor: PINK, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: PINK },
};

const primaryBtnSx = {
  py: 1.5, borderRadius: 2, fontWeight: 700, color: "#fff", background: GRADIENT, boxShadow: "none",
  "&:hover": { background: "linear-gradient(135deg, #E94E88 0%, #FF5C93 100%)", boxShadow: "none" },
  "&.Mui-disabled": { background: "#F5C6D0", color: "#fff" },
};

const textBtnSx = { color: PINK_DARK, fontWeight: 600, borderRadius: 2 };

const circles = [
  { top: -100, right: 0, size: 350, a: 0.08 },
  { bottom: -50, left: -50, size: 300, a: 0.08 },
  { top: "50%", left: "50%", size: 600, a: 0.03, center: true },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 4 && h <= 12) return "Buenos días";
  if (h >= 13 && h <= 16) return "Buenas tardes";
  return "Buenas noches";
};

// ─── Campo reutilizable ──────────────────────────────────────────────────────
const Field = ({ icon: Icon, end, ...props }) => (
  <TextField
    fullWidth
    margin="normal"
    sx={fieldSx}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start"><Icon sx={{ color: PINK }} /></InputAdornment>
      ),
      endAdornment: end && <InputAdornment position="end">{end}</InputAdornment>,
    }}
    {...props}
  />
);

// ─── Componente principal ────────────────────────────────────────────────────
function Login() {
  const { iniciarSesion } = useContext(AuthContext);
  const { resetPassword } = useContext(ResetPasswordContext);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [login, setLogin] = useState({ email: "", password: "" });
  const [reset, setReset] = useState({ email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loginError, setLoginError] = useState("");

  const setL = (k) => (e) => setLogin((s) => ({ ...s, [k]: e.target.value }));
  const setR = (k) => (e) => setReset((s) => ({ ...s, [k]: e.target.value }));

  const loginValid = login.email.trim() && login.password;
  const resetValid = reset.email && reset.password && reset.password === reset.confirm;

  const handleLogin = async () => {
    if (!loginValid || !executeRecaptcha) return;
    setLoginError("");
    setIsLoading(true);
    try {
      const captchaToken = await executeRecaptcha("login");
      await iniciarSesion({ ...login, captchaToken });
    } catch {
      setLoginError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const error =
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reset.email) ? "Por favor ingresa un email válido"
        : reset.password.length < 8 ? "La contraseña debe tener al menos 8 caracteres"
          : null;
    if (error) return Swal.fire("Error", error, "error");

    setIsLoading(true);
    try {
      await resetPassword({
        email: reset.email,
        password: reset.password,
        passwordConfirmation: reset.confirm,
      });
      Swal.fire({
        icon: "success",
        title: "¡Contraseña restablecida!",
        text: "Ahora puedes iniciar sesión con tu nueva contraseña.",
        timer: 3000,
        showConfirmButton: false,
      });
      setReset({ email: "", password: "", confirm: "" });
      setIsForgot(false);
    } catch {
      Swal.fire("Error", "Hubo un problema al restablecer tu contraseña", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const Spinner = <CircularProgress size={24} sx={{ color: "#fff" }} />;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        background: "linear-gradient(135deg, #FF5C93 0%, #F9CADA 100%)",
      }}
    >
      {/* ── Panel izquierdo ── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 6,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {circles.map(({ size, a, center, ...pos }, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute", ...pos, width: size, height: size, borderRadius: "50%",
              background: `rgba(255,255,255,${a})`,
              transform: center ? "translate(-50%, -50%)" : undefined,
            }}
          />
        ))}
        <Box sx={{ zIndex: 1, maxWidth: 560 }}>
          <Box
            component="img"
            src={logo}
            alt="Floreciendo Juntas"
            sx={{ width: 480, maxWidth: "100%", mb: 4, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))" }}
          />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            ¡Bienvenido!
          </Typography>
          <Typography sx={{ fontSize: GREETING_FONT_SIZE, opacity: 0.95, mx: "auto" }}>
            {GREETING_MESSAGE}
          </Typography>
        </Box>
      </Box>

      {/* ── Panel derecho: formulario ── */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <Grow in timeout={800}>
          <Card
            sx={{
              width: { xs: "100%", sm: 440 },
              p: { xs: 2.5, sm: 4 },
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.96)",
              boxShadow: "0 20px 60px rgba(255, 92, 147, 0.25)",
              border: `1px solid ${PINK_SOFT}`,
            }}
          >
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
              <Box component="img" src={logo} alt="Floreciendo Juntas" sx={{ width: 220 }} />
            </Box>

            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Avatar sx={{ background: GRADIENT, width: 48, height: 48 }}>
                {isForgot ? <VpnKeyOutlined /> : <LoginOutlined />}
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {isForgot ? "Recuperar acceso" : "Iniciar sesión"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isForgot ? "Ingresa tu email y crea una nueva contraseña" : `${getGreeting()} 👋`}
                </Typography>
              </Box>
            </Stack>

            <Fade in key={isForgot} timeout={300}>
              <Box>
                {isForgot ? (
                  <>
                    <Field icon={EmailOutlined} label="Correo electrónico" type="email" value={reset.email} onChange={setR("email")} />
                    <Field icon={LockOutlined} label="Nueva contraseña" type="password" value={reset.password} onChange={setR("password")} />
                    <Field icon={LockOutlined} label="Confirmar contraseña" type="password" value={reset.confirm} onChange={setR("confirm")} />

                    <Stack spacing={1.5} mt={3}>
                      <Button
                        fullWidth size="large" variant="contained" sx={primaryBtnSx}
                        onClick={handleResetPassword}
                        disabled={!resetValid || isLoading}
                        startIcon={!isLoading && <VpnKeyOutlined />}
                      >
                        {isLoading ? Spinner : "Restablecer contraseña"}
                      </Button>
                      <Button fullWidth variant="text" sx={textBtnSx} onClick={() => setIsForgot(false)} startIcon={<ArrowBackOutlined />}>
                        Volver al inicio de sesión
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    {loginError && (
                      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{loginError}</Alert>
                    )}

                    <Field
                      icon={EmailOutlined} label="Correo electrónico" type="email"
                      value={login.email} onChange={setL("email")}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <Field
                      icon={LockOutlined} label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      value={login.password} onChange={setL("password")}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      end={
                        <IconButton edge="end" sx={{ color: PINK }} onClick={() => setShowPassword((s) => !s)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      }
                    />

                    <Stack spacing={1.5} mt={3}>
                      <Button
                        fullWidth size="large" variant="contained" sx={primaryBtnSx}
                        onClick={handleLogin}
                        disabled={!loginValid || isLoading}
                        startIcon={!isLoading && <LoginOutlined />}
                      >
                        {isLoading ? Spinner : "Acceder"}
                      </Button>

                      <Divider sx={{ my: 1, "&::before, &::after": { borderColor: PINK_SOFT } }}>
                        <Chip
                          label="¿Necesitas ayuda?" size="small"
                          sx={{ bgcolor: "#FFF5FA", color: PINK_DARK, fontWeight: 600, border: `1px solid ${PINK_SOFT}` }}
                        />
                      </Divider>

                      <Button fullWidth variant="text" sx={textBtnSx} onClick={() => setIsForgot(true)}>
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </Stack>
                  </>
                )}
              </Box>
            </Fade>

            <Typography variant="caption" align="center" display="block" sx={{ mt: 3, color: "text.secondary", opacity: 0.75 }}>
              © {new Date().getFullYear()} Floreciendo Juntas. Todos los derechos reservados.
            </Typography>
          </Card>
        </Grow>
      </Box>
    </Box>
  );
}

export default withRouter(Login);