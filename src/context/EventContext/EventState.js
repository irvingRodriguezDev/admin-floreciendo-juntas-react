import React, { useReducer } from "react";
import EventReducer from "./EventReducer";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../config/Service";
import Swal from "sweetalert2";
import { types } from "../../types";
import EventContext from "./EventContext";

const EventState = (props) => {
    const initialState = {
        eventos: [],
        eventoActual: null,
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
            type: types.OBTENER_EVENTOS,
            payload: Array.isArray(res.data.events) ? res.data.events : [],
        });
    } catch (error) {
        dispatch({
            type: types.EVENTO_ERROR,
            payload: error.response?.data?.message || "Error al obtener eventos",
        });
    }
};


    // 🔹 Crear nuevo evento (recibe FormData directamente)
    const crearEvento = async (formData) => {
        try {
            const res = await MethodPost("/events", formData);

            dispatch({
                type: types.CREAR_EVENTO,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: types.EVENTO_ERROR,
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
                type: types.ACTUALIZAR_EVENTO,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: types.EVENTO_ERROR,
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
                type: types.OBTENER_EVENTO,
                payload: res.data, // asumimos que res.data contiene el evento
            });
            return res.data;
        } catch (error) {
            dispatch({
                type: types.EVENTO_ERROR,
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



    // 🔹 Eliminar evento
    const eliminarEvento = async (id) => {
        try {
            await MethodDelete(`/events/${id}`);
            dispatch({ type: types.ELIMINAR_EVENTO, payload: id });

            Swal.fire({
                title: "¡Éxito!",
                text: "Evento eliminado correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            dispatch({
                type: types.EVENTO_ERROR,
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
                error: state.error,
                success: state.success,
                cargando: state.cargando,
                obtenerEventos,
                crearEvento,
                actualizarEvento,
                obtenerEventoPorId,
                eliminarEvento,
            }}
        >
            {props.children}
        </EventContext.Provider>
    );
};

export default EventState;
