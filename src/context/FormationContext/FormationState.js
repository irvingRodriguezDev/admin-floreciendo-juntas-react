import React, { useReducer } from "react";
import FormationContext from "./FormationContext";
import FormationReducer from "./FormationReducer";
import MethodGet, { MethodDelete, MethodPost, MethodPut } from "../../config/Service";
import Swal from "sweetalert2";
import {
    GET_FORMATIONS,
    ADD_FORMATION,
    UPDATE_FORMATION,
    DELETE_FORMATION,
    FORMATION_ERROR,
    SET_LOADING,
    GET_PENDING_DELIVERIES,
    REVIEW_DELIVERY,
    DELIVERY_ERROR,
} from "../../types";

const FormationState = (props) => {
    const initialState = {
        formations: [],
        pendingDeliveries: [],
        formationActual: null,
        error: null,
        success: false,
        cargando: false,
    };

    const [state, dispatch] = useReducer(FormationReducer, initialState);

    // 🔹 Obtener todas las formaciones activas
    const getFormations = async () => {
        try {
            const res = await MethodGet("/formations/active");
            const data = res.data;
            const payload = Array.isArray(data.data) ? data.data : [];

            dispatch({ type: GET_FORMATIONS, payload });
        } catch (error) {
            dispatch({
                type: FORMATION_ERROR,
                payload: error.response?.data?.message || "Error al obtener formaciones",
            });
        }
    };

    // 🔹 Crear nueva formación (recibe FormData directamente)
    const createFormation = async (formData) => {
        try {
            const res = await MethodPost("/formations", formData);

            dispatch({
                type: ADD_FORMATION,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: FORMATION_ERROR,
                payload: error.response?.data?.message || "Error al crear formación",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al crear formación",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Actualizar formación existente (recibe FormData directamente)
    const updateFormation = async (id, formData) => {
        try {
            const res = await MethodPut(`/formations/${id}`, formData);

            dispatch({
                type: UPDATE_FORMATION,
                payload: res.data,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: FORMATION_ERROR,
                payload: error.response?.data?.message || "Error al actualizar formación",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al actualizar formación",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Obtener formación por ID
    const getFormationById = async (id) => {
        try {
            const res = await MethodGet(`/formations/${id}`);
            dispatch({
                type: GET_FORMATIONS,
                payload: res.data,
            });
            return res.data;
        } catch (error) {
            dispatch({
                type: FORMATION_ERROR,
                payload: error.response?.data?.message || "Error al obtener formación",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener formación",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Eliminar formación
    const deleteFormation = async (id) => {
        try {
            await MethodDelete(`/formations/${id}`);
            dispatch({ type: DELETE_FORMATION, payload: id });

            Swal.fire({
                title: "¡Éxito!",
                text: "Formación eliminada correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            dispatch({
                type: FORMATION_ERROR,
                payload: error.response?.data?.message || "Error al eliminar formación",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al eliminar formación",
                icon: "error",
            });
        }
    };

    // ✅ Obtener entregables pendientes
    const getPendingDeliveries = async (page = 1) => {
        dispatch({ type: SET_LOADING });

        try {
            const res = await MethodGet(
                `/formations/deliveries/pending?page=${page}`
            );

            const payload = res.data?.data;

            dispatch({
                type: GET_PENDING_DELIVERIES,
                payload,
            });

        } catch (error) {
            dispatch({
                type: DELIVERY_ERROR,
                payload: error.response?.data?.message || "Error",
            });
        }
    };

    // ✅ Ahora recibe (id, status) donde status = "accepted" | "rejected"
    const reviewDelivery = async (id, status) => {
        dispatch({ type: SET_LOADING });
        try {
            await MethodPost(`/formations/review-delivery/${id}`, { status });

            dispatch({ type: REVIEW_DELIVERY, payload: id });

            Swal.fire({
                title: status === "accepted" ? "¡Aceptado!" : "Rechazado",
                text: status === "accepted"
                    ? "El entregable fue aceptado correctamente"
                    : "El entregable fue rechazado",
                icon: status === "accepted" ? "success" : "info",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            dispatch({
                type: DELIVERY_ERROR,
                payload: error.response?.data?.message || "Error al revisar entregable",
            });
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al revisar entregable",
                icon: "error",
            });
        }
    };

    return (
        <FormationContext.Provider
            value={{
                formations: state.formations,
                pendingDeliveries: state.pendingDeliveries,
                formationActual: state.formationActual,
                error: state.error,
                success: state.success,
                cargando: state.cargando,
                getFormations,
                createFormation,
                updateFormation,
                getFormationById,
                deleteFormation,
                getPendingDeliveries,
                reviewDelivery,
            }}
        >
            {props.children}
        </FormationContext.Provider>
    );
};

export default FormationState;