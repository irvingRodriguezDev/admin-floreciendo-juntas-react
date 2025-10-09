import React, { useState, useContext, useEffect } from "react";
import {
  Grid,
  CircularProgress,
  Grow,
  TextField as Input,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { withRouter } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Swal from "sweetalert2";

// styles
import useStyles from "./styles";

// logo
import logo from "./logo.svg";

// components
import { Button } from "../../components/Wrappers";

// context
import AuthContext from "../../context/AuthContext/AuthContext";
import ResetPasswordContext from "../../context/ResetPasswordContext/ResetPasswordContext";

const getGreeting = () => {
  const d = new Date();
  if (d.getHours() >= 4 && d.getHours() <= 12) return "Buen día";
  if (d.getHours() >= 13 && d.getHours() <= 16) return "Buen día";
  return "Buenas noches";
};

function Login(props) {
  const classes = useStyles();

  // context
  const { iniciarSesion, autenticado, enviarEmailRecuperacion } = useContext(AuthContext);

  // estados locales
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  // validar formulario
  const isLoginFormValid = () => loginValue.length !== 0 && passwordValue.length !== 0;

  // redirigir después de login
  useEffect(() => {
    if (autenticado) {
      props.history.push("/app/profile"); // cambia a la ruta que necesites
    }
  }, [autenticado, props.history]);

  // login
  const handleLogin = async () => {
    if (!isLoginFormValid()) return;

    setIsLoading(true);
    await iniciarSesion({ email: loginValue, password: passwordValue });
    setIsLoading(false);
  };

  // recuperación de contraseña
  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setIsLoading(true);
    await enviarEmailRecuperacion(forgotEmail);
    setIsLoading(false);
  };

  const loginOnEnterKey = (event) => {
    if (event.key === "Enter") handleLogin();
  };

 const { resetPassword } = useContext(ResetPasswordContext);


  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!forgotEmail || !newPassword || !confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Completa todos los campos",
    });
    return;
  }

  if (!emailRegex.test(forgotEmail)) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor ingresa un email válido",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Las contraseñas no coinciden",
    });
    return;
  }

  setIsLoading(true);

  await resetPassword({
    email: forgotEmail,
    password: newPassword,
    passwordConfirmation: confirmPassword,
  });

  setIsLoading(false);
  setIsForgot(false);
  setForgotEmail("");
  setNewPassword("");
  setConfirmPassword("");
 };



  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img src={logo} alt="logo" className={classes.logotypeImage} />
        <Typography className={classes.logotypeText}>React Material Admin</Typography>
      </div>

      <div className={classes.formContainer}>
        <div className={classes.form}>
          {isForgot ? (
  <div>
    <Input
      id="forgotEmail"
      InputProps={{
        classes: {
          underline: classes.InputUnderline,
          input: classes.Input,
        },
      }}
      value={forgotEmail}
      onChange={(e) => setForgotEmail(e.target.value)}
      margin="normal"
      placeholder="Email"
      type="email"
      fullWidth
    />

    <Input
      id="newPassword"
      InputProps={{
        classes: {
          underline: classes.InputUnderline,
          input: classes.Input,
        },
      }}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      margin="normal"
      placeholder="Nueva contraseña"
      type="password"
      fullWidth
    />

    <Input
      id="confirmPassword"
      InputProps={{
        classes: {
          underline: classes.InputUnderline,
          input: classes.Input,
        },
      }}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      margin="normal"
      placeholder="Confirmar contraseña"
      type="password"
      fullWidth
    />

    <div className={classes.formButtons}>
      {isLoading ? (
        <CircularProgress size={26} className={classes.loginLoader} />
      ) : (
        <Button
          disabled={
            !forgotEmail || !newPassword || !confirmPassword || newPassword !== confirmPassword
          }
          onClick={handleResetPassword}
          variant="contained"
          color="secondary"
          size="large"
        >
          Restablecer contraseña
        </Button>
      )}
      <Button
        color="secondary"
        size="large"
        onClick={() => setIsForgot(false)}
        className={classes.forgetButton}
      >
        Volver al inicio de sesión
      </Button>
    </div>
  </div>
          ) : (
            <>
              <Typography variant="h1" className={classes.greeting}>
                {getGreeting()}
              </Typography>

              <Input
                id="email"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                margin="normal"
                placeholder="Email"
                type="email"
                fullWidth
                onKeyDown={loginOnEnterKey}
                InputProps={{
                  classes: { underline: classes.InputUnderline, input: classes.Input },
                }}
              />

              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                margin="normal"
                placeholder="Contraseña"
                fullWidth
                onKeyDown={loginOnEnterKey}
                InputProps={{
                  classes: { underline: classes.InputUnderline, input: classes.Input },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <div className={classes.formButtons}>
                {isLoading ? (
                  <CircularProgress size={26} className={classes.loginLoader} />
                ) : (
                  <Button
                    disabled={!isLoginFormValid()}
                    onClick={handleLogin}
                    variant="contained"
                    color="secondary"
                    size="large"
                  >
                    Acceder
                  </Button>
                )}
                <Button
                  color="secondary"
                  size="large"
                  onClick={() => setIsForgot(true)}
                  className={classes.forgetButton}
                >
                  Has olvidado tu contraseña?
                </Button>
              </div>
            </>
          )}
        </div>

        <Typography color="secondary" className={classes.copyright}>
          2014-{new Date().getFullYear()}{" "}
          <a
            style={{ textDecoration: "none", color: "inherit" }}
            href="https://flatlogic.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Flatlogic
          </a>
          , LLC. All rights reserved.
        </Typography>
      </div>
    </Grid>
  );
}

export default withRouter(Login);
