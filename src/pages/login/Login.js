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
  CardActions,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; 
import Swal from "sweetalert2";
import { withRouter } from "react-router-dom";
import { Button } from "../../components/Wrappers";
import AuthContext from "../../context/AuthContext/AuthContext";
import ResetPasswordContext from "../../context/ResetPasswordContext/ResetPasswordContext";
import logo from "../../LOGOTIPO FLORECIENDO JUNTAS negro.png";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const getGreeting = () => {
  const d = new Date();
  if (d.getHours() >= 4 && d.getHours() <= 12) return "Buen día";
  if (d.getHours() >= 13 && d.getHours() <= 16) return "Buenas tardes";
  return "Buenas noches";
};

function Login(props) {
  const { iniciarSesion, autenticado, enviarEmailRecuperacion } = useContext(AuthContext);
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

  const isLoginFormValid = () => loginValue.length && passwordValue.length;

  // useEffect(() => {
  //   if (autenticado) props.history.push("/profile");
  // }, [autenticado, props.history]);

  const handleLogin = async () => {
    if (!isLoginFormValid()) return;
    if (!executeRecaptcha) return;
    setIsLoading(true);
    const token = await executeRecaptcha('login');
    await iniciarSesion({ email: loginValue, password: passwordValue, captchaToken: token });
    setIsLoading(false);
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

    setIsLoading(true);
    await resetPassword({ email: forgotEmail, password: newPassword, passwordConfirmation: confirmPassword });
    setIsLoading(false);
    setIsForgot(false);
    setForgotEmail("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const loginOnEnterKey = (event) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff5c93 0%, #f9cada 100%)",
      }}
    >
      <Grow in timeout={600}>
        <Card
          sx={{
            width: { xs: "90%", sm: 400 },
            p: 3,
            borderRadius: 3,
            boxShadow: 6,
            backgroundColor: "white",
          }}
        >
          <CardContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <img src={logo} alt="logo" style={{ width: 290, marginBottom: 10 }} />
              <Typography variant="h5" fontWeight="600" gutterBottom>
                {isForgot ? "Recuperar contraseña" : "Iniciar sesión"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getGreeting()}
              </Typography>
            </Box>

            {isForgot ? (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Correo electrónico"
                  variant="outlined"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nueva contraseña"
                  variant="outlined"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirmar contraseña"
                  variant="outlined"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <CardActions sx={{ mt: 2, flexDirection: "column", gap: 1 }}>
                  {isLoading ? (
                    <CircularProgress size={26} />
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={handleResetPassword}
                      disabled={
                        !forgotEmail || !newPassword || !confirmPassword || newPassword !== confirmPassword
                      }
                    >
                      Restablecer contraseña
                    </Button>
                  )}
                  <Button
                    fullWidth
                    color="secondary"
                    variant="text"
                    onClick={() => setIsForgot(false)}
                  >
                    Volver al inicio de sesión
                  </Button>
                </CardActions>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Correo electrónico"
                  variant="outlined"
                  type="email"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  onKeyDown={loginOnEnterKey}
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <CardActions sx={{ mt: 2, flexDirection: "column", gap: 1 }}>
                  {isLoading ? (
                    <CircularProgress size={26} />
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={handleLogin}
                      disabled={!isLoginFormValid()}
                    >
                      Acceder
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="text"
                    color="secondary"
                    onClick={() => setIsForgot(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </CardActions>
              </>
            )}
          </CardContent>

          <Typography variant="caption" align="center" display="block" sx={{ mt: 2, color: "text.secondary" }}>
            © {new Date().getFullYear()} Floreciendo Juntas. Todos los derechos reservados.
          </Typography>
        </Card>
      </Grow>
    </Grid>
  );
}

export default withRouter(Login);
