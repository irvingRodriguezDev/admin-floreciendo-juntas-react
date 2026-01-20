import React, { useReducer } from "react";
import Swal from "sweetalert2";
import SystemContext from "./SystemContext";
import SystemReducer from "./SystemReducer";
import MethodGet, { MethodPost, MethodPut, MethodDelete } from "../../config/Service";
import clienteAxios from "../../config/Axios";
import {
  GET_SYSTEMS,
  ADD_SYSTEM,
  UPDATE_SYSTEM,
  DELETE_SYSTEM,
  SYSTEM_ERROR,
} from "../../types";
import imageHeaders from "../../config/imageHeader";

const SystemState = (props) => {
  const initialState = {
    systems: [],
    loading: true,
    error: null,
  };

  const [state, dispatch] = useReducer(SystemReducer, initialState);

  // Obtener todos los sistemas
  const getSystems = async () => {
    try {
      const res = await MethodGet("/systems");
      dispatch({
        type: GET_SYSTEMS,
        payload: res.data,
      });
    } catch (error) {
      dispatch({
        type: SYSTEM_ERROR,
        payload: error.response?.data?.message || "Error al cargar sistemas",
      });
    }
  };

  const addSystem = async (data, setProgress) => {
    await clienteAxios.post("/systems", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (e) => {
        if (!e.total) return;

        const percent = Math.round((e.loaded * 100) / e.total);
        setProgress(percent);

        const bar = document.getElementById("swal-progress-bar");
        const text = document.getElementById("swal-progress-text");

        if (bar) bar.style.width = `${percent}%`;
        if (text) text.textContent = `${percent}%`;
      },
    });
  };


  const updateSystem = async (id, data, setProgress) => {
    await clienteAxios.put(`/systems/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (e) => {
        if (!e.total) return;

        const percent = Math.round((e.loaded * 100) / e.total);
        setProgress(percent);

        const bar = document.getElementById("swal-progress-bar");
        const text = document.getElementById("swal-progress-text");

        if (bar) bar.style.width = `${percent}%`;
        if (text) text.textContent = `${percent}%`;
      },
    });
  };




  // Crear un nuevo sistema
  // const addSystem = async (data) => {
  //   try {
  //     const res = await MethodPost("/systems", data);
  //     dispatch({
  //       type: ADD_SYSTEM,
  //       payload: res.data,
  //     });
  //     Swal.fire({
  //       title: "Sistema agregado",
  //       text: "El sistema se creó correctamente.",
  //       icon: "success",
  //       timer: 1500,
  //       showConfirmButton: false,
  //     });
  //   } catch (error) {
  //     Swal.fire({
  //       title: "Error",
  //       text: error.response?.data?.message || "Error al crear el sistema",
  //       icon: "error",
  //     });
  //     dispatch({
  //       type: SYSTEM_ERROR,
  //       payload: error.response?.data?.message,
  //     });
  //   }
  // };

  // Actualizar sistema
  // const updateSystem = async (id, datos) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("name", datos.name);
  //     formData.append("description", datos.description);

  //     if (datos.icon instanceof File) {
  //       formData.append("icon", datos.icon);
  //     }

  //     // Hacemos la petición y obtenemos los datos actualizados
  //     const { data } = await MethodPut(`/systems/${id}`, formData);

  //     // Actualizamos el contexto con el sistema modificado
  //     dispatch({
  //       type: UPDATE_SYSTEM,
  //       payload: data.system,
  //     });

  //     Swal.fire({
  //       title: "Éxito",
  //       text: "Sistema actualizado correctamente",
  //       icon: "success",
  //       timer: 1500,
  //       showConfirmButton: false,
  //     });
  //   } catch (error) {
  //     Swal.fire({
  //       title: "Error",
  //       text: error.response?.data?.message || "No se pudo actualizar el sistema",
  //       icon: "error",
  //     });
  //   }
  // };

  // Obtener un sistema por ID
  const obtenerSystemPorId = async (id) => {
    try {
      const { data } = await MethodGet(`/systems/${id}`);
      return data;
    } catch (error) {
      console.error("Error al obtener sistema:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo cargar el sistema",
        icon: "error",
      });
      throw error;
    }
  };




  // Eliminar sistema
  const deleteSystem = async (id) => {
    try {
      await MethodDelete(`/systems/${id}`);
      dispatch({
        type: DELETE_SYSTEM,
        payload: id,
      });
      Swal.fire({
        title: "Eliminado",
        text: "Sistema eliminado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Error al eliminar el sistema",
        icon: "error",
      });
      dispatch({
        type: SYSTEM_ERROR,
        payload: error.response?.data?.message,
      });
    }
  };

  return (
    <SystemContext.Provider
      value={{
        systems: state.systems,
        loading: state.loading,
        error: state.error,
        getSystems,
        addSystem,
        updateSystem,
        obtenerSystemPorId,
        deleteSystem,
      }}
    >
      {props.children}
    </SystemContext.Provider>
  );
};

export default SystemState;
