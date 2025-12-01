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
        case ACTUALIZAR_ORDER:
            return {
                ...state,
                orders: state.orders.map(order =>
                    order.id === action.payload.id ? action.payload : order
                ),
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