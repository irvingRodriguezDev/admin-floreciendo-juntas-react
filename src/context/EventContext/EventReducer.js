import {
    EVENTOS_CARGANDO,
    EVENTOS_NO_CARGANDO,
    OBTENER_EVENTOS,
    CREAR_EVENTO,
    ACTUALIZAR_EVENTO,
    ELIMINAR_EVENTO,
    OBTENER_EVENTO,
    EVENTO_ERROR,
    OBTENER_TOPSALES,
    LIMPIAR_EVENTO_ACTUAL,
    LIMPIAR_ERROR_EVENTO,
    RESET_SUCCESS_EVENTO,
} from "../../types";

export default (state, action) => {
    switch (action.type) {
        case OBTENER_EVENTOS:
            return {
                ...state,
                eventos: action.payload,
                error: null,
            };
        case CREAR_EVENTO:
            return {
                ...state,
                eventos: [action.payload, ...state.eventos],
                success: true,
                error: null,
            };
        case ACTUALIZAR_EVENTO:
            return {
                ...state,
                eventos: state.eventos.map(evento =>
                    evento.id === action.payload.id ? action.payload : evento
                ),
                success: true,
                error: null,
            };
        // EventReducer.js
        case OBTENER_TOPSALES:
            return {
                ...state,
                boletosMasVendidos: action.payload,
            };


        case ELIMINAR_EVENTO:
            return {
                ...state,
                eventos: state.eventos.filter(evento => evento.id !== action.payload),
                success: true,
                error: null,
            };
        case OBTENER_EVENTO:
            return {
                ...state,
                eventoActual: action.payload,
                error: null,
            };
        case LIMPIAR_EVENTO_ACTUAL:
            return {
                ...state,
                eventoActual: null,
            };
        case EVENTO_ERROR:
            return {
                ...state,
                error: action.payload,
                success: false,
            };
        case LIMPIAR_ERROR_EVENTO:
            return {
                ...state,
                error: null,
                success: false,
            };
        case RESET_SUCCESS_EVENTO:
            return {
                ...state,
                success: false,
            };
        default:
            return state;
    }
};
