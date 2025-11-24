import React, { useReducer } from "react";
import EventReducer from "./EventReducer";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../config/Service";
import Swal from "sweetalert2";
import {
    EVENTOS_CARGANDO,
    EVENTOS_NO_CARGANDO,
    OBTENER_EVENTOS,
    CREAR_EVENTO,
    ACTUALIZAR_EVENTO,
    ELIMINAR_EVENTO,
    OBTENER_EVENTO,
    LIMPIAR_EVENTO_ACTUAL,
    EVENTO_ERROR,
    OBTENER_TOPSALES, // 👈 AGREGA ESTA LÍNEA
    LIMPIAR_ERROR_EVENTO,
    RESET_SUCCESS_EVENTO,
} from "../../types";
import EventContext from "./EventContext";

const EventState = (props) => {
    const initialState = {
        eventos: [],
        eventoActual: null,
        boletosMasVendidos: [],
        error: null,
        success: false,
        cargando: false,
    };

    const [state, dispatch] = useReducer(EventReducer, initialState);

    // 🔹 Obtener todos los eventos (sin cargando)
    const obtenerEventos = async () => {
    try {
        const res = await MethodGet("/events");
        dispatch({
            type: OBTENER_EVENTOS,
            payload: Array.isArray(res.data.events) ? res.data.events : [],
        });
    } catch (error) {
        dispatch({
            type: EVENTO_ERROR,
            payload: error.response?.data?.message || "Error al obtener eventos",
        });
    }
};


    // 🔹 Crear nuevo evento (recibe FormData directamente)
    const crearEvento = async (formData) => {
        try {
            const res = await MethodPost("/events", formData);

            dispatch({
                type: CREAR_EVENTO,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: EVENTO_ERROR,
                payload: error.response?.data?.message || "Error al crear evento",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al crear evento",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Actualizar evento existente (recibe FormData directamente)
    const actualizarEvento = async (id, formData) => {
        try {
            const res = await MethodPut(`/events/${id}`, formData);

            dispatch({
                type: ACTUALIZAR_EVENTO,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: EVENTO_ERROR,
                payload: error.response?.data?.message || "Error al actualizar evento",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al actualizar evento",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Obtener evento por ID
    const obtenerEventoPorId = async (id) => {
        try {
            const res = await MethodGet(`/events/${id}`);
            dispatch({
                type: OBTENER_EVENTO,
                payload: res.data, // asumimos que res.data contiene el evento
            });
            return res.data;
        } catch (error) {
            dispatch({
                type: EVENTO_ERROR,
                payload: error.response?.data?.message || "Error al obtener evento",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener evento",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Obtener boletos más vendidos
    const obtenerBoletosMasVendidos = async () => {
        try {
            const res = await MethodGet("/events/topsales");

            // ✅ revisamos si viene el array correcto
            // console.log("Respuesta de topsales:", res.data);

            // console.log("🪄 Dispatchando tipo:", OBTENER_TOPSALES);
            dispatch({ type: OBTENER_TOPSALES, payload: res.data.data });

        } catch (error) {
            console.error("Error al obtener boletos más vendidos:", error);

            dispatch({
                type: EVENTO_ERROR,
                payload: error.response?.data?.message || "Error al obtener boletos más vendidos",
            });
        }
    };









    // 🔹 Eliminar evento
    const eliminarEvento = async (id) => {
        try {
            await MethodDelete(`/events/${id}`);
            dispatch({ type: ELIMINAR_EVENTO, payload: id });

            Swal.fire({
                title: "¡Éxito!",
                text: "Evento eliminado correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            dispatch({
                type: EVENTO_ERROR,
                payload: error.response?.data?.message || "Error al eliminar evento",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al eliminar evento",
                icon: "error",
            });
        }
    };

    return (
        <EventContext.Provider
            value={{
                eventos: state.eventos,
                eventoActual: state.eventoActual,
                boletosMasVendidos: state.boletosMasVendidos,
                error: state.error,
                success: state.success,
                cargando: state.cargando,
                obtenerEventos,
                crearEvento,
                actualizarEvento,
                obtenerEventoPorId,
                obtenerBoletosMasVendidos,
                eliminarEvento,
            }}
        >
            {props.children}
        </EventContext.Provider>
    );
};

export default EventState;
