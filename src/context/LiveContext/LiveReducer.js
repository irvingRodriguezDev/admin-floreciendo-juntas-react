// context/LiveContext/LiveReducer.js
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

export default (state, action) => {
    switch (action.type) {
        case LIVES_CARGANDO:
            return {
                ...state,
                cargando: true,
            };

        case LIVES_NO_CARGANDO:
            return {
                ...state,
                cargando: false,
            };

        case OBTENER_LIVES:
            return {
                ...state,
                lives: Array.isArray(action.payload) ? action.payload : [],
                error: null,
                cargando: false,
            };

        case CREAR_LIVE:
            return {
                ...state,
                lives: [action.payload, ...state.lives],
                liveActual: action.payload,
                success: true,
                error: null,
                cargando: false,
            };

        case ACTUALIZAR_LIVE:
            return {
                ...state,
                lives: state.lives.map((live) =>
                    live.id === action.payload.id ? action.payload : live
                ),
                liveActual: action.payload,
                success: true,
                error: null,
                cargando: false,
            };

        case ELIMINAR_LIVE:
            return {
                ...state,
                lives: state.lives.filter((live) => live.id !== action.payload),
                liveActual: null,
                error: null,
                cargando: false,
            };

        case OBTENER_LIVE:
            return {
                ...state,
                liveActual: action.payload,
                error: null,
                cargando: false,
            };

        case LIMPIAR_LIVE_ACTUAL:
            return {
                ...state,
                liveActual: null,
            };

        case LIVE_ERROR:
            return {
                ...state,
                error: action.payload,
                success: false,
                cargando: false,
            };

        case LIMPIAR_ERROR_LIVE:
            return {
                ...state,
                error: null,
            };

        case RESET_SUCCESS_LIVE:
            return {
                ...state,
                success: false,
            };

        default:
            return state;
    }
};