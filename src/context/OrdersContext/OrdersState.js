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
    OBTENER_ORDENES_ACTIVAS,
    OBTENER_ORDENES_LIQUIDADAS,
    OBTENER_ORDENES_ENVIO_PAGADO,
    OBTENER_ORDENES_ENVIADAS,
} from "../../types";
import OrdersContext from "./OrdersContext";

const OrdersState = (props) => {
    const initialState = {
        orders: [],
        orderActual: null,
        error: null,
        success: false,
        cargando: false,
        ordenesActivas: [],
        ordenesLiquidadas: [],
        ordenesEnviadas: [],
        enviosPagados: [],
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

    // Obtener órdenes activas
    const obtenerOrdenesActivas = async () => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodGet("/orders/active");
            dispatch({
                type: OBTENER_ORDENES_ACTIVAS,
                payload: Array.isArray(res.data.orders) ? res.data.orders : [],
            });
            return res.data.orders || [];
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al obtener órdenes activas",
            });
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener órdenes activas",
                icon: "error",
                timer: 3000,
            });
            return [];
        }
    };

    // Obtener órdenes liquidadas
    const obtenerOrdenesCompletadas = async () => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodGet("/orders/completed");
            dispatch({
                type: OBTENER_ORDENES_LIQUIDADAS,
                payload: Array.isArray(res.data.orders) ? res.data.orders : [],
            });
            return res.data.orders || [];
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al obtener órdenes liquidadas",
            });
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener órdenes liquidadas",
                icon: "error",
                timer: 3000,
            });
            return [];
        }
    };

    // Obtener órdenes con envío pagado
    const obtenerOrdenesEnvioPagado = async () => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodGet("/orders/shipp-payed");
            dispatch({
                type: OBTENER_ORDENES_ENVIO_PAGADO,
                payload: Array.isArray(res.data.orders) ? res.data.orders : [],
            });
            return res.data.orders || [];
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al obtener órdenes con envío pagado",
            });
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al obtener órdenes con envío pagado",
                icon: "error",
                timer: 3000,
            });
            return [];
        }
    };

    // Obtener órdenes enviadas
    const obtenerOrdenesEnviadas = async () => {
        dispatch({ type: ORDERS_CARGANDO });

        try {
            const res = await MethodGet("/orders/shipped");
            console.log("📡 Respuesta del API /orders/shipped:", res.data);

            // Asegúrate de acceder a la propiedad correcta
            const ordenesEnviadas = res.data.orders || res.data || [];

            dispatch({
                type: OBTENER_ORDENES_ENVIADAS,
                payload: ordenesEnviadas
            });

            return ordenesEnviadas;
        } catch (error) {
            console.error("Error completo:", error);
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al obtener órdenes enviadas",
            });
            return [];
        }
    };

    // Obtener orden por ID
    const obtenerOrderPorId = async (id) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodGet(`/orders/detail/${id}`);
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

    // Actualizar orden existente
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

    // Actualizar costo de envío específico
    const actualizarCostoEnvio = async (id, shippingCost) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodPost(`/orders/assignShippingCost/${id}`, {
                shippingCost
            });

            // Actualizar la orden en todos los estados relevantes
            dispatch({
                type: ACTUALIZAR_ORDER,
                payload: res.data.order,
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

    // Actualizar número de guía
    const actualizarGuiaEnvio = async (id, trackingNumber, carrier) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodPut(`/orders/${id}/shipping-info`, {
                trackingNumber, carrier
            });

            // Actualizar la orden en todos los estados relevantes
            dispatch({
                type: ACTUALIZAR_ORDER,
                payload: res.data.order,
            });

            Swal.fire({
                title: "¡Éxito!",
                text: "Número de guía actualizado correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al actualizar número de guía",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al actualizar número de guía",
                icon: "error",
            });

            throw error;
        }
    };

    // Marcar como enviado
    const marcarComoEnviado = async (id) => {
        dispatch({
            type: ORDERS_CARGANDO
        });

        try {
            const res = await MethodPost(`/orders/markAsShipped/${id}`);

            // Actualizar la orden en todos los estados relevantes
            dispatch({
                type: ACTUALIZAR_ORDER,
                payload: res.data.order,
            });

            Swal.fire({
                title: "¡Éxito!",
                text: "Orden marcada como enviada correctamente",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            return res.data;
        } catch (error) {
            dispatch({
                type: ORDER_ERROR,
                payload: error.response?.data?.message || "Error al marcar como enviado",
            });

            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Error al marcar como enviado",
                icon: "error",
            });

            throw error;
        }
    };

    // Limpiar orden actual
    const limpiarOrderActual = () => {
        dispatch({
            type: LIMPIAR_ORDER_ACTUAL
        });
    };

    // Limpiar errores
    const limpiarErrorOrder = () => {
        dispatch({
            type: LIMPIAR_ERROR_ORDER
        });
    };

    // Reset success
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
                ordenesActivas: state.ordenesActivas,
                ordenesLiquidadas: state.ordenesLiquidadas,
                ordenesEnviadas: state.ordenesEnviadas,
                enviosPagados: state.enviosPagados,
                obtenerOrders,
                obtenerOrdenesActivas,
                obtenerOrdenesCompletadas,
                obtenerOrdenesEnvioPagado,
                obtenerOrdenesEnviadas,
                obtenerOrderPorId,
                actualizarOrder,
                actualizarCostoEnvio,
                actualizarGuiaEnvio,
                marcarComoEnviado,
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