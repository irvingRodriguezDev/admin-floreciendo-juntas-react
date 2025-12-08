import {
    ORDERS_CARGANDO,
    ORDERS_NO_CARGANDO,
    OBTENER_ORDERS,
    ACTUALIZAR_ORDER,
    OBTENER_ORDER,
    ORDER_ERROR,
    LIMPIAR_ORDER_ACTUAL,
    LIMPIAR_ERROR_ORDER,
    RESET_SUCCESS_ORDER,
    OBTENER_ORDENES_ACTIVAS,
    OBTENER_ORDENES_LIQUIDADAS,
    OBTENER_ORDENES_ENVIO_PAGADO,
    OBTENER_ORDENES_ENVIADAS,
} from "../../types";

export default (state, action) => {
    switch (action.type) {
        case ORDERS_CARGANDO:
            return {
                ...state,
                cargando: true,
            };
        case ORDERS_NO_CARGANDO:
            return {
                ...state,
                cargando: false,
            };
        case OBTENER_ORDERS:
            return {
                ...state,
                orders: action.payload,
                error: null,
                cargando: false,
            };
        case OBTENER_ORDENES_ACTIVAS:
            return {
                ...state,
                ordenesActivas: action.payload,
                error: null,
                cargando: false,
            };
        case OBTENER_ORDENES_LIQUIDADAS:
            return {
                ...state,
                ordenesLiquidadas: action.payload,
                error: null,
                cargando: false,
            };
        case OBTENER_ORDENES_ENVIO_PAGADO:
            return {
                ...state,
                enviosPagados: action.payload,
                error: null,
                cargando: false,
            };
        case OBTENER_ORDENES_ENVIADAS:
            return {
                ...state,
                ordenesEnviadas: action.payload,
                error: null,
                cargando: false,
            };
        case ACTUALIZAR_ORDER:
            // Función auxiliar para actualizar una orden en un array
            const actualizarOrdenEnArray = (array, ordenActualizada) => {
                return array.map(order =>
                    order.id === ordenActualizada.id ? ordenActualizada : order
                );
            };

            return {
                ...state,
                orders: actualizarOrdenEnArray(state.orders, action.payload),
                ordenesActivas: actualizarOrdenEnArray(state.ordenesActivas, action.payload),
                ordenesLiquidadas: actualizarOrdenEnArray(state.ordenesLiquidadas, action.payload),
                enviosPagados: actualizarOrdenEnArray(state.enviosPagados, action.payload),
                orderActual: action.payload,
                success: true,
                error: null,
                cargando: false,
            };
        case OBTENER_ORDER:
            return {
                ...state,
                orderActual: action.payload,
                error: null,
                cargando: false,
            };
        case LIMPIAR_ORDER_ACTUAL:
            return {
                ...state,
                orderActual: null,
            };
        case ORDER_ERROR:
            return {
                ...state,
                error: action.payload,
                success: false,
                cargando: false,
            };
        case LIMPIAR_ERROR_ORDER:
            return {
                ...state,
                error: null,
                success: false,
            };
        case RESET_SUCCESS_ORDER:
            return {
                ...state,
                success: false,
            };
        default:
            return state;
    }
};