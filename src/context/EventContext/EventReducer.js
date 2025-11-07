import { types } from "../../types";

export default (state, action) => {
    switch (action.type) {
        case types.OBTENER_EVENTOS:
            return {
                ...state,
                eventos: action.payload,
                error: null,
            };
        case types.CREAR_EVENTO:
            return {
                ...state,
                eventos: [action.payload, ...state.eventos],
                success: true,
                error: null,
            };
        case types.ACTUALIZAR_EVENTO:
            return {
                ...state,
                eventos: state.eventos.map(evento =>
                    evento.id === action.payload.id ? action.payload : evento
                ),
                success: true,
                error: null,
            };
        case types.ELIMINAR_EVENTO:
            return {
                ...state,
                eventos: state.eventos.filter(evento => evento.id !== action.payload),
                success: true,
                error: null,
            };
        case types.OBTENER_EVENTO:
            return {
                ...state,
                eventoActual: action.payload,
                error: null,
            };
        case types.LIMPIAR_EVENTO_ACTUAL:
            return {
                ...state,
                eventoActual: null,
            };
        case types.EVENTO_ERROR:
            return {
                ...state,
                error: action.payload,
                success: false,
            };
        case types.LIMPIAR_ERROR_EVENTO:
            return {
                ...state,
                error: null,
                success: false,
            };
        case types.RESET_SUCCESS_EVENTO:
            return {
                ...state,
                success: false,
            };
        default:
            return state;
    }
};
