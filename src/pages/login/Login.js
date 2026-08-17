import React, { useState, useContext, useEffect } from "react";
import {
  Grid,
  CircularProgress,
  Grow,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Box,
  useTheme,
  useMediaQuery,
  Fade,
  Stack,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  LoginOutlined,
  VpnKeyOutlined,
  ArrowBackOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { withRouter } from "react-router-dom";
import { Button } from "../../components/Wrappers";
import AuthContext from "../../context/AuthContext/AuthContext";
import ResetPasswordContext from "../../context/ResetPasswordContext/ResetPasswordContext";
import logo from "../../LOGOTIPO FLORECIENDO JUNTAS negro.png";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const getGreeting = () => {
  const d = new Date();
  if (d.getHours() >= 4 && d.getHours() <= 12) return " Buenos días";
  if (d.getHours() >= 13 && d.getHours() <= 16) return " Buenas tardes";
  return " Buenas noches";
};

const getGreetingMessage = () => {
  return "Administra cada detalle para seguir Floreciendo";
};

function Login(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { iniciarSesion, autenticado } = useContext(AuthContext);
  const { resetPassword } = useContext(ResetPasswordContext);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const isLoginFormValid = () => loginValue.trim().length && passwordValue.length;

  const handleLogin = async () => {
    if (!isLoginFormValid()) return;
    if (!executeRecaptcha) return;
    setLoginError("");
    setIsLoading(true);
    try {
      const token = await executeRecaptcha('login');
      await iniciarSesion({ email: loginValue, password: passwordValue, captchaToken: token });
    } catch (error) {
      setLoginError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail || !newPassword || !confirmPassword) {
      Swal.fire("Error", "Completa todos los campos", "error");
      return;
    }
    if (!emailRegex.test(forgotEmail)) {
      Swal.fire("Error", "Por favor ingresa un email válido", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }
    if (newPassword.length < 8) {
      Swal.fire("Error", "La contraseña debe tener al menos 8 caracteres", "error");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email: forgotEmail, password: newPassword, passwordConfirmation: confirmPassword });
      setResetSuccess(true);
      Swal.fire({
        icon: "success",
        title: "¡Contraseña restablecida!",
        text: "Ahora puedes iniciar sesión con tu nueva contraseña.",
        timer: 3000,
        showConfirmButton: false,
      });
      setTimeout(() => {
        setIsForgot(false);
        setForgotEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setResetSuccess(false);
      }, 1500);
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al restablecer tu contraseña", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loginOnEnterKey = (event) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff5c93 0%, #f9cada 100%)",
      }}
    >
      {/* Panel Izquierdo - Decorativo */}
      {!isMobile && (
        <Grid
          item
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 6,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: 0,
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -50,
              left: -50,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
            }}
          />
          <Box sx={{ textAlign: "center", zIndex: 1 }}>
            <img
              src={logo}
              alt="logo"
              style={{
                width: 500,
                marginBottom: 30,
                // filter: "brightness(0) invert(1)",
              }}
            />
            <Typography
              variant="h3"
              fontWeight="700"
              gutterBottom
              sx={{ textShadow: "0 2px 20px rgba(0,0,0,0.1)" }}
            >
              ¡Bienvenido!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.95,
                maxWidth: 400,
                mx: "auto",
                textShadow: "0 2px 10px rgba(0,0,0,0.1)"
              }}
            >
              {getGreetingMessage()}
            </Typography>
            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {/* {["🌸 Bienestar", "💖 Apoyo", "✨ Crecimiento"].map((text, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {text}
                </Paper>
              ))} */}
            </Box>
          </Box>
        </Grid>
      )}

      {/* Panel Derecho - Formulario */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <Grow in timeout={800}>
          <Card
            sx={{
              width: { xs: "100%", sm: 420 },
              p: { xs: 2, sm: 4 },
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(255, 92, 147, 0.25)",
              backdropFilter: "blur(20px)",
              backgroundColor: "rgba(255,255,255,0.95)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 30px 80px rgba(255, 92, 147, 0.3)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              {/* Logo mobile */}
              {isMobile && (
                <Box display="flex" justifyContent="center" mb={3}>
                  <img src={logo} alt="logo" style={{ width: 200 }} />
                </Box>
              )}

              <Box mb={3}>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  sx={{
                    background: "linear-gradient(135deg, #ff5c93 0%, #d6336c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {isForgot ? "Recuperar acceso" : "Iniciar sesión"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {isForgot
                    ? "Ingresa tu email y crea una nueva contraseña"
                    : `${getGreeting()} 👋`}
                </Typography>
              </Box>

              {isForgot ? (
                <Fade in timeout={300}>
                  <Box>
                    {resetSuccess && (
                      <Alert
                        icon={<CheckCircleOutlineOutlined />}
                        severity="success"
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          backgroundColor: "#fce4ec",
                          color: "#c62828",
                        }}
                      >
                        ¡Contraseña actualizada exitosamente!
                      </Alert>
                    )}
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Correo electrónico"
                      variant="outlined"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: "#ff5c93" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "#ff5c93",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff5c93",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ff5c93",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Nueva contraseña"
                      variant="outlined"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: "#ff5c93" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "#ff5c93",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff5c93",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ff5c93",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Confirmar contraseña"
                      variant="outlined"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: "#ff5c93" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "#ff5c93",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff5c93",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ff5c93",
                        },
                      }}
                    />

                    <Stack spacing={1.5} sx={{ mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleResetPassword}
                        disabled={
                          !forgotEmail ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword !== confirmPassword ||
                          isLoading
                        }
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #ff5c93 0%, #d6336c 100%)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #e84c83 0%, #c6286c 100%)",
                          },
                          "&.Mui-disabled": {
                            background: "#f5c6d0",
                          },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} sx={{ color: "white" }} />
                        ) : (
                          <>
                            <VpnKeyOutlined sx={{ mr: 1 }} />
                            Restablecer contraseña
                          </>
                        )}
                      </Button>
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => setIsForgot(false)}
                        startIcon={<ArrowBackOutlined />}
                        sx={{
                          color: "#d6336c",
                          "&:hover": {
                            background: "rgba(214, 51, 108, 0.08)",
                          },
                        }}
                      >
                        Volver al inicio de sesión
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              ) : (
                <Fade in timeout={300}>
                  <Box>
                    {loginError && (
                      <Alert
                        severity="error"
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          backgroundColor: "#fce4ec",
                          color: "#c62828",
                        }}
                      >
                        {loginError}
                      </Alert>
                    )}
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Correo electrónico"
                      variant="outlined"
                      type="email"
                      value={loginValue}
                      onChange={(e) => setLoginValue(e.target.value)}
                      onKeyDown={loginOnEnterKey}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: "#ff5c93" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover fieldset": {
                            borderColor: "#ff5c93",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff5c93",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ff5c93",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Contraseña"
                      variant="outlined"
                      type={showPassword ? "text" : "password"}
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      onKeyDown={loginOnEnterKey}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: "#ff5c93" }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: "#ff5c93" }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          transition: "all 0.3s",
                          "&:hover fieldset": {
                            borderColor: "#ff5c93",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#ff5c93",
                            borderWidth: 2,
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#ff5c93",
                        },
                      }}
                    />

                    <Stack spacing={1.5} sx={{ mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleLogin}
                        disabled={!isLoginFormValid() || isLoading}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          color: "#fff !important",
                          background: "linear-gradient(135deg, #ff5c93 0%, #d6336c 100%)",

                          "&:hover": {
                            background: "linear-gradient(135deg, #e84c83 0%, #c6286c 100%)",
                          },

                          "&.Mui-disabled": {
                            background: "#f5c6d0",
                            color: "#fff !important",
                          },

                          "& .MuiButton-startIcon, & svg": {
                            color: "#fff !important",
                          },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} sx={{ color: "#fff" }} />
                        ) : (
                          <>
                            <LoginOutlined sx={{ mr: 1, color: "#fff !important" }} />
                            <span style={{ color: "#fff" }}>Acceder</span>
                          </>
                        )}
                      </Button>

                      <Divider sx={{
                        my: 1,
                        "&::before, &::after": {
                          borderColor: "#f5c6d0",
                        },
                      }}>
                        <Typography color="#d6336c" variant="caption">
                          ¿Necesitas ayuda?
                        </Typography>
                      </Divider>

                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => setIsForgot(true)}
                        sx={{
                          color: "#d6336c",
                          "&:hover": {
                            background: "rgba(214, 51, 108, 0.08)",
                          },
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              )}
            </CardContent>

            <Typography
              variant="caption"
              align="center"
              display="block"
              sx={{
                mt: 2,
                color: "text.secondary",
                opacity: 0.7,
              }}
            >
              © {new Date().getFullYear()} Floreciendo Juntas. Todos los derechos reservados.
            </Typography>
          </Card>
        </Grow>
      </Grid>
    </Grid>
  );
}

export default withRouter(Login);