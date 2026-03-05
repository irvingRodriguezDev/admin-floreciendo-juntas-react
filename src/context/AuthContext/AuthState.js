import React, { useReducer } from "react";
import AuthContext from "./AuthContext";
import AuthReducer from "./AuthReducer";
import MethodGet, { MethodPost, MethodPut } from "../../config/Service";
// import headerConfig from "../../config/imageHeaders";
import Swal from "sweetalert2";

/**Importar componente token headers */
import tokenAuth from "../../config/TokenAuth";

import { SHOW_ERRORS_API, types } from "../../types";

const AuthState = (props) => {
  //Agregar state inicial
  const initialState = {
    token: localStorage.getItem("token"),
    autenticado: false,
    usuario: {},
    cargando: true,
    success: false,
    // directions: [],
  };

  const [state, dispatch] = useReducer(AuthReducer, initialState);
  //funciones
  //Retorna el usuario autenticado
  const usuarioAutenticado = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      tokenAuth(token);
    }

    MethodGet("/auth/me")
      .then(({ data }) => {
        dispatch({
          type: types.OBTENER_USUARIO,
          payload: data,
        });

        // Guardar roleId y usuario en localStorage
        if (data.user) {
          localStorage.setItem("roleId", data.user.roleId); // Actualiza roleId
          localStorage.setItem("usuario", JSON.stringify(data.user));
        }
      })
      .catch((error) => {
        dispatch({
          type: types.LOGIN_ERROR,
        });
        localStorage.removeItem("roleId");
        localStorage.removeItem("usuario");
      });
  };



  //cuando el usuario inicia sesion
  const iniciarSesion = async (datos) => {
    try {
      const res = await MethodPost("/auth/login", { ...datos, captchaToken: datos.captchaToken });

      const roleId = res.data.user?.roleId;

      // Solo permitir acceso a roles 1 y 5
      if (roleId !== 1 && roleId !== 5 && roleId !== 3) {
        Swal.fire(
          "Acceso denegado",
          "No tienes permisos para ingresar",
          "error"
        );

        // Limpieza total
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("roleId");

        return { unauthorized: true };
      }

      // Guardar token porque el rol sí es válido
      dispatch({
        type: types.LOGIN_EXITOSO,
        payload: res.data,
      });

      tokenAuth(res.data.token);

      // Obtener usuario autenticado y guardar roleId en localStorage
      await usuarioAutenticado();

      return res.data;

    } catch (error) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Email o contraseña incorrectos",
        timer: 2500,
        showConfirmButton: false,
      });
      dispatch({
        type: SHOW_ERRORS_API,
      });
    }
  };




  //cuando el usuario Ccambia de contraseña
  const ChangePasswordUser = (datos) => {
    let url = "/admin/auth/changePassword";
    MethodPost(url, datos)
      .then((res) => {
        Swal.fire({
          title: "Contraseña!",
          text: "Modificada Correctamente",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
        dispatch({
          type: types.USER_CHANGEPASSWORD,
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: error.response.data.message,
          icon: "error",
        });
        dispatch({
          type: SHOW_ERRORS_API,
        });
      });
  };

  //Cierrra sesion del usuario
  const cerrarSesion = () => {
    dispatch({
      type: types.CERRAR_SESION,
    });

    // 🔹 Limpiar localStorage
    localStorage.removeItem("roleId");
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        autenticado: state.autenticado,
        usuario: state.usuario,
        success: state.success,
        cargando: state.cargando,
        directions: state.directions,
        iniciarSesion,
        usuarioAutenticado,
        cerrarSesion,
        ChangePasswordUser,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
