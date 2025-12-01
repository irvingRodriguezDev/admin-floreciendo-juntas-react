import React, { useReducer } from "react";
import OrdersReducer from "./OrdersReducer";
import MethodGet, { MethodPut, MethodPost } from "../../config/Service";
import Swal from "sweetalert2";
import {
    ORDERS_CARGANDO,
    ORDERS_NO_CARGANDO,
    OBTENER_ORDERS,
    ACTUALIZAR_ORDER,
    OBTENER_ORDER,
    LIMPIAR_ORDER_ACTUAL,
    ORDER_ERROR,
    LIMPIAR_ERROR_ORDER,
    RESET_SUCCESS_ORDER,
} from "../../types";
import OrdersContext from "./OrdersContext";

const OrdersState = (props) => {
    const initialState = {
        orders: [],
        orderActual: null,
        error: null,
        success: false,
        cargando: false,
    };

    const [state, dispatch] = useReducer(OrdersReducer, initialState);

    // 🔹 Obtener todas las órdenes
    const obtenerOrders = async () => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodGet("/orders");
            dispatch({
                type: OBTENER_ORDERS,
                payload: Array.isArray(res.data.orders) ? res.data.orders : [],
            });
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al obtener órdenes",
            });
        }
    };

    // 🔹 Obtener orden por ID
    const obtenerOrderPorId = async (id) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodGet(`/orders/${id}`);
            dispatch({
                type: OBTENER_ORDER,
                payload: res.data,
            });
            return res.data;
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al obtener orden",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener orden",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Actualizar orden existente
    const actualizarOrder = async (id, datos) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodPut(`/orders/${id}`, datos);

            dispatch({
                type: ACTUALIZAR_ORDER,
                payload: res.data,
            });

            Swal.fire({
                title: "¡Éxito!",
                text: "Orden actualizada correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al actualizar orden",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al actualizar orden",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Actualizar costo de envío específico - ENDPOINT CORREGIDO
    const actualizarCostoEnvio = async (id, shippingCost) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            // Usar el endpoint específico para asignar costo de envío
            const res = await MethodPost(`/orders/assignShippingCost/${id}`, {
                shippingCost
            });

            // Actualizar la orden en el estado local
            dispatch({
                type: ACTUALIZAR_ORDER,
                payload: res.data.order, // Asumiendo que la respuesta tiene la orden actualizada
            });

            Swal.fire({
                title: "¡Éxito!",
                text: "Costo de envío actualizado correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al actualizar costo de envío",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al actualizar costo de envío",
                icon: "error",
            });

            throw error;
        }
    };

    // 🔹 Limpiar orden actual
    const limpiarOrderActual = () => {
        dispatch({
            type: LIMPIAR_ORDER_ACTUAL
        });
    };

    // 🔹 Limpiar errores
    const limpiarErrorOrder = () => {
        dispatch({
            type: LIMPIAR_ERROR_ORDER
        });
    };

    // 🔹 Reset success
    const resetSuccessOrder = () => {
        dispatch({
            type: RESET_SUCCESS_ORDER
        });
    };

    return (
        <OrdersContext.Provider
            value={{
                orders: state.orders,
                orderActual: state.orderActual,
                error: state.error,
                success: state.success,
                cargando: state.cargando,
                obtenerOrders,
                obtenerOrderPorId,
                actualizarOrder,
                actualizarCostoEnvio,
                limpiarOrderActual,
                limpiarErrorOrder,
                resetSuccessOrder,
            }}
        >
            {props.children}
        </OrdersContext.Provider>
    );
};

export default OrdersState;