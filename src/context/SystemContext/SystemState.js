import React, { useReducer } from "react";
import Swal from "sweetalert2";
import SystemContext from "./SystemContext";
import SystemReducer from "./SystemReducer";
import MethodGet, { MethodPost, MethodPut, MethodDelete } from "../../config/Service";
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

  // 📦 Obtener todos los sistemas
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

  // ➕ Crear un nuevo sistema
  const addSystem = async (data) => {
    try {
      const res = await MethodPost("/systems", data);
      dispatch({
        type: ADD_SYSTEM,
        payload: res.data,
      });
      Swal.fire({
        title: "Sistema agregado",
        text: "El sistema se creó correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Error al crear el sistema",
        icon: "error",
      });
      dispatch({
        type: SYSTEM_ERROR,
        payload: error.response?.data?.message,
      });
    }
  };

  // ✏️ Actualizar sistema
  const updateSystem = async (id, data) => {
    try {
      const res = await MethodPut(`/systems/${id}`, data, imageHeaders);
      dispatch({
        type: UPDATE_SYSTEM,
        payload: res.data,
      });
      Swal.fire({
        title: "Actualizado",
        text: "Sistema actualizado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Error al actualizar el sistema",
        icon: "error",
      });
      dispatch({
        type: SYSTEM_ERROR,
        payload: error.response?.data?.message,
      });
    }
  };


  // 🗑️ Eliminar sistema
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
        deleteSystem,
      }}
    >
      {props.children}
    </SystemContext.Provider>
  );
};

export default SystemState;
