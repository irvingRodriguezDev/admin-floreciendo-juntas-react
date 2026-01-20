// context/LiveContext/LiveState.js
import React, { useReducer } from "react";
import LiveReducer from "./LiveReducer";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../config/Service";
import Swal from "sweetalert2";
import {
    LIVES_CARGANDO,
    LIVES_NO_CARGANDO,
    OBTENER_LIVES,
    CREAR_LIVE,
    ACTUALIZAR_LIVE,
    ELIMINAR_LIVE,
    OBTENER_LIVE,
    LIMPIAR_LIVE_ACTUAL,
    LIVE_ERROR,
    LIMPIAR_ERROR_LIVE,
    RESET_SUCCESS_LIVE,
} from "../../types";
import LiveContext from "./LiveContext";

const LiveState = (props) => {
    const initialState = {
        lives: [],
        liveActual: null,
        error: null,
        success: false,
        cargando: false,
    };

    const [state, dispatch] = useReducer(LiveReducer, initialState);

    // 🔹 Establecer estado de carga
    const setCargando = () => {
        dispatch({ type: LIVES_CARGANDO });
    };

    const setNoCargando = () => {
        dispatch({ type: LIVES_NO_CARGANDO });
    };

    // 🔹 Obtener todos los lives
    const obtenerLives = async () => {
        setCargando();
        try {
            const res = await MethodGet("/lives");
            dispatch({
                type: OBTENER_LIVES,
                payload: Array.isArray(res.data) ? res.data : [],
            });
        } catch (error) {
            dispatch({
                type: LIVE_ERROR,
                payload: error.response?.data?.message || "Error al obtener lives",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener lives",
                icon: "error",
            });
        } finally {
            setNoCargando();
        }
    };

    // 🔹 Crear nuevo live (recibe FormData)
    const crearLive = async (formData) => {
        setCargando();
        try {
            const res = await MethodPost("/lives", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            dispatch({
                type: CREAR_LIVE,
                payload: res.data.data,
            });
            return true;
        } catch (error) {
            dispatch({
                type: LIVE_ERROR,
                payload: error.response?.data?.message || "Error al crear live",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al crear live",
                icon: "error",
            });

            return false;
        } finally {
            setNoCargando();
        }
    };

    // 🔹 Actualizar live existente (recibe FormData)
    const actualizarLive = async (id, formData) => {
        setCargando();
        try {
            const res = await MethodPut(`/lives/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
           // console.log(res.data);

            dispatch({
                type: ACTUALIZAR_LIVE,
                payload: res.data.live,
            });

            return true;
        } catch (error) {
            dispatch({
                type: LIVE_ERROR,
                payload: error.response?.data?.message || "Error al actualizar live",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al actualizar live",
                icon: "error",
            });

            return false;
        } finally {
            setNoCargando();
        }
    };

    // 🔹 Obtener live por ID
    const obtenerLivePorId = async (id) => {
        setCargando();
        try {
            const res = await MethodGet(`/lives/${id}`);

            dispatch({
                type: OBTENER_LIVE,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: LIVE_ERROR,
                payload: error.response?.data?.message || "Error al obtener live",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener live",
                icon: "error",
            });

            return null;
        } finally {
            setNoCargando();
        }
    };

    // 🔹 Eliminar live
    const eliminarLive = async (id) => {
        setCargando();
        try {
            await MethodDelete(`/lives/${id}`);

            dispatch({ type: ELIMINAR_LIVE, payload: id });

            Swal.fire({
                title: "¡Éxito!",
                text: "Live eliminado correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            return true;
        } catch (error) {
            dispatch({
                type: LIVE_ERROR,
                payload: error.response?.data?.message || "Error al eliminar live",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al eliminar live",
                icon: "error",
            });

            return false;
        } finally {
            setNoCargando();
        }
    };

    // 🔹 Limpiar live actual
    const limpiarLiveActual = () => {
        dispatch({ type: LIMPIAR_LIVE_ACTUAL });
    };

    // 🔹 Limpiar errores
    const limpiarError = () => {
        dispatch({ type: LIMPIAR_ERROR_LIVE });
    };

    // 🔹 Resetear success
    const resetSuccess = () => {
        dispatch({ type: RESET_SUCCESS_LIVE });
    };

    return (
        <LiveContext.Provider
            value={{
                lives: state.lives,
                liveActual: state.liveActual,
                error: state.error,
                success: state.success,
                cargando: state.cargando,
                obtenerLives,
                crearLive,
                actualizarLive,
                obtenerLivePorId,
                eliminarLive,
                limpiarLiveActual,
                limpiarError,
                resetSuccess,
                setCargando,
                setNoCargando,
            }}
        >
            {props.children}
        </LiveContext.Provider>
    );
};

export default LiveState;